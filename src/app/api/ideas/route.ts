import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { IDEA_KV_PREFIX } from "@/lib/constants";
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
  const listResult = await kv.list({ prefix: IDEA_KV_PREFIX });

  // If no ideas exist, seed them
  if (listResult.keys.length === 0) {
    for (const idea of SEED_IDEAS) {
      await kv.put(`${IDEA_KV_PREFIX}${idea.id}`, JSON.stringify(idea));
    }
    return NextResponse.json<Idea[]>(SEED_IDEAS);
  }

  const ideas: Idea[] = [];
  for (const key of listResult.keys) {
    const ideaRaw = await kv.get(key.name);
    if (ideaRaw) {
      ideas.push(JSON.parse(ideaRaw) as Idea);
    }
  }

  ideas.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

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

  // Store the individual idea
  await kv.put(`${IDEA_KV_PREFIX}${newIdea.id}`, JSON.stringify(newIdea));

  return NextResponse.json<Idea>(newIdea, { status: 201 });
}
