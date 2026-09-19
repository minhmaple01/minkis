export interface SceneBeat {
  id: string;
  index: number;
  durationSeconds: number;
  description: string;
  pauseSeconds?: number;
  pauseDescription?: string;
  character: string;
  characterDisplayName: string;
  dialogue: string;
  wordCount: number;
  startTime: number;
  endTime: number;
  speakingDuration: number;
  speechRate: number; // words per second during speaking time
  speechRateThreshold: number; // 2.3 wps standard, 4.0 wps for exclamations (<5 words)
  isExclamationOrReaction: boolean;
  isSpeechRateExceeded: boolean;
  missingPauseBuffer?: boolean; // standard dialogue in scene transition missing [pau-1+]
  motaDuration?: number; // duration of the containing [mota-sss] (must be 6, 8, or 10s)
  isMultiTurn?: boolean; // true if mota has multiple dialogues
  turnIndex?: number; // 1-based turn number within the mota
  totalTurnsInMota?: number; // total dialogue turns in this mota
  silentCharacters?: string[]; // characters present/reacting in visual/pause descriptions without speaking
  isCinematicLongScene?: boolean; // true if mota duration is >= 7s (cinematic scene beat)
  endingPauseSeconds?: number; // duration of trailing [pau-1] cushion at the end of mota
  endingPauseDescription?: string; // description of lingering/reaction before scene cut
  hasEndingPause?: boolean; // true if this mota scene ends with a trailing pause cushion
  isStandardSceneDuration?: boolean; // true if mota duration is strictly 6, 8, or 10s
  style?: string; // e.g. "Modern 3D Pixar animation style video with synced voice and dialogue"
  backgroundTag?: string; // e.g. "living_room_morning"
  backgroundDescription?: string; // static environment description inside [background-xxx]...[/background]
}

export interface Chapter {
  id: string;
  chapterIndex: number;
  locationKey: string;
  displayName: string;
  beats: SceneBeat[];
  durationSeconds: number;
  startTime: number;
  endTime: number;
  speakingCharacters: string[]; // unique character tags with [char-xxx] in this chapter
  speakingCharacterCount: number; // number of distinct speaking characters
  isCharacterCountValid: boolean; // maximum 3–4 characters (<= 4)
}

export interface ChapterCharacterLimitViolation {
  chapterIndex: number;
  chapterLocationKey: string;
  characterCount: number;
  characters: string[];
}

export interface ScriptMetrics {
  totalDurationSeconds: number;
  totalLines: number;
  totalWords: number;
  averageWordsPerLine: number;
  maxWordsInSingleLine: number;
  characterLineCounts: Record<string, number>;
  characterWordCounts: Record<string, number>;
  linesExceeding15Words: { lineIndex: number; character: string; dialogue: string; count: number }[];
  isDurationValid: boolean; // 300 - 460s (+40% duration per user request)
  isLineCountValid: boolean; // 60 - 90 lines
  isWordCountValid: boolean; // 220 - 480 words
  consecutiveRepeatSssCount: number; // count of violations where sss repeated > 3 consecutive times
  scenesWithoutAudioCount: number; // mota missing audio cue
  isAudioComplete: boolean; // true if 100% of mota have audio
  isSssVariationValid: boolean; // true if no sss repeats > 3 times
  maxSssValue: number; // maximum sss (must be <= 10)
  totalPauseCount: number; // number of [pau] elements
  totalPauseSeconds: number; // total duration of pauses
  averageSpeechRate: number; // average words per second
  maxSpeechRate: number; // peak words per second
  speechRateViolations: {
    lineIndex: number;
    character: string;
    dialogue: string;
    wordCount: number;
    speakingDuration: number;
    rate: number;
    threshold: number;
  }[];
  isSpeechRateValid: boolean; // true if no speech rate violations
  missingPauseBufferCount: number; // count of standard narrative lines missing transition pause
  chapterCharacterLimitViolations: ChapterCharacterLimitViolation[]; // chapters with > 4 speaking characters
  isChapterCharacterLimitValid: boolean; // true if every chapter has <= 4 speaking characters
  totalStoryCharacters: number; // total unique speaking characters in the entire story
  isStoryCharacterLimitValid: boolean; // true if story uses at most 4 speaking characters total
  storyCharacters: string[]; // names of speaking characters in the story
  is10sScenesPrioritized: boolean; // true if 10s scenes are prioritized (dominant)
  duration10sPercentage: number; // percentage of scenes that are 10s
  cinematicLongScenesCount: number; // count of [mota] with sss >= 7s
  multiTurnScenesCount: number; // count of [mota] with multiple dialogues
  multiTurnPercentage: number; // percentage of scenes with multi-turn dialogues
  isDialogueBalanced: boolean; // true if balanced combination of multi-turn (>= 20%) and single-turn scenes
  silentCharacterInteractionsCount: number; // count of scenes featuring silent character reactions
  scenesMissingEndingPauseCount: number; // count of mota scenes without trailing [pau-1]
  isEndingPauseComplete: boolean; // true if 100% of mota scenes have ending pause cushion
  nonStandardDurationScenesCount: number; // count of mota scenes whose sss is not 6, 8, or 10s
  isSceneDurationStandard: boolean; // true if all mota scenes are strictly 6, 8, or 10s
  durationBreakdown: {
    duration6s: number;
    duration8s: number;
    duration10s: number;
    other: number;
  };
  scenesMissingStyleTagCount: number; // count of mota scenes missing [style: ...]
  isStyleTagComplete: boolean; // true if 100% of mota scenes have [style: ...]
  scenesMissingBackgroundCount: number; // count of mota scenes missing [background-...]
  isBackgroundComplete: boolean; // true if 100% of mota scenes have [background-...]
  backgroundConsistencyViolationsCount: number; // count of scenes with inconsistent background description
  isBackgroundConsistent: boolean; // true if all scenes in the same location use identical background description
  uniqueBackgroundTags: string[]; // unique background tags found in script
}

export interface Screenplay {
  title: string;
  rawText: string;
  chapters: Chapter[];
  metrics: ScriptMetrics;
  createdAt: string;
}

export interface SavedScript {
  id: string;
  title: string;
  rawText: string;
  createdAt: string;
  updatedAt: string;
  metricsSummary: {
    totalDurationSeconds: number;
    totalLines: number;
    totalChapters: number;
    totalWords: number;
  };
}

export interface CharacterInfo {
  id: string;
  name: string;
  tag: string;
  age: string;
  relation: string;
  personality: string;
  role: string;
  avatarEmoji: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  bubbleBg: string;
  bubbleBorder: string;
  voicePitch: number;
  voiceRate: number;
}
