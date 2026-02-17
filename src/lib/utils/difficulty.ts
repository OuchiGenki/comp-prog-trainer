/**
 * AtCoder difficulty color scheme.
 * Maps difficulty rating to color (Gray → Brown → Green → Cyan → Blue → Yellow → Orange → Red).
 */

export interface DifficultyColor {
  bg: string;
  text: string;
  label: string;
}

export function getDifficultyColor(difficulty: number | undefined): DifficultyColor {
  if (difficulty === undefined || difficulty === null) {
    return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500", label: "不明" };
  }

  if (difficulty < 400) {
    return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500", label: "灰" };
  }
  if (difficulty < 800) {
    return { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", label: "茶" };
  }
  if (difficulty < 1200) {
    return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "緑" };
  }
  if (difficulty < 1600) {
    return { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-400", label: "水" };
  }
  if (difficulty < 2000) {
    return { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "青" };
  }
  if (difficulty < 2400) {
    return { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "黄" };
  }
  if (difficulty < 2800) {
    return { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", label: "橙" };
  }
  return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "赤" };
}

export function getDifficultyHexColor(difficulty: number | undefined): string {
  if (difficulty === undefined || difficulty === null) return "#808080";
  if (difficulty < 400) return "#808080";
  if (difficulty < 800) return "#804000";
  if (difficulty < 1200) return "#008000";
  if (difficulty < 1600) return "#00C0C0";
  if (difficulty < 2000) return "#0000FF";
  if (difficulty < 2400) return "#C0C000";
  if (difficulty < 2800) return "#FF8000";
  return "#FF0000";
}

export function getDifficultyLabel(difficulty: number | undefined): string {
  return getDifficultyColor(difficulty).label;
}

export function getContestCategory(contestId: string): "ABC" | "ARC" | "AGC" | "Other" {
  if (contestId.startsWith("abc")) return "ABC";
  if (contestId.startsWith("arc")) return "ARC";
  if (contestId.startsWith("agc")) return "AGC";
  return "Other";
}
