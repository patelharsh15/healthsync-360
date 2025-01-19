import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { DashboardCard } from "./DashboardCard";

interface MealAnalysisProps {
  onImageSelect?: (imageBase64: string) => void;
}

export function MealAnalysis({ onImageSelect }: MealAnalysisProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
        if (onImageSelect) {
          onImageSelect(base64String.split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
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
          >
            Upload Photo
            <input
              type="file"
              id="meal-photo"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
          </Button>
        </div>
      </div>
    </DashboardCard>
  );
}