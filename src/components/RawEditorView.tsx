import React, { useState } from "react";
import { Copy, Check, Download, FileText, FileSpreadsheet, Code2, Edit3, Eye, Hash, Clock, MapPin, Sparkles, Clapperboard, MessagesSquare, Volume2, UserCheck, AlertTriangle, Play, Wand2, Save, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Chapter, Screenplay, SceneBeat } from "../types";
import { generateSrtContent, generateCsvContent, formatTime, autoRepairScreenplayTags } from "../utils/parser";

interface RawEditorViewProps {
  screenplay: Screenplay;
  onChangeRawText: (newText: string) => void;
  onSaveScript?: () => void;
  isSaved?: boolean;
}

export const RawEditorView: React.FC<RawEditorViewProps> = ({ screenplay, onChangeRawText, onSaveScript, isSaved }) => {
  const [copied, setCopied] = useState(false);
  const [repairedSuccess, setRepairedSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<"highlight" | "beats" | "plain" | "edit">("highlight");
  const [showGuide, setShowGuide] = useState(false);
  const [showChapterStrip, setShowChapterStrip] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const toggleChapter = (chapterId: string) => {
    setCollapsedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const collapseAllChapters = () => {
    const all: Record<string, boolean> = {};
    screenplay.chapters.forEach((ch) => {
      all[ch.id] = true;
    });
    setCollapsedChapters(all);
  };

  const expandAllChapters = () => {
    setCollapsedChapters({});
  };

  const handleAutoRepair = () => {
    const repaired = autoRepairScreenplayTags(screenplay.rawText);
    onChangeRawText(repaired);
    setRepairedSuccess(true);
    setTimeout(() => setRepairedSuccess(false), 2500);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(screenplay.rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([screenplay.rawText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${screenplay.title.toLowerCase().replace(/\s+/g, "_")}_script.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSrt = () => {
    const srt = generateSrtContent(screenplay.chapters);
    const blob = new Blob([srt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${screenplay.title.toLowerCase().replace(/\s+/g, "_")}.srt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    const csv = generateCsvContent(screenplay.chapters, screenplay.title);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${screenplay.title.toLowerCase().replace(/\s+/g, "_")}_scenes.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(screenplay, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${screenplay.title.toLowerCase().replace(/\s+/g, "_")}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Syntax highlight renderer
  const renderHighlightedScript = () => {
    const lines = screenplay.rawText.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Chapter Open
      if (trimmed.startsWith("[chapter-")) {
        const locMatch = trimmed.match(/^\[chapter-([^\]]+)\]/);
        const locKey = locMatch ? locMatch[1] : "";
        const matchedChapter = screenplay.chapters.find((c) => c.locationKey === locKey);
        const hasTooManyChars = matchedChapter && !matchedChapter.isCharacterCountValid;

        return (
          <div key={idx} className="my-1.5">
            <div className={`py-1 px-2 rounded font-bold border-l-2 flex flex-wrap items-center justify-between gap-2 ${
              hasTooManyChars
                ? "bg-rose-950/60 text-rose-300 border-rose-500"
                : "bg-amber-950/40 text-amber-300 border-amber-500"
            }`}>
              <div className="flex items-center">
                <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
                <span>{line}</span>
              </div>
              {matchedChapter && (
                <div className="flex items-center gap-1.5 text-[11px] font-sans">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    hasTooManyChars
                      ? "bg-rose-500/30 text-rose-200 border border-rose-500/50"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {matchedChapter.speakingCharacterCount} nhân vật thoại ({matchedChapter.speakingCharacters.join(", ")})
                  </span>
                </div>
              )}
            </div>
            {hasTooManyChars && (
              <div className="mt-1 px-3 py-1 rounded bg-rose-950/80 border border-rose-800 text-[11px] text-rose-300 font-sans flex items-center gap-1.5">
                <span className="font-bold">⚠️ VƯỢT QUÁ GIỚI HẠN:</span> Chương này có {matchedChapter.speakingCharacterCount} nhân vật thoại (quy định tối đa 3–4). Hãy tách thành 2 chương liên tiếp: [chapter-{matchedChapter.locationKey}-1] và [chapter-{matchedChapter.locationKey}-2]!
              </div>
            )}
          </div>
        );
      }

      // Chapter Close
      if (trimmed.startsWith("[/chapter-")) {
        return (
          <div key={idx} className="py-0.5 px-2 text-amber-400/80 font-bold my-1">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            {line}
          </div>
        );
      }

      // Mota Open
      if (trimmed.startsWith("[mota-")) {
        return (
          <div key={idx} className="py-0.5 px-2 text-emerald-300/90 bg-emerald-950/20 rounded-t my-0.5 border-l-2 border-emerald-500">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            <span className="font-semibold text-emerald-400">{line.match(/^\[mota-\d+\]/)?.[0]}</span>
            <span>{line.replace(/^\[mota-\d+\]/, "")}</span>
          </div>
        );
      }

      // Style tag
      if (trimmed.startsWith("[style:")) {
        return (
          <div key={idx} className="py-0.5 px-2 text-fuchsia-300 bg-fuchsia-950/30 rounded my-0.5 border-l-2 border-fuchsia-400 ml-3 flex items-center gap-1.5 font-mono text-xs">
            <span className="text-neutral-500 select-none mr-2 text-[11px]">{idx + 1}</span>
            <span className="text-fuchsia-400 font-semibold">{line}</span>
          </div>
        );
      }

      // Background tag
      if (trimmed.startsWith("[background-")) {
        const bgMatch = trimmed.match(/^\[background-([a-zA-Z0-9_-]+)\]([\s\S]*?)\[\/background\]/);
        if (bgMatch) {
          const bgTag = bgMatch[1];
          const bgDesc = bgMatch[2].trim();
          return (
            <div key={idx} className="py-1 px-2.5 text-teal-200 bg-teal-950/40 rounded my-1 border-l-2 border-teal-400 ml-3 text-xs leading-relaxed">
              <div className="flex items-center gap-1.5 font-mono text-teal-300 font-bold mb-0.5">
                <span className="text-neutral-500 select-none mr-2 text-[11px]">{idx + 1}</span>
                <span>[background-{bgTag}]</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900/60 text-teal-200 font-sans font-normal border border-teal-700/50">Bối cảnh tĩnh chuẩn</span>
              </div>
              <p className="font-sans text-teal-100/90 pl-6">{bgDesc}</p>
              <div className="text-right text-teal-400 font-mono text-[11px]">[/background]</div>
            </div>
          );
        }
        return (
          <div key={idx} className="py-0.5 px-2 text-teal-300 font-medium ml-3 text-xs">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            {line}
          </div>
        );
      }

      // Mota Close
      if (trimmed === "[/mota]") {
        return (
          <div key={idx} className="py-0.5 px-2 text-emerald-400/80 font-semibold bg-emerald-950/10 rounded-b mb-1.5 border-l-2 border-emerald-500">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            <span>[/mota]</span>
          </div>
        );
      }

      // Pause tag: [1-second] or [2-second] or legacy [pause-1-second], [pau-1]
      const pauMatch = line.match(/^(\s*)\[(?:(\d+)-second(?:s)?|pause-(?:(\d+)-second(?:s)?|(\d+))|pau-(\d+))\](.*?)\[\/(?:(?:\d+)-second(?:s)?|pause-(?:\d+)-second(?:s)?|pause-\d+|pause|pau)\]/i);
      if (pauMatch) {
        const pauSec = pauMatch[2] || pauMatch[3] || pauMatch[4] || pauMatch[5] || "1";
        const pauContent = pauMatch[6];
        return (
          <div key={idx} className="py-0.5 px-2 text-purple-200 bg-purple-950/30 rounded my-0.5 border-l-2 border-purple-400 ml-3">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            <span className="font-bold text-purple-400">[{pauSec}-second]</span>
            <span className="font-medium text-purple-100">{pauContent}</span>
            <span className="font-bold text-purple-400">[/{pauSec}-second]</span>
          </div>
        );
      }

      // Character dialogue tag: [Mom_Emma]...[/Mom_Emma] or legacy [char-xxx]
      const charMatch = line.match(/^(\s*)\[(?:char-)?(?!chapter|mota|background|scene|prop|outfit|style|\d+-second|pause|pau)([a-zA-Z0-9_]+)\]([\s\S]*?)\[\/(?:char-)?\2\]/i);
      if (charMatch) {
        const charName = charMatch[2];
        const dialogue = charMatch[3];
        return (
          <div key={idx} className="py-0.5 px-2 text-sky-200 bg-sky-950/30 rounded my-0.5 border-l-2 border-sky-400 ml-3">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            <span className="font-bold text-sky-400">[{charName}]</span>
            <span className="font-semibold text-white">{dialogue}</span>
            <span className="font-bold text-sky-400">[/{charName}]</span>
          </div>
        );
      }

      // Graphic Asset tags if present in pasted text
      if (trimmed.startsWith("[scene-") || trimmed.startsWith("[prop-") || trimmed.startsWith("[outfit-")) {
        return (
          <div
            key={idx}
            className="py-0.5 px-2 rounded bg-neutral-800/40 text-neutral-400 font-mono text-xs my-0.5"
          >
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            {line}
          </div>
        );
      }

      if (trimmed.startsWith("[/scene-") || trimmed.startsWith("[/prop-") || trimmed.startsWith("[/outfit-")) {
        return (
          <div key={idx} className="py-0.5 px-2 text-neutral-500 font-mono my-0.5 text-xs">
            <span className="text-neutral-600 select-none mr-3 text-[11px]">{idx + 1}</span>
            {line}
          </div>
        );
      }

      // Highlight new scene indicator
      if (trimmed.includes("[MỚI - cần tạo ảnh và lưu lại]")) {
        return (
          <div key={idx} className="py-0.5 px-2 text-amber-300 font-bold bg-amber-500/20 rounded border border-amber-500/40 my-1">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            {line}
          </div>
        );
      }

      // Highlight @Character anchor token
      if (trimmed.startsWith("@")) {
        return (
          <div key={idx} className="py-0.5 px-2 text-rose-200">
            <span className="text-neutral-500 select-none mr-3 text-[11px]">{idx + 1}</span>
            <span className="font-bold text-rose-400">{line.match(/^@[a-zA-Z0-9_]+/)?.[0]}</span>
            <span>{line.replace(/^@[a-zA-Z0-9_]+/, "")}</span>
          </div>
        );
      }

      // Default line
      return (
        <div key={idx} className="py-0.5 px-2 text-neutral-300">
          <span className="text-neutral-600 select-none mr-3 text-[11px]">{idx + 1}</span>
          {line}
        </div>
      );
    });
  };

  const renderCinematicBeatsView = () => {
    return (
      <div className="space-y-4 font-sans">
        {/* Quick Toolbar for Beats View */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-neutral-800 text-xs text-neutral-400">
          <span className="font-mono text-neutral-300">
            {screenplay.chapters.length} chương phân cảnh điện ảnh ({screenplay.metrics.totalDurationSeconds}s)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={collapseAllChapters}
              className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium transition"
            >
              Thu gọn tất cả
            </button>
            <button
              onClick={expandAllChapters}
              className="px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium transition"
            >
              Mở tất cả
            </button>
          </div>
        </div>

        {screenplay.chapters.map((chapter, cIdx) => {
          // Group beats by mota
          const motaGroups: SceneBeat[][] = [];
          let currentGroup: SceneBeat[] = [];

          chapter.beats.forEach((b) => {
            if (b.turnIndex === 1 || !b.turnIndex) {
              if (currentGroup.length > 0) {
                motaGroups.push(currentGroup);
              }
              currentGroup = [b];
            } else {
              currentGroup.push(b);
            }
          });
          if (currentGroup.length > 0) {
            motaGroups.push(currentGroup);
          }

          const isCollapsed = collapsedChapters[chapter.id];

          return (
            <div key={chapter.id} className="border border-neutral-800 rounded-xl bg-neutral-900/80 overflow-hidden transition-all">
              {/* Clickable Chapter Header */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="w-full p-3 bg-neutral-800/80 hover:bg-neutral-800 border-b border-neutral-700/80 flex flex-wrap items-center justify-between gap-2 text-left transition"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs font-mono">
                    CHƯƠNG {cIdx + 1}
                  </span>
                  <span className="font-bold text-neutral-200 text-sm font-mono">
                    [chapter-{chapter.locationKey}]
                  </span>
                  <span className="text-xs text-neutral-400 font-mono">
                    ({chapter.beats.length} câu • {motaGroups.length} cảnh)
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-400 font-mono">
                  <span>{chapter.durationSeconds}s ({formatTime(chapter.durationSeconds)})</span>
                  <span>•</span>
                  <span>{chapter.speakingCharacterCount} NV ({chapter.speakingCharacters.join(", ")})</span>
                  <span className="p-1 rounded hover:bg-neutral-700 text-neutral-300 transition">
                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  </span>
                </div>
              </button>

              {/* Mota Scenes in Chapter (Collapsible) */}
              {!isCollapsed && (
                <div className="p-3.5 space-y-3.5 animate-fadeIn">
                  {motaGroups.map((group, gIdx) => {
                  const firstBeat = group[0];
                  const lastBeat = group[group.length - 1];
                  const motaSec = firstBeat.motaDuration || firstBeat.durationSeconds;
                  const isStandard = motaSec === 6 || motaSec === 8 || motaSec === 10;
                  const isLong = firstBeat.isCinematicLongScene || motaSec >= 7;
                  const isMulti = group.length > 1;
                  const silentChars = firstBeat.silentCharacters;

                  return (
                    <div
                      key={gIdx}
                      className={`p-3.5 rounded-xl border transition ${
                        !isStandard
                          ? "bg-neutral-950 border-amber-800/60 shadow-sm"
                          : isLong
                          ? "bg-neutral-950 border-violet-800/60 shadow-sm"
                          : "bg-neutral-950/70 border-neutral-800"
                      }`}
                    >
                      {/* Scene Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-neutral-800/80">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded font-mono text-xs font-bold border ${
                            isStandard
                              ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                              : "bg-amber-950 text-amber-300 border-amber-700"
                          }`}>
                            [mota-{motaSec}]
                          </span>
                          <span className="text-xs text-neutral-400 font-mono">
                            {motaSec}s
                          </span>
                          {!isStandard && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-700 text-[10px] font-semibold">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              Khác 6/8/10s
                            </span>
                          )}
                          {isLong && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-700 text-[11px] font-semibold">
                              <Clapperboard className="w-3 h-3 text-amber-400" />
                              Cảnh điện ảnh ({motaSec}s)
                            </span>
                          )}
                          {isMulti && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700 text-[11px] font-semibold">
                              <MessagesSquare className="w-3 h-3 text-blue-400" />
                              Hội thoại {group.length} lượt
                            </span>
                          )}
                          {silentChars && silentChars.length > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700 text-[11px] font-semibold">
                              <Eye className="w-3 h-3 text-emerald-400" />
                              Nhân vật im lặng: {silentChars.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Style & Background Tag display */}
                      {(firstBeat.style || firstBeat.backgroundTag) && (
                        <div className="mb-2.5 space-y-1.5">
                          {firstBeat.style && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-fuchsia-950/40 border border-fuchsia-800/60 text-[11px] text-fuchsia-200 font-mono">
                              <Sparkles className="w-3 h-3 text-fuchsia-400 shrink-0" />
                              <span className="text-fuchsia-400 font-bold">[style:</span>
                              <span className="truncate text-fuchsia-200">{firstBeat.style}</span>
                              <span className="text-fuchsia-400 font-bold">]</span>
                            </div>
                          )}
                          {firstBeat.backgroundTag && (
                            <div className="p-2 rounded-lg bg-teal-950/40 border border-teal-800/60 text-xs">
                              <div className="flex items-center gap-1.5 text-teal-300 font-mono font-bold text-[11px] mb-1">
                                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                                <span>[background-{firstBeat.backgroundTag}]</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900/70 text-teal-200 font-sans font-normal border border-teal-700/50">
                                  Bối cảnh tĩnh chuẩn
                                </span>
                              </div>
                              <p className="text-teal-100/90 text-[11px] leading-relaxed font-sans pl-4 border-l-2 border-teal-700/40">
                                {firstBeat.backgroundDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual and Audio Description */}
                      <div className="text-xs text-neutral-300 bg-neutral-900/90 p-2.5 rounded-lg border border-neutral-800 leading-relaxed mb-3">
                        <p className="font-sans text-neutral-200">{firstBeat.description}</p>
                      </div>

                      {/* Turns inside this Mota */}
                      <div className="space-y-2">
                        {group.map((beat, bIdx) => (
                          <div
                            key={beat.id}
                            className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            <div className="space-y-1.5 flex-1">
                              {beat.pauseSeconds && beat.pauseSeconds > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/70 text-[11px]">
                                  <Clock className="w-3 h-3 text-purple-400" />
                                  <span className="font-mono font-bold">[{beat.pauseSeconds}-second]</span>
                                  {beat.pauseDescription && (
                                    <span className="italic text-purple-200">({beat.pauseDescription})</span>
                                  )}
                                </div>
                              )}
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-sky-400 font-mono shrink-0">
                                  [{beat.character}]:
                                </span>
                                <span className="font-medium text-white text-sm">
                                  "{beat.dialogue}"
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] shrink-0 font-mono text-neutral-400">
                              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">
                                {beat.wordCount} từ
                              </span>
                              <span className={`px-1.5 py-0.5 rounded ${
                                beat.isSpeechRateExceeded
                                  ? "bg-rose-950 text-rose-300 border border-rose-800"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              }`}>
                                {beat.speechRate} w/s
                              </span>
                              {isMulti && (
                                <span className="text-neutral-500 font-sans">
                                  Lượt {beat.turnIndex || bIdx + 1}/{group.length}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Ending Pause Cushion Indicator */}
                      {lastBeat.hasEndingPause ? (
                        <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-950/60 text-purple-200 border border-purple-800/60 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span className="font-mono font-bold text-purple-300">[{lastBeat.endingPauseSeconds || 1}-second]</span>
                            <span className="text-purple-300 font-medium">Đệm kết thúc cảnh: {lastBeat.endingPauseDescription || "Khoảng lặng lắng đọng trước khi chuyển cảnh"}</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" /> Giữ nhịp thoại, không ngắt đột ngột
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2.5 pt-2 border-t border-rose-900/40 flex items-center justify-between text-xs">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800/60 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>Thiếu thẻ [1-second] cuối cảnh — Cảnh có nguy cơ bị cắt đột ngột ngay sau câu nói!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden flex flex-col">
      {/* Action Header */}
      <div className="p-3.5 sm:p-4 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Code2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Kịch bản Định dạng Thẻ Gốc
            </h3>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              Kịch bản thuần túy
            </span>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 inline-flex items-center gap-1 font-medium underline decoration-dotted ml-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>{showGuide ? "Ẩn hướng dẫn" : "Hướng dẫn thẻ"}</span>
              {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* View Mode and Copy / Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switch */}
          <div className="flex items-center bg-neutral-200 dark:bg-neutral-800 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode("highlight")}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === "highlight"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              Màu thẻ
            </button>
            <button
              onClick={() => setViewMode("beats")}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                viewMode === "beats"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              <Clapperboard className="w-3 h-3 text-amber-500" />
              <span>Phân cảnh</span>
            </button>
            <button
              onClick={() => setViewMode("plain")}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === "plain"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              Văn bản thô
            </button>
            <button
              onClick={() => setViewMode("edit")}
              className={`px-2.5 py-1 rounded-md transition ${
                viewMode === "edit"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
              }`}
            >
              Chỉnh sửa
            </button>
          </div>

          {/* Auto-Repair Button */}
          <button
            onClick={handleAutoRepair}
            title="Tự động chuẩn hóa kịch bản: thời lượng 6, 8, hoặc 10s cho mỗi cảnh, chèn thẻ đệm [pause-1-second] cuối cảnh"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
          >
            {repairedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Đã chuẩn hóa!</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Chuẩn hóa thẻ</span>
              </>
            )}
          </button>

          {/* Save Script Button */}
          {onSaveScript && (
            <button
              onClick={onSaveScript}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm ${
                isSaved
                  ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/25"
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã lưu</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            disabled={!screenplay.rawText.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Đã copy" : "Copy thẻ"}</span>
          </button>

          {/* Export Buttons */}
          <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-neutral-700 pl-1.5">
            <button
              onClick={handleDownloadTxt}
              title="Tải tệp văn bản .TXT"
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition text-xs flex items-center gap-1 font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.TXT</span>
            </button>

            <button
              onClick={handleDownloadSrt}
              title="Tải phụ đề .SRT (Subtitle) khớp giây lồng tiếng"
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition text-xs flex items-center gap-1 font-medium"
            >
              <FileText className="w-3.5 h-3.5 text-rose-500" />
              <span>.SRT</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              title="Tải file .CSV (Scene & Voice) cho CapCut / ElevenLabs / Runway"
              className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition text-xs flex items-center gap-1 font-medium"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>.CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Format Guide (only shown when toggled) */}
      {showGuide && (
        <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-neutral-700 dark:text-neutral-300 animate-fadeIn space-y-1">
          <div className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Quy chuẩn thẻ kịch bản YouTube Kids EN:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-[11px]">
            <div className="p-2 rounded bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-100">[chapter-XXX]:</strong> Khối bối cảnh chính, tối đa 3–4 nhân vật có thoại.
            </div>
            <div className="p-2 rounded bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-100">[mota-6/8/10]:</strong> Mỗi cảnh bắt buộc 6, 8 hoặc 10s. Ưu tiên [mota-10] làm cảnh chủ đạo.
            </div>
            <div className="p-2 rounded bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-100">[background-...]:</strong> Mô tả 1 câu ngắn gọn, đồng nhất 100% giữa các cảnh cùng bối cảnh.
            </div>
            <div className="p-2 rounded bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-100">[1-second]:</strong> Đệm 1s cuối mỗi cảnh sau câu thoại để tránh cắt cảnh đột ngột.
            </div>
            <div className="p-2 rounded bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-100">[char-Tên_NV]:</strong> Tối đa 4 nhân vật có thoại trong cả câu chuyện, nói chậm ≤1.7 từ/giây.
            </div>
            <div className="p-2 rounded bg-white/60 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800">
              <strong className="text-neutral-900 dark:text-neutral-100">[pau-x]:</strong> Khoảng lặng đệm tự nhiên trước/giữa các lời thoại.
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Chapters Quick Navigation strip */}
      {screenplay.chapters.length > 0 && (
        <div className="bg-neutral-100/70 dark:bg-neutral-800/40 border-b border-neutral-200/80 dark:border-neutral-800 text-xs transition-all">
          <div className="px-4 py-1.5 flex items-center justify-between gap-2">
            <button
              onClick={() => setShowChapterStrip(!showChapterStrip)}
              className="text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
            >
              <MapPin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Các chương ({screenplay.chapters.length})</span>
              {showChapterStrip ? <ChevronUp className="w-3 h-3 text-neutral-400" /> : <ChevronDown className="w-3 h-3 text-neutral-400" />}
            </button>

            {showChapterStrip && (
              <span className="text-[10px] text-neutral-400 hidden sm:inline">
                Cuộn ngang để xem tất cả các chương
              </span>
            )}
          </div>

          {showChapterStrip && (
            <div className="px-4 pb-2 pt-0.5 flex items-center gap-2 overflow-x-auto animate-fadeIn">
              {screenplay.chapters.map((ch, i) => (
                <span
                  key={ch.id}
                  className={`px-2.5 py-1 rounded border font-mono shrink-0 flex items-center gap-1.5 transition ${
                    ch.isCharacterCountValid
                      ? "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  <span className={ch.isCharacterCountValid ? "text-amber-600 dark:text-amber-400 font-bold" : "text-rose-600 dark:text-rose-400 font-bold"}>
                    C{i + 1}:
                  </span>
                  <span>[chapter-{ch.locationKey}]</span>
                  <span className="text-[10px] text-neutral-400">({ch.beats.length} câu, {ch.durationSeconds}s)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-medium ${
                    ch.isCharacterCountValid
                      ? "bg-neutral-100 dark:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300"
                      : "bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/30"
                  }`}>
                    {ch.speakingCharacterCount} NV {ch.isCharacterCountValid ? "" : "⚠️ >4"}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 flex-1 bg-neutral-950 text-neutral-100 font-mono text-xs sm:text-sm overflow-x-auto min-h-[520px]">
        {viewMode === "edit" ? (
          <textarea
            value={screenplay.rawText}
            onChange={(e) => onChangeRawText(e.target.value)}
            className="w-full h-full min-h-[520px] bg-transparent text-neutral-100 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed"
            placeholder="Dán hoặc nhập kịch bản theo định dạng thẻ: [chapter-xxx] ... [mota-8] ... [char-Lucy] ... [/char-Lucy] ... [/mota] ... [/chapter-xxx]"
            spellCheck={false}
          />
        ) : !screenplay.rawText.trim() ? (
          <div className="h-full min-h-[480px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-200 mb-1">
              Kịch bản đang trống
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto mb-5 leading-relaxed font-sans">
              Nhập tiêu đề video ở ô phía trên và bấm <strong>"Sáng tác Kịch bản"</strong> để tạo tự động, hoặc bấm <strong>"Viết kịch bản"</strong> để tự soạn thảo định dạng thẻ.
            </p>
            <button
              onClick={() => setViewMode("edit")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-sans text-xs font-semibold shadow-sm transition"
            >
              <Edit3 className="w-4 h-4" />
              <span>Chuyển sang chế độ Chỉnh sửa & Viết</span>
            </button>
          </div>
        ) : viewMode === "plain" ? (
          <pre className="whitespace-pre-wrap leading-relaxed font-mono text-neutral-200">
            {screenplay.rawText}
          </pre>
        ) : viewMode === "beats" ? (
          renderCinematicBeatsView()
        ) : (
          <div className="font-mono leading-relaxed space-y-0.5">
            {renderHighlightedScript()}
          </div>
        )}
      </div>

      {/* Footer status bar */}
      <div className="px-4 py-2.5 bg-black text-neutral-400 text-xs font-mono border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>StoryForge Kids EN • Hệ thống thẻ độc quyền</span>
          </span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">{screenplay.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{screenplay.metrics.totalLines} câu</span>
          <span>•</span>
          <span>{screenplay.metrics.totalWords} từ</span>
          <span>•</span>
          <span>{screenplay.metrics.totalDurationSeconds} giây ({formatTime(screenplay.metrics.totalDurationSeconds)})</span>
        </div>
      </div>
    </div>
  );
};
