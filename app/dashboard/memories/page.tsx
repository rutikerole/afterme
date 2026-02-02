"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  Images,
  X,
  Heart,
  Calendar,
  MapPin,
  Plus,
  Grid3X3,
  LayoutGrid,
  Trash2,
  Edit3,
  Camera,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { memoriesApi, getBase64FileSize, type Memory as ApiMemory } from "@/lib/api";
import { toast } from "sonner";

interface Memory {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  date: Date;
  location?: string;
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

// Camera/Photo decoration with animation
const PhotoDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="60" height="60" viewBox="0 0 60 60" fill="none">
    <rect x="10" y="18" width="40" height="30" rx="4" fill="hsl(var(--sage))" fillOpacity="0.15" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" />
    <circle cx="30" cy="33" r="10" fill="hsl(var(--sage))" fillOpacity="0.1" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" className="animate-breathe" />
    <circle cx="30" cy="33" r="5" fill="hsl(var(--sage))" fillOpacity="0.2" className="animate-pulse" />
    <rect x="20" y="12" width="20" height="8" rx="2" fill="hsl(var(--sage))" fillOpacity="0.2" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.4" />
    {/* Flash */}
    <circle cx="42" cy="24" r="3" fill="hsl(var(--sage))" fillOpacity="0.4" className="animate-twinkle" />
  </svg>
);

// Frame decoration
const FrameDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="70" height="70" viewBox="0 0 70 70" fill="none">
    <rect x="10" y="10" width="50" height="50" rx="3" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" strokeOpacity="0.3" />
    <rect x="15" y="15" width="40" height="40" rx="2" fill="hsl(var(--sage))" fillOpacity="0.08" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.2" />
    {/* Corner decorations */}
    <circle cx="10" cy="10" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
    <circle cx="60" cy="10" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
    <circle cx="10" cy="60" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
    <circle cx="60" cy="60" r="2" fill="hsl(var(--sage))" fillOpacity="0.4" />
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

