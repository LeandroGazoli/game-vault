/**
 * Shim do Firestore Admin compatível com Edge / Cloudflare Workers.
 *
 * Reimplementa a *superfície encadeável* do `firebase-admin/firestore`
 * (collection / doc / where / orderBy / limit / get / set / update / delete /
 * count / runTransaction / batch) usando exclusivamente `fetch` contra a
 * Firestore REST API v1.
 *
 * Motivo: `@google-cloud/firestore` depende de gRPC + protobufjs, que usam
 * `new Function` e módulos nativos — ambos indisponíveis no isolate V8 do
 * workerd, o que derrubava as rotas de servidor com HTTP 500.
 *
 * A API pública espelha a do Admin SDK para que nenhum consumidor precise mudar.
 */
import {
  buildDeleteWrite,
  buildDocumentWrite,
  firestoreDocToJs,
  firestoreValueToJs,
  fromDocumentName,
  jsValueToFirestore,
  makeSentinel,
  newFirestoreId,
  restBeginTransaction,
  restCommit,
  restCountQuery,
  restGetDocument,
  restRollback,
  restRunQuery,
} from "./firestoreRest";

export type WhereFilterOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "array-contains"
  | "array-contains-any"
  | "in"
  | "not-in";

export type OrderByDirection = "asc" | "desc";

export interface SetOptions {
  merge?: boolean;
}

const OP_MAP: Record<WhereFilterOp, string> = {
  "==": "EQUAL",
  "!=": "NOT_EQUAL",
  "<": "LESS_THAN",
  "<=": "LESS_THAN_OR_EQUAL",
  ">": "GREATER_THAN",
  ">=": "GREATER_THAN_OR_EQUAL",
  "array-contains": "ARRAY_CONTAINS",
  "array-contains-any": "ARRAY_CONTAINS_ANY",
  in: "IN",
  "not-in": "NOT_IN",
};

interface WhereClause {
  field: string;
  op: WhereFilterOp;
  value: any;
}

interface OrderClause {
  field: string;
  direction: OrderByDirection;
}

function toFilter(clause: WhereClause): any {
  const field = { fieldPath: clause.field };

  // Comparações com null/NaN viram filtros unários, como no SDK oficial.
  if (clause.value === null && (clause.op === "==" || clause.op === "!=")) {
    return { unaryFilter: { field, op: clause.op === "==" ? "IS_NULL" : "IS_NOT_NULL" } };
  }
  if (typeof clause.value === "number" && Number.isNaN(clause.value)) {
    return { unaryFilter: { field, op: clause.op === "==" ? "IS_NAN" : "IS_NOT_NAN" } };
  }

  const isListOp =
    clause.op === "in" || clause.op === "not-in" || clause.op === "array-contains-any";
  const value = isListOp
    ? { arrayValue: { values: (clause.value || []).map(jsValueToFirestore) } }
    : jsValueToFirestore(clause.value);

  return { fieldFilter: { field, op: OP_MAP[clause.op], value } };
}

/* -------------------------------------------------------------------------- */
/*  Snapshots                                                                  */
/* -------------------------------------------------------------------------- */

export class RestDocumentSnapshot<T = any> {
  readonly ref: RestDocumentReference<T>;
  readonly id: string;
  readonly exists: boolean;
  private readonly _data: any;

  constructor(ref: RestDocumentReference<T>, raw: any | null) {
    this.ref = ref;
    this.id = ref.id;
    this.exists = Boolean(raw);
    this._data = raw ? firestoreDocToJs<any>(raw) : undefined;
  }

  data(): T | undefined {
    if (!this._data) return undefined;
    // `id` é adicionado por firestoreDocToJs; o Admin SDK não o inclui em data(),
    // mas manter é inofensivo e preserva o comportamento de quem já lia data().id.
    return this._data as T;
  }

  /** Lê um campo por caminho pontilhado (`socialLinks.steam`). */
  get(fieldPath: string): any {
    return String(fieldPath)
      .split(".")
      .reduce((acc: any, key) => (acc == null ? undefined : acc[key]), this._data);
  }
}

export class RestQuerySnapshot<T = any> {
  readonly docs: RestDocumentSnapshot<T>[];

  constructor(docs: RestDocumentSnapshot<T>[]) {
    this.docs = docs;
  }

  get empty(): boolean {
    return this.docs.length === 0;
  }

  get size(): number {
    return this.docs.length;
  }

  forEach(cb: (doc: RestDocumentSnapshot<T>) => void): void {
    this.docs.forEach(cb);
  }
}

/* -------------------------------------------------------------------------- */
/*  Query                                                                      */
/* -------------------------------------------------------------------------- */

export class RestQuery<T = any> {
  protected readonly parentPath: string;
  protected readonly collectionId: string;
  protected readonly wheres: WhereClause[];
  protected readonly orders: OrderClause[];
  protected readonly limitValue?: number;
  protected readonly offsetValue?: number;

