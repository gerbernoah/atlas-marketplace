import type { Idea } from "./types";

// ---- API client (KV-backed via /api/ideas) ----

export async function fetchIdeas(): Promise<Idea[]> {
  const res = await fetch("/api/ideas");
  if (!res.ok) throw new Error("Failed to fetch ideas");
  return res.json<Idea[]>();
}

export async function createIdea(
  idea: Omit<Idea, "id" | "createdAt" | "likes">,
): Promise<Idea> {
  const res = await fetch("/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(idea),
  });
  if (!res.ok) throw new Error("Failed to create idea");
  return res.json<Idea>();
}

export async function likeIdea(
  id: string,
  action: "like" | "unlike",
): Promise<Idea> {
  const res = await fetch(`/api/ideas/${id}/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("Failed to like idea");
  return res.json<Idea>();
}

export async function deleteIdea(id: string): Promise<void> {
  const res = await fetch(`/api/ideas/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete idea");
}

// ---- Client-side like tracking (stays in localStorage) ----

export function isLiked(id: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`atlas-liked-${id}`) === "true";
}

export function setLiked(id: string, liked: boolean): void {
  if (typeof window === "undefined") return;
  if (liked) {
    localStorage.setItem(`atlas-liked-${id}`, "true");
  } else {
    localStorage.removeItem(`atlas-liked-${id}`);
  }
}
