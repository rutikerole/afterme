"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { legacyAccessApi, LegacyContent } from "@/lib/api";

type ContentTab = "voice" | "memories" | "stories" | "instructions";

export default function LegacyAccessViewPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [content, setContent] = useState<LegacyContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ContentTab>("voice");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadContent();
    } else {
      setError("No access token provided");
      setIsLoading(false);
    }
  }, [token]);

  const loadContent = async () => {
    try {
      const result = await legacyAccessApi.getContent(token);
      setContent(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
        <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sage-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 20 24" fill="currentColor">
                  <path d="M10 2C10 2 3 8 3 14C3 18 6 22 10 22C14 22 17 18 17 14C17 8 10 2 10 2Z" />
                </svg>
              </div>
              <span className="font-serif text-xl font-semibold text-sage-800">AfterMe</span>
            </Link>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-sage-800 mb-2">Access Error</h1>
            <p className="text-sage-600 mb-6">{error}</p>
            <Link
              href="/legacy-access/status"
              className="inline-block px-6 py-3 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors font-medium"
            >
              Check Request Status
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!content) return null;

  const tabs = [
    { id: "voice" as const, label: "Voice Messages", count: content.content.voiceMessages.length },
    { id: "memories" as const, label: "Memories", count: content.content.memories.length },
    { id: "stories" as const, label: "Stories", count: content.content.stories.length },
    { id: "instructions" as const, label: "Final Wishes", count: content.content.legacyInstructions.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <header className="border-b border-sage-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sage-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 24" fill="currentColor">
                <path d="M10 2C10 2 3 8 3 14C3 18 6 22 10 22C14 22 17 18 17 14C17 8 10 2 10 2Z" />
              </svg>
            </div>
            <span className="font-serif text-xl font-semibold text-sage-800">AfterMe</span>
          </Link>
          {content.accessExpiresAt && (
            <div className="text-sm text-sage-500">
              Access expires: {formatDate(content.accessExpiresAt)}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* User info header */}
        <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-8 mb-8">
          <div className="flex items-center gap-6">
            {content.user.avatar ? (
              <img
                src={content.user.avatar}
                alt={content.user.name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-sage-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-serif text-sage-500">
                  {content.user.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-serif font-semibold text-sage-800 mb-2">
                Memories of {content.user.name}
              </h1>
              {content.user.bio && (
                <p className="text-sage-600 max-w-2xl">{content.user.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-sage-500 text-white"
                  : "bg-white text-sage-600 hover:bg-sage-50 border border-sage-200"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Voice Messages */}
        {activeTab === "voice" && (
          <div className="space-y-4">
            {content.content.voiceMessages.length === 0 ? (
              <EmptyState message="No voice messages available" />
            ) : (
              content.content.voiceMessages.map((msg) => (
                <div key={msg.id} className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-sage-800">{msg.title}</h3>
                      {msg.description && (
                        <p className="text-sm text-sage-600 mt-1">{msg.description}</p>
                      )}
                      <p className="text-xs text-sage-400 mt-2">
                        {formatDate(msg.recordedAt)} • {formatDuration(msg.duration)}
                      </p>
                    </div>
                    {msg.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {msg.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <audio
                    src={msg.fileUrl}
                    controls
                    className="w-full"
                    onPlay={() => setPlayingAudio(msg.id)}
                    onPause={() => setPlayingAudio(null)}
                  />
                  {msg.transcript && (
                    <div className="mt-4 p-4 bg-sage-50 rounded-lg">
                      <p className="text-xs font-medium text-sage-500 mb-2">Transcript</p>
                      <p className="text-sm text-sage-700">{msg.transcript}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Memories */}
        {activeTab === "memories" && (
          <div>
            {content.content.memories.length === 0 ? (
              <EmptyState message="No memories available" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {content.content.memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden group"
                  >
                    <div className="aspect-square relative">
                      <img
                        src={memory.mediaUrl}
                        alt={memory.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sage-800">{memory.title}</h3>
                      {memory.description && (
                        <p className="text-sm text-sage-600 mt-1 line-clamp-2">{memory.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-sage-400">
                        {memory.dateTaken && <span>{formatDate(memory.dateTaken)}</span>}
                        {memory.location && (
                          <>
                            <span>•</span>
                            <span>{memory.location}</span>
                          </>
                        )}
                      </div>
                      {memory.people.length > 0 && (
                        <div className="flex gap-1 flex-wrap mt-2">
                          {memory.people.map((person) => (
                            <span
                              key={person}
                              className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded"
                            >
                              {person}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stories */}
        {activeTab === "stories" && (
          <div className="space-y-6">
            {content.content.stories.length === 0 ? (
              <EmptyState message="No stories available" />
            ) : (
              content.content.stories.map((story) => (
                <div key={story.id} className="bg-white rounded-xl shadow-sm border border-sage-100 overflow-hidden">
                  {story.coverImageUrl && (
                    <img
                      src={story.coverImageUrl}
                      alt={story.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded capitalize">
                        {story.category}
                      </span>
                      {story.publishedAt && (
                        <span className="text-xs text-sage-400">{formatDate(story.publishedAt)}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-sage-800 mb-2">{story.title}</h3>
                    {story.excerpt && (
                      <p className="text-sage-600 mb-4">{story.excerpt}</p>
                    )}
                    <div
                      className="prose prose-sage max-w-none"
                      dangerouslySetInnerHTML={{ __html: story.content }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Legacy Instructions */}
        {activeTab === "instructions" && (
          <div className="space-y-4">
            {content.content.legacyInstructions.length === 0 ? (
              <EmptyState message="No final wishes recorded" />
            ) : (
              content.content.legacyInstructions.map((instruction) => (
                <div key={instruction.id} className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-sage-800">{instruction.title}</h3>
                        <span className="px-2 py-1 bg-sage-100 text-sage-600 text-xs rounded capitalize">
                          {instruction.category.replace("_", " ")}
                        </span>
                      </div>
                      <div
                        className="prose prose-sage prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: instruction.content }}
                      />
                      {instruction.attachmentUrls.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-sage-100">
                          <p className="text-xs font-medium text-sage-500 mb-2">Attachments</p>
                          <div className="flex gap-2 flex-wrap">
                            {instruction.attachmentUrls.map((url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-sage-50 text-sage-600 text-sm rounded hover:bg-sage-100 transition-colors"
                              >
                                Attachment {i + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-12 text-center">
      <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-sage-600">{message}</p>
    </div>
  );
}
