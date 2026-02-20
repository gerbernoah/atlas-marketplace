import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { IDEA_KV_PREFIX } from "@/lib/constants";
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

  // Get the idea
  const ideaRaw = await kv.get(`${IDEA_KV_PREFIX}${id}`);
  if (!ideaRaw) {
    return NextResponse.json<ErrorResponse>(
      { error: "Idea not found" },
      { status: 404 },
    );
  }

  const idea = JSON.parse(ideaRaw) as Idea;
  const newLikes =
    action === "like" ? idea.likes + 1 : Math.max(0, idea.likes - 1);
  const updatedIdea: Idea = { ...idea, likes: newLikes };

  // Update just this idea
  await kv.put(`${IDEA_KV_PREFIX}${id}`, JSON.stringify(updatedIdea));

  return NextResponse.json<Idea>(updatedIdea);
}