  constructor(
    parentPath: string,
    collectionId: string,
    wheres: WhereClause[] = [],
    orders: OrderClause[] = [],
    limitValue?: number,
    offsetValue?: number
  ) {
    this.parentPath = parentPath;
    this.collectionId = collectionId;
    this.wheres = wheres;
    this.orders = orders;
    this.limitValue = limitValue;
    this.offsetValue = offsetValue;
  }

  protected clone(patch: Partial<{
    wheres: WhereClause[];
    orders: OrderClause[];
    limitValue: number;
    offsetValue: number;
  }>): RestQuery<T> {
    return new RestQuery<T>(
      this.parentPath,
      this.collectionId,
      patch.wheres ?? this.wheres,
      patch.orders ?? this.orders,
      patch.limitValue ?? this.limitValue,
      patch.offsetValue ?? this.offsetValue
    );
  }

  where(field: string, op: WhereFilterOp, value: any): RestQuery<T> {
    return this.clone({ wheres: [...this.wheres, { field, op, value }] });
  }

  orderBy(field: string, direction: OrderByDirection = "asc"): RestQuery<T> {
    return this.clone({ orders: [...this.orders, { field, direction }] });
  }

  limit(n: number): RestQuery<T> {
    return this.clone({ limitValue: n });
  }

  offset(n: number): RestQuery<T> {
    return this.clone({ offsetValue: n });
  }

  /** Monta o objeto `structuredQuery` enviado à REST API. */
  toStructuredQuery(): Record<string, any> {
    const sq: Record<string, any> = { from: [{ collectionId: this.collectionId }] };

    if (this.wheres.length === 1) {
      sq.where = toFilter(this.wheres[0]);
    } else if (this.wheres.length > 1) {
      sq.where = {
        compositeFilter: { op: "AND", filters: this.wheres.map(toFilter) },
      };
    }

    if (this.orders.length) {
      sq.orderBy = this.orders.map((o) => ({
        field: { fieldPath: o.field },
        direction: o.direction === "desc" ? "DESCENDING" : "ASCENDING",
      }));
    }

    if (typeof this.limitValue === "number") sq.limit = this.limitValue;
    if (typeof this.offsetValue === "number") sq.offset = this.offsetValue;

    return sq;
  }

  async get(): Promise<RestQuerySnapshot<T>> {
    const documents = await restRunQuery(this.parentPath, this.toStructuredQuery());
    const docs = documents.map((raw) => {
      const path = fromDocumentName(raw.name);
      const id = path.split("/").pop() || "";
      return new RestDocumentSnapshot<T>(
        new RestDocumentReference<T>(this.parentPath, this.collectionId, id),
        raw
      );
    });
    return new RestQuerySnapshot<T>(docs);
  }

  /** Equivalente a `query.count()` do Admin SDK. */
  count(): { get: () => Promise<{ data: () => { count: number } }> } {
    const parentPath = this.parentPath;
    const structuredQuery = this.toStructuredQuery();
    return {
      get: async () => {
        const total = await restCountQuery(parentPath, structuredQuery);
        return { data: () => ({ count: total }) };
      },
    };
  }
}

/* -------------------------------------------------------------------------- */
/*  Referências                                                                */
/* -------------------------------------------------------------------------- */

export class RestCollectionReference<T = any> extends RestQuery<T> {
  get id(): string {
    return this.collectionId;
  }

  get path(): string {
    return this.parentPath ? `${this.parentPath}/${this.collectionId}` : this.collectionId;
  }

  /** `doc()` sem argumento gera um ID automático, como no Admin SDK. */
  doc(id?: string): RestDocumentReference<T> {
    return new RestDocumentReference<T>(
      this.parentPath,
      this.collectionId,
      id && id.trim() ? id : newFirestoreId()
    );
  }
}

export class RestDocumentReference<T = any> {
  readonly id: string;
  readonly path: string;

  constructor(parentPath: string, collectionId: string, id: string) {
    this.id = id;
    const collectionPath = parentPath ? `${parentPath}/${collectionId}` : collectionId;
    this.path = `${collectionPath}/${id}`;
  }

  collection<U = any>(collectionId: string): RestCollectionReference<U> {
    return new RestCollectionReference<U>(this.path, collectionId);
  }

  async get(): Promise<RestDocumentSnapshot<T>> {
    const raw = await restGetDocument(this.path);
    return new RestDocumentSnapshot<T>(this, raw);
  }

  async set(data: Record<string, any>, options: SetOptions = {}): Promise<void> {
    await restCommit([buildDocumentWrite(this.path, data, { merge: options.merge === true })]);
  }

  async update(data: Record<string, any>): Promise<void> {
    await restCommit([buildDocumentWrite(this.path, data, { merge: true, exists: true })]);
  }

