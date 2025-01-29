import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function HealthDataIntegrations() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user.id) {
        throw new Error("User not authenticated");
      }

      // First, upload the file to Supabase storage
      const fileName = `health-data/${session.user.id}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(fileName);

      // Process the uploaded file using the Edge Function
      const { data, error } = await supabase.functions.invoke('process-health-data', {
        body: { fileUrl: publicUrl }
      });

      if (error) throw error;

      toast({
        title: "Health data processed successfully",
        description: "Your health data has been uploaded and processed.",
      });

    } catch (error) {
      console.error('Error processing health data:', error);
      toast({
        title: "Error",
        description: "Failed to process health data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Health Data Integration</h3>
      <p className="text-sm text-gray-500">
        Upload your Apple Health export (export.xml) to sync your health data.
      </p>
      <div className="flex items-center gap-4">
        <input
          type="file"
          accept=".xml"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="hidden"
          id="health-data-upload"
        />
        <label htmlFor="health-data-upload">
          <Button
            variant="outline"
            disabled={isUploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Upload Health Data'
              )}
            </span>
          </Button>
        </label>
      </div>
    </div>
  );
}