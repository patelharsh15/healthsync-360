import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { cn } from "@/lib/utils";

interface VoiceJournalProps {
  onRecordingComplete?: (audioBlob: Blob) => void;
}

export function VoiceJournal({ onRecordingComplete }: VoiceJournalProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <DashboardCard title="Voice Journal" className="animate-fadeIn">
      <div className="space-y-4">
        <div className="flex justify-center">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            className="rounded-full h-16 w-16"
            onClick={toggleRecording}
          >
            <Mic className={cn("h-6 w-6", isRecording && "animate-pulse")} />
          </Button>
        </div>
        <p className="text-center text-sm text-gray-500">
          {isRecording ? "Recording... Click to stop" : "Tap to start recording"}
        </p>
      </div>
    </DashboardCard>
  );
}