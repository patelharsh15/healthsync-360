import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

export function VoiceJournal() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
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
          {isRecording ? "Recording..." : "Tap to start recording"}
        </p>
      </div>
    </DashboardCard>
  );
}