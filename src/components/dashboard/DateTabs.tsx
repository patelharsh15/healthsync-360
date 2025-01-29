import { format, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";

export const dateRanges = [
  { label: 'Today', date: new Date() },
  { label: 'Yesterday', date: subDays(new Date(), 1) },
  { label: '2 Days Ago', date: subDays(new Date(), 2) },
];

interface DateTabsProps {
  children: (range: typeof dateRanges[0]) => React.ReactNode;
}

export function DateTabs({ children }: DateTabsProps) {
  return (
    <Tabs defaultValue="today" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {dateRanges.map((range) => (
          <TabsTrigger
            key={range.label}
            value={range.label.toLowerCase()}
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