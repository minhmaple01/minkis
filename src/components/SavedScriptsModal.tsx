import React, { useState, useEffect, useRef } from "react";
import {
  X,
  BookOpen,
  Clock,
  FileText,
  Trash2,
  Download,
  Copy,
  FolderOpen,
  Search,
  Plus,
  Upload,
  Edit2,
  Check,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { SavedScript } from "../types";
import {
  getSavedScripts,
  deleteSavedScript,
  duplicateSavedScript,
  updateSavedScriptTitle,
  exportScriptAsTxt,
  importScriptFromTxtFile,
} from "../utils/storage";

interface SavedScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadScript: (script: SavedScript) => void;
  onNewScript: () => void;
  currentScriptId?: string | null;
}

export const SavedScriptsModal: React.FC<SavedScriptsModalProps> = ({
  isOpen,
  onClose,
  onLoadScript,
  onNewScript,
  currentScriptId,
}) => {
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reloadScripts = () => {
    setScripts(getSavedScripts());
  };

  useEffect(() => {
    if (isOpen) {
      reloadScripts();
      setDeleteConfirmId(null);
      setEditingId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredScripts = scripts.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRename = (s: SavedScript) => {
    setEditingId(s.id);
    setEditTitleValue(s.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitleValue.trim()) {
      updateSavedScriptTitle(id, editTitleValue.trim());
      reloadScripts();
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteSavedScript(id);
    setDeleteConfirmId(null);
    reloadScripts();
  };

  const handleDuplicate = (id: string) => {
    duplicateSavedScript(id);
    reloadScripts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importScriptFromTxtFile(file);
      // Pass imported data to app loader
      onLoadScript({
        id: `imported_${Date.now()}`,
        title: imported.title,
        rawText: imported.rawText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        metricsSummary: {
          totalDurationSeconds: 0,
          totalLines: 0,
          totalChapters: 0,
          totalWords: 0,
        },
      });
      onClose();
    } catch (err) {
      console.error("Failed to import file:", err);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s < 10 ? "0" : ""}${s}s`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/80 dark:bg-neutral-800/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-50">
                  Kịch bản đã lưu
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 font-semibold">
                  {scripts.length} kịch bản
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Quản lý, mở lại hoặc xuất các kịch bản bạn đã viết và lưu trữ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNewScript();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tạo kịch bản mới</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Import */}
        <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tiêu đề kịch bản..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition"
            >
              <Upload className="w-3.5 h-3.5 text-neutral-500" />
              <span>Nhập file .txt</span>
            </button>
          </div>
        </div>

        {/* List of Saved Scripts */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          {filteredScripts.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 mb-1">
                {searchQuery ? "Không tìm thấy kịch bản phù hợp" : "Chưa có kịch bản nào được lưu"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mb-4">
                {searchQuery
                  ? "Vui lòng thử tìm với từ khóa khác."
                  : "Sau khi viết hoặc tạo kịch bản, bấm nút 'Lưu kịch bản' ở thanh công cụ để lưu trữ lâu dài tại đây."}
              </p>
              {!searchQuery && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onNewScript();
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
                  >
                    Bắt đầu viết kịch bản mới
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  >
                    Tải lên file .txt có sẵn
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredScripts.map((s) => {
              const isCurrent = currentScriptId === s.id;
              const isEditing = editingId === s.id;
              const isDeleting = deleteConfirmId === s.id;

              return (
                <div
                  key={s.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? "bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-sm"
                      : "bg-white dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <div className="flex items-center gap-2 flex-1 max-w-md">
                            <input
                              type="text"
                              value={editTitleValue}
                              onChange={(e) => setEditTitleValue(e.target.value)}
                              autoFocus
                              className="px-2.5 py-1 text-xs sm:text-sm font-bold rounded-lg border border-amber-500 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex-1 focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveRename(s.id)}
                              className="p-1 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-500 transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded-lg bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs hover:bg-neutral-400 transition"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-50 truncate">
                              {s.title}
                            </h4>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500 text-white font-semibold shrink-0">
                                Đang mở
                              </span>
                            )}
                            <button
                              onClick={() => handleStartRename(s)}
                              title="Đổi tên kịch bản"
                              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Metrics Summary badges */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-700/60 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {s.metricsSummary?.totalDurationSeconds
                            ? formatDuration(s.metricsSummary.totalDurationSeconds)
                            : "0s"}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-700/60 px-2 py-0.5 rounded">
                          <FileText className="w-3 h-3 text-sky-500" />
                          {s.metricsSummary?.totalLines || 0} câu thoại
                        </span>
                        <span className="flex items-center gap-1 font-mono text-[11px] bg-neutral-100 dark:bg-neutral-700/60 px-2 py-0.5 rounded">
                          <Layers className="w-3 h-3 text-purple-500" />
                          {s.metricsSummary?.totalChapters || 0} chương
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-neutral-400">
                          <Calendar className="w-3 h-3" />
                          Lưu lúc: {formatDate(s.updatedAt || s.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onLoadScript(s);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-bold transition shadow-sm"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                        <span>Mở</span>
                      </button>

                      <button
                        onClick={() => exportScriptAsTxt(s.title, s.rawText)}
                        title="Tải về file .txt"
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDuplicate(s.id)}
                        title="Tạo bản sao"
                        className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 p-1 rounded-lg border border-rose-200 dark:border-rose-800">
                          <span className="text-[10px] text-rose-600 dark:text-rose-300 font-semibold px-1">
                            Xóa?
                          </span>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[10px] font-bold"
                          >
                            Có
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded text-[10px]"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirmId(s.id)}
                          title="Xóa kịch bản này"
                          className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-neutral-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-800/40 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>Kịch bản được lưu trữ an toàn trong trình duyệt của bạn (Local Storage)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
