import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { HealthGoal } from "@/components/HealthGoal";
import { HealthDataIntegrations } from "@/components/HealthDataIntegrations";
import { Link } from "react-router-dom";
import { ArrowRight, Activity, Utensils, Mic, MessageSquare } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
      
      <HealthDataIntegrations />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/progress" className="transition-transform hover:scale-105">
          <DashboardCard title="Progress Overview" className="h-full">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <Activity className="h-5 w-5" />
                <span className="font-medium">Track Your Progress</span>
              </div>
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
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardCard title="Recent Goals" className="h-full">
          <div className="space-y-4">
            <HealthGoal
              title="Daily Steps"
              description="Reach 10,000 steps"
              completed={false}
            />
            <HealthGoal
              title="Water Intake"
              description="Drink 2.5L of water"
              completed={true}
            />
            <HealthGoal
              title="Sleep Duration"
              description="Sleep 8 hours"
              completed={false}
            />
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Stats" className="h-full">
          <div className="space-y-6">
            <HealthMetric
              label="Steps Today"
              value={6500}
              target={10000}
              unit="steps"
            />
            <HealthMetric
              label="Water Intake"
              value={1.5}
              target={2.5}
              unit="L"
            />
            <HealthMetric
              label="Sleep Last Night"
              value={6.5}
              target={8}
              unit="hours"
            />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Index;