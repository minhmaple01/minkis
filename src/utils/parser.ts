import { Chapter, SceneBeat, ScriptMetrics, Screenplay } from "../types";
import { getCharacterInfo } from "../data/characters";

function extractSilentCharacters(motaText: string, speakingCharsInMota: string[]): string[] {
  const charactersMap: { pattern: RegExp; tag: string }[] = [
    { pattern: /\b(henry)\b/i, tag: "Henry" },
    { pattern: /\b(lucy)\b/i, tag: "Lucy" },
    { pattern: /\b(mom\s*emma|mẹ\s*emma|emma|mom)\b/i, tag: "Mom_Emma" },
    { pattern: /\b(dad\s*david|bố\s*david|david|dad)\b/i, tag: "Dad_David" },
    { pattern: /\b(baby\s*mia|bé\s*mia|mia)\b/i, tag: "Baby_Mia" },
    { pattern: /\b(grandpa\s*joseph|ông\s*joseph|joseph|grandpa)\b/i, tag: "Grandpa_Joseph" },
    { pattern: /\b(grandma\s*rose|bà\s*rose|rose|grandma)\b/i, tag: "Grandma_Rose" },
    { pattern: /\b(classmate\s*zoe|zoe)\b/i, tag: "Classmate_Zoe" },
    { pattern: /\b(mr\s*ben|bác\s*ben|ben)\b/i, tag: "Mr_Ben" },
    { pattern: /\b(ms\s*anna|cô\s*anna|anna)\b/i, tag: "Ms_Anna" },
  ];

  const speakingSet = new Set(speakingCharsInMota.map((c) => c.toLowerCase()));
  const silentSet = new Set<string>();

  for (const item of charactersMap) {
    if (!speakingSet.has(item.tag.toLowerCase())) {
      if (item.pattern.test(motaText)) {
        silentSet.add(item.tag);
      }
    }
  }

  return Array.from(silentSet);
}

export const CANONICAL_BACKGROUND_DESCRIPTIONS: Record<string, string> = {
  living_room_morning: "Cozy sunlit living room, yellow sofa, warm morning light.",
  living_room: "Cozy sunlit living room, yellow sofa, warm ambient light.",
  living_room_evening: "Cozy living room, warm evening lamps, soft amber glow.",
  kitchen_noon: "Bright family kitchen, mint toaster, sunny dining table.",
  kitchen: "Bright family kitchen, mint toaster, cheerful dining table.",
  backyard_noon: "Green backyard garden, wooden fence, sunny cobblestone path.",
  backyard: "Green backyard garden, wooden fence, cozy cobblestone path.",
  backyard_climax: "Green backyard garden, gentle breeze under dynamic skies.",
  treehouse_sunset: "Rustic wooden treehouse, fairy lights, golden sunset glow.",
  treehouse: "Rustic wooden treehouse nestled in oak tree, warm lights.",
  bedroom_night: "Cozy children's bedroom, star wallpaper, warm nightlight.",
  bedroom: "Cozy children's bedroom, single bed, warm soft lighting.",
  attic: "Cozy wooden attic, sunbeams, vintage trunks and telescope.",
  workshop: "Creative garage workshop, pegboard tools, wooden workbench.",
  park: "Sunny neighborhood park, green lawn, shady picnic trees.",
  classroom: "Cheerful kindergarten classroom, colorful tables, bright cubbies.",
};

export function getCanonicalBackgroundDescription(locationKey: string, existingDesc?: string): string {
  const normalizedKey = locationKey.toLowerCase().replace(/-\d+$/, "").trim();
  if (existingDesc && existingDesc.trim().length > 5) {
    return existingDesc.trim();
  }
  if (CANONICAL_BACKGROUND_DESCRIPTIONS[normalizedKey]) {
    return CANONICAL_BACKGROUND_DESCRIPTIONS[normalizedKey];
  }
  const baseKey = normalizedKey.replace(/_(morning|noon|afternoon|evening|sunset|night|climax)$/, "");
  if (CANONICAL_BACKGROUND_DESCRIPTIONS[baseKey]) {
    return CANONICAL_BACKGROUND_DESCRIPTIONS[baseKey];
  }
  const formattedName = normalizedKey.replace(/_/g, " ");
  return `Cozy, warm ${formattedName}, gentle cinematic ambient lighting.`;
}

