import { DashboardCard } from "@/components/DashboardCard";
import { HealthMetric } from "@/components/HealthMetric";
import { HealthGoal } from "@/components/HealthGoal";
import { MealAnalysis } from "@/components/MealAnalysis";
import { VoiceJournal } from "@/components/VoiceJournal";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container py-4">
          <h1 className="text-2xl font-bold text-primary">HealthSync</h1>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard title="Today's Progress" className="lg:col-span-2">
            <div className="space-y-6">
              <HealthMetric
                label="Steps"
                value={6500}
                target={10000}
                unit="steps"
              />
              <HealthMetric
                label="Water"
                value={1.5}
                target={2.5}
                unit="L"
              />
              <HealthMetric
                label="Sleep"
                value={6.5}
                target={8}
                unit="hours"
              />
            </div>
          </DashboardCard>

          <DashboardCard title="Goals" className="md:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <HealthGoal
                title="Morning Walk"
                description="30 minutes of walking"
                completed
              />
              <HealthGoal
                title="Meditation"
                description="15 minutes of mindfulness"
              />
              <HealthGoal
                title="Healthy Breakfast"
                description="Include proteins and fruits"
                completed
              />
            </div>
          </DashboardCard>

          <MealAnalysis />
          <VoiceJournal />
        </div>
      </main>
    </div>
  );
};

export default Index;