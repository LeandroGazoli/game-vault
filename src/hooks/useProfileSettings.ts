"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";
import { PRESET_BANNERS, ProfileTheme, DEFAULT_GAMER_TITLES, SocialLinks, ProfileVisibility, ProfileLayout } from "@/lib/types";
import { BackgroundConfig } from "@/lib/types/background.types";
import { isPureHtmlBio } from "@/lib/sanitizeHtml";

const RANDOM_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200",
];

const TAB_MAP: Record<string, number> = { info: 1, appearance: 2, titles: 3, markdown: 4, socials: 5, showcase: 6, visibility: 7 };

export function useProfileSettings(initialTab?: string, onOpenUpgrade?: () => void, onClose?: () => void) {
  const { user, isPremium, isLoading, updateUserProfile } = useAuth();

  const [activeAccordion, setActiveAccordion] = useState<number | null>(() => (initialTab ? TAB_MAP[initialTab] || 1 : 1));
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [birthDate, setBirthDate] = useState(user?.birthDate || "");
  const [showAge, setShowAge] = useState(true);

  const [bannerURL, setBannerURL] = useState(user?.bannerURL || PRESET_BANNERS[0].url);
  const [customBannerUrl, setCustomBannerUrl] = useState("");
  const [theme, setTheme] = useState<ProfileTheme>(user?.theme || "cyan");
  const [layout, setLayout] = useState<ProfileLayout>(user?.profileLayout || "default");
  const [customBgConfig, setCustomBgConfig] = useState<BackgroundConfig | null>((user?.customBackground as BackgroundConfig) || null);
  const [customCss, setCustomCss] = useState(user?.customCss || "");

  const [equippedTitles, setEquippedTitles] = useState<string[]>(() => {
    if (user?.customTitles?.length) return user.customTitles.slice(0, 3);
    if (user?.customTitle) return [user.customTitle];
    return [DEFAULT_GAMER_TITLES[0]];
  });
  const [createdTitles, setCreatedTitles] = useState<string[]>(user?.createdCustomTitles || []);
  const [newTitleInput, setNewTitleInput] = useState("");
  const [newTitleEmoji, setNewTitleEmoji] = useState("🛡️");

  const [markdownContent, setMarkdownContent] = useState(user?.customMarkdown || user?.customHtml || "");
  const [bioTab, setBioTab] = useState<"editor" | "preview">("editor");
  const [bioMode, setBioMode] = useState<"markdown" | "html">(() => {
    if (user?.customBioMode) return user.customBioMode;
    return isPureHtmlBio(user?.customMarkdown || user?.customHtml || "") ? "html" : "markdown";
  });

  const [socials, setSocials] = useState<SocialLinks>(user?.socialLinks || {});
  const [showcaseGameId, setShowcaseGameId] = useState<number | null>(user?.showcaseGameId || null);
  const [visibility, setVisibility] = useState<ProfileVisibility>(
    user?.visibility || { isPublic: user?.isPublic ?? true, showStats: true, showPlaytime: true, showRatings: true, showDropped: true }
  );

  // Sincroniza o estado do formulário assim que os dados do usuário forem carregados/hidratados
  useEffect(() => {
    if (!user) return;
    setDisplayName((prev) => prev || user.displayName || "");
    setUsername((prev) => prev || user.username || "");
    setPhotoURL((prev) => prev || user.photoURL || "");
    setBio((prev) => prev || user.bio || "");
    setBirthDate((prev) => prev || user.birthDate || "");
    if (user.bannerURL) setBannerURL(user.bannerURL);
    if (user.theme) setTheme(user.theme);
    if (user.profileLayout) setLayout(user.profileLayout);
    if (user.customBackground) setCustomBgConfig(user.customBackground as BackgroundConfig);
    if (user.customCss) setCustomCss((prev) => prev || user.customCss || "");
    if (user.customTitles?.length) {
      setEquippedTitles(user.customTitles.slice(0, 3));
    } else if (user.customTitle) {
      setEquippedTitles([user.customTitle]);
    }
    if (user.createdCustomTitles?.length) setCreatedTitles(user.createdCustomTitles);
    if (user.customMarkdown || user.customHtml) {
      setMarkdownContent((prev) => prev || user.customMarkdown || user.customHtml || "");
    }
    if (user.socialLinks) setSocials(user.socialLinks);
    if (user.showcaseGameId !== undefined) setShowcaseGameId(user.showcaseGameId);
    if (user.visibility) setVisibility(user.visibility);
  }, [user]);

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const toggleAccordion = (index: number) => {
    triggerSelectionHaptic();
    setActiveAccordion((prev) => (prev === index ? null : index));
  };

  const moveEquippedTitle = (index: number, direction: "up" | "down") => {
    triggerSelectionHaptic();
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= equippedTitles.length) return;
    const next = [...equippedTitles];
    [next[index], next[target]] = [next[target], next[index]];
    setEquippedTitles(next);
  };

  const unequipTitle = (title: string) => {
    triggerSelectionHaptic();
    setEquippedTitles((prev) => prev.filter((t) => t !== title));
  };

  const toggleEquipTitle = (title: string) => {
    triggerSelectionHaptic();
    if (equippedTitles.includes(title)) return unequipTitle(title);
    if (equippedTitles.length >= 3) return showToast("Limite de 3 insígnias atingido!");
    setEquippedTitles((prev) => [...prev, title]);
  };

  const handleCreateCustomTitle = () => {
    if (!isPremium) return onOpenUpgrade?.();
    const clean = `${newTitleEmoji} ${newTitleInput.trim()}`.trim();
    if (!newTitleInput.trim()) return showToast("Digite o nome da insígnia!");
    if (createdTitles.includes(clean)) return showToast("Insígnia já existe!");
    setCreatedTitles((prev) => [...prev, clean]);
    if (equippedTitles.length < 3) setEquippedTitles((prev) => [...prev, clean]);
    setNewTitleInput("");
    showToast("Insígnia criada com sucesso!");
  };

  const randomAvatar = () => {
    triggerSelectionHaptic();
    setPhotoURL(RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)]);
    showToast("Avatar aleatório selecionado!");
  };

  const suggestBio = () => {
    triggerSelectionHaptic();
    setBio("Mestre dos Troféus, explorador de masmorras e viciado em platinas perfeitas.");
    showToast("Bio gerada por IA!");
  };

  const copyHandle = () => {
    const handle = `@${user?.username || "jogador"}`;
    navigator.clipboard?.writeText(handle);
    showToast(`${handle} copiado!`);
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const banner = customBannerUrl.trim() || bannerURL;
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      const isChangingUsername = cleanUsername && cleanUsername !== user.username;
      const currentChangeCount = user.usernameChangeCount || 0;

      if (isChangingUsername && currentChangeCount >= 1) {
        showToast("O limite de 1 alteração de username já foi atingido.");
        setIsSaving(false);
        return;
      }

      await updateUserProfile({
        displayName: displayName.trim() || user.displayName || user.username,
        ...(isChangingUsername && currentChangeCount < 1
          ? {
              username: cleanUsername,
              usernameChangeCount: currentChangeCount + 1,
              usernameChangedAt: new Date().toISOString(),
            }
          : {}),
        photoURL: photoURL.trim() || null,
        bio: bio.trim(),
        birthDate: birthDate.trim() || null,
        bannerURL: banner,
        customBackground: customBgConfig,
        customCss: customCss.trim(),
        theme,
        profileLayout: layout,
        customTitle: equippedTitles[0] || null,
        customTitles: equippedTitles,
        createdCustomTitles: createdTitles,
        customMarkdown: markdownContent.trim(),
        customHtml: markdownContent.trim(),
        customBioMode: bioMode,
        socialLinks: socials,
        showcaseGameId,
        isPublic: visibility.isPublic !== false,
        visibility: { ...visibility, isPublic: visibility.isPublic !== false },
      });
      triggerSuccessHaptic();
      showToast("Todas as alterações foram salvas!");
      setTimeout(() => onClose?.(), 1000);
    } catch (e) {
      console.error(e);
      showToast("Erro ao salvar alterações.");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    user, isPremium, isLoading, activeAccordion, toggleAccordion, displayName, setDisplayName,
    username, setUsername,
    photoURL, setPhotoURL, bio, setBio, birthDate, setBirthDate, showAge, setShowAge,
    bannerURL, setBannerURL, customBannerUrl, setCustomBannerUrl, theme, setTheme,
    layout, setLayout, customBgConfig, setCustomBgConfig, customCss, setCustomCss, equippedTitles, moveEquippedTitle,
    unequipTitle, toggleEquipTitle, createdTitles, newTitleInput, setNewTitleInput,
    newTitleEmoji, setNewTitleEmoji, handleCreateCustomTitle, markdownContent, setMarkdownContent,
    bioTab, setBioTab, bioMode, setBioMode, socials, setSocials, showcaseGameId,
    setShowcaseGameId, visibility, setVisibility, isSaving, toastMessage, showToast,
    randomAvatar, suggestBio, copyHandle, handleSave,
  };
}