function extractBeatsFromContent(content: string, startGlobalIndex: number, currentCumulativeTime: number): {
  beats: SceneBeat[];
  nextGlobalIndex: number;
  newCumulativeTime: number;
} {
  const beats: SceneBeat[] = [];
  let globalIndex = startGlobalIndex;
  let time = currentCumulativeTime;

  // Regex to match a [mota-sss] block and its following content
  // Handles:
  // Case A (New Nested format): [mota-sss] description [pau-sss] desc [/pau] [char-xxx] line [/char-xxx] [/mota]
  // Case B (Old Adjacent format): [mota-sss] description [/mota] [xxx] line [/xxx]
  const motaRegex = /\[mota-(\d+)\]([\s\S]*?)\[\/mota\](?:\s*\[(?!chapter|mota|background|\d+-second|pause|pau|style)(?:char-)?([a-zA-Z0-9_]+)\]([\s\S]*?)\[\/(?:char-)?(?:\3|char)\])?/gi;
  let match: RegExpExecArray | null;

  while ((match = motaRegex.exec(content)) !== null) {
    const motaDuration = Math.max(1, parseInt(match[1], 10) || 3);
    const motaInner = match[2];
    const adjacentChar = match[3];
    const adjacentDialogue = match[4];

    // Check if [xxx] or [char-xxx] is nested inside [mota]
    // Supports [1-second] (or [X-second(s)], [pause-1-second], [pause-X], [pau-X])
    const nestedCharRegex = /(?:\[(?:(\d+)-second(?:s)?|pause-(?:(\d+)-second(?:s)?|(\d+))|pau-(\d+))\]([\s\S]*?)\[\/(?:(?:\d+-second(?:s)?)|pause(?:-(?:\d+-second(?:s)?|\d+))?|pau)\])?\s*\[(?!chapter|mota|background|\d+-second|pause|pau|style|scene|prop|outfit)(?:char-)?([a-zA-Z0-9_]+)\]([\s\S]*?)\[\/(?:char-)?(?:\6|char)\]/gi;
    const nestedMatches: {
      pauseSeconds?: number;
      pauseDescription?: string;
      charTag: string;
      dialogue: string;
    }[] = [];

    let nestedMatch: RegExpExecArray | null;
    while ((nestedMatch = nestedCharRegex.exec(motaInner)) !== null) {
      const pSec = (nestedMatch[1] || nestedMatch[2] || nestedMatch[3] || nestedMatch[4])
        ? parseInt(nestedMatch[1] || nestedMatch[2] || nestedMatch[3] || nestedMatch[4], 10)
        : undefined;
      const pDesc = nestedMatch[5] ? nestedMatch[5].trim() : undefined;
      const cTag = nestedMatch[6].trim();
      const dial = nestedMatch[7].trim();
      nestedMatches.push({
        pauseSeconds: pSec,
        pauseDescription: pDesc,
        charTag: cTag,
        dialogue: dial,
      });
    }

    if (nestedMatches.length > 0) {
      // Extract [style: ...] tag if present (optional/legacy)
      const styleMatch = motaInner.match(/\[style:\s*([^\]]+)\]/i);
      const style = styleMatch ? styleMatch[1].trim() : undefined;

      // Extract [background-ten_boi_canh]...[/background] tag if present
      const bgMatch = motaInner.match(/\[background-([a-zA-Z0-9_-]+)\]([\s\S]*?)\[\/background\]/i);
      const backgroundTag = bgMatch ? bgMatch[1].trim() : undefined;
      const backgroundDescription = bgMatch ? bgMatch[2].trim() : undefined;

      // New nested format!
      // Description is motaInner with style, background, pause and char tags removed
      const cleanDescription = motaInner
        .replace(/\[style:\s*[^\]]+\]/gi, "")
        .replace(/\[background-[a-zA-Z0-9_-]+\][\s\S]*?\[\/background\]/gi, "")
        .replace(/\[(?:(?:\d+)-second(?:s)?|pause-(?:\d+-second(?:s)?|\d+)|pau-\d+)\][\s\S]*?\[\/(?:(?:\d+-second(?:s)?)|pause(?:-(?:\d+-second(?:s)?|\d+))?|pau)\]/gi, "")
        .replace(/\[(?!chapter|mota|background|\d+-second|pause|pau|style|scene|prop|outfit)(?:char-)?([a-zA-Z0-9_]+)\][\s\S]*?\[\/(?:char-)?(?:\1|char)\]/gi, "")
        .trim();

      const speakingCharsInMota = Array.from(new Set(nestedMatches.map((m) => m.charTag)));
      const silentCharactersInMota = extractSilentCharacters(motaInner, speakingCharsInMota);
      const isCinematicLongScene = motaDuration >= 7;
      const isMultiTurn = nestedMatches.length > 1;

      // Detect trailing [1-second] ending cushion after the last dialogue in the mota
      let endingPauseSec: number | undefined;
      let endingPauseDesc: string | undefined;
      const allCharCloseMatches = Array.from(motaInner.matchAll(/\[\/(?!chapter|mota|background|\d+-second|pause|pau|style|scene|prop|outfit)(?:char-)?[a-zA-Z0-9_]+\]/gi));
      const lastCharCloseMatch = allCharCloseMatches[allCharCloseMatches.length - 1];
      if (lastCharCloseMatch && lastCharCloseMatch.index !== undefined) {
        const afterLastChar = motaInner.slice(lastCharCloseMatch.index + lastCharCloseMatch[0].length);
        const endPauMatch = afterLastChar.match(/\[(?:(\d+)-second(?:s)?|pause-(?:(\d+)-second(?:s)?|(\d+))|pau-(\d+))\]([\s\S]*?)\[\/(?:(?:\d+-second(?:s)?)|pause(?:-(?:\d+-second(?:s)?|\d+))?|pau)\]/i);
        if (endPauMatch) {
          endingPauseSec = parseInt(endPauMatch[1] || endPauMatch[2] || endPauMatch[3] || endPauMatch[4] || "1", 10);
          endingPauseDesc = (endPauMatch[5] || "").trim();
        }
      }
      const hasEndingPause = endingPauseSec !== undefined && endingPauseSec > 0;

      // Calculate total pauses (both intro pauses and ending cushion) and word counts
      const totalNestedPauseSec = nestedMatches.reduce((sum, item) => sum + (item.pauseSeconds || 0), 0);
      const totalPauseSec = totalNestedPauseSec + (endingPauseSec || 0);
      const wordCounts = nestedMatches.map((item) => item.dialogue.split(/\s+/).filter(Boolean).length);
      const totalWordsInMota = wordCounts.reduce((sum, w) => sum + Math.max(1, w), 0);
      const remainingSpeakingTime = Math.max(nestedMatches.length * 0.5, motaDuration - totalPauseSec);

      let allocatedDuration = 0;

      for (let i = 0; i < nestedMatches.length; i++) {
        const item = nestedMatches[i];
        const isLastTurn = i === nestedMatches.length - 1;
        const words = item.dialogue.split(/\s+/).filter(Boolean);
        const charInfo = getCharacterInfo(item.charTag);
        const pauseSec = item.pauseSeconds || 0;
        const wordCount = words.length;

        // Proportional speaking duration: sss(mota) = sum(pau) + sum(speaking)
        const proportionalSpeaking = (Math.max(1, wordCount) / totalWordsInMota) * remainingSpeakingTime;
        const speakingDuration = Number(Math.max(0.5, proportionalSpeaking).toFixed(1));

        let beatDuration = Number((pauseSec + speakingDuration).toFixed(1));
        if (isLastTurn) {
          // Last beat absorbs any sub-second remainder and ending pause cushion to match motaDuration exactly
          beatDuration = Math.max(1, Number((motaDuration - allocatedDuration).toFixed(1)));
        }
        allocatedDuration += beatDuration;

        const effectiveSpeakingTime = Math.max(0.4, isLastTurn ? beatDuration - pauseSec - (endingPauseSec || 0) : beatDuration - pauseSec);
        const rawSpeechRate = wordCount / effectiveSpeakingTime;
        const speechRate = Number(rawSpeechRate.toFixed(1));

        // Short exclamation or quick reaction: < 5 words with exclamation mark or quick reaction interjections
        const isShort = wordCount < 5;
        const isExclamatory = item.dialogue.trim().endsWith("!") ||
          /^(catch|look|watch|hurry|run|quick|whoa|wow|yay|haha|ha|hurray|ouch|yes|no|wait|stop|help|oh|hi|bye|shh|oops)\b/i.test(item.dialogue.trim());
        const isExclamationOrReaction = isShort && (isExclamatory || wordCount <= 3);

        const speechRateThreshold = isExclamationOrReaction ? 2.5 : 1.7;
        const isSpeechRateExceeded = speechRate > speechRateThreshold;

        // Rule: Standard dialogue transitioning from scene start requires [pause-1-second].
        // User directive: "ở giữa 2 nhân vật nói trong cùng 1 cảnh có thể không cần thẻ pause"
        const isBetweenCharactersInSameScene = i > 0;
        const missingPauseBuffer = !isExclamationOrReaction && pauseSec < 1 && !isBetweenCharactersInSameScene;

        // Extract silent characters relevant to this specific pause/turn or whole scene
        const beatSilentChars = item.pauseDescription
          ? extractSilentCharacters(item.pauseDescription, [item.charTag])
          : silentCharactersInMota;

        const beatStartTime = time;
        time += beatDuration;
        const beatEndTime = time;

        beats.push({
          id: `beat-${globalIndex}`,
          index: globalIndex,
          durationSeconds: beatDuration,
          description: cleanDescription,
          pauseSeconds: item.pauseSeconds,
          pauseDescription: item.pauseDescription,
          character: item.charTag,
          characterDisplayName: charInfo.name,
          dialogue: item.dialogue,
          wordCount,
          startTime: beatStartTime,
          endTime: beatEndTime,
          speakingDuration: effectiveSpeakingTime,
          speechRate,
          speechRateThreshold,
          isExclamationOrReaction,
          isSpeechRateExceeded,
          missingPauseBuffer,
          motaDuration,
          isMultiTurn,
          turnIndex: i + 1,
          totalTurnsInMota: nestedMatches.length,
          silentCharacters: beatSilentChars.length > 0 ? beatSilentChars : (silentCharactersInMota.length > 0 ? silentCharactersInMota : undefined),
          isCinematicLongScene,
          endingPauseSeconds: isLastTurn ? endingPauseSec : undefined,
          endingPauseDescription: isLastTurn ? endingPauseDesc : undefined,
          hasEndingPause: isLastTurn ? hasEndingPause : undefined,
          isStandardSceneDuration: motaDuration === 6 || motaDuration === 8 || motaDuration === 10,
          style,
          backgroundTag,
          backgroundDescription,
        });

        globalIndex++;
      }
    } else if (adjacentChar && adjacentDialogue) {
      // Old adjacent format fallback
      const styleMatch = motaInner.match(/\[style:\s*([^\]]+)\]/i);
      const style = styleMatch ? styleMatch[1].trim() : undefined;

      const bgMatch = motaInner.match(/\[background-([a-zA-Z0-9_-]+)\]([\s\S]*?)\[\/background\]/i);
      const backgroundTag = bgMatch ? bgMatch[1].trim() : undefined;
      const backgroundDescription = bgMatch ? bgMatch[2].trim() : undefined;

      const cleanDescription = motaInner
        .replace(/\[style:\s*[^\]]+\]/gi, "")
        .replace(/\[background-[a-zA-Z0-9_-]+\][\s\S]*?\[\/background\]/gi, "")
        .trim();
      const words = adjacentDialogue.split(/\s+/).filter(Boolean);
      const charInfo = getCharacterInfo(adjacentChar);

      const beatStartTime = time;
      time += motaDuration;
      const beatEndTime = time;

      const wordCount = words.length;
      const speakingDuration = Math.max(0.5, motaDuration);
      const rawSpeechRate = wordCount / speakingDuration;
      const speechRate = Number(rawSpeechRate.toFixed(1));

      const isShort = wordCount < 5;
      const isExclamatory = adjacentDialogue.trim().endsWith("!") ||
        /^(catch|look|watch|hurry|run|quick|whoa|wow|yay|haha|ha|hurray|ouch|yes|no|wait|stop|help|oh|hi|bye|shh|oops)\b/i.test(adjacentDialogue.trim());
      const isExclamationOrReaction = isShort && (isExclamatory || wordCount <= 3);

      const speechRateThreshold = isExclamationOrReaction ? 2.5 : 1.7;
      const isSpeechRateExceeded = speechRate > speechRateThreshold;
      const missingPauseBuffer = !isExclamationOrReaction;

      beats.push({
        id: `beat-${globalIndex}`,
        index: globalIndex,
        durationSeconds: motaDuration,
        description: cleanDescription,
        character: adjacentChar,
        characterDisplayName: charInfo.name,
        dialogue: adjacentDialogue.trim(),
        wordCount,
        startTime: beatStartTime,
        endTime: beatEndTime,
        speakingDuration,
        speechRate,
        speechRateThreshold,
        isExclamationOrReaction,
        isSpeechRateExceeded,
        missingPauseBuffer,
        style,
        backgroundTag,
        backgroundDescription,
      });

      globalIndex++;
    }
  }

  return {
    beats,
    nextGlobalIndex: globalIndex,
    newCumulativeTime: time,
  };
}

