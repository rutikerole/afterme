"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Download,
  ArrowLeft,
  Clock,
  Heart,
  Volume2,
  Waves,
  MessageCircle,
  Loader2,
  FileText,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { voiceMessagesApi, blobToBase64, type VoiceMessage } from "@/lib/api";
import { toast } from "sonner";

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

// Sound wave decoration with animation
const SoundWaveDecoration = ({ className }: { className?: string }) => (
  <svg className={className} width="80" height="50" viewBox="0 0 80 50" fill="none">
    <path d="M8 25V30" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" className="animate-pulse" style={{ animationDelay: "0s" }} />
    <path d="M16 18V32" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" className="animate-pulse" style={{ animationDelay: "0.1s" }} />
    <path d="M24 12V38" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" className="animate-pulse" style={{ animationDelay: "0.2s" }} />
    <path d="M32 5V45" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
    <path d="M40 8V42" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.6" className="animate-pulse" style={{ animationDelay: "0.4s" }} />
    <path d="M48 12V38" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
    <path d="M56 18V32" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.5" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
    <path d="M64 22V28" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" className="animate-pulse" style={{ animationDelay: "0.7s" }} />
    <path d="M72 24V26" stroke="hsl(var(--sage))" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.3" className="animate-pulse" style={{ animationDelay: "0.8s" }} />
  </svg>
);

// Microphone decoration
const MicrophoneDecoration = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} width="50" height="70" viewBox="0 0 50 70" fill="none">
    <rect x="15" y="8" width="20" height="35" rx="10" fill="hsl(var(--sage))" fillOpacity="0.15" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.5" />
    <path d="M10 30C10 30 10 45 25 50C40 45 40 30 40 30" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
    <path d="M25 50V60M18 60H32" stroke="hsl(var(--sage))" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
    {/* Sound waves */}
    <path d="M8 25C5 25 5 35 8 35" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.3" className="animate-pulse" />
    <path d="M42 25C45 25 45 35 42 35" stroke="hsl(var(--sage))" strokeWidth="1" strokeOpacity="0.3" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
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

interface Recording {
  id: string;
  name: string;
  duration: number;
  date: Date;
  audioUrl: string;
}

