"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Mic,
  Video,
  PenLine,
  Heart,
  Sparkles,
  Baby,
  Users,
  Lightbulb,
  Clock,
  ChevronRight,
  Play,
  Pause,
  CheckCircle2,
  Star,
  MessageCircle,
  Lock,
  Calendar,
  X,
  Feather,
  Quote,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { storiesApi, type Story as ApiStory } from "@/lib/api";
import { toast } from "sonner";

interface StoryPrompt {
  id: string;
  category: string;
  prompt: string;
  description: string;
  isCompleted: boolean;
  response?: {
    type: "text" | "voice" | "video";
    content: string;
    createdAt: string;
    storyId?: string;
  };
}

// Floating Leaf with variants
const FloatingLeaf = ({ className, style, size = 40, variant = 1 }: { className?: string; style?: React.CSSProperties; size?: number; variant?: number }) => {
  const paths = [
    "M20 2C20 2 8 12 8 24C8 32 13 38 20 38C27 38 32 32 32 24C32 12 20 2 20 2Z",
    "M20 2C15 8 8 15 8 24C8 30 12 36 20 38C28 36 32 30 32 24C32 15 25 8 20 2Z",
    "M20 5C12 10 8 18 10 28C12 35 16 38 20 38C24 38 28 35 30 28C32 18 28 10 20 5Z",
  ];

  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 40 40" fill="none">
      <path
        d={paths[(variant - 1) % 3]}
        fill="hsl(var(--sage))"
        fillOpacity="0.3"
        stroke="hsl(var(--sage))"
        strokeWidth="1.5"
        strokeOpacity="0.6"
      />
      <path
        d="M20 8V32M20 14L14 20M20 20L26 26"
        stroke="hsl(var(--sage))"
        strokeWidth="1"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

// Sparkle decoration
const Sparkle = ({ className, style, size = 20 }: { className?: string; style?: React.CSSProperties; size?: number }) => (
  <svg className={className} style={style} width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path
      d="M10 0L11.5 8.5L20 10L11.5 11.5L10 20L8.5 11.5L0 10L8.5 8.5L10 0Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.5"
    />
  </svg>
);

// Quill/Feather decoration for writing theme with animation
const QuillDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="70" height="70" viewBox="0 0 70 70" fill="none">
    <path
      d="M52 10C52 10 40 22 34 34C28 46 24 60 24 60L28 57C28 57 32 45 38 33C44 21 56 12 56 12L52 10Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.2"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-draw-line"
    />
    <path
      d="M24 60L19 66M34 34L40 30"
      stroke="hsl(var(--sage))"
      strokeWidth="1"
      strokeOpacity="0.4"
      strokeLinecap="round"
    />
    {/* Ink drops */}
    <circle cx="22" cy="62" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" className="animate-twinkle" />
    <circle cx="18" cy="58" r="1.5" fill="hsl(var(--sage))" fillOpacity="0.3" className="animate-twinkle" style={{ animationDelay: "0.5s" }} />
  </svg>
);

// Open book decoration
const BookDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="80" height="60" viewBox="0 0 80 60" fill="none">
    <path
      d="M40 15C40 15 25 10 10 12C10 12 10 50 10 50C25 48 40 52 40 52C40 52 55 48 70 50C70 50 70 12 70 12C55 10 40 15 40 15Z"
      fill="hsl(var(--sage))"
      fillOpacity="0.1"
      stroke="hsl(var(--sage))"
      strokeWidth="1.5"
      strokeOpacity="0.4"
    />
    <path d="M40 15V52" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.3" />
    {/* Page lines */}
    <path d="M18 22H35M18 28H32M18 34H34M18 40H30" stroke="hsl(var(--sage))" strokeWidth="0.5" strokeOpacity="0.3" />
    <path d="M45 22H62M48 28H62M46 34H62M50 40H62" stroke="hsl(var(--sage))" strokeWidth="0.5" strokeOpacity="0.3" />
  </svg>
);

// Gentle rings decoration
const GentleRings = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="70" height="70" viewBox="0 0 70 70" fill="none">
    <circle cx="35" cy="35" r="30" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="5 5" className="animate-rotate-gentle" style={{ transformOrigin: 'center' }} />
    <circle cx="35" cy="35" r="20" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.3" className="animate-rotate-gentle" style={{ transformOrigin: 'center', animationDirection: 'reverse', animationDuration: '25s' }} />
    <circle cx="35" cy="35" r="10" fill="hsl(var(--sage))" fillOpacity="0.08" />
  </svg>
);

