import React, { useState, useEffect } from "react";
import { ArrowRight, Wand2, RefreshCw, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface TitleInputSectionProps {
  currentTitle: string;
  onGenerate: (title: string, useFastMode?: boolean) => void;
  isLoading: boolean;
  hasScript?: boolean;
}

export const TitleInputSection: React.FC<TitleInputSectionProps> = ({
  currentTitle,
  onGenerate,
  isLoading,
  hasScript = false,
}) => {
  const [title, setTitle] = useState(currentTitle || "");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;
    onGenerate(title.trim());
  };

  // If collapsed and not loading, show a neat compact bar
  if (isCollapsed && !isLoading) {
    return (
      <section className="bg-white dark:bg-neutral-900 rounded-xl px-4 py-2.5 border border-amber-200/60 dark:border-neutral-800 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-all">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
          <span className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400 shrink-0">
            Tiêu đề kịch bản:
          </span>
          <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-neutral-100 truncate">
            {title || currentTitle || "Chưa có tiêu đề"}
          </span>
        </div>

        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-300 dark:border-amber-800 text-xs font-semibold transition shrink-0 shadow-sm"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Đổi tiêu đề / Viết lại AI</span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
        </button>
      </section>
    );
  }

  return (
    <section className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-amber-200/60 dark:border-neutral-800 shadow-sm transition-all">
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Sáng tác kịch bản YouTube Kids EN
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs text-neutral-500 dark:text-neutral-400">
            Tự động sinh kịch bản chuẩn thẻ [chapter], [mota], [char]
          </span>
          {hasScript && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 px-2 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition font-medium"
              title="Tạm ẩn ô nhập để tập trung vào kịch bản"
            >
              <span>Thu gọn</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề kịch bản (Ví dụ: Henry Helps Grandpa, Lucy Finds A Secret Map...)"
            disabled={isLoading}
            className="w-full px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-50 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm sm:text-base font-medium shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !title.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-semibold text-sm shadow-md shadow-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Đang sáng tác kịch bản...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4" />
              <span>Sáng tác Kịch bản</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </section>
  );
};
