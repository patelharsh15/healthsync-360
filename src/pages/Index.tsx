import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { HealthGoal } from "@/components/HealthGoal";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/progress" className="transition-transform hover:scale-105">
          <DashboardCard title="Progress Overview" className="h-full">
            <div className="space-y-4">
              <HealthMetric
                label="Daily Goals Progress"
                value={2}
                target={3}
                unit="completed"
              />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </DashboardCard>
        </Link>

        <Link to="/meals" className="transition-transform hover:scale-105">
          <DashboardCard title="Recent Meals" className="h-full">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Track and analyze your meals</p>
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
              <p className="text-sm text-gray-500">Record your health journey</p>
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
              <p className="text-sm text-gray-500">Get personalized health advice and support</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Start Chat</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </DashboardCard>
        </Link>
      </div>
    </div>
  );
};

export default Index;