const promptCategories = [
  {
    id: "love",
    name: "Love & Relationships",
    icon: Heart,
    color: "from-sage/30 to-sage-light/40",
    bgColor: "bg-sage/15",
    iconColor: "text-sage-dark",
    prompts: [
      { prompt: "How did you meet your partner?", description: "Tell the story of how love found you" },
      { prompt: "What's your favorite memory together?", description: "A moment you never want to forget" },
      { prompt: "What do you love most about them?", description: "The little things that matter" },
      { prompt: "Advice for a lasting relationship", description: "Wisdom for your children" },
    ],
  },
  {
    id: "childhood",
    name: "Childhood & Growing Up",
    icon: Baby,
    color: "from-amber-100/80 to-sage-light/30",
    bgColor: "bg-amber-100/50",
    iconColor: "text-amber-700",
    prompts: [
      { prompt: "Tell me about your childhood home", description: "Where did you grow up?" },
      { prompt: "Your favorite childhood memory", description: "A moment of pure joy" },
      { prompt: "Who was your childhood best friend?", description: "Stories of friendship" },
      { prompt: "What did you dream of becoming?", description: "Your childhood aspirations" },
    ],
  },
  {
    id: "wisdom",
    name: "Life Lessons",
    icon: Lightbulb,
    color: "from-sage-light/50 to-sage/20",
    bgColor: "bg-sage-light/40",
    iconColor: "text-sage-dark",
    prompts: [
      { prompt: "Your biggest life lesson", description: "What would you tell your younger self?" },
      { prompt: "A mistake that taught you something", description: "Growth through failure" },
      { prompt: "The best advice you ever received", description: "Words that changed your life" },
      { prompt: "What does success mean to you?", description: "Your definition of a good life" },
    ],
  },
  {
    id: "family",
    name: "Family Stories",
    icon: Users,
    color: "from-sage/25 to-sage-light/35",
    bgColor: "bg-sage/10",
    iconColor: "text-sage-dark",
    prompts: [
      { prompt: "Tell me about your parents", description: "Stories about mom and dad" },
      { prompt: "A family tradition you love", description: "Traditions worth passing on" },
      { prompt: "Your proudest moment as a parent", description: "When your heart was fullest" },
      { prompt: "What do you want your children to know?", description: "Your hopes for them" },
    ],
  },
  {
    id: "milestones",
    name: "For Milestones",
    icon: Star,
    color: "from-rose-100/60 to-sage-light/30",
    bgColor: "bg-rose-100/40",
    iconColor: "text-rose-600",
    prompts: [
      { prompt: "Message for my child at 18", description: "Wisdom for adulthood" },
      { prompt: "For your wedding day", description: "Love and blessings for the big day" },
      { prompt: "When you have your first child", description: "Welcome to parenthood" },
      { prompt: "If you're reading this, I'm gone", description: "A final message of love" },
    ],
  },
  {
    id: "gratitude",
    name: "Gratitude & Thanks",
    icon: Sparkles,
    color: "from-sage-light/60 to-sage/15",
    bgColor: "bg-sage-light/50",
    iconColor: "text-sage",
    prompts: [
      { prompt: "Thank you to my partner", description: "Appreciation for a lifetime together" },
      { prompt: "Thank you to my children", description: "What you've given me" },
      { prompt: "Thank you to my parents", description: "Gratitude for those who raised you" },
      { prompt: "Thank you to a friend", description: "For someone who was always there" },
    ],
  },
];

