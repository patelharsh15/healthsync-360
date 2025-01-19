import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardCard } from "./DashboardCard";
import { ScrollArea } from "./ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface HistoryItem {
  id: string;
  created_at: string;
  type: 'chat' | 'meal' | 'journal';
  content: string;
  response?: string;
}

interface HistoryListProps {
  type?: 'chat' | 'meal' | 'journal';
}

export function HistoryList({ type }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, [type]);

  const fetchHistory = async () => {
    try {
      let combinedHistory: HistoryItem[] = [];

      // Fetch chat history if type is chat or undefined
      if (!type || type === 'chat') {
        const { data: chatData, error: chatError } = await supabase
          .from('chat_history')
          .select('*')
          .order('created_at', { ascending: false });

        if (chatError) throw chatError;

        combinedHistory = [
          ...combinedHistory,
          ...(chatData?.map(chat => ({
            id: chat.id,
            created_at: chat.created_at,
            type: 'chat' as const,
            content: chat.message,
            response: chat.response
          })) || [])
        ];
      }

      // Fetch meal analysis history if type is meal or undefined
      if (!type || type === 'meal') {
        const { data: mealData, error: mealError } = await supabase
          .from('meal_analysis')
          .select('*')
          .order('created_at', { ascending: false });

        if (mealError) throw mealError;

        combinedHistory = [
          ...combinedHistory,
          ...(mealData?.map(meal => ({
            id: meal.id,
            created_at: meal.created_at,
            type: 'meal' as const,
            content: meal.analysis === 'Processing...' ? 'Image uploaded, waiting for analysis...' : meal.analysis
          })) || [])
        ];
      }

      // Fetch voice journal history if type is journal or undefined
      if (!type || type === 'journal') {
        const { data: journalData, error: journalError } = await supabase
          .from('voice_journal')
          .select('*')
          .order('created_at', { ascending: false });

        if (journalError) throw journalError;

        combinedHistory = [
          ...combinedHistory,
          ...(journalData?.map(journal => ({
            id: journal.id,
            created_at: journal.created_at,
            type: 'journal' as const,
            content: journal.transcript || 'Voice recording',
            response: journal.analysis
          })) || [])
        ];
      }

      // Sort all history items by date
      combinedHistory.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setHistory(combinedHistory);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast({
        title: "Error",
        description: "Failed to load history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getHistoryTitle = () => {
    switch (type) {
      case 'chat':
        return 'Chat History';
      case 'meal':
        return 'Meal Analysis History';
      case 'journal':
        return 'Voice Journal History';
      default:
        return 'History';
    }
  };

  return (
    <DashboardCard title={getHistoryTitle()} className="h-[500px]">
      <ScrollArea className="h-[450px] w-full pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">Loading history...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500">No history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-secondary/50 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                    {item.type === 'chat' ? 'Chat' : 
                     item.type === 'meal' ? 'Meal Analysis' : 
                     'Voice Journal'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{item.content}</p>
                {item.response && (
                  <p className="text-sm text-gray-600 mt-2 pl-4 border-l-2 border-primary/20">
                    {item.response}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </DashboardCard>
  );
}