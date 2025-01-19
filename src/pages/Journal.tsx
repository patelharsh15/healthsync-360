import { VoiceJournal } from "@/components/VoiceJournal";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Journal = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processJournalEntry = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('groq-chat', {
          body: {
            messages: [
              {
                role: 'system',
                content: 'You are a health journal AI assistant. Analyze the voice journal entry and provide supportive feedback and insights.'
              },
              {
                role: 'user',
                content: 'Analyze this voice journal entry and provide health insights.'
              }
            ]
          }
        });

        if (error) throw error;

        toast({
          title: "Journal Analysis",
          description: data.choices[0].message.content,
        });
      };
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Error",
        description: "Failed to process journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Voice Journal</h2>
      <VoiceJournal onRecordingComplete={processJournalEntry} />
    </div>
  );
}

export default Journal;