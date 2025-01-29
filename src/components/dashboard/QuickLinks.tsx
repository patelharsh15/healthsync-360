import { DashboardCard } from "../DashboardCard";
import { Link } from "react-router-dom";
import { ArrowRight, Utensils, Mic, MessageSquare } from "lucide-react";

export function QuickLinks() {
  return (
    <>
      <Link to="/meals" className="transition-transform hover:scale-105">
        <DashboardCard title="Meal Analysis" className="h-full">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary">
              <Utensils className="h-5 w-5" />
              <span className="font-medium">Analyze Your Meals</span>
            </div>
            <p className="text-sm text-gray-500">Get AI-powered nutritional insights for your meals</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Start Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </DashboardCard>
      </Link>

      <Link to="/journal" className="transition-transform hover:scale-105">
        <DashboardCard title="Voice Journal" className="h-full">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary">
              <Mic className="h-5 w-5" />
              <span className="font-medium">Record Your Journey</span>
            </div>
            <p className="text-sm text-gray-500">Log your health journey with voice notes</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Start Recording</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </DashboardCard>
      </Link>

      <Link to="/chat" className="transition-transform hover:scale-105 md:col-span-2 lg:col-span-3">
        <DashboardCard title="Health Assistant" className="h-full">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-primary">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">AI Health Assistant</span>
            </div>
            <p className="text-sm text-gray-500">Get personalized health advice and support</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Start Chat</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </DashboardCard>
      </Link>
    </>
  );
}