export function parseScreenplay(rawText: string, title: string = "Untitled Story"): Screenplay {
  const chapters: Chapter[] = [];
  let globalBeatIndex = 1;
  let cumulativeTime = 0;

  // Match chapters robustly (works whether or not closing [/chapter-XXX] tags exist)
  const chapterStartRegex = /\[chapter-([a-zA-Z0-9_-]+)\]/gi;
  const starts: { locationKey: string; startIndex: number; contentStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = chapterStartRegex.exec(rawText)) !== null) {
    starts.push({
      locationKey: m[1],
      startIndex: m.index,
      contentStart: m.index + m[0].length,
    });
  }

  let hasChapters = starts.length > 0;
  let chapterIndex = 1;

  for (let i = 0; i < starts.length; i++) {
    const current = starts[i];
    const nextStart = starts[i + 1] ? starts[i + 1].startIndex : rawText.length;
    let block = rawText.slice(current.contentStart, nextStart);

    // If explicit closing tag exists, cut before or strip it
    const closeRegex = new RegExp(`\\[\\/chapter-(?:${current.locationKey}|[a-zA-Z0-9_-]+)\\]`, "i");
    const closeMatch = block.match(closeRegex);
    if (closeMatch && closeMatch.index !== undefined) {
      block = block.slice(0, closeMatch.index);
    }
    const chapterContent = block.trim();
    const chapterStartTime = cumulativeTime;

    const { beats, nextGlobalIndex, newCumulativeTime } = extractBeatsFromContent(
      chapterContent,
      globalBeatIndex,
      cumulativeTime
    );

    globalBeatIndex = nextGlobalIndex;
    cumulativeTime = newCumulativeTime;

    const chapterDuration = cumulativeTime - chapterStartTime;
    const speakingCharacters = Array.from(new Set(beats.map((b) => b.character)));
    const speakingCharacterCount = speakingCharacters.length;
    const isCharacterCountValid = speakingCharacterCount <= 4;

    let cleanDisplayName = current.locationKey
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    
    // Nice formatting for part suffixes like -1, -2
    if (/-\d+$/.test(current.locationKey)) {
      const partNum = current.locationKey.match(/-(\d+)$/)?.[1];
      cleanDisplayName = cleanDisplayName.replace(/-\d+$/, ` (Phần ${partNum})`);
    }

    chapters.push({
      id: `chapter-${chapterIndex}`,
      chapterIndex,
      locationKey: current.locationKey,
      displayName: cleanDisplayName,
      beats,
      durationSeconds: chapterDuration,
      startTime: chapterStartTime,
      endTime: cumulativeTime,
      speakingCharacters,
      speakingCharacterCount,
      isCharacterCountValid,
    });

    chapterIndex++;
  }

  // Fallback: If no strict chapter tags found, parse mota at root
  if (!hasChapters) {
    const { beats, newCumulativeTime } = extractBeatsFromContent(
      rawText,
      globalBeatIndex,
      cumulativeTime
    );
    cumulativeTime = newCumulativeTime;

    if (beats.length > 0) {
      const speakingCharacters = Array.from(new Set(beats.map((b) => b.character)));
      const speakingCharacterCount = speakingCharacters.length;
      const isCharacterCountValid = speakingCharacterCount <= 4;

      chapters.push({
        id: "chapter-1",
        chapterIndex: 1,
        locationKey: "main_story",
        displayName: "Main Story",
        beats,
        durationSeconds: cumulativeTime,
        startTime: 0,
        endTime: cumulativeTime,
        speakingCharacters,
        speakingCharacterCount,
        isCharacterCountValid,
      });
    }
  }

  // Metrics calculation
  let totalWords = 0;
  let totalLines = 0;
  let maxWordsInSingleLine = 0;
  let maxSssValue = 0;
  let scenesWithoutAudioCount = 0;
  let consecutiveRepeatSssCount = 0;
  let totalPauseCount = 0;
  let totalPauseSeconds = 0;
  let cinematicLongScenesCount = 0;
  let multiTurnScenesCount = 0;
  let silentCharacterInteractionsCount = 0;
  let scenesMissingEndingPauseCount = 0;
  let nonStandardDurationScenesCount = 0;
  let duration6sCount = 0;
  let duration8sCount = 0;
  let duration10sCount = 0;
  let durationOtherCount = 0;

  let currentSssVal = -1;
  let currentSssStreak = 0;

  const characterLineCounts: Record<string, number> = {};
  const characterWordCounts: Record<string, number> = {};
  const linesExceeding15Words: { lineIndex: number; character: string; dialogue: string; count: number }[] = [];
  const speechRateViolations: {
    lineIndex: number;
    character: string;
    dialogue: string;
    wordCount: number;
    speakingDuration: number;
    rate: number;
    threshold: number;
  }[] = [];

  let totalSpeakingDuration = 0;
  let maxSpeechRate = 0;
  let missingPauseBufferCount = 0;

  let scenesMissingStyleTagCount = 0;
  let scenesMissingBackgroundCount = 0;
  let backgroundConsistencyViolationsCount = 0;
  const canonicalBgMap = new Map<string, string>();
  const uniqueBackgroundTagsSet = new Set<string>();

  const audioKeywords = [
    "âm thanh", "tiếng", "nhạc", "sound", "music", "audio", "bgm", "sfx", "melody",
    "tiếng động", "tiếng kêu", "tiếng cười", "tiếng khóc", "tiếng thở", "tiếng bước", "tiếng vỗ"
  ];

  for (const chapter of chapters) {
    for (const beat of chapter.beats) {
      totalLines++;
      totalWords += beat.wordCount;
      totalSpeakingDuration += beat.speakingDuration;

      const isFirstTurnInMota = !beat.turnIndex || beat.turnIndex === 1;
      const isLastTurnInMota = !beat.turnIndex || beat.turnIndex === beat.totalTurnsInMota;
      const sceneSss = beat.motaDuration || beat.durationSeconds;

      if (isFirstTurnInMota) {
        if (beat.isCinematicLongScene) {
          cinematicLongScenesCount++;
        }
        if (beat.isMultiTurn) {
          multiTurnScenesCount++;
        }
        if (beat.silentCharacters && beat.silentCharacters.length > 0) {
          silentCharacterInteractionsCount++;
        }

        // Standard scene duration check (must be 6, 8, or 10s)
        if (sceneSss === 6) {
          duration6sCount++;
        } else if (sceneSss === 8) {
          duration8sCount++;
        } else if (sceneSss === 10) {
          duration10sCount++;
        } else {
          durationOtherCount++;
          nonStandardDurationScenesCount++;
        }

        if (sceneSss > maxSssValue) {
          maxSssValue = sceneSss;
        }

        // Style tag removed per user request ("bỏ thẻ style")
        // No style tag check required

        // Check background tag presence & consistency
        if (!beat.backgroundTag || !beat.backgroundDescription) {
          scenesMissingBackgroundCount++;
        } else {
          uniqueBackgroundTagsSet.add(beat.backgroundTag);
          const currentDesc = beat.backgroundDescription.trim();
          if (!canonicalBgMap.has(beat.backgroundTag)) {
            canonicalBgMap.set(beat.backgroundTag, currentDesc);
          } else {
            const canonical = canonicalBgMap.get(beat.backgroundTag)!;
            const isMatch =
              currentDesc === canonical ||
              currentDesc.startsWith(canonical) ||
              canonical.startsWith(currentDesc);
            if (!isMatch) {
              backgroundConsistencyViolationsCount++;
            }
          }
        }

        // Rule "Cấm lặp cùng sss > 3 cảnh liên tiếp" has been removed per user request
        currentSssVal = sceneSss;
        currentSssStreak = 1;
      }

      if (isLastTurnInMota) {
        if (!beat.hasEndingPause) {
          scenesMissingEndingPauseCount++;
        }
        if (beat.endingPauseSeconds && beat.endingPauseSeconds > 0) {
          totalPauseCount++;
          totalPauseSeconds += beat.endingPauseSeconds;
        }
      }

      if (beat.wordCount > maxWordsInSingleLine) {
        maxWordsInSingleLine = beat.wordCount;
      }
      if (beat.wordCount > 8) {
        linesExceeding15Words.push({
          lineIndex: beat.index,
          character: beat.character,
          dialogue: beat.dialogue,
          count: beat.wordCount,
        });
      }

      if (beat.pauseSeconds && beat.pauseSeconds > 0) {
        totalPauseCount++;
        totalPauseSeconds += beat.pauseSeconds;
      }

      // Check speech rate metrics
      if (beat.speechRate > maxSpeechRate) {
        maxSpeechRate = beat.speechRate;
      }

      if (beat.isSpeechRateExceeded) {
        speechRateViolations.push({
          lineIndex: beat.index,
          character: beat.characterDisplayName,
          dialogue: beat.dialogue,
          wordCount: beat.wordCount,
          speakingDuration: beat.speakingDuration,
          rate: beat.speechRate,
          threshold: beat.speechRateThreshold,
        });
      }

      if (beat.missingPauseBuffer) {
        missingPauseBufferCount++;
      }

      // Check audio cue presence in mota
      const descLower = beat.description.toLowerCase();
      const hasAudio = audioKeywords.some((kw) => descLower.includes(kw));
      if (!hasAudio && isFirstTurnInMota) {
        scenesWithoutAudioCount++;
      }

      characterLineCounts[beat.character] = (characterLineCounts[beat.character] || 0) + 1;
      characterWordCounts[beat.character] = (characterWordCounts[beat.character] || 0) + beat.wordCount;
    }
  }

  const averageWordsPerLine = totalLines > 0 ? Number((totalWords / totalLines).toFixed(1)) : 0;
  const averageSpeechRate = totalSpeakingDuration > 0
    ? Number((totalWords / totalSpeakingDuration).toFixed(1))
    : 0;

  // Chapter character limit check: Max 3–4 speaking characters per chapter
  const chapterCharacterLimitViolations = chapters
    .filter((ch) => ch.speakingCharacterCount > 4)
    .map((ch) => ({
      chapterIndex: ch.chapterIndex,
      chapterLocationKey: ch.locationKey,
      characterCount: ch.speakingCharacterCount,
      characters: ch.speakingCharacters,
    }));
  const isChapterCharacterLimitValid = chapterCharacterLimitViolations.length === 0;

  // Story-level character count & limit check (Max 4 speaking characters per story)
  const storyCharacters = Object.keys(characterLineCounts);
  const totalStoryCharacters = storyCharacters.length;
  const isStoryCharacterLimitValid = totalStoryCharacters <= 4;

  const totalScenesCount = duration6sCount + duration8sCount + duration10sCount + durationOtherCount;
  const duration10sPercentage = totalScenesCount > 0 ? Math.round((duration10sCount / totalScenesCount) * 100) : 0;
  const multiTurnPercentage = totalScenesCount > 0 ? Math.round((multiTurnScenesCount / totalScenesCount) * 100) : 0;
  // Balanced dialogue: contains interactive multi-turn scenes (>= 15% or >= 3 scenes) combined with single-turn scenes
  const isDialogueBalanced = multiTurnScenesCount >= 3 || multiTurnPercentage >= 15;
  // Prioritize 10s scenes: 10s scenes must be dominant (at least as many as 6s and 8s individually, or >= 40% of scenes)
  const is10sScenesPrioritized = totalScenesCount > 0 && (
    (duration10sCount >= duration8sCount && duration10sCount >= duration6sCount) ||
    duration10sPercentage >= 50
  );

  const metrics: ScriptMetrics = {
    totalDurationSeconds: cumulativeTime,
    totalLines,
    totalWords,
    averageWordsPerLine,
    maxWordsInSingleLine,
    characterLineCounts,
    characterWordCounts,
    linesExceeding15Words,
    isDurationValid: cumulativeTime >= 300 && cumulativeTime <= 600,
    isLineCountValid: totalLines >= 60 && totalLines <= 95,
    isWordCountValid: totalWords >= 150 && totalWords <= 500,
    consecutiveRepeatSssCount,
    scenesWithoutAudioCount,
    isAudioComplete: scenesWithoutAudioCount === 0,
    isSssVariationValid: consecutiveRepeatSssCount === 0,
    maxSssValue,
    totalPauseCount,
    totalPauseSeconds,
    averageSpeechRate,
    maxSpeechRate,
    speechRateViolations,
    isSpeechRateValid: speechRateViolations.length === 0,
    missingPauseBufferCount,
    chapterCharacterLimitViolations,
    isChapterCharacterLimitValid,
    totalStoryCharacters,
    isStoryCharacterLimitValid,
    storyCharacters,
    is10sScenesPrioritized,
    duration10sPercentage,
    cinematicLongScenesCount,
    multiTurnScenesCount,
    multiTurnPercentage,
    isDialogueBalanced,
    silentCharacterInteractionsCount,
    scenesMissingEndingPauseCount,
    isEndingPauseComplete: scenesMissingEndingPauseCount === 0,
    nonStandardDurationScenesCount,
    isSceneDurationStandard: nonStandardDurationScenesCount === 0,
    durationBreakdown: {
      duration6s: duration6sCount,
      duration8s: duration8sCount,
      duration10s: duration10sCount,
      other: durationOtherCount,
    },
    scenesMissingStyleTagCount,
    isStyleTagComplete: scenesMissingStyleTagCount === 0,
    scenesMissingBackgroundCount,
    isBackgroundComplete: scenesMissingBackgroundCount === 0,
    backgroundConsistencyViolationsCount,
    isBackgroundConsistent: backgroundConsistencyViolationsCount === 0,
    uniqueBackgroundTags: Array.from(uniqueBackgroundTagsSet),
  };

  const cleanScriptRawText = stripAssetPromptsFromScript(rawText);

  return {
    title,
    rawText: cleanScriptRawText,
    chapters,
    metrics,
    createdAt: new Date().toISOString(),
  };
}

