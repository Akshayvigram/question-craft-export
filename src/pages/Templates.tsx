
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, User, LogOut } from "lucide-react";
import Footer from "@/components/Footer";

const Templates = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = () => {
      const userData = localStorage.getItem("user");
      const authToken = localStorage.getItem("authToken");

      if (userData && authToken) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    checkAuthStatus();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "authToken") {
        checkAuthStatus();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const handleGeneratorClick = (path: string) => {
    const authToken = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (!user) {
      sessionStorage.setItem("redirectAfterLogin", path);
      navigate("/login");
      return;
    }

    if (!authToken || !userData) {
      sessionStorage.setItem("redirectAfterLogin", path);
      navigate("/login");
      return;
    }

    navigate(path);
  };

  // Extended template data with titles and descriptions
  const allTemplates = [
    {
      id: 1,
      preview: "question-paper.jpg",
      title: "Standard University Format",
      description: "Traditional format with multiple sections and varied question types"
    },
    {
      id: 2,
      preview: "question-paper1.jpg",
      title: "Professional Academic Layout",
      description: "Clean, professional layout ideal for engineering and science subjects"
    },
    {
      id: 3,
      preview: "question-paper.jpg",
      title: "Engineering Format",
      description: "Structured format perfect for technical subjects and problem-solving"
    },
    {
      id: 4,
      preview: "question-paper1.jpg",
      title: "Mathematics Template",
      description: "Optimized for mathematical equations and numerical problems"
    },
    {
      id: 5,
      preview: "question-paper.jpg",
      title: "Science Template",
      description: "Designed for physics, chemistry, and biology examinations"
    },
    {
      id: 6,
      preview: "question-paper1.jpg",
      title: "Liberal Arts Format",
      description: "Ideal for humanities, literature, and social science subjects"
    },
    {
      id: 7,
      preview: "question-paper.jpg",
      title: "Business Studies Template",
      description: "Professional format for business and management courses"
    },
    {
      id: 8,
      preview: "question-paper1.jpg",
      title: "Computer Science Format",
      description: "Tailored for programming and technical computing subjects"
    },
    {
      id: 9,
      preview: "question-paper.jpg",
      title: "Medical Template",
      description: "Specialized format for medical and healthcare examinations"
    },
    {
      id: 10,
      preview: "question-paper1.jpg",
      title: "Research Paper Format",
      description: "Academic format for research-based questions and essays"
    },
    {
      id: 11,
      preview: "question-paper.jpg",
      title: "Entrance Exam Template",
      description: "Optimized for competitive and entrance examinations"
    },
    {
      id: 12,
      preview: "question-paper1.jpg",
      title: "Assignment Format",
      description: "Perfect for take-home assignments and project evaluations"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/vinathaal_icon.png"
                alt="Vinathaal Icon"
                className="w-14 h-14 object-contain"
              />
              <img
                src="/vinathaal-heading-black.png"
                alt="Vinathaal Heading"
                className="h-[45px] w-30 object-contain"
              />
            </Link>

            {/* Back Button */}
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="outline" size="sm" className="hover:bg-gradient-primary">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>

              {/* Auth Buttons / User Info */}
              {user ? (
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Hi, {user.name || user.email}</span>
                  <Button variant="outline" className="hover:bg-gradient-primary" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="outline" size="sm" className="hover:bg-gradient-primary">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-gradient-primary hover:brightness-110 transition-all">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              All Question Paper Templates
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose from our comprehensive collection of question paper templates designed for various subjects and academic levels.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {allTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-card border-border/100">
                <CardHeader className="p-0">
                  <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                    <img
                      src={template.preview}
                      alt={template.title}
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.description}
                  </CardDescription>
                  <Button 
                    size="sm" 
                    className="w-full bg-gradient-primary hover:opacity-90 transition-all"
                    onClick={() => handleGeneratorClick("/generator")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Don't see what you're looking for?
              </h2>
              <p className="text-muted-foreground mb-6">
                Our AI can generate custom question papers based on your specific requirements and syllabus.
              </p>
              <Button 
                size="lg" 
                className="px-8 py-3 bg-gradient-primary hover:opacity-90"
                onClick={() => handleGeneratorClick("/generator")}
              >
                Create Custom Paper
              </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Templates;
