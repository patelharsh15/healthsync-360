import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/progress", label: "Progress Tracking" },
    { path: "/meals", label: "Meal Analysis" },
    { path: "/journal", label: "Voice Journal" },
    { path: "/chat", label: "Health Assistant" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">HealthSync</h1>
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    isActive(item.path)
                      ? "text-primary"
                      : "text-gray-600"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}