import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { KV_KEY_IDEAS } from "@/lib/constants";
import { SEED_IDEAS } from "@/lib/seed";
import type { Idea } from "@/lib/types";

type CreateIdeaBody = Omit<Idea, "id" | "createdAt" | "likes">;

async function getKV() {
  const { env } = await getCloudflareContext({ async: true });
  return env.DATA_KV;
}

// GET /api/ideas — fetch all ideas
export async function GET() {
  const kv = await getKV();
  const raw = await kv.get(KV_KEY_IDEAS);

  if (!raw) {
    // Seed on first access
    await kv.put(KV_KEY_IDEAS, JSON.stringify(SEED_IDEAS));
    return NextResponse.json<Idea[]>(SEED_IDEAS);
  }

  const ideas = JSON.parse(raw) as Idea[];
  return NextResponse.json<Idea[]>(ideas);
}

// POST /api/ideas — create a new idea
export async function POST(request: Request) {
  const kv = await getKV();
  const body = await request.json<CreateIdeaBody>();

  const newIdea: Idea = {
    ...body,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  const raw = await kv.get(KV_KEY_IDEAS);
  const ideas: Idea[] = raw ? JSON.parse(raw) : SEED_IDEAS;
  const updated = [newIdea, ...ideas];

  await kv.put(KV_KEY_IDEAS, JSON.stringify(updated));

  return NextResponse.json<Idea>(newIdea, { status: 201 });
}