export default function MemoryVaultPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("grid");
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch memories on mount
  useEffect(() => {
    fetchMemories();
  }, []);

  const fetchMemories = async () => {
    try {
      setIsLoading(true);
      const response = await memoriesApi.getAll();
      const mappedMemories: Memory[] = response.memories.map((mem: ApiMemory) => ({
        id: mem.id,
        imageUrl: mem.mediaUrl,
        title: mem.title,
        description: mem.description || "",
        date: new Date(mem.createdAt),
        location: mem.location,
      }));
      setMemories(mappedMemories);
    } catch (error) {
      console.error("Failed to fetch memories:", error);
      toast.error("Failed to load memories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find((file) => file.type.startsWith("image/"));

    if (imageFile) {
      processFile(imageFile);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
      setShowUploadModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!uploadPreview) return;

    setIsSaving(true);
    try {
      const newMemory = await memoriesApi.create({
        title: uploadForm.title || `Memory ${memories.length + 1}`,
        description: uploadForm.description || undefined,
        mediaUrl: uploadPreview,
        mediaType: "image",
        fileSize: getBase64FileSize(uploadPreview),
        location: uploadForm.location || undefined,
      });

      const mappedMemory: Memory = {
        id: newMemory.id,
        imageUrl: newMemory.mediaUrl,
        title: newMemory.title,
        description: newMemory.description || "",
        date: new Date(newMemory.createdAt),
        location: newMemory.location,
      };

      setMemories((prev) => [mappedMemory, ...prev]);
      setShowUploadModal(false);
      setUploadPreview(null);
      setUploadForm({ title: "", description: "", location: "" });
      toast.success("Memory saved!");
    } catch (error) {
      console.error("Failed to save memory:", error);
      toast.error("Failed to save memory");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await memoriesApi.delete(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setSelectedMemory(null);
      toast.success("Memory deleted");
    } catch (error) {
      console.error("Failed to delete memory:", error);
      toast.error("Failed to delete memory");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage-light/10 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Morphing background blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/12 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/28 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-sage/8 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

        {/* Floating leaves with varied animations */}
        <FloatingLeaf className="absolute top-28 left-[8%] animate-float-rotate opacity-55" style={{ animationDuration: "10s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[40%] right-[5%] animate-sway opacity-45 rotate-45" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[30%] left-[5%] animate-drift opacity-40 -rotate-12" style={{ animationDuration: "12s" }} size={52} variant={3} />
        <FloatingLeaf className="absolute top-[60%] right-[12%] animate-wave opacity-35" style={{ animationDuration: "8s" }} size={38} variant={1} />
        <FloatingLeaf className="absolute top-[25%] left-[18%] animate-swing opacity-30" style={{ animationDuration: "4s" }} size={35} variant={2} />

        {/* Photo decorations */}
        <PhotoDecoration className="absolute top-32 right-[20%] opacity-45" />
        <PhotoDecoration className="absolute bottom-40 left-[25%] opacity-35 rotate-12" />

        {/* Frame decorations */}
        <FrameDecoration className="absolute top-[45%] left-[3%] opacity-30 animate-breathe" />
        <FrameDecoration className="absolute bottom-[25%] right-[4%] opacity-25 animate-breathe" style={{ animationDelay: "2s" }} />

        {/* Gentle rings */}
        <GentleRings className="absolute top-[18%] right-[30%] opacity-25" />
        <GentleRings className="absolute bottom-[22%] left-[12%] opacity-20" style={{ transform: "scale(0.7)" }} />

        {/* Sparkles */}
        <Sparkle className="absolute top-36 left-[30%] animate-twinkle opacity-55" style={{ animationDelay: "0s" }} size={16} />
        <Sparkle className="absolute top-[55%] right-[25%] animate-twinkle opacity-50" style={{ animationDelay: "0.7s" }} size={20} />
        <Sparkle className="absolute bottom-32 right-[40%] animate-twinkle opacity-45" style={{ animationDelay: "1.4s" }} size={14} />
        <Sparkle className="absolute top-[70%] left-[22%] animate-twinkle opacity-40" style={{ animationDelay: "2.1s" }} size={18} />

        {/* Firefly particles */}
        <div className="absolute top-36 left-[32%] w-3 h-3 rounded-full bg-sage/50 animate-firefly" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[55%] right-[28%] w-4 h-4 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-32 right-[42%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />
        <div className="absolute top-[65%] left-[15%] w-2 h-2 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "7s", animationDelay: "1s" }} />

        {/* Animated decorative lines */}
        <svg className="absolute top-16 left-0 w-full h-28 opacity-20" viewBox="0 0 1200 110" preserveAspectRatio="none">
          <path d="M0,55 Q200,25 400,55 T800,55 T1200,55" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
          <path d="M0,75 Q300,45 600,75 T1200,75" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
        </svg>
        <svg className="absolute bottom-16 left-0 w-full h-20 opacity-15" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>

        {/* Ripple effect */}
        <div className="absolute top-[50%] left-[55%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-36 h-36 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s" }} />
          <div className="absolute inset-0 w-36 h-36 rounded-full border border-sage/15 animate-ripple" style={{ animationDuration: "4s", animationDelay: "1.3s" }} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-serif text-3xl font-medium text-foreground">
                Memory <span className="text-sage-dark">Vault</span>
              </h1>
              <p className="text-muted-foreground">Preserve your most cherished moments</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="hidden sm:flex items-center gap-1 p-1.5 bg-sage-light/30 border border-sage/10 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === "grid" ? "bg-white shadow-sm text-sage-dark" : "hover:bg-white/50 text-muted-foreground"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("masonry")}
                className={`p-2 rounded-lg transition-all duration-300 ${viewMode === "masonry" ? "bg-white shadow-sm text-sage-dark" : "hover:bg-white/50 text-muted-foreground"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-sage hover:bg-sage-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Memory
            </Button>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 mb-8 overflow-hidden ${
            isDragging
              ? "border-sage bg-sage/10 scale-[1.01]"
              : "border-sage/30 hover:border-sage/50 bg-gradient-to-br from-sage-light/10 to-transparent"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="p-12 text-center relative">
            {/* Background decoration */}
            <div className="absolute top-4 right-8 opacity-30">
              <FloatingLeaf size={30} className="animate-float" style={{ animationDuration: "6s" }} />
            </div>

            <motion.div
              animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center transition-all duration-300 ${
                isDragging ? "bg-sage/25" : "bg-gradient-to-br from-sage/15 to-sage-light/25"
              } border-2 border-sage/20`}
            >
              <Upload className={`w-10 h-10 transition-colors ${isDragging ? "text-sage-dark" : "text-sage"}`} />
            </motion.div>

            <h3 className="font-serif text-xl font-medium text-foreground mb-2">
              {isDragging ? "Drop your photo here" : "Upload a memory"}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop an image, or click to browse
            </p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-sage/30 hover:border-sage hover:bg-sage/10"
            >
              <Camera className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          </div>
        </motion.div>

        {/* Memories Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-16 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-sage mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your memories...</p>
          </motion.div>
        ) : memories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-16 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mx-auto mb-6 border-2 border-sage/20">
              <Images className="w-12 h-12 text-sage-dark" />
            </div>
            <h3 className="font-serif text-2xl font-medium text-foreground mb-3">
              No memories yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Start building your legacy by uploading your first cherished photo.
              Every memory tells a story worth preserving.
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-sage hover:bg-sage-dark text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Your First Memory
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {memories.map((memory, index) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative rounded-2xl overflow-hidden bg-card border border-sage/15 hover:border-sage/40 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  viewMode === "masonry" && index % 3 === 0 ? "row-span-2" : ""
                }`}
                onClick={() => setSelectedMemory(memory)}
              >
                <div className={`relative ${viewMode === "masonry" && index % 3 === 0 ? "aspect-[3/4]" : "aspect-square"}`}>
                  <Image
                    src={memory.imageUrl}
                    alt={memory.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="font-medium text-white truncate">{memory.title}</h4>
                    {memory.location && (
                      <p className="text-white/70 text-sm flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {memory.location}
                      </p>
                    )}
                  </div>

                  {/* Heart icon */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Bottom decorative divider */}
        <div className="flex justify-center pt-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-sage/40 to-sage/20 rounded-full" />
            <FloatingLeaf className="opacity-50 animate-float" style={{ animationDuration: "6s" }} size={24} />
            <div className="w-3 h-3 rounded-full bg-sage/40 animate-pulse" />
            <FloatingLeaf className="opacity-50 animate-float rotate-45" style={{ animationDuration: "6s", animationDelay: "1s" }} size={24} />
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent via-sage/40 to-sage/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-card rounded-3xl overflow-hidden shadow-2xl border border-sage/20"
            >
              <div className="relative aspect-video">
                {uploadPreview && (
                  <Image
                    src={uploadPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadPreview(null);
                  }}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 bg-gradient-to-b from-card to-sage-light/5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Give this memory a name..."
                    className="w-full px-4 py-3 rounded-xl bg-background border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Story
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell the story behind this moment..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Location (optional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sage" />
                    <input
                      type="text"
                      value={uploadForm.location}
                      onChange={(e) => setUploadForm((prev) => ({ ...prev, location: e.target.value }))}
                      placeholder="Where was this taken?"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-sage/20 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-sage/30 hover:bg-sage/10"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadPreview(null);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-sage hover:bg-sage-dark text-white"
                    onClick={handleUpload}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 mr-2" />
                        Save Memory
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory Detail Modal */}
      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-4xl bg-card rounded-3xl overflow-hidden shadow-2xl border border-sage/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-square md:aspect-auto">
                  <Image
                    src={selectedMemory.imageUrl}
                    alt={selectedMemory.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-8 flex flex-col bg-gradient-to-br from-card to-sage-light/5">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="font-serif text-2xl font-medium text-foreground">
                      {selectedMemory.title}
                    </h2>
                    <button
                      onClick={() => setSelectedMemory(null)}
                      className="w-10 h-10 rounded-full bg-sage/10 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-sage/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {selectedMemory.description && (
                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                      &quot;{selectedMemory.description}&quot;
                    </p>
                  )}

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="p-1.5 rounded-lg bg-sage/10">
                        <Calendar className="w-4 h-4 text-sage" />
                      </div>
                      <span>{selectedMemory.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    {selectedMemory.location && (
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="p-1.5 rounded-lg bg-sage/10">
                          <MapPin className="w-4 h-4 text-sage" />
                        </div>
                        <span>{selectedMemory.location}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-sage/30 hover:bg-sage/10 hover:border-sage"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                      onClick={() => deleteMemory(selectedMemory.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
