import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { KV_KEY_IDEAS } from "@/lib/constants";
import { SEED_IDEAS } from "@/lib/seed";
import type { Idea } from "@/lib/types";

interface LikeActionBody {
  action?: "like" | "unlike";
}

interface ErrorResponse {
  error: string;
}

// POST /api/ideas/[id]/like — increment or decrement like
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const kv = env.DATA_KV;

  const body = await request.json<LikeActionBody>();
  const action: "like" | "unlike" = body.action ?? "like";

  const raw = await kv.get(KV_KEY_IDEAS);
  const ideas: Idea[] = raw ? JSON.parse(raw) : SEED_IDEAS;

  let updatedIdea: Idea | null = null;

  const updated = ideas.map((idea) => {
    if (idea.id === id) {
      const newLikes =
        action === "like" ? idea.likes + 1 : Math.max(0, idea.likes - 1);
      updatedIdea = { ...idea, likes: newLikes };
      return updatedIdea;
    }
    return idea;
  });

  if (!updatedIdea) {
    return NextResponse.json<ErrorResponse>(
      { error: "Idea not found" },
      { status: 404 },
    );
  }

  await kv.put(KV_KEY_IDEAS, JSON.stringify(updated));

  return NextResponse.json<Idea>(updatedIdea);
}
