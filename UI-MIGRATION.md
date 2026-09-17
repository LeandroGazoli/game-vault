# Plano de migração de UI — shadcn + mobile-first

Branch: `homologacao-ui-shadcn`. Contexto: site mobile-first, empacotado com Capacitor
(iOS/Android), rodando em Cloudflare Workers.

---

## Já feito nesta branch

### 1. Busca sem popup ✅
O `SpotlightSearchModal` foi removido. Dois problemas reais no mobile:

- overlay em tela cheia disputa espaço com o teclado virtual;
- **num app Capacitor, o botão VOLTAR do Android não fecha modal** — ele sai da tela ou do
  app. Isso quebra a expectativa mais básica de navegação nativa.

Estratégia por contexto, em vez de um componente servindo aos dois:

| Contexto | Comportamento |
|---|---|
| Mobile | Toque leva para `/search` — **rota real**. Voltar funciona, entra no histórico, URL é compartilhável, teclado tem a tela inteira |
| Desktop | Campo real com dropdown ancorado abaixo, sem overlay e sem roubo de foco |

O `LiveSearchInput` já existia pronto no repositório e não era usado por ninguém — foi só
ligá-lo, com `variant="navbar"` e `variant="hero"`.

### 2. Fundação shadcn ✅
Configurado **sem** `shadcn init`, que reescreveria `globals.css` e `tailwind.config.ts`.
Os tokens do projeto já usavam a nomenclatura semântica esperada; só foram ACRESCENTADOS os
que faltavam (`popover`, `secondary`, `destructive`, `input`, `ring`, `card-foreground`).
**Nenhum valor existente mudou** — o visual é idêntico.

Primitivos disponíveis: `button`, `input`, `sheet`, `dialog`, `card`, `badge`, `skeleton`,
`separator`, `scroll-area`.

Os tamanhos padrão do shadcn (36px) foram elevados para **44px no mobile**, encolhendo em
`sm:`. 44px é o mínimo de alvo de toque do WCAG 2.5.8 e do HIG da Apple; o padrão do shadcn
é pensado para desktop e fica pequeno num app nativo.

---

## Decisões de NÃO fazer (e por quê)

### O `AdaptiveModal` fica como está
20 componentes dependem dele, e ele **já é mobile-first**: bottom sheet no mobile
(`items-end md:items-center`), centrado no desktop, com drag handle e `safe-area-inset`.
Trocá-lo pelo `Sheet` do shadcn seria risco de regressão em 20 telas sem nenhum ganho
perceptível para o usuário.

### Os 573 botões não foram migrados em massa
A auditoria mostrou que **42 pontos já usam `min-h-[44px]`** e que os `h-3`/`h-4` são
tamanhos de ícone, não alvos de toque. Migração em massa sem verificação visual é como
trocar peça de motor no escuro: alto risco, benefício incerto.

**Recomendação:** adotar `<Button>` em telas NOVAS e quando um componente for tocado por
outro motivo. Migração oportunista, não campanha.

### Os 27 `transition: all` ficam por ora
`transition-all` faz o navegador observar todas as propriedades, o que pode custar em
mobile. Mas trocar por propriedades específicas exige saber o que cada um anima — sem
verificação visual, é mudança cega. Vale fazer com o site aberto ao lado.

---

## Próximos passos sugeridos, por ordem de retorno

1. **Validar a busca nova no dispositivo real** (Android e iOS). É a mudança de maior
   impacto e a única cujo ganho depende de comportamento nativo — o botão voltar.
2. **`transition-all` → propriedades específicas**, com o site aberto, começando pela home
   e pela navbar (maior tráfego).
3. **Componentes gigantes**: `SearchClient` (1.400+ linhas), `FeedbackClient`,
   `LiveSearchInput`. Quebrar em partes menores facilita tudo o que vier depois.
4. **Acessibilidade**: 125 campos dependem só de `placeholder` como rótulo — problema real
   para leitor de tela, e correção mecânica.
5. **`<Skeleton>` nos estados de carregamento**, substituindo spinners. Percepção de
   velocidade melhor em conexão móvel.

---

## Regras para quem continuar

- **Nunca** `shadcn init` neste projeto — ele sobrescreve o design system existente.
- Adicionar componente: `npx shadcn@latest add <nome>`, depois **revisar as alturas**
  (o padrão de 36px é pequeno demais para toque).