export function stripAssetPromptsFromScript(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText
    // Strip [scene-...]...[/scene-...]
    .replace(/\[scene-[a-zA-Z0-9_-]+\][\s\S]*?\[\/scene(?:-[a-zA-Z0-9_-]+)?\]/gi, "")
    // Strip [prop-...]...[/prop-...]
    .replace(/\[prop-[a-zA-Z0-9_-]+\][\s\S]*?\[\/prop(?:-[a-zA-Z0-9_-]+)?\]/gi, "")
    // Strip [outfit-...]...[/outfit-...]
    .replace(/\[outfit-[a-zA-Z0-9_-]+\][\s\S]*?\[\/outfit(?:-[a-zA-Z0-9_-]+)?\]/gi, "")
    // Strip standalone indicators like [MỚI - cần tạo ảnh và lưu lại]
    .replace(/\[MỚI\s*-\s*cần tạo ảnh và lưu lại\]/gi, "")
    // Strip group dividers or banners like === A. PROMPT BỐI CẢNH === or ====================
    .replace(/={3,}.*?(?:PROMPT|BỐI CẢNH|ĐẠO CỤ|TRANG PHỤC|SCENE|PROP|OUTFIT|ASSET).*?={3,}/gi, "")
    // Strip any section header notes like "4. BƯỚC BẮT BUỘC SAU KỊCH BẢN: SINH PROMPT ẢNH THÀNH PHẦN..."
    .replace(/(?:BƯỚC\s+BẮT\s+BUỘC\s+SAU\s+KỊCH\s+BẢN|SINH\s+PROMPT\s+ẢNH\s+THÀNH\s+PHẦN)[\s\S]*$/i, "")
    // Clean excessive empty lines
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}

export function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatSrtTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds % 1) * 1000);
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
}

export function generateSrtContent(chapters: Chapter[]): string {
  let srt = "";
  let counter = 1;

  for (const chapter of chapters) {
    for (const beat of chapter.beats) {
      // Subtitle line starts after the pause period (if any) and ends before the scene's ending pause cushion
      const dialogueStartTime = beat.startTime + (beat.pauseSeconds || 0);
      const dialogueEndTime = Math.max(dialogueStartTime + 0.5, beat.endTime - (beat.endingPauseSeconds || 0));
      const start = formatSrtTime(dialogueStartTime);
      const end = formatSrtTime(dialogueEndTime);
      srt += `${counter}\n${start} --> ${end}\n[${beat.characterDisplayName}]: ${beat.dialogue}\n\n`;
      counter++;
    }
  }

  return srt;
}

export function generateCsvContent(chapters: Chapter[], title: string): string {
  const headers = [
    "Index",
    "Chapter",
    "TotalDuration(s)",
    "IntroPause(s)",
    "EndingPause(s)",
    "SpeakingDuration(s)",
    "SpeechRate(wps)",
    "RateStatus",
    "StartTime",
    "EndTime",
    "Character",
    "CharacterName",
    "Dialogue",
    "WordCount",
    "PauseCue",
    "EndingCue",
    "VisualAndAudioCue",
  ];
  const rows: string[][] = [headers];

  for (const chapter of chapters) {
    for (const beat of chapter.beats) {
      const rateStatus = beat.isSpeechRateExceeded
        ? `Quá nhanh (${beat.speechRate} wps > ${beat.speechRateThreshold})`
        : `Chuẩn (${beat.speechRate} wps)`;

      rows.push([
        beat.index.toString(),
        chapter.displayName,
        beat.durationSeconds.toString(),
        (beat.pauseSeconds || 0).toString(),
        (beat.endingPauseSeconds || 0).toString(),
        beat.speakingDuration.toString(),
        beat.speechRate.toString(),
        rateStatus,
        formatTime(beat.startTime),
        formatTime(beat.endTime),
        beat.character,
        beat.characterDisplayName,
        `"${beat.dialogue.replace(/"/g, '""')}"`,
        beat.wordCount.toString(),
        `"${(beat.pauseDescription || "").replace(/"/g, '""')}"`,
        `"${(beat.endingPauseDescription || "").replace(/"/g, '""')}"`,
        `"${beat.description.replace(/"/g, '""')}"`,
      ]);
    }
  }

  return rows.map((r) => r.join(",")).join("\n");
}

