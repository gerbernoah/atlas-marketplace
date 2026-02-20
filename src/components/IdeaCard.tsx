"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { isLiked } from "@/lib/store";
import type { Idea } from "@/lib/types";

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
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

interface IdeaCardProps {
  idea: Idea;
  onSelect: (idea: Idea) => void;
  onLike: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function IdeaCard({
  idea,
  onSelect,
  onLike,
  onDelete,
}: IdeaCardProps) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(isLiked(idea.id));
  }, [idea.id]);

  return (
    <Card className="relative group rounded-2xl border border-gray-100 bg-card hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-300 hover:border-gray-200">
      {/* Category badge */}
      <span
        className={`absolute right-6 top-6 text-xs font-medium px-2.5 py-1 rounded-full ${
          CATEGORY_COLORS[idea.category] || CATEGORY_COLORS.Other
        }`}
      >
        {idea.category}
      </span>

      {/* Header */}
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {idea.founder.avatar}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {idea.founder.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {timeAgo(idea.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(idea.id);
            }}
            className="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Delete idea"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </Button>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-0">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onSelect(idea)}
          className="w-full justify-start px-0 py-0 h-auto text-left hover:bg-transparent"
        >
          <div className="w-full min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2 wrap-break-word">
              {idea.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3 wrap-break-word">
              {idea.description}
            </p>
          </div>
        </Button>

        {/* Looking For Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {idea.lookingFor.map((role) => (
            <span
              key={role}
              className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full"
            >
              {role}
            </span>
          ))}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex items-center justify-between pt-4 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setLiked(!liked);
            onLike(idea.id);
          }}
          className={`flex items-center gap-1.5 text-sm font-medium ${
            liked
              ? "text-rose-500 hover:text-rose-600"
              : "text-gray-400 hover:text-rose-500"
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
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {idea.likes}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSelect(idea)}
          className="text-xs text-gray-400 group-hover:text-indigo-500 transition-colors font-medium"
        >
          View details →
        </Button>
      </CardFooter>
    </Card>
  );
}