export default function StoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activePrompt, setActivePrompt] = useState<{ category: string; prompt: string } | null>(null);
  const [responseType, setResponseType] = useState<"text" | "voice" | "video">("text");
  const [textResponse, setTextResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [completedStories, setCompletedStories] = useState<StoryPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<Record<string, string>>({});

  // Fetch stories on mount
  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const response = await storiesApi.getAll();

      // Map API stories to StoryPrompt format
      const mappedStories: StoryPrompt[] = response.stories.map((story: ApiStory) => ({
        id: story.id,
        category: story.category || "wisdom",
        prompt: story.title,
        description: story.excerpt || "",
        isCompleted: true,
        response: {
          type: "text" as const,
          content: story.content,
          createdAt: story.createdAt,
          storyId: story.id,
        },
      }));

      setCompletedStories(mappedStories);
    } catch (error) {
      console.error("Failed to fetch stories:", error);
      toast.error("Failed to load stories");
    } finally {
      setIsLoading(false);
    }
  };

  const saveStory = async () => {
    if (!activePrompt || !textResponse.trim()) {
      toast.error("Please write something before saving");
      return;
    }

    setIsSaving(true);
    try {
      // Map category to API category
      const categoryMap: Record<string, "life" | "wisdom" | "memories" | "advice" | "traditions"> = {
        love: "life",
        childhood: "memories",
        wisdom: "wisdom",
        family: "life",
        milestones: "advice",
        gratitude: "life",
      };

      const newStory = await storiesApi.create({
        title: activePrompt.prompt,
        content: textResponse,
        excerpt: textResponse.slice(0, 150) + (textResponse.length > 150 ? "..." : ""),
        category: categoryMap[activePrompt.category] || "wisdom",
        status: "published",
      });

      const mappedStory: StoryPrompt = {
        id: newStory.id,
        category: activePrompt.category,
        prompt: activePrompt.prompt,
        description: "",
        isCompleted: true,
        response: {
          type: "text",
          content: textResponse,
          createdAt: newStory.createdAt,
          storyId: newStory.id,
        },
      };

      setCompletedStories((prev) => [mappedStory, ...prev]);
      setActivePrompt(null);
      setSelectedCategory(null);
      setTextResponse("");
      toast.success("Story saved!");
    } catch (error) {
      console.error("Failed to save story:", error);
      toast.error("Failed to save story");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      await storiesApi.delete(storyId);
      setCompletedStories((prev) => prev.filter((s) => s.id !== storyId));
      toast.success("Story deleted");
    } catch (error) {
      console.error("Failed to delete story:", error);
      toast.error("Failed to delete story");
    }
  };

  const summarizeStory = async (storyId: string) => {
    setSummarizingId(storyId);
    try {
      const response = await fetch(`/api/stories/${storyId}/summarize`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate summary");
      }

      const data = await response.json();
      setSummaries((prev) => ({ ...prev, [storyId]: data.summary }));
      toast.success("Summary generated!");
    } catch (error) {
      console.error("Failed to summarize:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate summary. Make sure OpenAI API key is configured.");
    } finally {
      setSummarizingId(null);
    }
  };

  const totalPrompts = promptCategories.reduce((sum, cat) => sum + cat.prompts.length, 0);
  const completedCount = completedStories.length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Morphing background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage/12 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage-light/30 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-sage/8 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

        {/* Floating leaves with varied animations */}
        <FloatingLeaf className="absolute top-28 left-[5%] animate-float-rotate opacity-55" style={{ animationDuration: "10s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[35%] right-[4%] animate-sway opacity-45" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[25%] left-[8%] animate-drift opacity-40 -rotate-12" style={{ animationDuration: "12s" }} size={52} variant={3} />
        <FloatingLeaf className="absolute top-[55%] right-[10%] animate-wave opacity-35" style={{ animationDuration: "8s" }} size={38} variant={1} />
        <FloatingLeaf className="absolute top-[20%] left-[20%] animate-swing opacity-30" style={{ animationDuration: "4s" }} size={35} variant={2} />

        {/* Quill decorations */}
        <QuillDecoration className="absolute top-20 right-[15%] opacity-45" />
        <QuillDecoration className="absolute bottom-32 left-[20%] opacity-35 rotate-[-30deg]" />

        {/* Book decorations */}
        <BookDecoration className="absolute top-[40%] left-[3%] opacity-30 animate-breathe" />
        <BookDecoration className="absolute bottom-[35%] right-[5%] opacity-25 animate-breathe" style={{ animationDelay: "2s" }} />

        {/* Gentle rings */}
        <GentleRings className="absolute top-[15%] right-[25%] opacity-25" />
        <GentleRings className="absolute bottom-[20%] left-[15%] opacity-20" style={{ transform: "scale(0.7)" }} />

        {/* Sparkles */}
        <Sparkle className="absolute top-32 left-[30%] animate-twinkle opacity-55" style={{ animationDelay: "0s" }} size={16} />
        <Sparkle className="absolute top-[50%] right-[20%] animate-twinkle opacity-50" style={{ animationDelay: "0.7s" }} size={20} />
        <Sparkle className="absolute bottom-40 right-[35%] animate-twinkle opacity-45" style={{ animationDelay: "1.4s" }} size={14} />
        <Sparkle className="absolute top-[65%] left-[25%] animate-twinkle opacity-40" style={{ animationDelay: "2.1s" }} size={18} />

        {/* Firefly particles */}
        <div className="absolute top-32 left-[32%] w-3 h-3 rounded-full bg-sage/50 animate-firefly" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[50%] right-[22%] w-4 h-4 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-40 right-[38%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />
        <div className="absolute top-[70%] left-[18%] w-2 h-2 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "7s", animationDelay: "1s" }} />

        {/* Animated decorative lines */}
        <svg className="absolute top-12 left-0 w-full h-28 opacity-20" viewBox="0 0 1200 110" preserveAspectRatio="none">
          <path d="M0,55 Q200,25 400,55 T800,55 T1200,55" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
          <path d="M0,75 Q300,45 600,75 T1200,75" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
        </svg>
        <svg className="absolute bottom-12 left-0 w-full h-20 opacity-15" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>

        {/* Ripple effect */}
        <div className="absolute top-[45%] left-[60%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-32 h-32 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-0 w-32 h-32 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "1.3s" }} />
        </div>
      </div>

      {/* Header - Sage themed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage/25 via-sage-light/35 to-sage/15 border border-sage/20 p-8"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="p-4 rounded-2xl bg-white/60 backdrop-blur border border-sage/20 shadow-sm"
            >
              <BookOpen className="w-8 h-8 text-sage-dark" />
            </motion.div>
            <div>
              <h1 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                Life <span className="text-sage-dark">Stories</span> & Wisdom
              </h1>
              <p className="text-muted-foreground">Guided prompts to preserve your precious memories</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground/70">Stories Recorded</span>
              <span className="font-semibold text-sage-dark">{completedCount} of {totalPrompts}</span>
            </div>
            <div className="h-3 bg-white/50 rounded-full overflow-hidden border border-sage/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalPrompts) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sage/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-sage-light/40 rounded-full blur-2xl" />
        <FloatingLeaf className="absolute top-4 right-8 opacity-50 animate-float" style={{ animationDuration: "8s" }} size={35} />
        <Quote className="absolute bottom-4 right-4 w-8 h-8 text-sage/30" />
      </motion.div>

      {/* Recently Completed Stories */}
      {isLoading ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-12 text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin text-sage mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your stories...</p>
        </motion.div>
      ) : completedStories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-serif text-xl font-medium text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sage/15">
              <CheckCircle2 className="w-5 h-5 text-sage-dark" />
            </div>
            Your Stories
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {completedStories.map((story, index) => {
              const category = promptCategories.find((c) => c.id === story.category);
              const Icon = category?.icon || BookOpen;

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-2xl border border-sage/20 bg-gradient-to-br from-card to-sage-light/10 hover:shadow-lg hover:border-sage/40 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${category?.bgColor || "bg-sage/15"}`}>
                      <Icon className={`w-5 h-5 ${category?.iconColor || "text-sage-dark"}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-sage-dark transition-colors">
                        {story.prompt}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sage/10">
                          {story.response?.type === "voice" ? (
                            <>
                              <Mic className="w-3 h-3 text-sage" />
                              {story.response.content}
                            </>
                          ) : story.response?.type === "video" ? (
                            <>
                              <Video className="w-3 h-3 text-sage" />
                              Video
                            </>
                          ) : (
                            <>
                              <PenLine className="w-3 h-3 text-sage" />
                              Written
                            </>
                          )}
                        </span>
                        <span className="text-sage/60">•</span>
                        <span>{new Date(story.response?.createdAt || "").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                      {story.response?.type === "text" && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2 italic">
                          &quot;{story.response.content}&quot;
                        </p>
                      )}

                      {/* AI Summary */}
                      {summaries[story.id] && (
                        <div className="mt-3 p-3 rounded-xl bg-sage/10 border border-sage/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="w-3 h-3 text-sage" />
                            <span className="text-xs font-medium text-sage-dark">AI Summary</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{summaries[story.id]}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => summarizeStory(story.id)}
                        disabled={summarizingId === story.id || !!summaries[story.id]}
                        className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-sage/10 text-muted-foreground hover:text-sage-dark transition-all disabled:opacity-50"
                        title={summaries[story.id] ? "Already summarized" : "Generate AI summary"}
                      >
                        {summarizingId === story.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => story.response?.storyId && deleteStory(story.response.storyId)}
                        className="p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Prompt Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="font-serif text-xl font-medium text-foreground flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sage/15">
            <Feather className="w-5 h-5 text-sage-dark" />
          </div>
          Choose a Topic
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promptCategories.map((category, index) => {
            const Icon = category.icon;
            const completedInCategory = completedStories.filter(
              (s) => s.category === category.id
            ).length;

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`group p-6 rounded-2xl border border-sage/20 bg-gradient-to-br ${category.color} hover:border-sage/40 hover:shadow-lg transition-all duration-300 text-left`}
              >
                <div className={`inline-flex p-3 rounded-xl ${category.bgColor} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${category.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg text-foreground group-hover:text-sage-dark transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.prompts.length} prompts to explore
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-sage/10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className={`w-4 h-4 ${completedInCategory > 0 ? "text-sage" : "text-muted-foreground/50"}`} />
                    <span>{completedInCategory} completed</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sage/50 group-hover:text-sage-dark group-hover:translate-x-1 transition-all" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Category Prompts Modal */}
      <AnimatePresence>
        {selectedCategory && !activePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setSelectedCategory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-3xl border border-sage/20 shadow-2xl overflow-hidden max-h-[80vh] overflow-y-auto"
            >
              {(() => {
                const category = promptCategories.find((c) => c.id === selectedCategory);
                if (!category) return null;
                const Icon = category.icon;

                return (
                  <>
                    <div className={`p-6 bg-gradient-to-br ${category.color} border-b border-sage/10`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${category.bgColor} border border-white/20`}>
                            <Icon className={`w-6 h-6 ${category.iconColor}`} />
                          </div>
                          <div>
                            <h2 className="font-serif text-xl font-medium text-foreground">{category.name}</h2>
                            <p className="text-muted-foreground text-sm">
                              Choose a prompt to share your story
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedCategory(null)}
                          className="h-8 w-8 p-0 hover:bg-white/50 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      {category.prompts.map((prompt, index) => {
                        const isCompleted = completedStories.some(
                          (s) => s.category === category.id && s.prompt === prompt.prompt
                        );

                        return (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setActivePrompt({ category: category.id, prompt: prompt.prompt })}
                            className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 hover:shadow-md ${
                              isCompleted
                                ? "border-sage/40 bg-sage/10"
                                : "border-border hover:border-sage/40 bg-card"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{prompt.prompt}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {prompt.description}
                                </p>
                              </div>
                              {isCompleted ? (
                                <div className="p-1 rounded-full bg-sage/20">
                                  <CheckCircle2 className="w-5 h-5 text-sage-dark" />
                                </div>
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="p-4 border-t border-sage/10 bg-sage-light/10">
                      <Button
                        variant="ghost"
                        className="w-full hover:bg-sage/10"
                        onClick={() => setSelectedCategory(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record Response Modal */}
      <AnimatePresence>
        {activePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => {
              setActivePrompt(null);
              setTextResponse("");
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-card rounded-3xl border border-sage/20 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-sage/10 bg-gradient-to-r from-sage-light/20 to-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sage/15">
                      <Quote className="w-5 h-5 text-sage-dark" />
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-medium text-foreground">{activePrompt.prompt}</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        Share your story in your own way
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActivePrompt(null);
                      setTextResponse("");
                    }}
                    className="h-8 w-8 p-0 hover:bg-sage/10 rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Response Type Selector */}
              <div className="p-6 border-b border-sage/10">
                <p className="text-sm text-muted-foreground mb-3">How would you like to share?</p>
                <div className="flex items-center gap-3">
                  {[
                    { type: "text", icon: PenLine, label: "Write" },
                    { type: "voice", icon: Mic, label: "Record Voice" },
                    { type: "video", icon: Video, label: "Record Video" },
                  ].map(({ type, icon: Icon, label }) => (
                    <button
                      key={type}
                      onClick={() => setResponseType(type as typeof responseType)}
                      className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                        responseType === type
                          ? "border-sage bg-sage/15 text-sage-dark shadow-sm"
                          : "border-border hover:border-sage/40 text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Response Input */}
              <div className="p-6">
                {responseType === "text" && (
                  <div className="relative">
                    <textarea
                      value={textResponse}
                      onChange={(e) => setTextResponse(e.target.value)}
                      placeholder="Start writing your story... Let your heart speak freely."
                      className="w-full p-4 rounded-2xl border border-sage/20 bg-background min-h-[200px] resize-none focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage transition-all"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {textResponse.length} characters
                    </div>
                  </div>
                )}

                {responseType === "voice" && (
                  <div className="text-center py-12">
                    <motion.button
                      onClick={() => setIsRecording(!isRecording)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isRecording
                          ? "bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-500/30"
                          : "bg-gradient-to-br from-sage/20 to-sage-light/40 text-sage-dark hover:from-sage/30 hover:to-sage-light/50 border-2 border-sage/20"
                      }`}
                    >
                      {isRecording ? (
                        <Pause className="w-12 h-12" />
                      ) : (
                        <Mic className="w-12 h-12" />
                      )}
                    </motion.button>
                    {isRecording && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 flex items-center justify-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        <span className="text-rose-600 font-medium">Recording...</span>
                      </motion.div>
                    )}
                    <p className="mt-4 text-muted-foreground">
                      {isRecording ? "Click to stop recording" : "Click to start recording your voice"}
                    </p>
                  </div>
                )}

                {responseType === "video" && (
                  <div className="text-center py-8">
                    <div className="w-full aspect-video bg-gradient-to-br from-sage-light/20 to-sage/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-sage/30">
                      <div className="text-center p-8">
                        <div className="w-16 h-16 mx-auto rounded-full bg-sage/15 flex items-center justify-center mb-4">
                          <Video className="w-8 h-8 text-sage-dark" />
                        </div>
                        <Button className="bg-sage hover:bg-sage-dark text-white">
                          <Play className="w-4 h-4 mr-2" />
                          Start Recording
                        </Button>
                        <p className="text-sm text-muted-foreground mt-3">
                          Record a video message for your loved ones
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time-Lock Option */}
              <div className="px-6 pb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-sage-light/20 to-transparent border border-sage/15 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-sage/15">
                      <Lock className="w-5 h-5 text-sage-dark" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Time-Lock this story?</p>
                      <p className="text-sm text-muted-foreground">
                        Release only after a specific date or event
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-sage/30 hover:bg-sage/10 hover:border-sage">
                    <Calendar className="w-4 h-4 mr-2" />
                    Set Date
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-sage/10 bg-gradient-to-r from-transparent to-sage-light/10 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setActivePrompt(null);
                    setTextResponse("");
                  }}
                  className="hover:bg-sage/10"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-sage hover:bg-sage-dark text-white"
                  onClick={saveStory}
                  disabled={isSaving || (responseType === "text" && !textResponse.trim())}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Save Story
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-3xl bg-gradient-to-br from-sage/10 to-sage-light/20 border border-sage/20"
      >
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
          <div className="p-1.5 rounded-lg bg-sage/20">
            <MessageCircle className="w-5 h-5 text-sage-dark" />
          </div>
          Tips for Meaningful Stories
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Speak from the heart - there's no wrong answer",
            "Include specific details and names",
            "Don't worry about being perfect",
            "Record when you're in a reflective mood",
            "Include lessons you've learned",
            "Think about what you wish you knew earlier",
          ].map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-start gap-3 text-sm text-muted-foreground"
            >
              <div className="w-5 h-5 rounded-full bg-sage/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-sage-dark" />
              </div>
              {tip}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom decorative divider */}
      <div className="flex justify-center pt-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-sage/20 rounded-full" />
          <FloatingLeaf className="opacity-50 animate-float" style={{ animationDuration: "6s" }} size={24} />
          <div className="w-3 h-3 rounded-full bg-sage/40 animate-pulse" />
          <FloatingLeaf className="opacity-50 animate-float rotate-45" style={{ animationDuration: "6s", animationDelay: "1s" }} size={24} />
          <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-sage/40 to-sage/20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
