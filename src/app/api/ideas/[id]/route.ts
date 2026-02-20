import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { KV_KEY_IDEAS } from "@/lib/constants";
import { SEED_IDEAS } from "@/lib/seed";
import type { Idea } from "@/lib/types";

interface ErrorResponse {
  error: string;
}

// DELETE /api/ideas/[id] — delete an idea
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const kv = env.DATA_KV;

  const raw = await kv.get(KV_KEY_IDEAS);
  const ideas: Idea[] = raw ? JSON.parse(raw) : SEED_IDEAS;

  const ideaExists = ideas.some((idea) => idea.id === id);
  if (!ideaExists) {
    return NextResponse.json<ErrorResponse>(
      { error: "Idea not found" },
      { status: 404 },
    );
  }

  const updated = ideas.filter((idea) => idea.id !== id);
  await kv.put(KV_KEY_IDEAS, JSON.stringify(updated));

  return NextResponse.json({ success: true }, { status: 200 });
}