/**
 * Automatically repairs screenplay tags:
 * 1. Guarantees every chapter has matching [chapter-XXX] and [/chapter-XXX] tags.
 * 2. Normalizes every scene duration strictly to 6s, 8s, or 10s.
 * 3. Guarantees every scene has an ending [pau-1] tag cushion before [/mota].
 * 4. Automatically splits any chapter with > 4 characters into part 1 (-1) and part 2 (-2).
 */
export function autoRepairScreenplayTags(rawText: string): string {
  if (!rawText || !rawText.trim()) return rawText;

  // 1. Build canonical background dictionary across the script
  const canonicalBackgroundMap = new Map<string, string>();

  // If user has [scene-ten_boi_canh] prompts in text (from step 2), register them
  const scenePromptRegex = /\[scene-([a-zA-Z0-9_-]+)\]([\s\S]*?)\[\/scene(?:-[a-zA-Z0-9_-]+)?\]/gi;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = scenePromptRegex.exec(rawText)) !== null) {
    const sTag = sMatch[1].replace(/-\d+$/, "").trim();
    const sDesc = sMatch[2].trim();
    if (!canonicalBackgroundMap.has(sTag) && sDesc.length > 5) {
      canonicalBackgroundMap.set(sTag, sDesc);
    }
  }

  // Scan existing [background-...] tags for existing canonical definitions
  const bgRegex = /\[background-([a-zA-Z0-9_-]+)\]([\s\S]*?)\[\/background\]/gi;
  let bgMatch: RegExpExecArray | null;
  while ((bgMatch = bgRegex.exec(rawText)) !== null) {
    const bTag = bgMatch[1].replace(/-\d+$/, "").trim();
    const bDesc = bgMatch[2].trim();
    if (!canonicalBackgroundMap.has(bTag) && bDesc.length > 5) {
      canonicalBackgroundMap.set(bTag, bDesc);
    }
  }

  const chapterStartRegex = /\[chapter-([a-zA-Z0-9_-]+)\]/gi;
  const starts: { locationKey: string; startIndex: number; contentStart: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = chapterStartRegex.exec(rawText)) !== null) {
    starts.push({
      locationKey: m[1],
      startIndex: m.index,
      contentStart: m.index + m[0].length,
    });
  }

  // If no chapter tags at all, return raw text or wrap in chapter-main_story
  if (starts.length === 0) {
    return rawText;
  }

  const repairedChapters: string[] = [];

  for (let i = 0; i < starts.length; i++) {
    const current = starts[i];
    const nextStart = starts[i + 1] ? starts[i + 1].startIndex : rawText.length;
    let block = rawText.slice(current.contentStart, nextStart);

    // Strip existing closing tag within this block
    block = block.replace(/\[\/chapter-[a-zA-Z0-9_-]+\]/gi, "").trim();

    // Extract all [mota-...]...[/mota] beats
    const motaRegex = /\[mota-(\d+)\]([\s\S]*?)\[\/mota\]/gi;
    const beats: { full: string; duration: number; chars: string[] }[] = [];
    let motaMatch: RegExpExecArray | null;
    while ((motaMatch = motaRegex.exec(block)) !== null) {
      let motaDuration = parseInt(motaMatch[1], 10) || 6;
      let inner = motaMatch[2].trim();

      // Extract or determine background tag
      const rawLocationTag = current.locationKey.replace(/-\d+$/, "").trim();
      const existingBgMatch = inner.match(/\[background-([a-zA-Z0-9_-]+)\]([\s\S]*?)\[\/background\]/i);
      let bgTag = rawLocationTag;
      let existingBgDesc = "";
      if (existingBgMatch) {
        bgTag = existingBgMatch[1].replace(/-\d+$/, "").trim();
        existingBgDesc = existingBgMatch[2].trim();
      }

      // Canonical description lookup or initialization
      let canonicalDesc = canonicalBackgroundMap.get(bgTag);
      if (!canonicalDesc) {
        canonicalDesc = getCanonicalBackgroundDescription(bgTag, existingBgDesc);
        canonicalBackgroundMap.set(bgTag, canonicalDesc);
      }

      // Check for lighting variation sentence at end (Rule 3)
      let finalBgDesc = canonicalDesc;
      if (existingBgDesc && existingBgDesc.length > canonicalDesc.length) {
        if (existingBgDesc.startsWith(canonicalDesc)) {
          finalBgDesc = existingBgDesc;
        } else {
          const lightingMatch = existingBgDesc.match(/(?:Now|Currently|In\s+the)\s+.*?(?:light|sunlight|sunset|evening|twilight|morning|afternoon|night|glow|sky|hues).*?$/i);
          if (lightingMatch) {
            finalBgDesc = `${canonicalDesc} ${lightingMatch[0].trim()}`;
          }
        }
      }

      // Strip existing [style: ...] and [background-...] from inner so we can place background cleanly at the top
      inner = inner
        .replace(/\[style:\s*[^\]]+\]\s*/gi, "")
        .replace(/\[background-[a-zA-Z0-9_-]+\][\s\S]*?\[\/background\]\s*/gi, "")
        .trim();

      // Normalize character tags: convert legacy [char-xxx]...[/char-xxx] to [xxx]...[/xxx]
      inner = inner.replace(/\[char-([a-zA-Z0-9_]+)\]([\s\S]*?)\[\/char(?:-[a-zA-Z0-9_]+)?\]/gi, (match, cName, dText) => {
        return `[${cName}]${dText}[/${cName}]`;
      });

      // Normalize all internal pause tags to [1-second]...[/1-second]
      inner = inner.replace(/\[(?:(?:\d+)-second(?:s)?|pause-(?:\d+-second(?:s)?|\d+)|pau-\d+)\]([\s\S]*?)\[\/(?:(?:\d+-second(?:s)?)|pause(?:-(?:\d+-second(?:s)?|\d+))?|pau)\]/gi, (match, desc) => {
        return `[1-second]${desc}[/1-second]`;
      });

      // Normalize motaDuration strictly to 6, 8, or 10s, prioritizing 10s scenes per user directive
      if (motaDuration !== 6 && motaDuration !== 8 && motaDuration !== 10) {
        if (motaDuration <= 4) motaDuration = 8;
        else if (motaDuration === 5 || motaDuration === 7 || motaDuration >= 9) motaDuration = 10;
        else motaDuration = 8;
      }

      // Ensure every scene has EXACTLY ONE trailing [1-second] cushion after the last dialogue before [/mota]
      const allCharCloseMatches = Array.from(inner.matchAll(/\[\/(?!chapter|mota|background|\d+-second|pause|pau|style|scene|prop|outfit)(?:char-)?[a-zA-Z0-9_]+\]/gi));
      const lastCharCloseMatch = allCharCloseMatches[allCharCloseMatches.length - 1];
      if (lastCharCloseMatch && lastCharCloseMatch.index !== undefined) {
        const cutIdx = lastCharCloseMatch.index + lastCharCloseMatch[0].length;
        const beforeAfterChar = inner.slice(0, cutIdx).trimEnd();
        const afterChar = inner.slice(cutIdx);

        // Find all pause matches after the last character tag
        const pauMatches = Array.from(afterChar.matchAll(/\[(?:(?:\d+)-second(?:s)?|pause-(?:(\d+)-second(?:s)?|\d+)|pau-(\d+))\]([\s\S]*?)\[\/(?:(?:\d+-second(?:s)?)|pause(?:-(?:\d+-second(?:s)?|\d+))?|pau)\]/gi));
        let endingPauText = "";
        if (pauMatches.length > 0) {
          // Keep strictly ONLY the first valid ending pause, standardized to [1-second]
          const pDesc = (pauMatches[0][3] || pauMatches[0][2] || pauMatches[0][1] || "").trim() || "Khoảng lặng cuối cảnh, hình ảnh lắng đọng trước khi chuyển cảnh";
          endingPauText = `\n[1-second] ${pDesc} [/1-second]`;
        } else {
          endingPauText = `\n[1-second] Khoảng lặng cuối cảnh, hình ảnh lắng đọng trước khi chuyển cảnh [/1-second]`;
        }

        // Clean up any remaining pause text after the last char (if any)
        const leftoverText = afterChar.replace(/\[(?:(?:\d+)-second(?:s)?|pause-(?:\d+-second(?:s)?|\d+)|pau-\d+)\][\s\S]*?\[\/(?:(?:\d+-second(?:s)?)|pause(?:-(?:\d+-second(?:s)?|\d+))?|pau)\]/gi, "").trim();
        inner = beforeAfterChar + (leftoverText ? `\n${leftoverText}` : "") + endingPauText;
      }

      // Prepend mandatory [background-...] at the very top of each mota (style tag removed per user request)
      const bgTagLine = `[background-${bgTag}] ${finalBgDesc} [/background]`;
      inner = `${bgTagLine}\n${inner}`;

      const repairedFull = `[mota-${motaDuration}]\n${inner}\n[/mota]`;
      const charMatches = Array.from(repairedFull.matchAll(/\[(?!chapter|mota|background|\d+-second|pause|pau|style|scene|prop|outfit)(?:char-)?([a-zA-Z0-9_]+)\]/gi)).map((m) => m[1]);
      beats.push({ full: repairedFull, duration: motaDuration, chars: charMatches });
    }

    if (beats.length === 0) {
      repairedChapters.push(`[chapter-${current.locationKey}]\n${block}\n[/chapter-${current.locationKey}]`);
      continue;
    }

    const uniqueChars = Array.from(new Set(beats.flatMap((b) => b.chars).filter(Boolean)));

    if (uniqueChars.length <= 4) {
      // Valid chapter: ensure it is closed with [/chapter-XXX]
      repairedChapters.push(`[chapter-${current.locationKey}]\n${beats.map((b) => b.full).join("\n")}\n[/chapter-${current.locationKey}]`);
    } else {
      // Oversized chapter (> 4 characters)! Split into sequential chunks where EACH chunk has <= 4 characters
      const baseKey = current.locationKey.replace(/-\d+$/, "");
      const chunks: { beats: string[]; chars: Set<string> }[] = [];
      let currentChunk = { beats: [] as string[], chars: new Set<string>() };

      for (const beat of beats) {
        const combined = new Set([...currentChunk.chars, ...beat.chars]);
        if (combined.size > 4 && currentChunk.beats.length > 0) {
          chunks.push(currentChunk);
          currentChunk = { beats: [beat.full], chars: new Set(beat.chars) };
        } else {
          beat.chars.forEach((c) => currentChunk.chars.add(c));
          currentChunk.beats.push(beat.full);
        }
      }
      if (currentChunk.beats.length > 0) {
        chunks.push(currentChunk);
      }

      chunks.forEach((chunk, idx) => {
        const key = `${baseKey}-${idx + 1}`;
        repairedChapters.push(`[chapter-${key}]\n${chunk.beats.join("\n")}\n[/chapter-${key}]`);
      });
    }
  }

  return repairedChapters.join("\n\n");
}

