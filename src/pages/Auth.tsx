import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { GoalSettingForm } from "@/components/GoalSettingForm";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN") {
          if (session) {
            const { data: goals } = await supabase
              .from('user_goals')
              .select('id')
              .eq('user_id', session.user.id)
              .limit(1);

            if (!goals?.length) {
              setUserId(session.user.id);
              setShowGoalForm(true);
            } else {
              navigate("/");
              toast({
                title: "Welcome back!",
                description: "You have successfully signed in.",
              });
            }
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  if (showGoalForm && userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <GoalSettingForm userId={userId} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          HealthSync
        </h1>
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0EA5E9',
                    brandAccent: '#0284C7',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;