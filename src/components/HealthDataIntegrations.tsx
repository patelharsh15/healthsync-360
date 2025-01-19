import { Button } from "@/components/ui/button";
import { DashboardCard } from "./DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { Activity, Heart, Watch, Apple } from "lucide-react";

type Platform = 'fitbit' | 'strava' | 'google_fit' | 'apple_health';

interface PlatformConfig {
  name: string;
  icon: React.ComponentType;
}

const platforms: Record<Platform, PlatformConfig> = {
  fitbit: {
    name: "Fitbit",
    icon: Watch
  },
  strava: {
    name: "Strava",
    icon: Activity
  },
  google_fit: {
    name: "Google Fit",
    icon: Heart
  },
  apple_health: {
    name: "Apple Health",
    icon: Apple
  }
};

interface HealthDataIntegrationsProps {
  className?: string;
}

export function HealthDataIntegrations({ className }: HealthDataIntegrationsProps) {
  const { toast } = useToast();

  const handleConnect = (platform: Platform) => {
    toast({
      title: "Coming Soon",
      description: `${platforms[platform].name} integration will be available soon!`,
    });
  };

  return (
    <DashboardCard title="Health Data Integrations" className={className}>
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(platforms).map(([key, platform]) => {
          const Icon = platform.icon;
          const isPlatform = key as Platform;
          
          return (
            <Button
              key={key}
              variant="outline"
              className="h-auto py-4 px-6 flex items-center justify-start space-x-4"
              onClick={() => handleConnect(isPlatform)}
            >
              <Icon className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">{platform.name}</div>
                <div className="text-sm text-gray-500">Coming Soon</div>
              </div>
            </Button>
          );
        })}
      </div>
    </DashboardCard>
  );
}