/**
 * Enforces that the screenplay uses at most 4 characters with dialogue throughout the entire story.
 * If more than 4 characters speak, reassigns excess character lines to the top 4 primary characters.
 */
export function enforceStoryCharacterLimit(scriptText: string): string {
  if (!scriptText) return scriptText;
  const charMatches = Array.from(scriptText.matchAll(/\[(?!chapter|mota|background|\d+-second|pause|pau|style|scene|prop|outfit)(?:char-)?([a-zA-Z0-9_]+)\]/g)).map(m => m[1]);
  const counts: Record<string, number> = {};
  for (const c of charMatches) counts[c] = (counts[c] || 0) + 1;
  const uniqueChars = Object.keys(counts);
  if (uniqueChars.length <= 4) return scriptText;

  // Pick top 4 characters with highest frequency
  const top4 = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([n]) => n);
  const childFallback = top4.find(c => ["Henry", "Lucy", "Baby_Mia", "Classmate_Jake", "Classmate_Zoe"].includes(c)) || top4[0];
  const adultFallback = top4.find(c => ["Mom_Emma", "Dad_David", "Grandpa_Joseph", "Grandma_Rose", "Mr_Ben", "Ms_Anna", "Officer_Sam", "Doctor_Kim"].includes(c)) || top4[top4.length - 1];

  let result = scriptText;
  for (const c of uniqueChars) {
    if (!top4.includes(c)) {
      const isChild = ["Henry", "Lucy", "Baby_Mia", "Classmate_Jake", "Classmate_Zoe"].includes(c);
      const replacement = isChild ? childFallback : adultFallback;
      const regexOpen = new RegExp(`\\[(?:char-)?${c}\\]`, 'g');
      const regexClose = new RegExp(`\\[/(?:char-)?${c}\\]`, 'g');
      result = result.replace(regexOpen, `[${replacement}]`).replace(regexClose, `[/${replacement}]`);
    }
  }
  return result;
}

/**
 * Ensures that the script strictly meets the mandatory criteria:
 * 1. 60–90 dialogue lines (+40% duration per user request)
 * 2. 300–460 seconds total duration (~5.0–7.5 minutes)
 * 3. Concise 2–5 words per dialogue (relaxed speech rate <= 1.7 wps)
 * 4. Maximum 4 speaking characters for the entire story
 * 5. Prioritizes 10s scenes ([mota-10]) over 6s/8s scenes
 */