export default function VoiceVaultPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(Array(20).fill(0));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [transcribingId, setTranscribingId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<Record<string, string>>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Fetch existing recordings on mount
  useEffect(() => {
    fetchRecordings();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const fetchRecordings = async () => {
    try {
      setIsLoading(true);
      const response = await voiceMessagesApi.getAll();
      const mappedRecordings: Recording[] = response.messages.map((msg: VoiceMessage) => ({
        id: msg.id,
        name: msg.title,
        duration: msg.duration,
        date: new Date(msg.createdAt),
        audioUrl: msg.fileUrl,
      }));
      setRecordings(mappedRecordings);
    } catch (error) {
      console.error("Failed to fetch recordings:", error);
      toast.error("Failed to load recordings");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up audio analyzer for visualization
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const duration = currentTime;

        // Convert to base64 and save to API
        setIsSaving(true);
        try {
          const base64Url = await blobToBase64(audioBlob);
          const newRecording = await voiceMessagesApi.create({
            title: `Recording ${recordings.length + 1}`,
            fileUrl: base64Url,
            fileSize: audioBlob.size,
            duration: duration,
            mimeType: "audio/webm",
          });

          const mappedRecording: Recording = {
            id: newRecording.id,
            name: newRecording.title,
            duration: newRecording.duration,
            date: new Date(newRecording.createdAt),
            audioUrl: newRecording.fileUrl,
          };

          setRecordings((prev) => [mappedRecording, ...prev]);
          toast.success("Recording saved!");
        } catch (error) {
          console.error("Failed to save recording:", error);
          toast.error("Failed to save recording");
        } finally {
          setIsSaving(false);
        }

        setCurrentTime(0);
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);

      // Start visualization
      visualize();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please grant permission.");
    }
  };

  const visualize = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      const levels = Array(20).fill(0).map((_, i) => {
        const index = Math.floor((i / 20) * bufferLength);
        return dataArray[index] / 255;
      });

      setAudioLevels(levels);
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      setAudioLevels(Array(20).fill(0));
    }
  };

  const playRecording = (recording: Recording) => {
    if (playingId === recording.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(recording.audioUrl);
      audio.onended = () => setPlayingId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingId(recording.id);
    }
  };

  const deleteRecording = async (id: string) => {
    try {
      await voiceMessagesApi.delete(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
      if (playingId === id) {
        audioRef.current?.pause();
        setPlayingId(null);
      }
      toast.success("Recording deleted");
    } catch (error) {
      console.error("Failed to delete recording:", error);
      toast.error("Failed to delete recording");
    }
  };

  const transcribeRecording = async (id: string) => {
    setTranscribingId(id);
    try {
      const response = await fetch(`/api/voice-messages/${id}/transcribe`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to transcribe");
      }

      const data = await response.json();
      setTranscripts((prev) => ({ ...prev, [id]: data.transcript }));
      toast.success("Transcription complete!");
    } catch (error) {
      console.error("Failed to transcribe:", error);
      toast.error(error instanceof Error ? error.message : "Failed to transcribe. Make sure OpenAI API key is configured.");
    } finally {
      setTranscribingId(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-sage-light/10 relative">
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Morphing background blobs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-sage/12 rounded-full blur-3xl animate-blob-morph" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-sage-light/28 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-5s" }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-sage/8 rounded-full blur-3xl animate-blob-morph" style={{ animationDelay: "-10s" }} />

        {/* Floating leaves with varied animations */}
        <FloatingLeaf className="absolute top-28 left-[8%] animate-float-rotate opacity-55" style={{ animationDuration: "10s" }} size={50} variant={1} />
        <FloatingLeaf className="absolute top-[45%] right-[5%] animate-sway opacity-45 rotate-45" style={{ animationDuration: "6s" }} size={45} variant={2} />
        <FloatingLeaf className="absolute bottom-[25%] left-[6%] animate-drift opacity-40 -rotate-12" style={{ animationDuration: "12s" }} size={52} variant={3} />
        <FloatingLeaf className="absolute top-[60%] right-[10%] animate-wave opacity-35" style={{ animationDuration: "8s" }} size={38} variant={1} />
        <FloatingLeaf className="absolute top-[22%] left-[15%] animate-swing opacity-30" style={{ animationDuration: "4s" }} size={35} variant={2} />

        {/* Sound wave decorations */}
        <SoundWaveDecoration className="absolute top-32 right-[18%] opacity-50" />
        <SoundWaveDecoration className="absolute bottom-40 left-[22%] opacity-40" />

        {/* Microphone decorations */}
        <MicrophoneDecoration className="absolute top-[40%] left-[3%] opacity-35" />
        <MicrophoneDecoration className="absolute bottom-[30%] right-[4%] opacity-30" />

        {/* Gentle rings */}
        <GentleRings className="absolute top-[15%] right-[28%] opacity-25" />
        <GentleRings className="absolute bottom-[25%] left-[15%] opacity-20" style={{ transform: "scale(0.7)" }} />

        {/* Sparkles */}
        <Sparkle className="absolute top-36 left-[25%] animate-twinkle opacity-55" style={{ animationDelay: "0s" }} size={16} />
        <Sparkle className="absolute top-[50%] right-[30%] animate-twinkle opacity-50" style={{ animationDelay: "0.7s" }} size={20} />
        <Sparkle className="absolute bottom-32 right-[45%] animate-twinkle opacity-45" style={{ animationDelay: "1.4s" }} size={14} />
        <Sparkle className="absolute top-[68%] left-[20%] animate-twinkle opacity-40" style={{ animationDelay: "2.1s" }} size={18} />

        {/* Firefly particles */}
        <div className="absolute top-36 left-[28%] w-3 h-3 rounded-full bg-sage/50 animate-firefly" style={{ animationDuration: "8s" }} />
        <div className="absolute top-[50%] right-[32%] w-4 h-4 rounded-full bg-sage/40 animate-firefly" style={{ animationDuration: "10s", animationDelay: "2s" }} />
        <div className="absolute bottom-32 right-[48%] w-3 h-3 rounded-full bg-sage/45 animate-firefly" style={{ animationDuration: "9s", animationDelay: "4s" }} />
        <div className="absolute top-[62%] left-[12%] w-2 h-2 rounded-full bg-sage/35 animate-firefly" style={{ animationDuration: "7s", animationDelay: "1s" }} />

        {/* Animated decorative lines */}
        <svg className="absolute top-16 left-0 w-full h-28 opacity-20" viewBox="0 0 1200 110" preserveAspectRatio="none">
          <path d="M0,55 Q200,25 400,55 T800,55 T1200,55" fill="none" stroke="hsl(var(--sage))" strokeWidth="2" className="animate-line-flow" />
          <path d="M0,75 Q300,45 600,75 T1200,75" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" strokeOpacity="0.6" className="animate-line-flow" style={{ animationDelay: "-2s" }} />
        </svg>
        <svg className="absolute bottom-16 left-0 w-full h-20 opacity-15" viewBox="0 0 1200 80" preserveAspectRatio="none">
          <path d="M0,40 C200,10 400,70 600,40 C800,10 1000,70 1200,40" fill="none" stroke="hsl(var(--sage))" strokeWidth="1.5" className="animate-line-flow" style={{ animationDirection: "reverse" }} />
        </svg>

        {/* Sound ripple effect - unique to voice page */}
        <div className="absolute top-[45%] left-[50%] -translate-x-1/2 -translate-y-1/2">
          <div className="w-40 h-40 rounded-full border-2 border-sage/20 animate-ripple" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-0 w-40 h-40 rounded-full border-2 border-sage/20 animate-ripple" style={{ animationDuration: "3s", animationDelay: "1s" }} />
          <div className="absolute inset-0 w-40 h-40 rounded-full border-2 border-sage/20 animate-ripple" style={{ animationDuration: "3s", animationDelay: "2s" }} />
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-serif text-3xl font-medium text-foreground">
              Voice <span className="text-sage-dark">Vault</span>
            </h1>
            <p className="text-muted-foreground">Record heartfelt messages for your loved ones</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recording Section */}
          <div className="space-y-6">
            {/* Recorder Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-8 overflow-hidden"
            >
              {/* Background glow when recording */}
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-gradient-to-br from-sage/10 to-rose-500/5"
                />
              )}

              {/* Decorative element */}
              <div className="absolute top-4 right-4 opacity-30">
                <FloatingLeaf size={30} className="animate-float" style={{ animationDuration: "6s" }} />
              </div>

              <div className="relative">
                {/* Visualization */}
                <div className="flex items-center justify-center gap-1 h-36 mb-8">
                  {audioLevels.map((level, index) => (
                    <motion.div
                      key={index}
                      className="w-2 rounded-full transition-all duration-75"
                      style={{
                        height: `${Math.max(8, level * 100)}%`,
                        opacity: isRecording ? 0.4 + level * 0.6 : 0.2,
                        background: isRecording
                          ? `linear-gradient(to top, hsl(var(--sage)), hsl(var(--sage-dark)))`
                          : `hsl(var(--sage))`,
                      }}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="text-center mb-8">
                  <span className="text-6xl font-mono text-foreground font-light tracking-wider">
                    {formatTime(currentTime)}
                  </span>
                  <p className="text-sm text-muted-foreground mt-3 flex items-center justify-center gap-2">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-sage" />
                        Saving recording...
                      </>
                    ) : isRecording ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        Recording...
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-sage" />
                        Ready to record
                      </>
                    )}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4">
                  {!isRecording ? (
                    <motion.button
                      onClick={startRecording}
                      disabled={isSaving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-sage to-sage-dark text-white shadow-lg shadow-sage/30 flex items-center justify-center disabled:opacity-50"
                    >
                      <Mic className="w-10 h-10" />
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={stopRecording}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-lg shadow-rose-500/30 flex items-center justify-center"
                    >
                      <Square className="w-10 h-10" />
                    </motion.button>
                  )}
                </div>

                {/* Instructions */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                  {isRecording
                    ? "Click the stop button when you're done"
                    : "Click the microphone to start recording"}
                </p>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl bg-gradient-to-br from-sage/15 to-sage-light/25 border border-sage/20 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage/20 flex items-center justify-center shrink-0 border border-sage/20">
                  <Heart className="w-6 h-6 text-sage-dark" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Recording Tips</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Find a quiet place with minimal background noise
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Speak naturally, as if talking to your loved one
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Share stories, advice, or simply say "I love you"
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 shrink-0" />
                      Don't worry about being perfect — authenticity matters most
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recordings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-medium text-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-sage/15">
                  <Volume2 className="w-5 h-5 text-sage-dark" />
                </div>
                Your Recordings
              </h2>
              <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-sage/10">
                {recordings.length} messages
              </span>
            </div>

            {isLoading ? (
              <div className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-12 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-sage mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your recordings...</p>
              </div>
            ) : recordings.length === 0 ? (
              <div className="rounded-3xl bg-gradient-to-br from-card to-sage-light/10 border border-sage/20 p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sage/15 to-sage-light/30 flex items-center justify-center mx-auto mb-4 border-2 border-sage/20">
                  <Waves className="w-10 h-10 text-sage-dark" />
                </div>
                <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                  No recordings yet
                </h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                  Record your first voice message to preserve your voice for those you love
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recordings.map((recording, index) => (
                  <motion.div
                    key={recording.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group rounded-2xl border p-4 transition-all duration-300 ${
                      playingId === recording.id
                        ? "bg-gradient-to-r from-sage/15 to-sage-light/20 border-sage/40 shadow-md"
                        : "bg-card border-sage/15 hover:border-sage/30 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Play Button */}
                      <motion.button
                        onClick={() => playRecording(recording)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          playingId === recording.id
                            ? "bg-sage text-white shadow-md"
                            : "bg-sage/15 text-sage-dark hover:bg-sage/25"
                        }`}
                      >
                        {playingId === recording.id ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-0.5" />
                        )}
                      </motion.button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {recording.name}
                        </h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sage/10">
                            <Clock className="w-3 h-3 text-sage" />
                            {formatTime(recording.duration)}
                          </span>
                          <span>
                            {recording.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10"
                          onClick={() => transcribeRecording(recording.id)}
                          disabled={transcribingId === recording.id || !!transcripts[recording.id]}
                          title={transcripts[recording.id] ? "Already transcribed" : "Transcribe with AI"}
                        >
                          {transcribingId === recording.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-sage-dark hover:bg-sage/10"
                          asChild
                        >
                          <a href={recording.audioUrl} download={`${recording.name}.webm`}>
                            <Download className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => deleteRecording(recording.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress bar when playing */}
                    {playingId === recording.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 h-1.5 bg-sage/20 rounded-full overflow-hidden"
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-sage to-sage-dark rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: recording.duration, ease: "linear" }}
                        />
                      </motion.div>
                    )}

                    {/* Transcript display */}
                    {transcripts[recording.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-3 rounded-xl bg-sage/10 border border-sage/20"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-sage" />
                          <span className="text-xs font-medium text-sage-dark">AI Transcript</span>
                        </div>
                        <p className="text-sm text-muted-foreground italic">
                          &quot;{transcripts[recording.id]}&quot;
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Message Ideas */}
            {recordings.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 p-5 rounded-2xl bg-sage-light/20 border border-sage/15"
              >
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-sage" />
                  Message Ideas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["Share a story", "Life advice", "Say I love you", "Birthday wish", "Encouragement"].map((idea) => (
                    <span
                      key={idea}
                      className="px-3 py-1.5 rounded-full bg-white/60 text-sm text-muted-foreground border border-sage/10"
                    >
                      {idea}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

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
    </div>
  );
}