  async delete(): Promise<void> {
    await restCommit([buildDeleteWrite(this.path)]);
  }
}

/* -------------------------------------------------------------------------- */
/*  Transações e lotes                                                         */
/* -------------------------------------------------------------------------- */

export class RestTransaction {
  private readonly transactionId: string;
  private readonly writes: any[] = [];

  constructor(transactionId: string) {
    this.transactionId = transactionId;
  }

  async get<T>(ref: RestDocumentReference<T>): Promise<RestDocumentSnapshot<T>>;
  async get<T>(query: RestQuery<T>): Promise<RestQuerySnapshot<T>>;
  async get(refOrQuery: any): Promise<any> {
    if (refOrQuery instanceof RestDocumentReference) {
      const raw = await restGetDocument(refOrQuery.path, { transaction: this.transactionId });
      return new RestDocumentSnapshot(refOrQuery, raw);
    }
    // Leituras de query dentro da transação não usam o transactionId (a REST API
    // exige um corpo diferente); o commit ainda é atômico sobre os writes.
    return (refOrQuery as RestQuery).get();
  }

  set(ref: RestDocumentReference, data: Record<string, any>, options: SetOptions = {}): this {
    this.writes.push(buildDocumentWrite(ref.path, data, { merge: options.merge === true }));
    return this;
  }

  update(ref: RestDocumentReference, data: Record<string, any>): this {
    this.writes.push(buildDocumentWrite(ref.path, data, { merge: true, exists: true }));
    return this;
  }

  delete(ref: RestDocumentReference): this {
    this.writes.push(buildDeleteWrite(ref.path));
    return this;
  }

  /** @internal */
  async commit(): Promise<void> {
    await restCommit(this.writes, this.transactionId);
  }

  /** @internal */
  async rollback(): Promise<void> {
    await restRollback(this.transactionId);
  }
}

export class RestWriteBatch {
  private readonly writes: any[] = [];

  set(ref: RestDocumentReference, data: Record<string, any>, options: SetOptions = {}): this {
    this.writes.push(buildDocumentWrite(ref.path, data, { merge: options.merge === true }));
    return this;
  }

  update(ref: RestDocumentReference, data: Record<string, any>): this {
    this.writes.push(buildDocumentWrite(ref.path, data, { merge: true, exists: true }));
    return this;
  }

  delete(ref: RestDocumentReference): this {
    this.writes.push(buildDeleteWrite(ref.path));
    return this;
  }

  async commit(): Promise<void> {
    await restCommit(this.writes);
  }
}

/* -------------------------------------------------------------------------- */
/*  Instância                                                                  */
/* -------------------------------------------------------------------------- */

const TRANSACTION_ATTEMPTS = 5;

export class RestFirestore {
  collection<T = any>(collectionId: string): RestCollectionReference<T> {
    return new RestCollectionReference<T>("", collectionId);
  }

  /** Aceita um caminho completo (`users/abc/games/xyz`). */
  doc<T = any>(path: string): RestDocumentReference<T> {
    const parts = path.replace(/^\/+|\/+$/g, "").split("/");
    if (parts.length < 2 || parts.length % 2 !== 0) {
      throw new Error(`Caminho de documento inválido: "${path}".`);
    }
    const id = parts.pop() as string;
    const collectionId = parts.pop() as string;
    return new RestDocumentReference<T>(parts.join("/"), collectionId, id);
  }

  batch(): RestWriteBatch {
    return new RestWriteBatch();
  }

  async runTransaction<T>(fn: (tx: RestTransaction) => Promise<T>): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt < TRANSACTION_ATTEMPTS; attempt++) {
      const transactionId = await restBeginTransaction();
      const tx = new RestTransaction(transactionId);

      try {
        const result = await fn(tx);
        await tx.commit();
        return result;
      } catch (error: any) {
        await tx.rollback();
        lastError = error;

        // 409 = ABORTED (conflito de concorrência): vale a pena repetir.
        const retriable = error?.status === 409;
        if (!retriable) throw error;

        await new Promise((r) => setTimeout(r, 50 * 2 ** attempt));
      }
    }

    throw lastError;
  }
}

let cachedDb: RestFirestore | null = null;

export function getRestFirestore(): RestFirestore {
  if (!cachedDb) cachedDb = new RestFirestore();
  return cachedDb;
}

/** Sentinelas compatíveis com `FieldValue` do Admin SDK. */
export const RestFieldValue = {
  delete: () => makeSentinel("delete"),
  serverTimestamp: () => makeSentinel("serverTimestamp"),
  increment: (n: number) => makeSentinel("increment", n),
  arrayUnion: (...elements: any[]) => makeSentinel("arrayUnion", elements),
  arrayRemove: (...elements: any[]) => makeSentinel("arrayRemove", elements),
};

export { firestoreValueToJs };
