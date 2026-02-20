"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Category } from "@/lib/types";
import { CATEGORIES, LOOKING_FOR_OPTIONS } from "@/lib/types";

interface PostIdeaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    category: Category;
    lookingFor: string[];
    founder: {
      name: string;
      avatar: string;
      tagline: string;
      email: string;
    };
  }) => void;
}

export default function PostIdeaModal({
  open,
  onClose,
  onSubmit,
}: PostIdeaModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("SaaS");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open, onClose]);

  if (!open) return null;

  const toggleLookingFor = (role: string) => {
    setLookingFor((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!title.trim()) {
      setError("Please enter a title for your idea");
      return;
    }
    if (!description.trim()) {
      setError("Please enter a description for your idea");
      return;
    }
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (lookingFor.length === 0) {
      setError("Please select at least one role you're looking for");
      return;
    }

    setError("");

    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    onSubmit({
      title,
      description,
      category,
      lookingFor,
      founder: { name, avatar: initials, tagline, email },
    });

    // Reset
    setTitle("");
    setDescription("");
    setCategory("SaaS");
    setLookingFor([]);
    setName("");
    setTagline("");
    setEmail("");
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-default"
        onClick={(e) => {
          // Only close if clicking directly on the backdrop, not on modal content
          if (
            e.target === e.currentTarget ||
            !modalRef.current?.contains(e.target as Node)
          ) {
            onClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Share your idea
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Tell the world what you&apos;re building
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* About You */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                About you
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="founder-name"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Your name *
                  </label>
                  <input
                    id="founder-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="founder-email"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Email *
                  </label>
                  <input
                    id="founder-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@startup.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="founder-tagline"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  One-liner about you
                </label>
                <input
                  id="founder-tagline"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Ex-Google engineer, passionate about climate tech"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* Your Idea */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Your idea
              </h3>
              <div>
                <label
                  htmlFor="idea-title"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Title *
                </label>
                <input
                  id="idea-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A catchy name for your idea"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="idea-description"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Description *
                </label>
                <Textarea
                  id="idea-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your idea, the problem it solves, and why you're excited about it..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="idea-category"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Category
                </label>
                <select
                  id="idea-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Looking For */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Who are you looking for? *
              </h3>
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR_OPTIONS.map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={lookingFor.includes(role) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      toggleLookingFor(role);
                      if (error) setError("");
                    }}
                    className="rounded-full px-4"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full rounded-2xl py-3 text-sm font-medium shadow-sm"
            >
              Publish Idea 🚀
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
