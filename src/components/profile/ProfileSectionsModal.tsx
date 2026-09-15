"use client";

import React, { useState } from "react";
import {
  ProfileTemplateId,
  ProfileSectionConfig,
  ProfileTemplate,
} from "@/lib/types/profile.types";
import { OFFICIAL_PROFILE_TEMPLATES, resolveProfileSections } from "@/lib/profileTemplates";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import ProfileSectionsReorderList from "@/components/profile/ProfileSectionsReorderList";
import {
  X,
  Layers,
  RotateCcw,
  Check,
  Crown,
  Gamepad2,
  Trophy,
  Minimize2,
  Save,
  Loader2,
} from "lucide-react";

export interface ProfileSectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateId: ProfileTemplateId;
  sections: ProfileSectionConfig[];
  customTemplate?: ProfileTemplate | null;
  isPremium: boolean;
  onApplySections: (newSections: ProfileSectionConfig[], templateId: ProfileTemplateId) => Promise<void>;
  onOpenUpgrade?: () => void;
}

export default function ProfileSectionsModal({
  isOpen,
  onClose,
  activeTemplateId: initialTemplateId,
  sections: initialSections,
  customTemplate: initialCustomTemplate,
  isPremium,
  onApplySections,
  onOpenUpgrade,
}: ProfileSectionsModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"templates" | "reorder">("templates");
  const [selectedTemplate, setSelectedTemplate] = useState<ProfileTemplateId>(initialTemplateId);
  const [sections, setSections] = useState<ProfileSectionConfig[]>(initialSections);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectTemplate = (id: ProfileTemplateId) => {
    triggerSelectionHaptic();
    setSelectedTemplate(id);

    if (id === "custom" && initialCustomTemplate) {
      setSections([...initialCustomTemplate.sections]);
    } else if (id !== "custom") {
      const templateSections = resolveProfileSections(null, id);
      setSections(templateSections);
    }
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    triggerSelectionHaptic();
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;

    // Atualiza a propriedade order
    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    setSections(reordered);
    setSelectedTemplate("custom");
  };

  const toggleVisibility = (id: string) => {
    triggerSelectionHaptic();
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
    setSelectedTemplate("custom");
  };

  const handleRestoreDefaults = () => {
    triggerSelectionHaptic();
    setSelectedTemplate("tracker");
    setSections(resolveProfileSections(null, "tracker"));
    setFeedbackMsg("Ordem padrão restaurada!");
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleSaveCustomToBackend = async () => {
    if (!isPremium) {
      onOpenUpgrade?.();
      return;
    }

    setIsSavingCustom(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/profile/template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          template: {
            id: "custom",
            name: "Meu Layout Customizado",
            sections,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar template");
      }

      triggerSuccessHaptic();
      setFeedbackMsg("Template customizado salvo com sucesso!");
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg(err.message || "Falha ao salvar template");
    } finally {
      setIsSavingCustom(false);
    }
  };

  const handleSaveAndApply = async () => {
    triggerSuccessHaptic();
    await onApplySections(sections, selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-lg max-h-[90dvh] bg-[#12151e] border border-white/10 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-slideUp">
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#151926]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Organização do Perfil</h2>
              <p className="text-[11px] text-gray-400">Personalize a ordem e visibilidade das seções</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alternador de Abas */}
        <div className="flex p-2 gap-1.5 bg-[#0f1118] border-b border-white/5">
          <button
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setActiveTab("templates");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "templates"
                ? "bg-white/15 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Templates Oficiais
          </button>
          <button
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setActiveTab("reorder");
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "reorder"
                ? "bg-white/15 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Reordenar Seções ({sections.filter((s) => s.visible).length}/{sections.length})
          </button>
        </div>

        {/* Feedback Temporário */}
        {feedbackMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium text-center animate-fadeIn">
            {feedbackMsg}
          </div>
        )}

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === "templates" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(OFFICIAL_PROFILE_TEMPLATES).map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? "bg-[#112a20] border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/40"
                        : "bg-[#161a26] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-sm text-white">{tmpl.name}</span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : tmpl.id === "tracker" ? (
                        <Gamepad2 className="w-4 h-4 text-cyan-400" />
                      ) : tmpl.id === "gamer" ? (
                        <Trophy className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Minimize2 className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">{tmpl.description}</p>
                  </button>
                );
              })}

              {/* Opção de Template Customizado (VIP/PRO) */}
              <button
                type="button"
                onClick={() => {
                  if (!isPremium) {
                    onOpenUpgrade?.();
                  } else {
                    handleSelectTemplate("custom");
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all col-span-1 sm:col-span-2 ${
                  selectedTemplate === "custom"
                    ? "bg-[#2d2212] border-amber-500/60 shadow-lg ring-1 ring-amber-500/40"
                    : "bg-[#161a26] border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-sm text-white">Template Personalizado</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 uppercase">
                      VIP / PRO
                    </span>
                  </div>
                  {selectedTemplate === "custom" && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Defina uma ordem personalizada exclusiva para a sua conta salva no servidor.
                </p>
              </button>
            </div>
          ) : (
            /* Lista de Seções para Reordenação e Visibilidade */
            <ProfileSectionsReorderList
              sections={sections}
              onToggleVisibility={toggleVisibility}
              onMoveSection={moveSection}
            />
          )}
        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-white/10 bg-[#151926] flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrão</span>
          </button>

          <div className="flex items-center gap-2">
            {isPremium && (
              <button
                type="button"
                disabled={isSavingCustom}
                onClick={handleSaveCustomToBackend}
                className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                title="Salva esta configuração como seu template VIP/PRO definitivo no servidor"
              >
                {isSavingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Salvar Template</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              Aplicar Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
