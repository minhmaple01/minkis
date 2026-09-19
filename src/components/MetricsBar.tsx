import React, { useState } from "react";
import {
  Clock,
  Layers,
  Type,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Volume2,
  Activity,
  Users,
  Clapperboard,
  MessagesSquare,
  Eye,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ScriptMetrics } from "../types";
import { formatTime } from "../utils/parser";

interface MetricsBarProps {
  metrics: ScriptMetrics;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    totalDurationSeconds,
    totalLines,
    totalWords,
    averageWordsPerLine,
    maxWordsInSingleLine,
    linesExceeding15Words,
    isDurationValid,
    isLineCountValid,
    isWordCountValid,
    characterLineCounts,
    scenesWithoutAudioCount,
    isAudioComplete,
    maxSssValue,
    totalPauseCount,
    totalPauseSeconds,
    averageSpeechRate,
    maxSpeechRate,
    speechRateViolations,
    isSpeechRateValid,
    missingPauseBufferCount,
    chapterCharacterLimitViolations,
    isChapterCharacterLimitValid,
    scenesMissingEndingPauseCount,
    isEndingPauseComplete,
    nonStandardDurationScenesCount,
    isSceneDurationStandard,
    durationBreakdown,
    scenesMissingBackgroundCount,
    isBackgroundComplete,
    backgroundConsistencyViolationsCount,
    isBackgroundConsistent,
    uniqueBackgroundTags,
    totalStoryCharacters,
    isStoryCharacterLimitValid,
    storyCharacters,
    is10sScenesPrioritized,
    duration10sPercentage,
  } = metrics;

  const isAllValid =
    isDurationValid &&
    isLineCountValid &&
    isWordCountValid &&
    linesExceeding15Words.length === 0 &&
    isAudioComplete &&
    maxSssValue <= 10 &&
    isSpeechRateValid &&
    isStoryCharacterLimitValid &&
    isChapterCharacterLimitValid &&
    isEndingPauseComplete &&
    isSceneDurationStandard &&
    isBackgroundComplete &&
    isBackgroundConsistent;

  const warningCount = [
    !isDurationValid,
    !isLineCountValid,
    !isWordCountValid,
    linesExceeding15Words.length > 0,
    !isAudioComplete,
    maxSssValue > 10,
    !isSpeechRateValid,
    !isStoryCharacterLimitValid,
    !isChapterCharacterLimitValid,
    !isEndingPauseComplete,
    !isSceneDurationStandard,
    !isBackgroundComplete,
    !isBackgroundConsistent,
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm overflow-hidden transition-all">
      {/* Collapsed / Compact Summary Bar */}
      <div className="p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 bg-neutral-50/70 dark:bg-neutral-800/40">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Main Status Pill */}
          <div className="flex items-center gap-1.5">
            {isAllValid ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Chuẩn 100% YouTube</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-800 dark:text-amber-300 font-semibold text-xs border border-amber-500/30">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{warningCount} mục cần lưu ý</span>
              </span>
            )}
          </div>

          {/* Scannable Metric Chips */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs">
            <span
              className={`px-2 py-0.5 rounded-md border font-medium font-mono flex items-center gap-1 ${
                isDurationValid
                  ? "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
              }`}
              title="Tổng thời lượng kịch bản (Chuẩn: 300–460s)"
            >
              <Clock className="w-3 h-3 text-neutral-400" />
              <span>{totalDurationSeconds}s ({formatTime(totalDurationSeconds)})</span>
            </span>

            <span
              className={`px-2 py-0.5 rounded-md border font-medium font-mono flex items-center gap-1 ${
                isLineCountValid
                  ? "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                  : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
              }`}
              title="Tổng số câu thoại (Chuẩn: 60–90 câu)"
            >
              <Layers className="w-3 h-3 text-neutral-400" />
              <span>{totalLines} câu</span>
            </span>

            <span
              className={`px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                isStoryCharacterLimitValid
                  ? "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
              }`}
              title="Số nhân vật có thoại trong toàn bộ câu chuyện (Tối đa 4)"
            >
              <Users className="w-3 h-3 text-neutral-400" />
              <span>{totalStoryCharacters}/4 NV</span>
            </span>

            <span
              className={`hidden md:inline-flex px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                isSpeechRateValid
                  ? "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
              }`}
              title="Tốc độ nói trung bình (Chuẩn ≤ 1.7 từ/giây)"
            >
              <Activity className="w-3 h-3 text-neutral-400" />
              <span>{averageSpeechRate} wps</span>
            </span>

            <span
              className={`hidden lg:inline-flex px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                isBackgroundComplete && isBackgroundConsistent
                  ? "bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 border-neutral-200 dark:border-neutral-700"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
              }`}
              title="Tính đồng nhất và đầy đủ của thẻ [background-...]"
            >
              <MapPin className="w-3 h-3 text-teal-500" />
              <span>Bối cảnh {isBackgroundComplete && isBackgroundConsistent ? "đồng nhất" : "cần sửa"}</span>
            </span>

            <span
              className={`hidden lg:inline-flex px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${
                isEndingPauseComplete
                  ? "bg-white dark:bg-neutral-800 text-emerald-700 dark:text-emerald-400 border-neutral-200 dark:border-neutral-700"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
              }`}
              title="Đệm [1-second] cuối mỗi cảnh để tránh cắt thoại đột ngột"
            >
              <span>[1-second]: {isEndingPauseComplete ? "100%" : "thiếu"}</span>
            </span>
          </div>
        </div>

        {/* Toggle Expand / Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-white dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition shrink-0 shadow-sm"
        >
          <span>{isExpanded ? "Thu gọn chỉ số" : "Chi tiết kiểm định"}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-neutral-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
          )}
        </button>
      </div>

      {/* Expanded Full Diagnostic Details */}
      {isExpanded && (
        <div className="p-4 sm:p-5 border-t border-neutral-200/80 dark:border-neutral-800 space-y-4">
          {/* Header title */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Chi tiết Kiểm duyệt Quy tắc &amp; Tiêu chuẩn Kịch bản YouTube
              </h2>
            </div>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              Tiêu chuẩn kỹ thuật AI Studio
            </span>
          </div>

          {/* 4 Core Quantitative Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Duration */}
            <div
              className={`p-3.5 rounded-xl border ${
                isDurationValid
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Tổng số giây
                </span>
                <span
                  className={`font-bold ${
                    isDurationValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isDurationValid ? "Đạt chuẩn" : "Chưa đủ"}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalDurationSeconds}s{" "}
                <span className="text-xs font-normal text-neutral-400">
                  ({formatTime(totalDurationSeconds)})
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Quy định: 300–460 giây (~5.0–7.5 phút)
              </div>
            </div>

            {/* Lines */}
            <div
              className={`p-3.5 rounded-xl border ${
                isLineCountValid
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> Tổng số câu
                </span>
                <span
                  className={`font-bold ${
                    isLineCountValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isLineCountValid ? "Đạt chuẩn" : "Chưa đủ"}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalLines}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  câu thoại
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Quy định: 60–90 câu (+40% độ dài)
              </div>
            </div>

            {/* Total Words */}
            <div
              className={`p-3.5 rounded-xl border ${
                isWordCountValid
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Tổng số từ
                </span>
                <span
                  className={`font-bold ${
                    isWordCountValid
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isWordCountValid ? "Đạt chuẩn" : "Cần xem lại"}
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {totalWords}{" "}
                <span className="text-xs font-normal text-neutral-400">từ</span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Quy định: 220–480 từ
              </div>
            </div>

            {/* Avg words/line & max length */}
            <div
              className={`p-3.5 rounded-xl border ${
                maxWordsInSingleLine <= 8
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40"
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Độ dài câu
                </span>
                <span
                  className={`font-bold ${
                    maxWordsInSingleLine <= 8
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  Max: {maxWordsInSingleLine}t
                </span>
              </div>
              <div className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
                ~{averageWordsPerLine}{" "}
                <span className="text-xs font-normal text-neutral-400">
                  từ/câu
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                Chuẩn A2: TB 3–5 từ, Max ≤ 8 từ
              </div>
            </div>
          </div>

          {/* Specific Compliance Checks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {/* Background Tag & Consistency Card */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isBackgroundComplete && isBackgroundConsistent
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <MapPin
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isBackgroundComplete && isBackgroundConsistent
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Bối cảnh [background]</span>
                  {isBackgroundComplete && isBackgroundConsistent ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      ✓ Đồng nhất ({uniqueBackgroundTags.length} bối cảnh)
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      {!isBackgroundComplete
                        ? `Thiếu ở ${scenesMissingBackgroundCount} cảnh`
                        : `${backgroundConsistencyViolationsCount} cảnh không khớp mô tả gốc!`}
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Mô tả ngắn gọn, tóm tắt 1 câu, đồng nhất 100% giữa các cảnh cùng bối cảnh.
                </p>
              </div>
            </div>

            {/* Ending Pause Cushion Card (pau-1 at end of each mota) */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isEndingPauseComplete
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <Clock
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isEndingPauseComplete
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Đệm cuối cảnh [1-second]</span>
                  {isEndingPauseComplete ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      ✓ 100% Cảnh có [1-second]
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      {scenesMissingEndingPauseCount} cảnh thiếu [1-second]!
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Mỗi cảnh kết thúc bằng [1-second], không ngắt cảnh đột ngột ngay khi dứt thoại.
                </p>
              </div>
            </div>

            {/* Standard Scene Duration Card (6s, 8s, 10s strictly) */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isSceneDurationStandard
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <Clapperboard
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isSceneDurationStandard
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Thời lượng cảnh 6, 8, 10s</span>
                  {isSceneDurationStandard ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      ✓ 100% Chuẩn ({durationBreakdown.duration6s}x6s, {durationBreakdown.duration8s}x8s, {durationBreakdown.duration10s}x10s)
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      {nonStandardDurationScenesCount} cảnh sai thời lượng!
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Thời gian mỗi cảnh [mota] bắt buộc là 6, 8 hoặc 10 giây.
                </p>
              </div>
            </div>

            {/* Speech Rate Card */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isSpeechRateValid
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <Activity
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isSpeechRateValid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Tốc độ nói</span>
                  {isSpeechRateValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      ✓ TB {averageSpeechRate} wps
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      {speechRateViolations.length} câu quá nhanh!
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Trần thuật chậm rãi ≤ 1.7 từ/s (~100 wpm). Cảm thán ngắn ≤ 2.5 từ/s. Peak: {maxSpeechRate} wps.
                </p>
              </div>
            </div>

            {/* Story Character Limit Card (Max 4 characters per story) */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isStoryCharacterLimitValid
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50"
              }`}
            >
              <Users
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  isStoryCharacterLimitValid
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Nhân vật cả câu chuyện</span>
                  {isStoryCharacterLimitValid ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      ✓ {totalStoryCharacters}/4 Nhân vật
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-bold text-[11px]">
                      {totalStoryCharacters} nhân vật (vượt quá 4!)
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Mỗi câu chuyện chỉ dùng tối đa 4 nhân vật có thoại xuyên suốt toàn bộ kịch bản.
                </p>
              </div>
            </div>

            {/* Priority 10s Scenes Card */}
            <div
              className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                is10sScenesPrioritized
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                  : "bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50"
              }`}
            >
              <Clapperboard
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  is10sScenesPrioritized
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              />
              <div className="text-xs">
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <span>Ưu tiên cảnh dài 10s</span>
                  {is10sScenesPrioritized ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                      ✓ Ưu tiên 10s ({duration10sPercentage}% - {durationBreakdown.duration10s} cảnh)
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                      {duration10sPercentage}% ({durationBreakdown.duration10s} cảnh 10s)
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Tạo nhịp phim thư thái, sâu lắng cho kênh YouTube trẻ em.
                </p>
              </div>
            </div>
          </div>

          {/* Warnings List Box if any issues exist */}
          {!isAllValid && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
              <div className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Chi tiết các điểm cần hoàn thiện:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-rose-700 dark:text-rose-300">
                {!isStoryCharacterLimitValid && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">
                      Vượt quá giới hạn nhân vật cả câu chuyện ({totalStoryCharacters} nhân vật):
                    </strong>{" "}
                    Mỗi câu chuyện chỉ được có tối đa 4 nhân vật có lời thoại ([Tên_Nhân_Vật]). Hiện tại kịch bản có các nhân vật:{" "}
                    {storyCharacters?.map((c) => c.replace(/_/g, " ")).join(", ")}. Hãy giảm bớt nhân vật hoặc chuyển thành nhân vật im lặng trong [mota].
                  </li>
                )}
                {!is10sScenesPrioritized && (
                  <li>
                    <span className="text-amber-800 dark:text-amber-300">Ưu tiên cảnh dài 10s:</span> Nên sử dụng cảnh [mota-10] làm loại cảnh chủ đạo (hiện có {durationBreakdown.duration10s} cảnh 10s, chiếm {duration10sPercentage}%). Hãy ưu tiên dùng [mota-10] để tạo nhịp phim thư thái và giàu biểu cảm.
                  </li>
                )}
                {!isBackgroundComplete && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">
                      Thiếu thẻ [background-...] ({scenesMissingBackgroundCount} cảnh):
                    </strong>{" "}
                    Mỗi cảnh [mota] bắt buộc phải có thẻ <code>[background-ten_boi_canh]...[/background]</code> mô tả chi tiết không gian tĩnh.
                  </li>
                )}
                {!isBackgroundConsistent && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">
                      Bối cảnh không đồng nhất ({backgroundConsistencyViolationsCount} cảnh):
                    </strong>{" "}
                    Các cảnh cùng chung một bối cảnh phải sử dụng LẠI NGUYÊN VĂN cùng một đoạn mô tả bên trong thẻ [background-ten_boi_canh].
                  </li>
                )}
                {!isEndingPauseComplete && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">
                      Thiếu thẻ [1-second] kết thúc cảnh ({scenesMissingEndingPauseCount} cảnh):
                    </strong>{" "}
                    Mỗi cảnh mota bắt buộc kết thúc bằng 1 thẻ [1-second] sau lời thoại cuối để tránh việc ngắt cảnh đột ngột.
                  </li>
                )}
                {!isSceneDurationStandard && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">
                      Thời lượng cảnh sai quy định ({nonStandardDurationScenesCount} cảnh):
                    </strong>{" "}
                    Mỗi cảnh [mota] bắt buộc có thời lượng là 6, 8 hoặc 10 giây (hiện tại có cảnh sử dụng số giây khác).
                  </li>
                )}
                {!isChapterCharacterLimitValid && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">
                      Giới hạn số nhân vật trong mỗi chương vượt ngưỡng ({chapterCharacterLimitViolations.length} chương):
                    </strong>{" "}
                    Quy định mỗi khối [chapter-XXX] chỉ được có tối đa 3–4 nhân vật có lời thoại ([Tên_Nhân_Vật]).
                    <div className="mt-1 space-y-1 pl-3 text-[10px]">
                      {chapterCharacterLimitViolations.map((v, i) => (
                        <div key={i} className="text-rose-700 dark:text-rose-300">
                          • Chương #{v.chapterIndex} (<strong>[chapter-{v.chapterLocationKey}]</strong>): có <strong>{v.characterCount} nhân vật</strong> ({v.characters.map((c) => c.replace(/_/g, " ")).join(", ")}).
                          <span className="block text-neutral-600 dark:text-neutral-400 pl-2">
                            ↳ Giải pháp: Tách thành 2 chương liên tiếp cùng bối cảnh (VD: [chapter-{v.chapterLocationKey}-1] và [chapter-{v.chapterLocationKey}-2]), mỗi chương chỉ giữ 3–4 nhân vật thoại chính.
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                )}
                {speechRateViolations.length > 0 && (
                  <li>
                    <strong className="text-rose-600 dark:text-rose-400">Tốc độ nói vượt ngưỡng:</strong> Có {speechRateViolations.length} cảnh nói quá nhanh (vượt ngưỡng chậm rãi 1.7 từ/giây). Cần giảm số từ xuống 2–5 từ/câu hoặc tăng thời lượng mota để trẻ nghe rõ.
                    <div className="mt-1 space-y-1 pl-3 text-[10px]">
                      {speechRateViolations.slice(0, 3).map((v, i) => (
                        <div key={i} className="text-rose-700 dark:text-rose-300">
                          • Cảnh #{v.lineIndex} ({v.character}): "{v.dialogue}" — {v.wordCount} từ trong {v.speakingDuration}s nói ({v.rate} w/s &gt; {v.threshold} w/s).
                        </div>
                      ))}
                      {speechRateViolations.length > 3 && (
                        <div className="text-neutral-500">và {speechRateViolations.length - 3} cảnh khác...</div>
                      )}
                    </div>
                  </li>
                )}
                {missingPauseBufferCount > 0 && (
                  <li>
                    <span className="text-amber-800 dark:text-amber-300">Nhịp đệm chuyển cảnh:</span> Có {missingPauseBufferCount} câu trần thuật thông thường mở đầu cảnh mới chưa có thẻ [1-second] làm nhịp đệm trước khi nói.
                  </li>
                )}
                {!isDurationValid && (
                  <li>Thời lượng hiện tại là {totalDurationSeconds}s (Yêu cầu phải từ 300 đến 460 giây, ~5.0–7.5 phút).</li>
                )}
                {!isLineCountValid && (
                  <li>Số câu thoại hiện tại là {totalLines} câu (Yêu cầu phải từ 60 đến 90 câu).</li>
                )}
                {!isAudioComplete && (
                  <li>Có {scenesWithoutAudioCount} cảnh thiếu phần mô tả âm thanh trong thẻ [mota].</li>
                )}
                {linesExceeding15Words.length > 0 && (
                  <li>Có {linesExceeding15Words.length} câu dài quá 8 từ (cần rút gọn xuống 2–5 từ/câu).</li>
                )}
              </ul>
            </div>
          )}

          {/* Character Line Distribution and Pause Stats */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-neutral-500 dark:text-neutral-400">
                Phân bổ câu thoại nhân vật ({storyCharacters?.map((c) => c.replace(/_/g, " ")).join(", ") || "Các nhân vật"}):
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium text-[11px] border border-indigo-200 dark:border-indigo-800/40">
                <span>Khoảng lặng [pau]:</span>
                <span className="font-bold">{totalPauseCount} cảnh</span>
                <span className="text-neutral-400">({totalPauseSeconds}s đệm &amp; giữ nhịp đã nằm trọn trong sss mota)</span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(characterLineCounts).map(([char, count]) => (
                <div
                  key={char}
                  className="text-xs px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5"
                >
                  <span>{char.replace(/_/g, " ")}:</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom collapse button */}
          <div className="text-center pt-1">
            <button
              onClick={() => setIsExpanded(false)}
              className="inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium py-1 px-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Thu gọn bảng chỉ số</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
