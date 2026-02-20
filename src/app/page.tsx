"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import IdeaCard from "@/components/IdeaCard";
import IdeaDetailModal from "@/components/IdeaDetailModal";
import Navbar from "@/components/Navbar";
import PostIdeaModal from "@/components/PostIdeaModal";
import {
  createIdea,
  deleteIdea,
  fetchIdeas,
  isLiked,
  likeIdea,
  setLiked,
} from "@/lib/store";
import type { Category, Idea } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export default function Home() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent");

  useEffect(() => {
    fetchIdeas()
      .then(setIdeas)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredIdeas = useMemo(() => {
    let result = ideas;

    if (activeCategory !== "All") {
      result = result.filter((idea) => idea.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.description.toLowerCase().includes(q) ||
          idea.founder.name.toLowerCase().includes(q) ||
          idea.lookingFor.some((r) => r.toLowerCase().includes(q)),
      );
    }

    if (sortBy === "popular") {
      result = [...result].sort((a, b) => b.likes - a.likes);
    } else {
      result = [...result].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    return result;
  }, [ideas, activeCategory, searchQuery, sortBy]);

  const handlePost = useCallback(
    async (data: Parameters<typeof createIdea>[0]) => {
      try {
        const newIdea = await createIdea(data);
        setIdeas((prev) => [newIdea, ...prev]);
      } catch (e) {
        console.error("Failed to create idea:", e);
      }
    },
    [],
  );

  const handleLike = useCallback(
    async (id: string) => {
      const currentlyLiked = isLiked(id);
      const action = currentlyLiked ? "unlike" : "like";

      // Optimistic update
      setLiked(id, !currentlyLiked);
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === id
            ? { ...idea, likes: idea.likes + (currentlyLiked ? -1 : 1) }
            : idea,
        ),
      );

      try {
        const updated = await likeIdea(id, action);
        // Sync server state
        setIdeas((prev) =>
          prev.map((idea) => (idea.id === id ? updated : idea)),
        );
        if (selectedIdea?.id === id) {
          setSelectedIdea(updated);
        }
      } catch (e) {
        // Revert optimistic update
        setLiked(id, currentlyLiked);
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === id
              ? { ...idea, likes: idea.likes + (currentlyLiked ? 1 : -1) }
              : idea,
          ),
        );
        console.error("Failed to like:", e);
      }
    },
    [selectedIdea],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this idea?")) {
        return;
      }

      // Optimistic update
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
      if (selectedIdea?.id === id) {
        setSelectedIdea(null);
      }

      try {
        await deleteIdea(id);
      } catch (e) {
        // Revert by refetching
        fetchIdeas().then(setIdeas).catch(console.error);
        console.error("Failed to delete:", e);
      }
    },
    [selectedIdea],
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar onPostIdea={() => setShowPost(true)} />

      {/* Hero */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            {ideas.length} ideas shared by founders
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-4">
            Where ideas find
            <br />
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              their co-founders
            </span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Share your startup idea, discover what others are building, and find
            the perfect people to build it with.
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas, founders, or roles..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveCategory("All")}
                className={`shrink-0 text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${
                  activeCategory === "All"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 text-sm px-4 py-2 rounded-full border transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 shrink-0">
              <button
                type="button"
                onClick={() => setSortBy("recent")}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  sortBy === "recent"
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Recent
              </button>
              <button
                type="button"
                onClick={() => setSortBy("popular")}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  sortBy === "popular"
                    ? "bg-gray-900 text-white"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Popular
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Ideas Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-3 w-24 bg-gray-200 rounded" />
                      <div className="h-2 w-16 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
                  <div className="space-y-2 mb-4">
                    <div className="h-3 w-full bg-gray-100 rounded" />
                    <div className="h-3 w-5/6 bg-gray-100 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredIdeas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  onSelect={setSelectedIdea}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No ideas found
              </h3>
              <p className="text-sm text-gray-400 mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Be the first to share an idea in this category!"}
              </p>
              <button
                type="button"
                onClick={() => setShowPost(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-6 py-2.5 rounded-full transition-all cursor-pointer"
              >
                + Share an Idea
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-900">Atlas</span>
          </div>
          <p className="text-xs text-gray-400">
            Where founders meet their next chapter.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PostIdeaModal
        open={showPost}
        onClose={() => setShowPost(false)}
        onSubmit={handlePost}
      />
      <IdeaDetailModal
        idea={selectedIdea}
        onClose={() => setSelectedIdea(null)}
        onLike={handleLike}
        onDelete={handleDelete}
      />
    </div>
  );
}
