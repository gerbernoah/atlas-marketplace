import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";
import { IDEA_KV_PREFIX } from "@/lib/constants";

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

  // Check if idea exists
  const ideaRaw = await kv.get(`${IDEA_KV_PREFIX}${id}`);
  if (!ideaRaw) {
    return NextResponse.json<ErrorResponse>(
      { error: "Idea not found" },
      { status: 404 },
    );
  }

  // Delete the idea
  await kv.delete(`${IDEA_KV_PREFIX}${id}`);

  return NextResponse.json({ success: true }, { status: 200 });
}
