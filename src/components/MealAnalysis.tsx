import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { DashboardCard } from "./DashboardCard";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MealAnalysisProps {
  onImageSelect?: (imageBase64: string) => void;
}

export function MealAnalysis({ onImageSelect }: MealAnalysisProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `meal-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-files')
        .getPublicUrl(filePath);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        if (onImageSelect) {
          const base64Data = base64String.split(',')[1];
          onImageSelect(base64Data);
        }
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Failed to read the image file",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);

      // Save to meal_analysis table
      const { error: dbError } = await supabase
        .from('meal_analysis')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          analysis: 'Processing...' // This will be updated when analysis is complete
        });

      if (dbError) throw dbError;

    } catch (error) {
      console.error('Error handling image upload:', error);
      toast({
        title: "Error",
        description: "Failed to process the image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardCard title="Meal Analysis" className="animate-fadeIn">
      <div className="space-y-4">
        <div className="flex justify-center">
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Uploaded meal"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-secondary rounded-lg flex items-center justify-center">
              <Camera className="h-12 w-12 text-primary opacity-50" />
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="relative overflow-hidden"
            onClick={() => document.getElementById("meal-photo")?.click()}
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload Photo"}
            <input
              type="file"
              id="meal-photo"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
              disabled={isLoading}
            />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}