export function ensureScriptMeetsCriteria(rawScript: string, title: string): string {
  if (!rawScript || !rawScript.trim()) return rawScript;

  let repaired = autoRepairScreenplayTags(rawScript);
  repaired = enforceStoryCharacterLimit(repaired);
  let parsed = parseScreenplay(repaired, title);

  // If already strictly within both ranges (300-460s and 60-90 lines), return
  if (parsed.metrics.totalLines >= 60 && parsed.metrics.totalDurationSeconds >= 300) {
    return repaired;
  }

  // Identify active characters (max 4) to ensure 100% character continuity
  const chars = Object.keys(parsed.metrics.characterLineCounts);
  const mainChar = chars.includes("Henry") ? "Henry" : (chars[0] || "Henry");
  const siblingChar = mainChar === "Henry"
    ? (chars.includes("Lucy") ? "Lucy" : "Lucy")
    : (chars.includes("Henry") ? "Henry" : "Henry");

  const existingAdults = chars.filter((c) => c !== mainChar && c !== siblingChar);
  const adult1 = existingAdults[0] || "Mom_Emma";
  const adult2 = existingAdults[1] || (adult1 === "Mom_Emma" ? "Dad_David" : "Mom_Emma");

  // Modular extension chapters strictly using tokens __MAIN__, __SIBLING__, __ADULT1__, __ADULT2__
  // 1. Garden Climax Challenge (Main character acts bravely to solve a challenge) - 60s, 10 lines
  const moduleClimax = `[chapter-garden_climax_challenge-1]
[mota-10]
[background-garden_climax_challenge] Sunlit backyard garden, tall oak tree, green wooden fence. [/background]
__MAIN__ và __SIBLING__ chạy ra bãi cỏ sau vườn, bất ngờ nhìn thấy một chú chim non bị rơi khỏi cành cây cao. Ánh nắng rực rỡ chiếu qua kẽ lá. Âm thanh: Tiếng chim mẹ kêu ríu rít lo lắng trên cành, tiếng gió lay lá xào xạc.
[1-second] __MAIN__ chỉ tay lên cành cây cao. [/1-second]
[__MAIN__] Look at the little bird! [/__MAIN__]
[__SIBLING__] It fell from the nest! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, cả hai cùng nín thở lo lắng nhìn chú chim nhỏ trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_climax_challenge] Sunlit backyard garden, tall oak tree, green wooden fence. [/background]
__MAIN__ nhanh trí chạy tới lán gỗ lấy chiếc khăn tay mềm mại quấn quanh chú chim nhỏ để giữ ấm. Âm thanh: Tiếng bước chân vội vã trên cỏ, tiếng thở dồn dập quyết tâm.
[1-second] __MAIN__ cẩn thận nâng chú chim nhỏ bằng hai tay. [/1-second]
[__MAIN__] Stay warm, little birdie! [/__MAIN__]
[__SIBLING__] You are so brave today! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, ánh mắt ấm áp nâng niu sinh linh bé nhỏ trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_climax_challenge] Sunlit backyard garden, tall oak tree, green wooden fence. [/background]
__ADULT1__ từ hiên nhà vội bước ra, nhìn thấy hành động dũng cảm của các con liền mỉm cười tán thưởng và mang chiếc thang nhỏ tới trợ giúp. Âm thanh: Tiếng bước chân vội vã trên lối đá, tiếng chim hót mừng rỡ.
[1-second] __ADULT1__ đặt chiếc thang gỗ vững chãi bên gốc cây. [/1-second]
[__ADULT1__] Hold the ladder steady! [/__ADULT1__]
[__MAIN__] I will hold it tight! [/__MAIN__]
[1-second] Khoảng lặng cuối cảnh, đôi tay nắm chặt chân thang vững chãi trước khi chuyển cảnh [/1-second]
[/mota]
[/chapter-garden_climax_challenge-1]

[chapter-garden_climax_challenge-2]
[mota-10]
[background-garden_climax_challenge] Sunlit backyard garden, tall oak tree, green wooden fence. [/background]
__ADULT2__ cẩn thận đưa chiếc tổ rơm êm ái lên cành cây an toàn, chú chim non cất tiếng hót líu lo bên mẹ. Âm thanh: Tiếng chim hót ríu ran hạnh phúc, tiếng vỗ tay mừng rỡ.
[1-second] __ADULT2__ mỉm cười bước xuống thang an toàn. [/1-second]
[__ADULT2__] The birdie is home! [/__ADULT2__]
[__SIBLING__] Mother bird is happy! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, cả nhà cùng ngước nhìn tổ chim an toàn trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_climax_challenge] Sunlit backyard garden, tall oak tree, green wooden fence. [/background]
__MAIN__ nhảy cẫng lên ôm lấy __SIBLING__, nụ cười rạng rỡ bừng sáng trên khuôn mặt dũng cảm. Âm thanh: Tiếng cười reo vui hân hoan, tiếng đàn piano tươi sáng.
[1-second] __MAIN__ tươi cười vẫy tay chào chú chim non. [/1-second]
[__MAIN__] We saved the little bird! [/__MAIN__]
[__ADULT1__] Courage solves hard problems! [/__ADULT1__]
[1-second] Khoảng lặng cuối cảnh, ánh mắt tự hào của cha mẹ dành cho hai con trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_climax_challenge] Sunlit backyard garden, tall oak tree, green wooden fence. [/background]
Cả gia đình cùng đứng quây quần dưới bóng cây râm mát, cảm giác nhẹ nhõm và yêu thương ngập tràn. Âm thanh: Tiếng gió mát rượi xào xạc cành lá, tiếng thở phào viên mãn.
[1-second] __ADULT2__ xoa đầu hai con đầy khích lệ. [/1-second]
[__ADULT2__] Great teamwork together! [/__ADULT2__]
[__SIBLING__] Family always helps! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, cái ôm ấm áp giữa vườn cây xanh tươi trước khi chuyển cảnh [/1-second]
[/mota]
[/chapter-garden_climax_challenge-2]`;

  // 2. Garden Teamwork & Discovery - 60s, 10 lines
  const moduleTeamwork = `[chapter-garden_teamwork_noon-1]
[mota-10]
[background-garden_teamwork_noon] Sunny garden workshop, wooden workbench, neatly arranged gardening tools. [/background]
__MAIN__ và __SIBLING__ cùng xách chiếc xô nước nhỏ ra tưới những chậu hoa cúc rực rỡ bên hiên lán. Ánh nắng trưa rải vàng trên những luống hoa. Âm thanh: Tiếng nước rơi tí tách vào chậu đất, tiếng ong mật vo ve.
[1-second] __MAIN__ nghiêng chiếc bình tưới nhỏ tưới từng gốc cây. [/1-second]
[__MAIN__] Drink fresh cool water! [/__MAIN__]
[__SIBLING__] Bright yellow flowers smile! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, từng giọt nước long lanh trên cánh hoa trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_teamwork_noon] Sunny garden workshop, wooden workbench, neatly arranged gardening tools. [/background]
__ADULT1__ mang chiếc chổi quét lá tới, tươi cười hướng dẫn hai con gom những cành cây khô gọn gàng vào sọt rơm. Âm thanh: Tiếng chổi quét soạt soạt trên nền gạch, tiếng chim sâu ríu rít.
[1-second] __ADULT1__ mỉm cười trao chiếc xẻng nhỏ cho __SIBLING__. [/1-second]
[__ADULT1__] Clean garden brings happiness! [/__ADULT1__]
[__SIBLING__] I will sweep neatly! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, lối đi sạch bóng lấp lánh dưới nắng trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_teamwork_noon] Sunny garden workshop, wooden workbench, neatly arranged gardening tools. [/background]
__ADULT2__ bước ra với chiếc giỏ đựng những quả táo đỏ mọng vừa thu hoạch, nhìn các con với ánh mắt dịu dàng. Âm thanh: Tiếng quả táo va nhẹ trong giỏ tre lách cách, tiếng cười vui tươi.
[1-second] __ADULT2__ nâng chiếc giỏ quả chín thơm phức. [/1-second]
[__ADULT2__] Sweet apples for helpers! [/__ADULT2__]
[__MAIN__] Red apples look delicious! [/__MAIN__]
[1-second] Khoảng lặng cuối cảnh, nụ cười rạng rỡ đón nhận giỏ quả ngọt trước khi chuyển cảnh [/1-second]
[/mota]
[/chapter-garden_teamwork_noon-1]

[chapter-garden_teamwork_noon-2]
[mota-10]
[background-garden_teamwork_noon] Sunny garden workshop, wooden workbench, neatly arranged gardening tools. [/background]
__MAIN__ đặt bình tưới xuống giá gỗ, đưa tay lau mồ hôi trên trán nhưng ánh mắt ngập tràn niềm vui lao động. Âm thanh: Tiếng chuông gió đung đưa leng keng êm dịu, tiếng thở phào sảng khoái.
[1-second] __MAIN__ nhìn quanh khu vườn vừa được dọn dẹp sạch sẽ. [/1-second]
[__MAIN__] Our yard looks beautiful! [/__MAIN__]
[__ADULT1__] Good work, little helpers! [/__ADULT1__]
[1-second] Khoảng lặng cuối cảnh, ánh mắt tự hào ngắm nhìn thành quả xanh tươi trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_teamwork_noon] Sunny garden workshop, wooden workbench, neatly arranged gardening tools. [/background]
__SIBLING__ cất chiếc chổi nhỏ vào góc lán, vui vẻ chạy tới bên cạnh anh/chị cùng nhận lấy quả táo ngọt lành. Âm thanh: Tiếng bước chân rộn ràng trên thảm cỏ non, tiếng cười khúc khích.
[1-second] __SIBLING__ giơ quả táo đỏ lên cao reo vui. [/1-second]
[__SIBLING__] Together we can help! [/__SIBLING__]
[__MAIN__] Teamwork makes us strong! [/__MAIN__]
[1-second] Khoảng lặng cuối cảnh, hai bạn nhỏ cùng cắn miếng táo giòn tan trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-garden_teamwork_noon] Sunny garden workshop, wooden workbench, neatly arranged gardening tools. [/background]
__ADULT2__ vỗ nhẹ vai hai con, chỉ tay về phía phòng khách báo hiệu giờ cơm tối ấm áp sắp bắt đầu. Âm thanh: Tiếng chim ríu rít bay về tổ, tiếng nhạc hòa tấu êm đềm chuyển đoạn.
[1-second] __ADULT2__ mỉm cười vẫy tay dẫn đường vào nhà. [/1-second]
[__ADULT2__] Time to go inside! [/__ADULT2__]
[__SIBLING__] Yummy dinner is waiting! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, cả nhà cùng rảo bước vào nhà ấm cúng trước khi chuyển cảnh [/1-second]
[/mota]
[/chapter-garden_teamwork_noon-2]`;

  // 3. Warm Evening Family Dinner - 58s, 10 lines
  const moduleDinner = `[chapter-living_room_evening_dinner-1]
[mota-10]
[background-living_room_evening_dinner] Cozy living room dining table, glowing amber chandelier, warm evening light. [/background]
Cả gia đình quây quần bên chiếc bàn tròn phòng khách, ánh đèn vàng ấm áp rọi sáng những đĩa súp nóng hổi thơm lừng. Âm thanh: Tiếng muỗng sứ chạm đĩa canh lách cách, tiếng nhạc hòa tấu êm dịu.
[1-second] __ADULT1__ múc từng bát súp nóng cho hai con. [/1-second]
[__ADULT1__] Warm soup for everyone! [/__ADULT1__]
[__MAIN__] It smells so good! [/__MAIN__]
[1-second] Khoảng lặng cuối cảnh, hơi súp nghi ngút ấm cúng lan tỏa khắp gian phòng trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-living_room_evening_dinner] Cozy living room dining table, glowing amber chandelier, warm evening light. [/background]
__ADULT2__ nâng ly nước cam cùng cả nhà, ánh mắt tràn trề niềm tự hào và tình thương yêu thương vô bờ. Âm thanh: Tiếng ly thủy tinh cụng nhẹ leng keng vui tai, tiếng cười ấm áp.
[1-second] __ADULT2__ mỉm cười nhìn quanh bàn ăn sum vầy. [/1-second]
[__ADULT2__] To honesty and courage! [/__ADULT2__]
[__SIBLING__] I love our family! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, nụ cười rạng rỡ của từng thành viên sum vầy trước khi chuyển cảnh [/1-second]
[/mota]
[mota-8]
[background-living_room_evening_dinner] Cozy living room dining table, glowing amber chandelier, warm evening light. [/background]
__MAIN__ gắp chiếc bánh nhỏ chia cho __SIBLING__, ánh mắt không còn chút sợ hãi hay lo âu. Âm thanh: Tiếng cười khúc khích trong trẻo của hai đứa trẻ.
[1-second] __MAIN__ đưa chiếc bánh cho em gái/em trai. [/1-second]
[__MAIN__] Take this sweet pancake! [/__MAIN__]
[__SIBLING__] Thank you, kind brother! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, tình thân gắn kết ngọt ngào trước khi chuyển cảnh [/1-second]
[/mota]
[/chapter-living_room_evening_dinner-1]

[chapter-living_room_evening_dinner-2]
[mota-10]
[background-living_room_evening_dinner] Cozy living room dining table, glowing amber chandelier, warm evening light. [/background]
__ADULT1__ đặt bàn tay dịu dàng lên vai __MAIN__, nhìn con với ánh mắt bao dung và thấu hiểu sâu sắc. Âm thanh: Tiếng thở phào nhẹ nhõm, tiếng nhạc du dương vỗ về.
[1-second] __ADULT1__ mỉm cười nói lời yêu thương. [/1-second]
[__ADULT1__] You told the truth. [/__ADULT1__]
[__MAIN__] Telling truth brings peace! [/__MAIN__]
[1-second] Khoảng lặng cuối cảnh, cái siết tay yêu thương giữa mẹ và con trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-living_room_evening_dinner] Cozy living room dining table, glowing amber chandelier, warm evening light. [/background]
__ADULT2__ gật đầu khẳng định, mỉm cười động viên hai con hãy luôn dũng cảm và yêu thương nhau suốt đời. Âm thanh: Tiếng dế đêm ngân nga ngoài vườn êm đềm.
[1-second] __ADULT2__ vỗ vai hai con đầy tự hào. [/1-second]
[__ADULT2__] Honesty is true bravery. [/__ADULT2__]
[__SIBLING__] We will remember always! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, ánh mắt rạng ngời ghi nhớ bài học nhân văn sâu sắc trước khi chuyển cảnh [/1-second]
[/mota]
[/chapter-living_room_evening_dinner-2]`;

  // 4. Peaceful Bedtime Reflection - 40s, 6 lines
  const moduleBedtime = `[chapter-bedroom_night_peace-1]
[mota-10]
[background-bedroom_night_peace] Softly lit children bedroom, star nightlight, cozy quilts. [/background]
__ADULT1__ mang hai ly sữa ấm thơm béo vào phòng ngủ cho các con, __MAIN__ đón lấy bằng cả hai tay với nụ cười ngoan ngoãn. Âm thanh: Tiếng sữa rót róc rách ấm lòng, tiếng bước chân êm nhẹ trên thảm.
[1-second] __ADULT1__ đưa ly sữa ấm cho __MAIN__. [/1-second]
[__ADULT1__] Warm milk brings dreams! [/__ADULT1__]
[__MAIN__] Thank you for caring! [/__MAIN__]
[1-second] Khoảng lặng cuối cảnh, hai bạn nhỏ nhấp từng ngụm sữa ấm trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-bedroom_night_peace] Softly lit children bedroom, star nightlight, cozy quilts. [/background]
__SIBLING__ chui vào chiếc chăn bông êm ái, ôm chú gấu nhỏ tựa đầu vào gối nhung mềm. Âm thanh: Tiếng vải chăn sột soạt êm ái, tiếng ngáp ngủ đáng yêu của trẻ thơ.
[1-second] __SIBLING__ nhắm hờ mắt thì thầm. [/1-second]
[__SIBLING__] Good night, sweet dreams! [/__SIBLING__]
[__ADULT2__] Sleep tight, little heroes! [/__ADULT2__]
[1-second] Khoảng lặng cuối cảnh, nụ hôn chúc ngủ ngon ấm áp lên trán trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-bedroom_night_peace] Softly lit children bedroom, star nightlight, cozy quilts. [/background]
__MAIN__ nằm gối đầu thoải mái, ngắm nhìn những vì sao dạ quang lấp lánh trên trần nhà với tâm hồn thanh thản. Âm thanh: Tiếng đồng hồ tích tắc êm đềm, tiếng thở đều đặn bình yên.
[1-second] __MAIN__ mỉm cười nhắm mắt lại. [/1-second]
[__MAIN__] Tomorrow will be great! [/__MAIN__]
[__ADULT1__] Love keeps us safe! [/__ADULT1__]
[1-second] Khoảng lặng cuối cảnh, ánh đèn ngủ dịu nhẹ canh giữ giấc mơ êm đềm của đàn con thơ trước khi chuyển cảnh [/1-second]
[/mota]
[mota-10]
[background-bedroom_night_peace] Softly lit children bedroom, star nightlight, cozy quilts. [/background]
Cả gian phòng chìm vào sự tĩnh lặng ngọt ngào của màn đêm, giai điệu nhạc ru dịu êm khép lại một ngày đầy bài học ý nghĩa. Âm thanh: Tiếng nhạc hòa tấu kết thúc du dương êm ái như lời ru của mẹ.
[1-second] Cả gia đình cùng mỉm cười trao nhau tình thương trọn vẹn. [/1-second]
[__ADULT2__] Home is always love. [/__ADULT2__]
[__SIBLING__] Love our happy home! [/__SIBLING__]
[1-second] Khoảng lặng cuối cảnh, khung cảnh gia đình bình yên trọn vẹn lắng đọng khép lại toàn bộ câu chuyện [/1-second]
[/mota]
[/chapter-bedroom_night_peace-1]`;

  const renderModule = (tmpl: string): string => {
    return tmpl
      .replaceAll("__MAIN__", mainChar)
      .replaceAll("__SIBLING__", siblingChar)
      .replaceAll("__ADULT1__", adult1)
      .replaceAll("__ADULT2__", adult2);
  };

  const extensionModules = [
    { key: "garden_climax_challenge", text: renderModule(moduleClimax) },
    { key: "garden_teamwork_noon", text: renderModule(moduleTeamwork) },
    { key: "living_room_evening_dinner", text: renderModule(moduleDinner) },
    { key: "bedroom_night_peace", text: renderModule(moduleBedtime) },
  ];

  // Sequentially append modules while totalLines < 60 OR totalDurationSeconds < 300
  for (const mod of extensionModules) {
    if (parsed.metrics.totalLines >= 60 && parsed.metrics.totalDurationSeconds >= 300) {
      break;
    }
    // Append module
    repaired = `${repaired.trim()}\n\n${mod.text.trim()}`;
    repaired = autoRepairScreenplayTags(repaired);
    repaired = enforceStoryCharacterLimit(repaired);
    parsed = parseScreenplay(repaired, title);
  }

  // Final check: if still under (in case base was super tiny e.g. 5 lines), loop teamwork with unique suffix
  let extraCount = 1;
  while ((parsed.metrics.totalLines < 60 || parsed.metrics.totalDurationSeconds < 300) && extraCount <= 3) {
    const extraModule = renderModule(moduleTeamwork)
      .replaceAll("garden_teamwork_noon-1", `garden_teamwork_extra_${extraCount}-1`)
      .replaceAll("garden_teamwork_noon-2", `garden_teamwork_extra_${extraCount}-2`)
      .replaceAll("garden_teamwork_noon", `garden_teamwork_extra_${extraCount}`);
    repaired = `${repaired.trim()}\n\n${extraModule.trim()}`;
    repaired = autoRepairScreenplayTags(repaired);
    repaired = enforceStoryCharacterLimit(repaired);
    parsed = parseScreenplay(repaired, title);
    extraCount++;
  }

  // If total duration exceeds 460s, convert some [mota-10] to [mota-8] or [mota-8] to [mota-6] to bring within 300-460s
  if (parsed.metrics.totalDurationSeconds > 460) {
    let excessSeconds = parsed.metrics.totalDurationSeconds - 440; // Target ~440s
    repaired = repaired.replace(/\[mota-10\]/g, (match) => {
      if (excessSeconds >= 2) {
        excessSeconds -= 2;
        return "[mota-8]";
      }
      return match;
    });

    if (excessSeconds > 0) {
      repaired = repaired.replace(/\[mota-8\]/g, (match) => {
        if (excessSeconds >= 2) {
          excessSeconds -= 2;
          return "[mota-6]";
        }
        return match;
      });
    }
  }

  return repaired;
}