- Modal novo: usar `AdaptiveModal`, que já resolve mobile. `Dialog`/`Sheet` do shadcn só se
  houver motivo específico.
- Qualquer componente client que leia Firestore: **não** use `onSnapshot` para configuração.
  Leitura feita no navegador custa por visitante e é invisível em log de servidor. Use
  `/api/system/settings` ou `/api/system/features`.
- Sanitizar HTML: use o hook `useSanitizedHtml`. O `dompurify` só funciona no navegador —
  chamar no SSR quebra no workerd.

---

## Limite de escrita do KV — resolvido com o Workers Paid em 17/09

**A conta assinou o Workers Paid (US$ 5/mês) em 17/09.** Esta seção fica como registro do
que apertava antes e do que passou a valer.

| Operação | Custo em escritas |
|---|---|
| Um `wrangler deploy` | **~115** (o cache incremental grava uma chave por página) |
| Cada regeneração de ISR | 1 por página regenerada |
| Toggle de manutenção pelo painel | 1 |

| | Gratuito (antes) | Paid (agora) |
|---|---|---|
| Escritas | 1.000/**dia** | 1 mi/**mês** (≈33 mil/dia) |
| Exclusões | 1.000/dia | 1 mi/mês |
| Leituras | 100 mil/dia | 10 mi/mês |
| Armazenamento | 1 GB | 1 GB, depois $0,50/GB-mês |

No gratuito, ~8 deploys esgotavam a cota do dia (`your account has reached the free usage
limit for this operation for today [code: 10048]`) — e com ela esgotada **nem o deploy nem o
toggle de manutenção do painel funcionavam**, porque os dois gravam no KV. O freio de
emergência para esse caso é a var `MAINTENANCE_MODE` no `wrangler.jsonc`, que não depende de
KV; ela continua existindo, mas deixou de ser o plano A.

**O que ainda merece atenção no plano pago:** cada regeneração de ISR é 1 escrita. Com ~33
mil páginas de jogo em `revalidate` de 24h, o teto teórico chega perto do 1 milhão incluído.
O excedente é barato ($5/milhão), mas é a única linha que pode crescer sem aviso.

### Espaço: a faxina agora vem no deploy

Escrita e espaço são limites diferentes. O limite de 1.000/dia é de **operações**; o de
1 GB é de **espaço** — e esse vinha sendo consumido sem ninguém apagar nada: cada deploy
grava as páginas sob um build ID novo e deixa o anterior para trás. Em 17/09 o namespace
tinha **1.392 chaves em 23 gerações, com só 1 em uso, ~190 MB** — crescendo ~9 MB por deploy.

Por isso o deploy de produção passou a ser um script:

```
npm run deploy              # build + deploy + faxina
npm run deploy -- --no-purge
npm run purge:kv            # simula a faxina avulsa (--apply para valer)
```

A ordem é o que torna isso seguro:

1. `wrangler deploy` (que num projeto OpenNext dispara `opennextjs-cloudflare deploy`:
   popula o cache e só então publica);
2. **com o deploy confirmado**, o build ID vai para a chave `deploy/current-build-id`;
3. a purga apaga tudo que **não** é esse ID.

O passo 2 existe porque o `.next/BUILD_ID` local é uma fonte enganosa: se você buildou uma
branch e não deployou, ele aponta para algo que nunca esteve no ar — e a purga trataria
produção inteira como órfã. O script **aborta** se nada confirmar que o build preservado
está no ar. Essa guarda já pegou exatamente esse caso no primeiro teste.

Teto de 10.000 chaves por rodada (limite da própria API de bulk delete), ajustável com
`--max`. A faxina acumulada de 1.392 chaves cabe numa rodada só. Falha na purga não invalida
o deploy — o site já está no ar.

### Como reduzir o consumo

- `revalidate` longo: cada regeneração é uma escrita. Nada abaixo de 1800s.
- Menos páginas pré-renderizadas: `generateStaticParams` vazio quando a página puder nascer
  sob demanda (já feito em `/artigos/[slug]`).
- Agrupar alterações em menos deploys deixou de ser necessário no plano pago, mas continua
  sendo bom hábito.
