import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { TitleInputSection } from "./components/TitleInputSection";
import { MetricsBar } from "./components/MetricsBar";
import { RawEditorView } from "./components/RawEditorView";
import { CastModal } from "./components/CastModal";
import { SavedScriptsModal } from "./components/SavedScriptsModal";
import { generateAlgorithmicScript } from "./utils/algorithmicGenerator";
import { parseScreenplay } from "./utils/parser";
import { Screenplay, SavedScript } from "./types";
import {
  getSavedScripts,
  saveScript,
  saveActiveDraft,
  getActiveDraft,
} from "./utils/storage";
import { Sparkles, FileText, Save, Plus, FolderHeart, Check } from "lucide-react";

export default function App() {
  // Check active draft or previous saved scripts
  const [currentSavedScriptId, setCurrentSavedScriptId] = useState<string | null>(() => {
    const draft = getActiveDraft();
    if (draft?.currentSavedId) return draft.currentSavedId;
    const saved = getSavedScripts();
    if (saved.length > 0) return saved[0].id;
    return null;
  });

  const [currentTitle, setCurrentTitle] = useState<string>(() => {
    const draft = getActiveDraft();
    if (draft?.title !== undefined) return draft.title;
    const saved = getSavedScripts();
    if (saved.length > 0) return saved[0].title;
    return "";
  });

  const [screenplay, setScreenplay] = useState<Screenplay>(() => {
    const draft = getActiveDraft();
    if (draft && draft.rawText !== undefined) {
      return parseScreenplay(draft.rawText, draft.title || "");
    }
    const saved = getSavedScripts();
    if (saved.length > 0) {
      return parseScreenplay(saved[0].rawText, saved[0].title);
    }
    // Clean empty state without sample scripts
    return parseScreenplay("", "");
  });

  const [isDirty, setIsDirty] = useState(false);
  const [savedScriptsCount, setSavedScriptsCount] = useState<number>(() => getSavedScripts().length);
  const [isLoading, setIsLoading] = useState(false);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Auto-sync active draft to localStorage
  useEffect(() => {
    saveActiveDraft(currentTitle, screenplay.rawText, currentSavedScriptId);
  }, [currentTitle, screenplay.rawText, currentSavedScriptId]);

  // Save Current Script
  const handleSaveScript = useCallback(() => {
    if (!screenplay.rawText.trim() && !currentTitle.trim()) {
      showToast("Kịch bản đang trống, hãy nhập nội dung trước khi lưu!", "info");
      return;
    }

    const titleToSave = currentTitle.trim() || screenplay.title.trim() || "Kịch bản chưa đặt tên";
    const saved = saveScript(titleToSave, screenplay.rawText, screenplay.metrics, currentSavedScriptId);

    setCurrentSavedScriptId(saved.id);
    setIsDirty(false);
    setSavedScriptsCount(getSavedScripts().length);
    showToast(`Đã lưu kịch bản "${saved.title}" vào Thư viện thành công!`, "success");
  }, [screenplay, currentTitle, currentSavedScriptId]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSaveScript();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveScript]);

  // Load a Saved Script
  const handleLoadSavedScript = (script: SavedScript) => {
    setCurrentTitle(script.title);
    const parsed = parseScreenplay(script.rawText, script.title);
    setScreenplay(parsed);
    setCurrentSavedScriptId(script.id);
    setIsDirty(false);
    showToast(`Đã mở kịch bản "${script.title}"!`, "info");
  };

  // Create New Blank Script
  const handleNewScript = () => {
    setCurrentTitle("");
    setScreenplay(parseScreenplay("", ""));
    setCurrentSavedScriptId(null);
    setIsDirty(false);
    showToast("Đã tạo kịch bản mới. Bạn có thể nhập tiêu đề hoặc bắt đầu viết.", "info");
  };

  const handleGenerate = async (titleToGen: string) => {
    setCurrentTitle(titleToGen);
    setIsLoading(true);

    try {
      // 1. Try server-side Gemini API
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleToGen }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.script && data.script.trim()) {
          const parsed = parseScreenplay(data.script, titleToGen);
          setScreenplay(parsed);
          setIsDirty(true);
          showToast(`Kịch bản "${titleToGen}" đã được sáng tác thành công (${data.model || "AI Gemini"})!`, "success");
          setIsLoading(false);
          return;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        let errMsg = errData?.error || `Lỗi AI (${res.status})`;
        try {
          const parsed = JSON.parse(errMsg);
          if (parsed?.error?.message) errMsg = parsed.error.message;
        } catch {}
        console.warn("AI generation failed, switching to fallback algorithmic generator:", errMsg);
        showToast("Mô hình AI đang bận. Đang kích hoạt bộ sinh kịch bản dự phòng thông minh...", "info");
      }

      // 2. Fallback to algorithmic generator
      const fallbackScript = generateAlgorithmicScript(titleToGen);
      const parsed = parseScreenplay(fallbackScript, titleToGen);
      setScreenplay(parsed);
      setIsDirty(true);
      showToast(`Đã sáng tác kịch bản chuẩn cấu trúc thẻ cho "${titleToGen}"!`, "info");
    } catch (err: any) {
      console.warn("API call failed, switching to algorithmic generator:", err);
      const script = generateAlgorithmicScript(titleToGen);
      const parsed = parseScreenplay(script, titleToGen);
      setScreenplay(parsed);
      setIsDirty(true);
      showToast(`Đã hoàn thành kịch bản định dạng thẻ cho "${titleToGen}"!`, "info");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRawText = (newText: string) => {
    const parsed = parseScreenplay(newText, currentTitle || screenplay.title);
    setScreenplay(parsed);
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen bg-neutral-100/60 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-emerald-900 text-emerald-100 border-emerald-700"
              : notification.type === "info"
              ? "bg-neutral-900 text-neutral-100 border-neutral-700"
              : "bg-rose-900 text-rose-100 border-rose-700"
          }`}>
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenCastModal={() => setIsCastModalOpen(true)}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        onSaveScript={handleSaveScript}
        onNewScript={handleNewScript}
        savedCount={savedScriptsCount}
        isSaved={!isDirty && Boolean(currentSavedScriptId || screenplay.rawText.trim())}
        metricsDuration={screenplay.metrics.totalDurationSeconds}
        metricsLines={screenplay.metrics.totalLines}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5 flex-1 w-full">
        {/* Single Input: Title Section (Collapsible when script exists) */}
        <TitleInputSection
          currentTitle={currentTitle}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          hasScript={screenplay.rawText.trim().length > 0}
        />

        {/* Live Metrics Checker (Collapsible by default) */}
        {screenplay.rawText.trim().length > 0 && (
          <MetricsBar metrics={screenplay.metrics} />
        )}

        {/* Core Workspace Display: Pure Screenplay View */}
        <RawEditorView
          screenplay={screenplay}
          onChangeRawText={handleUpdateRawText}
          onSaveScript={handleSaveScript}
          isSaved={!isDirty}
        />
      </main>

      {/* Cast Modal */}
      <CastModal isOpen={isCastModalOpen} onClose={() => setIsCastModalOpen(false)} />

      {/* Saved Scripts Modal */}
      <SavedScriptsModal
        isOpen={isSavedModalOpen}
        onClose={() => {
          setIsSavedModalOpen(false);
          setSavedScriptsCount(getSavedScripts().length);
        }}
        onLoadScript={handleLoadSavedScript}
        onNewScript={handleNewScript}
        currentScriptId={currentSavedScriptId}
      />

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 py-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
        StoryForge Kids EN • Hệ thống thẻ kịch bản chuẩn YouTube Faceless AI
      </footer>
    </div>
  );
}
