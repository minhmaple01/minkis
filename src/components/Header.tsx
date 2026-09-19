import React from "react";
import { Sparkles, Users, BookOpen, Clock, Layers, FolderHeart, Save, Plus, Check } from "lucide-react";

interface HeaderProps {
  onOpenCastModal: () => void;
  onOpenSavedModal: () => void;
  onSaveScript: () => void;
  onNewScript: () => void;
  savedCount: number;
  isSaved: boolean;
  metricsDuration?: number;
  metricsLines?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCastModal,
  onOpenSavedModal,
  onSaveScript,
  onNewScript,
  savedCount,
  isSaved,
  metricsDuration,
  metricsLines,
}) => {
  return (
    <header className="border-b border-amber-200/60 dark:border-amber-900/40 bg-amber-50/70 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-50 flex items-center gap-1.5">
                StoryForge Kids EN
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  YouTube Faceless AI
                </span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400">
              AI Screenplay Studio for Children's English Videos
            </p>
          </div>
        </div>

        {/* Center/Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* New Script Button */}
          <button
            onClick={onNewScript}
            title="Tạo một kịch bản mới hoàn toàn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition"
          >
            <Plus className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden sm:inline">Kịch bản mới</span>
            <span className="sm:hidden">Mới</span>
          </button>

          {/* Save Script Button */}
          <button
            onClick={onSaveScript}
            title={isSaved ? "Kịch bản đã được lưu" : "Lưu kịch bản này vào máy"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
              isSaved
                ? "bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/25"
                : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Đã lưu</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Lưu kịch bản</span>
              </>
            )}
          </button>

          {/* Saved Scripts Library Button */}
          <button
            onClick={onOpenSavedModal}
            title="Mở danh sách các kịch bản đã lưu"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-bold transition shadow-sm"
          >
            <FolderHeart className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
            <span>Kịch bản đã lưu</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Fixed Cast Lore */}
          <button
            onClick={onOpenCastModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition"
          >
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Fixed Cast Lore</span>
          </button>
        </div>
      </div>
    </header>
  );
};
