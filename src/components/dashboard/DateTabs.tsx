import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";

// Create an array of the last 7 days
export const dateRanges = Array.from({ length: 7 }, (_, i) => ({
  label: i === 0 ? 'Today' : 
         i === 1 ? 'Yesterday' : 
         `${i} Days Ago`,
  date: subDays(new Date(), i)
}));

interface DateTabsProps {
  children: (range: typeof dateRanges[0]) => React.ReactNode;
}

export function DateTabs({ children }: DateTabsProps) {
  return (
    <Tabs defaultValue="today" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        {dateRanges.map((range) => (
          <TabsTrigger
            key={range.label}
            value={range.label.toLowerCase()}
            className="text-xs sm:text-sm"
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