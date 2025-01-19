import { VoiceJournal } from "@/components/VoiceJournal";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardCard } from "@/components/DashboardCard";

const Journal = () => {
  const [journalInsights, setJournalInsights] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processJournalEntry = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('groq-chat', {
          body: {
            messages: [
              {
                role: 'system',
                content: 'You are a health journal AI assistant. Analyze the voice journal entry and provide supportive feedback, identify patterns, and offer personalized health insights.'
              },
              {
                role: 'user',
                content: 'Analyze this voice journal entry and provide detailed health insights and recommendations.'
              }
            ],
            audio: base64Audio
          }
        });

        if (error) throw error;

        const analysis = data.choices[0].message.content;
        setJournalInsights(analysis);

        // Update the analysis in the database
        const { error: updateError } = await supabase
          .from('voice_journal')
          .update({ analysis })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateError) throw updateError;

        toast({
          title: "Analysis Complete",
          description: "Your journal entry has been analyzed.",
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
      
      <div className="grid gap-6 md:grid-cols-2">
        <VoiceJournal onRecordingComplete={processJournalEntry} />
        
        {journalInsights && (
          <DashboardCard title="AI Analysis" className="animate-fadeIn">
            <div className="prose prose-sm">
              <p className="text-gray-700 whitespace-pre-line">{journalInsights}</p>
            </div>
          </DashboardCard>
        )}
      </div>
    </div>
  );
};

export default Journal;