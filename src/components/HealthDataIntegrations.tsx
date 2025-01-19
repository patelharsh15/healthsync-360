import { Button } from "@/components/ui/button";
import { DashboardCard } from "./DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { Activity, Heart, Watch, Apple } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Input } from "@/components/ui/input";

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

export function HealthDataIntegrations() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleConnect = async (platform: Platform) => {
    if (platform === 'apple_health' && selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error('No access token available');
        }

        const { data, error } = await supabase.functions.invoke('process-health-data', {
          body: formData,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Health data imported successfully!",
        });

        // Clear the selected file
        setSelectedFile(null);
      } catch (error) {
        console.error('Error uploading health data:', error);
        toast({
          title: "Error",
          description: "Failed to import health data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      toast({
        title: "Coming Soon",
        description: `${platforms[platform].name} integration will be available soon!`,
      });
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <DashboardCard title="Health Data Integrations">
      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(platforms).map(([key, platform]) => {
          const Icon = platform.icon;
          const isPlatform = key as Platform;
          const isAppleHealth = key === 'apple_health';
          
          return (
            <div key={key} className="space-y-2">
              <Button
                variant="outline"
                className="h-auto py-4 px-6 w-full flex items-center justify-start space-x-4"
                onClick={() => handleConnect(isPlatform)}
                disabled={isUploading || (isAppleHealth && !selectedFile)}
              >
                <Icon className="h-6 w-6" />
                <div className="text-left flex-1">
                  <div className="font-medium">{platform.name}</div>
                  <div className="text-sm text-gray-500">
                    {isAppleHealth ? 'Upload export file' : 'Coming Soon'}
                  </div>
                </div>
              </Button>
              {isAppleHealth && (
                <div className="w-full">
                  <Input
                    type="file"
                    accept=".xml"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}