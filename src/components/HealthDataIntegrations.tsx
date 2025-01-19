import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "./DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FitbitIcon, StravaIcon, GoogleFitIcon, AppleHealthIcon } from "lucide-react";

type Platform = 'fitbit' | 'strava' | 'google_fit' | 'apple_health';

interface PlatformConfig {
  name: string;
  icon: React.ComponentType;
  authUrl?: string;
}

const platforms: Record<Platform, PlatformConfig> = {
  fitbit: {
    name: "Fitbit",
    icon: FitbitIcon,
    authUrl: "https://www.fitbit.com/oauth2/authorize"
  },
  strava: {
    name: "Strava",
    icon: StravaIcon,
    authUrl: "https://www.strava.com/oauth/authorize"
  },
  google_fit: {
    name: "Google Fit",
    icon: GoogleFitIcon,
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth"
  },
  apple_health: {
    name: "Apple Health",
    icon: AppleHealthIcon
  }
};

export function HealthDataIntegrations() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async (platform: Platform) => {
    if (platform === 'apple_health') {
      document.getElementById('apple-health-file')?.click();
      return;
    }

    // For other platforms, we'll implement OAuth flow
    toast({
      title: "Coming Soon",
      description: `${platforms[platform].name} integration will be available soon!`,
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/xml' && !file.name.endsWith('.xml')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an Apple Health export file (XML format)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-health-data', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Health data imported successfully!",
      });
    } catch (error) {
      console.error('Error uploading health data:', error);
      toast({
        title: "Error",
        description: "Failed to import health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  return (
    <DashboardCard title="Health Data Integrations" className="animate-fadeIn">
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
              disabled={isUploading}
            >
              <Icon className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">{platform.name}</div>
                <div className="text-sm text-gray-500">
                  {isPlatform === 'apple_health' 
                    ? 'Import health export file' 
                    : 'Connect your account'}
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <input
        type="file"
        id="apple-health-file"
        accept=".xml"
        className="hidden"
        onChange={handleFileUpload}
        disabled={isUploading}
      />
    </DashboardCard>
  );
}