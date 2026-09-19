import { SavedScript, ScriptMetrics } from "../types";

const SAVED_SCRIPTS_KEY = "storyforge_saved_scripts_v1";
const ACTIVE_DRAFT_KEY = "storyforge_active_draft_v1";
const CURRENT_SAVED_ID_KEY = "storyforge_current_saved_id_v1";

export function getSavedScripts(): SavedScript[] {
  try {
    const raw = localStorage.getItem(SAVED_SCRIPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return [];
  } catch (err) {
    console.error("Error reading saved scripts from localStorage:", err);
    return [];
  }
}

export function saveScript(
  title: string,
  rawText: string,
  metrics: ScriptMetrics,
  existingId?: string | null
): SavedScript {
  const scripts = getSavedScripts();
  const now = new Date().toISOString();
  const cleanTitle = title.trim() || "Kịch bản chưa đặt tên";

  const chapterCount = (rawText.match(/\[chapter-/gi) || []).length;
  const metricsSummary = {
    totalDurationSeconds: metrics.totalDurationSeconds || 0,
    totalLines: metrics.totalLines || 0,
    totalChapters: chapterCount,
    totalWords: metrics.totalWords || 0,
  };

  if (existingId) {
    const index = scripts.findIndex((s) => s.id === existingId);
    if (index !== -1) {
      const updatedScript: SavedScript = {
        ...scripts[index],
        title: cleanTitle,
        rawText,
        updatedAt: now,
        metricsSummary,
      };
      scripts[index] = updatedScript;
      localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
      return updatedScript;
    }
  }

  // Create new saved script
  const newScript: SavedScript = {
    id: `script_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: cleanTitle,
    rawText,
    createdAt: now,
    updatedAt: now,
    metricsSummary,
  };

  scripts.unshift(newScript);
  localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
  return newScript;
}

export function deleteSavedScript(id: string): void {
  try {
    const scripts = getSavedScripts().filter((s) => s.id !== id);
    localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
  } catch (err) {
    console.error("Error deleting saved script:", err);
  }
}

export function updateSavedScriptTitle(id: string, newTitle: string): void {
  try {
    const scripts = getSavedScripts();
    const target = scripts.find((s) => s.id === id);
    if (target) {
      target.title = newTitle.trim() || "Kịch bản chưa đặt tên";
      target.updatedAt = new Date().toISOString();
      localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
    }
  } catch (err) {
    console.error("Error updating saved script title:", err);
  }
}

export function duplicateSavedScript(id: string): SavedScript | null {
  try {
    const scripts = getSavedScripts();
    const source = scripts.find((s) => s.id === id);
    if (!source) return null;

    const now = new Date().toISOString();
    const copy: SavedScript = {
      ...source,
      id: `script_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${source.title} (Bản sao)`,
      createdAt: now,
      updatedAt: now,
    };

    scripts.unshift(copy);
    localStorage.setItem(SAVED_SCRIPTS_KEY, JSON.stringify(scripts));
    return copy;
  } catch (err) {
    console.error("Error duplicating script:", err);
    return null;
  }
}

export function saveActiveDraft(title: string, rawText: string, currentSavedId?: string | null): void {
  try {
    localStorage.setItem(
      ACTIVE_DRAFT_KEY,
      JSON.stringify({
        title,
        rawText,
        savedAt: new Date().toISOString(),
        currentSavedId: currentSavedId || null,
      })
    );
  } catch (err) {
    console.error("Error saving active draft:", err);
  }
}

export function getActiveDraft(): { title: string; rawText: string; currentSavedId?: string | null } | null {
  try {
    const raw = localStorage.getItem(ACTIVE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading active draft:", err);
    return null;
  }
}

export function clearActiveDraft(): void {
  try {
    localStorage.removeItem(ACTIVE_DRAFT_KEY);
  } catch (err) {
    console.error("Error clearing active draft:", err);
  }
}

export function exportScriptAsTxt(title: string, rawText: string): void {
  const filename = `${(title.trim() || "kich-ban").replace(/[^\w\s-]/gi, "").replace(/\s+/g, "_")}.txt`;
  const blob = new Blob([rawText], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importScriptFromTxtFile(file: File): Promise<{ title: string; rawText: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || "";
      // Derrive title from filename (strip .txt extension)
      const title = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      resolve({ title, rawText: content });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
}
