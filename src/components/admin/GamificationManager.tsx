"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  GamificationAchievementDef,
  GamificationMissionDef,
  GamificationMissionType,
  GamificationMetric,
  GamificationConfig,
  GAMIFICATION_METRICS,
} from "@/lib/types";
import {
  getAchievementDefs,
  getMissionDefs,
  getGamificationConfig,
  createAchievementDef,
  updateAchievementDef,
  deleteAchievementDef,
  createMissionDef,
  updateMissionDef,
  deleteMissionDef,
  updateGamificationConfig,
  recordAuditLog,
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import {
  iconFromName,
  GAMIFICATION_ICON_NAMES,
  evaluateDef,
} from "@/lib/gamification";
import {
  Trophy,
  Target,
  CalendarClock,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Save,
  X,
  Star,
} from "lucide-react";

type TabKey = "achievements" | "season" | "daily";

interface FormState {
  title: string;
  description: string;
  iconName: string;
  metric: GamificationMetric;
  targetValue: number;
  rewardXp: number;
  globalRarity: number; // só conquistas
  isSecret: boolean; // só conquistas
  isActive: boolean;
  startsAt: string; // yyyy-mm-dd (season)
  endsAt: string; // yyyy-mm-dd (season)
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  iconName: "Trophy",
  metric: "completed",
  targetValue: 1,
  rewardXp: 50,
  globalRarity: 50,
  isSecret: false,
  isActive: true,
  startsAt: "",
  endsAt: "",
};

function toDateInput(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function fromDateInput(value: string, endOfDay = false): string | null {
  if (!value) return null;
  const d = new Date(value + (endOfDay ? "T23:59:59" : "T00:00:00"));
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function GamificationManager() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("achievements");
  const [achievements, setAchievements] = useState<GamificationAchievementDef[]>([]);
  const [missions, setMissions] = useState<GamificationMissionDef[]>([]);
  const [config, setConfig] = useState<GamificationConfig | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Config diária/temporada
  const [dailyCount, setDailyCount] = useState(3);
  const [seasonName, setSeasonName] = useState("");
  const [seasonEndsAt, setSeasonEndsAt] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);

  const seasonMissions = useMemo(
    () => missions.filter((m) => m.type === "season"),
    [missions]
  );
  const dailyMissions = useMemo(
    () => missions.filter((m) => m.type === "daily"),
    [missions]
  );

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [ach, mis, cfg] = await Promise.all([
        getAchievementDefs(),
        getMissionDefs(),
        getGamificationConfig(),
      ]);
      setAchievements(ach);
      setMissions(mis);
      setConfig(cfg);
      setDailyCount(cfg.dailyRotationCount ?? 3);
      setSeasonName(cfg.seasonName ?? "");
      setSeasonEndsAt(toDateInput(cfg.seasonEndsAt));
    } catch (e) {
      console.error("Erro ao carregar gamificação:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setErrorMessage(null);
  };

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    resetForm();
  };

  const flashSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const logAudit = async (action: string, details: Record<string, any>) => {
    if (!user) return;
    try {
      await recordAuditLog({
        adminEmail: user.email,
        adminUid: user.uid,
        action,
        category: "gamification",
        details,
      });
    } catch (e) {
      console.error("Erro ao registrar auditoria:", e);
    }
  };

  const startEditAchievement = (a: GamificationAchievementDef) => {
    setEditingId(a.id);
    setActiveTab("achievements");
    setForm({
      title: a.title,
      description: a.description,
      iconName: a.iconName || "Trophy",
      metric: a.metric,
      targetValue: a.targetValue,
      rewardXp: a.rewardXp,
      globalRarity: a.globalRarity ?? 50,
      isSecret: !!a.isSecret,
      isActive: a.isActive !== false,
      startsAt: "",
      endsAt: "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startEditMission = (m: GamificationMissionDef) => {
    setEditingId(m.id);
    setActiveTab(m.type === "season" ? "season" : "daily");
    setForm({
      title: m.title,
      description: m.description,
      iconName: m.iconName || "Trophy",
      metric: m.metric,
      targetValue: m.targetValue,
      rewardXp: m.rewardXp,
      globalRarity: 50,
      isSecret: false,
      isActive: m.isActive !== false,
      startsAt: toDateInput(m.startsAt),
      endsAt: toDateInput(m.endsAt),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.title.trim() || !form.description.trim()) {
      setErrorMessage("Título e descrição são obrigatórios.");
      return;
    }
    if (!form.targetValue || form.targetValue < 1) {
      setErrorMessage("O valor-alvo deve ser pelo menos 1.");
      return;
    }

    setIsSaving(true);
    try {
      const createdBy = user?.email || "admin";

      if (activeTab === "achievements") {
        const base = {
          title: form.title.trim(),
          description: form.description.trim(),
          iconName: form.iconName,
          metric: form.metric,
          targetValue: Number(form.targetValue),
          globalRarity: Number(form.globalRarity),
          rewardXp: Number(form.rewardXp),
          isSecret: form.isSecret,
          isActive: form.isActive,
        };
        if (editingId) {
          await updateAchievementDef(editingId, base);
          await logAudit(`Conquista atualizada: "${base.title}"`, { id: editingId, ...base });
          flashSuccess("Conquista atualizada com sucesso.");
        } else {
          const id = await createAchievementDef({ ...base, createdBy });
          await logAudit(`Conquista criada: "${base.title}"`, { id, ...base });
          flashSuccess("Conquista criada com sucesso.");
        }
      } else {
        const type: GamificationMissionType = activeTab === "season" ? "season" : "daily";
        const base: any = {
          title: form.title.trim(),
          description: form.description.trim(),
          iconName: form.iconName,
          type,
          metric: form.metric,
          targetValue: Number(form.targetValue),
          rewardXp: Number(form.rewardXp),
          isActive: form.isActive,
          startsAt: type === "season" ? fromDateInput(form.startsAt) : null,
          endsAt: type === "season" ? fromDateInput(form.endsAt, true) : null,
        };
        if (editingId) {
          await updateMissionDef(editingId, base);
          await logAudit(`Missão (${type}) atualizada: "${base.title}"`, { id: editingId, ...base });
          flashSuccess("Missão atualizada com sucesso.");
        } else {
          const id = await createMissionDef({ ...base, createdBy });
          await logAudit(`Missão (${type}) criada: "${base.title}"`, { id, ...base });
          flashSuccess("Missão criada com sucesso.");
        }
      }

      resetForm();
      await fetchAll();
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao salvar. Verifique suas permissões de admin.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAchievement = async (a: GamificationAchievementDef) => {
    if (!window.confirm(`Excluir a conquista "${a.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteAchievementDef(a.id);
      await logAudit(`Conquista excluída: "${a.title}"`, { id: a.id });
      if (editingId === a.id) resetForm();
      await fetchAll();
      flashSuccess("Conquista excluída.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao excluir conquista.");
    }
  };

  const handleDeleteMission = async (m: GamificationMissionDef) => {
    if (!window.confirm(`Excluir a missão "${m.title}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteMissionDef(m.id);
      await logAudit(`Missão excluída: "${m.title}"`, { id: m.id, type: m.type });
      if (editingId === m.id) resetForm();
      await fetchAll();
      flashSuccess("Missão excluída.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao excluir missão.");
    }
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setErrorMessage(null);
    try {
      const payload: Partial<GamificationConfig> = {
        dailyRotationCount: Math.max(1, Math.min(10, Number(dailyCount) || 3)),
        seasonName: seasonName.trim() || undefined,
        seasonEndsAt: fromDateInput(seasonEndsAt, true),
      };
      await updateGamificationConfig(payload, user?.email);
      await logAudit("Configuração de gamificação atualizada", payload);
      await fetchAll();
      flashSuccess("Configuração salva.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao salvar configuração.");
    } finally {
      setSavingConfig(false);
    }
  };

  const previewEval = useMemo(
    () => evaluateDef({ metric: form.metric, targetValue: Number(form.targetValue) || 1 }, { stats: null, level: 1 }),
    [form.metric, form.targetValue]
  );

  const metricUnit =
    GAMIFICATION_METRICS.find((m) => m.value === form.metric)?.unit || "";

  const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "achievements", label: "Conquistas", icon: Trophy },
    { key: "season", label: "Missões da Temporada", icon: CalendarClock },
    { key: "daily", label: "Missões Diárias", icon: Target },
  ];

  const inputCls =
    "w-full rounded-xl bg-[#0d0f14] border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF]/50";
  const labelCls = "block text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-1.5";

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
                active
                  ? "bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20"
                  : "bg-[#14161d] text-gray-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Mensagens */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Config diária/temporada */}
      {activeTab === "daily" && (
        <div className="rounded-[28px] bg-[#14161d] border border-white/10 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Rotação Diária
          </div>
          <p className="text-xs text-gray-400">
            O site sorteia esta quantidade de missões do pool por dia, de forma determinística
            (a mesma seleção durante todo o dia).
          </p>
          <div className="flex items-end gap-3">
            <div className="w-32">
              <label className={labelCls}>Missões por dia</label>
              <input
                type="number"
                min={1}
                max={10}
                value={dailyCount}
                onChange={(e) => setDailyCount(Number(e.target.value))}
                className={inputCls}
              />
            </div>
            <button
              onClick={handleSaveConfig}
              disabled={savingConfig}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold min-h-[44px] disabled:opacity-50"
            >
              {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar rotação
            </button>
          </div>
        </div>
      )}

      {activeTab === "season" && (
        <div className="rounded-[28px] bg-[#14161d] border border-white/10 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <CalendarClock className="w-4 h-4 text-purple-400" />
            Temporada Atual
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nome da temporada</label>
              <input
                type="text"
                value={seasonName}
                onChange={(e) => setSeasonName(e.target.value)}
                placeholder="Ex.: Temporada 1 — Início da Jornada"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Encerramento da temporada</label>
              <input
                type="date"
                value={seasonEndsAt}
                onChange={(e) => setSeasonEndsAt(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold min-h-[44px] disabled:opacity-50"
          >
            {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar temporada
          </button>
        </div>
      )}

      {/* Formulário de criação/edição */}
      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] bg-[#14161d] border border-white/10 p-5 sm:p-6 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            {editingId ? <Pencil className="w-4 h-4 text-[#00E5FF]" /> : <Plus className="w-4 h-4 text-[#00E5FF]" />}
            {editingId ? "Editar" : "Criar"}{" "}
            {activeTab === "achievements" ? "conquista" : activeTab === "season" ? "missão da temporada" : "missão diária"}
          </div>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" /> Cancelar edição
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Título</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex.: Mestre da Maratona"
              className={inputCls}
              maxLength={80}
            />
          </div>
          <div>
            <label className={labelCls}>Ícone</label>
            <div className="flex flex-wrap gap-1.5 max-h-[92px] overflow-y-auto rounded-xl bg-[#0d0f14] border border-white/10 p-2">
              {GAMIFICATION_ICON_NAMES.map((name) => {
                const Icon = iconFromName(name);
                const selected = form.iconName === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setForm({ ...form, iconName: name })}
                    title={name}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      selected
                        ? "bg-[#00E5FF] text-black"
                        : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Descrição</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Explique o que o jogador precisa fazer."
            rows={2}
            className={inputCls}
            maxLength={240}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Métrica</label>
            <select
              value={form.metric}
              onChange={(e) => setForm({ ...form, metric: e.target.value as GamificationMetric })}
              className={inputCls}
            >
              {GAMIFICATION_METRICS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Valor-alvo ({metricUnit})</label>
            <input
              type="number"
              min={1}
              value={form.targetValue}
              onChange={(e) => setForm({ ...form, targetValue: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Recompensa (XP)</label>
            <input
              type="number"
              min={0}
              value={form.rewardXp}
              onChange={(e) => setForm({ ...form, rewardXp: Number(e.target.value) })}
              className={inputCls}
            />
          </div>
        </div>

        {/* Campos específicos de conquista */}
        {activeTab === "achievements" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className={labelCls}>Raridade global (%)</label>
              <input
                type="number"
                min={0.1}
                max={100}
                step={0.1}
                value={form.globalRarity}
                onChange={(e) => setForm({ ...form, globalRarity: Number(e.target.value) })}
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl bg-[#0d0f14] border border-white/10 px-3.5 py-2.5">
              <input
                type="checkbox"
                checked={form.isSecret}
                onChange={(e) => setForm({ ...form, isSecret: e.target.checked })}
                className="accent-amber-400"
              />
              <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Lock className="w-3.5 h-3.5 text-amber-400" /> Conquista secreta
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl bg-[#0d0f14] border border-white/10 px-3.5 py-2.5">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-emerald-400"
              />
              <span className="text-xs font-bold text-white">Ativa</span>
            </label>
          </div>
        )}

        {/* Campos específicos de missão de temporada */}
        {activeTab === "season" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div>
              <label className={labelCls}>Início (opcional)</label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fim (opcional)</label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                className={inputCls}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl bg-[#0d0f14] border border-white/10 px-3.5 py-2.5">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-emerald-400"
              />
              <span className="text-xs font-bold text-white">Ativa</span>
            </label>
          </div>
        )}

        {/* Ativa para diárias */}
        {activeTab === "daily" && (
          <label className="flex items-center gap-2 cursor-pointer select-none rounded-xl bg-[#0d0f14] border border-white/10 px-3.5 py-2.5 w-fit">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="accent-emerald-400"
            />
            <span className="text-xs font-bold text-white">Ativa (no pool de sorteio)</span>
          </label>
        )}

        {/* Preview */}
        <div className="rounded-2xl bg-[#0d0f14] border border-white/10 p-4 flex items-center gap-3">
          {(() => {
            const Icon = iconFromName(form.iconName);
            return (
              <div className="w-11 h-11 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            );
          })()}
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">
              {form.isSecret && activeTab === "achievements" ? "??? (Conquista Secreta)" : form.title || "Prévia do título"}
            </div>
            <div className="text-xs text-gray-400 truncate">
              {form.isSecret && activeTab === "achievements"
                ? "Descrição oculta até desbloquear"
                : form.description || "Prévia da descrição"}
            </div>
            <div className="text-[11px] text-gray-500 mt-0.5">
              Alvo: {previewEval.target} {metricUnit} · +{form.rewardXp} XP
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00E5FF] text-black text-sm font-black min-h-[48px] hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {editingId ? "Salvar alterações" : "Criar"}
        </button>
      </form>

      {/* Listas */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : activeTab === "achievements" ? (
        <AchievementList
          items={achievements}
          onEdit={startEditAchievement}
          onDelete={handleDeleteAchievement}
        />
      ) : (
        <MissionList
          items={activeTab === "season" ? seasonMissions : dailyMissions}
          onEdit={startEditMission}
          onDelete={handleDeleteMission}
        />
      )}
    </div>
  );
}

function AchievementList({
  items,
  onEdit,
  onDelete,
}: {
  items: GamificationAchievementDef[];
  onEdit: (a: GamificationAchievementDef) => void;
  onDelete: (a: GamificationAchievementDef) => void;
}) {
  if (items.length === 0) {
    return <EmptyState label="Nenhuma conquista criada ainda." />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((a) => {
        const Icon = iconFromName(a.iconName);
        return (
          <div
            key={a.id}
            className="rounded-2xl bg-[#14161d] border border-white/10 p-4 flex items-start gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white truncate">{a.title}</span>
                {a.isSecret && (
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Lock className="w-2.5 h-2.5" /> SECRETA
                  </span>
                )}
                {a.isActive === false && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                    INATIVA
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{a.description}</p>
              <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {a.globalRarity}%</span>
                <span>·</span>
                <span>Alvo {a.targetValue}</span>
                <span>·</span>
                <span className="text-[#00E5FF]">+{a.rewardXp} XP</span>
              </div>
            </div>
            <ItemActions onEdit={() => onEdit(a)} onDelete={() => onDelete(a)} />
          </div>
        );
      })}
    </div>
  );
}

function MissionList({
  items,
  onEdit,
  onDelete,
}: {
  items: GamificationMissionDef[];
  onEdit: (m: GamificationMissionDef) => void;
  onDelete: (m: GamificationMissionDef) => void;
}) {
  if (items.length === 0) {
    return <EmptyState label="Nenhuma missão criada ainda." />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {items.map((m) => {
        const Icon = iconFromName(m.iconName);
        return (
          <div
            key={m.id}
            className="rounded-2xl bg-[#14161d] border border-white/10 p-4 flex items-start gap-3"
          >
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white truncate">{m.title}</span>
                {m.isActive === false && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-400">
                    INATIVA
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{m.description}</p>
              <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                <span>Alvo {m.targetValue}</span>
                <span>·</span>
                <span className="text-[#00E5FF]">+{m.rewardXp} XP</span>
                {m.type === "season" && (m.startsAt || m.endsAt) && (
                  <>
                    <span>·</span>
                    <span>
                      {m.startsAt ? new Date(m.startsAt).toLocaleDateString("pt-BR") : "—"} até{" "}
                      {m.endsAt ? new Date(m.endsAt).toLocaleDateString("pt-BR") : "∞"}
                    </span>
                  </>
                )}
              </div>
            </div>
            <ItemActions onEdit={() => onEdit(m)} onDelete={() => onDelete(m)} />
          </div>
        );
      })}
    </div>
  );
}

function ItemActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <button
        onClick={onEdit}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/15 text-gray-300 flex items-center justify-center transition-colors"
        title="Editar"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="w-8 h-8 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition-colors"
        title="Excluir"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl bg-[#14161d] border border-dashed border-white/10 p-8 text-center text-sm text-gray-500">
      {label}
    </div>
  );
}
