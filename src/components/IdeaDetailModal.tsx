"use client";

import type { Idea } from "@/lib/types";
import { isLiked } from "@/lib/store";
import { useEffect, useState } from "react";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const CATEGORY_COLORS: Record<string, string> = {
  SaaS: "bg-blue-50 text-blue-700",
  Fintech: "bg-emerald-50 text-emerald-700",
  Health: "bg-rose-50 text-rose-700",
  "AI / ML": "bg-violet-50 text-violet-700",
  Education: "bg-amber-50 text-amber-700",
  "E-Commerce": "bg-orange-50 text-orange-700",
  Social: "bg-pink-50 text-pink-700",
  "Developer Tools": "bg-cyan-50 text-cyan-700",
  Sustainability: "bg-lime-50 text-lime-700",
  Other: "bg-gray-50 text-gray-600",
};

interface IdeaDetailModalProps {
  idea: Idea | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function IdeaDetailModal({
  idea,
  onClose,
  onLike,
  onDelete,
}: IdeaDetailModalProps) {
  const [liked, setLiked] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (idea) {
      setLiked(isLiked(idea.id));
      setShowContact(false);
      setMessage("");
      setSent(false);
    }
  }, [idea]);

  if (!idea) return null;

  const handleSend = () => {
    if (!message.trim()) return;
    // In a real app, this would send an email/notification
    // For now we open a mailto link
    const subject = encodeURIComponent(
      `Let's collaborate on "${idea.title}" – via Atlas`
    );
    const body = encodeURIComponent(message);
    window.open(
      `mailto:${idea.founder.email}?subject=${subject}&body=${body}`,
      "_blank"
    );
    setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={() => {}}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Category */}
          <span
            className={`inline-block text-xs font-medium px-3 py-1.5 rounded-full mb-4 ${CATEGORY_COLORS[idea.category] || CATEGORY_COLORS.Other}`}
          >
            {idea.category}
          </span>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 pr-12">
            {idea.title}
          </h2>

          {/* Founder info */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {idea.founder.avatar}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {idea.founder.name}
              </p>
              <p className="text-xs text-gray-400">
                {idea.founder.tagline} · {timeAgo(idea.createdAt)}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {idea.description}
            </p>
          </div>

          {/* Looking For */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Looking for
            </h3>
            <div className="flex flex-wrap gap-2">
              {idea.lookingFor.map((role) => (
                <span
                  key={role}
                  className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                onLike(idea.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-sm font-medium cursor-pointer ${
                liked
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-gray-200 text-gray-500 hover:border-rose-200 hover:text-rose-500"
              }`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {idea.likes} {idea.likes === 1 ? "like" : "likes"}
            </button>

            <button
              type="button"
              onClick={() => setShowContact(true)}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 px-5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.99] text-sm cursor-pointer"
            >
              🤝 Approach {idea.founder.name.split(" ")[0]}
            </button>

            <button
              type="button"
              onClick={() => {
                onDelete(idea.id);
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all text-sm font-medium cursor-pointer"
              title="Delete idea"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>

          {/* Contact Form */}
          {showContact && !sent && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                Reach out to {idea.founder.name}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Write a short message about why you&apos;d be a great fit to
                collaborate
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Hi ${idea.founder.name.split(" ")[0]}, I saw your idea "${idea.title}" on Atlas and I'd love to chat about...`}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all text-sm resize-none bg-white mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowContact(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium py-2 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  Send message ✉️
                </button>
              </div>
            </div>
          )}

          {/* Sent confirmation */}
          {sent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-sm font-semibold text-emerald-800">
                Your email client should have opened!
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                If it didn&apos;t, you can reach {idea.founder.name} at{" "}
                <a
                  href={`mailto:${idea.founder.email}`}
                  className="underline font-medium"
                >
                  {idea.founder.email}
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
