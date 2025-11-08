import { useEffect, useState } from "react";
// Assuming Card, CardContent, CardHeader, CardTitle are utility components (e.g., from shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, TrendingUp, Clock } from "lucide-react";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalPapers: 0,
    activeUsers: 0,
    avgTime: 0,
    satisfaction: 0,
  });

  // Effect for fetching data and animating the counter
  useEffect(() => {
    // Prevent fetching on non-browser environments if this component is used in SSR
    if (typeof window === "undefined") return;

    fetch("https://vinathaal-backend-905806810470.asia-south1.run.app/api/stats")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          const progress = step / steps;

          setStats({
            // Use Math.round for better distribution during animation
            totalPapers: Math.round(data.totalPapers * progress),
            activeUsers: Math.round(data.activeUsers * progress),
            // Assuming avgTime and satisfaction are numbers
            avgTime: Math.round(data.avgTime * progress * 10) / 10, // Keep one decimal place for avgTime if it can be non-integer
            satisfaction: Math.round(data.satisfaction * progress),
          });

          if (step >= steps) {
            clearInterval(timer);
            // Ensure the final state is the actual data
            setStats(data);
          }
        }, interval);
        
        // Cleanup function for setInterval
        return () => clearInterval(timer);
      })
      .catch((err) => console.error("Failed to load stats", err));
  }, []); // Empty dependency array means this runs once on mount

  const statCards = [
    {
      title: "Question Papers Generated",
      value: stats.totalPapers.toLocaleString() + "+",
      icon: <FileText className="w-6 h-6 sm:w-8 sm:h-8" />,
      description: "Papers created by educators worldwide",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString() + "+",
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      description: "Educators trusting our platform",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Average Generation Time",
      // Ensure it handles non-integer avgTime if the backend returns it
      value: (typeof stats.avgTime === 'number' ? stats.avgTime.toFixed(1) : stats.avgTime) + " min",
      icon: <Clock className="w-6 h-6 sm:w-8 sm:h-8" />,
      description: "From upload to ready paper",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "Satisfaction Rate",
      value: stats.satisfaction + "%",
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
      description: "Users rating us 5 stars",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header - Already quite responsive */}
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-3 sm:mb-4 leading-snug sm:leading-tight">
            Trusted by Educators{" "}
            <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Worldwide
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
            Join thousands of educators who have revolutionized their question
            paper creation process.
          </p>
        </div>

        {/* Stats Grid - Enhanced Mobile Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-white/10 dark:bg-slate-800/20 backdrop-blur-md border border-accent/10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] group rounded-2xl p-4 sm:p-6" // Added padding for card body
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              {/* Card Header for Mobile - Flex for better icon/title alignment */}
              <CardHeader className="p-0 pb-3 sm:pb-4 z-10 relative flex-row items-center space-x-4 sm:flex-col sm:items-start sm:space-x-0">
                {/* Icon Container */}
                <div
                  className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${stat.gradient} rounded-xl sm:rounded-2xl flex items-center justify-center mb-0 sm:mb-4 shadow-md ring-4 ring-white/30`}
                >
                  <div className="text-white animate-pulse">{stat.icon}</div> 
                </div>
                {/* Title (Text) */}
                <CardTitle className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider text-left">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              
              {/* Card Content for Mobile - Left-aligned and compact */}
              <CardContent className="p-0 z-10 relative text-left">
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1 font-mono">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardStats;