import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";

// Create an array of the last 7 days
export const dateRanges = Array.from({ length: 7 }, (_, i) => ({
  label: i === 0 ? 'Today' : 
         i === 1 ? 'Yesterday' : 
         format(subDays(new Date(), i), 'EEE, MMM d'),
  date: subDays(new Date(), i)
}));

interface DateTabsProps {
  children: (range: typeof dateRanges[0]) => React.ReactNode;
}

export function DateTabs({ children }: DateTabsProps) {
  return (
    <Tabs defaultValue="today" className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-primary" />
        <span className="font-medium text-primary">Select Date</span>
      </div>
      <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-1">
        {dateRanges.map((range) => (
          <TabsTrigger
            key={range.label}
            value={range.label.toLowerCase()}
            className="px-2 py-1.5 text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {range.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {dateRanges.map((range) => (
        <TabsContent key={range.label} value={range.label.toLowerCase()}>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">
                {format(range.date, 'MMMM d, yyyy')}
              </span>
            </div>
            {children(range)}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}