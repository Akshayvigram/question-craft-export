import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { FileText, Upload, Download, Zap, User, LogOut, Brain, Settings, Image, FileKey, Share, Clock, BookOpen, ChevronDown, ArrowRight, Star, Users, Coins } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import DashboardStats from "@/components/DashboardStats";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Link as ScrollLink } from "react-scroll";
import { HelpCircle, Wallet } from "lucide-react";
import axios from "axios";

const Index = () => {
  const [user, setUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null); // New state to hold profile picture
  const [userCredits, setUserCredits] = useState(0); // Mock credits data
  const navigate = useNavigate();
  const [recentPapers, setRecentPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const storedUser = localStorage.getItem("user");
  const userEmail = storedUser ? JSON.parse(storedUser).email : null;

  // Extract first letter from the user's name (if available)
  const userInitial = user?.name?.trim() ? user.name.trim()[0].toUpperCase() : "U";

  useEffect(() => {
    const checkAuthStatus = async () => {
      const userData = localStorage.getItem("user"); // storedUser
      const authToken = localStorage.getItem("authToken");

      if (userData && authToken) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Retrieve profile picture
        const savedProfilePic = localStorage.getItem(`profilePicture_${parsedUser.email}`);
        setProfilePicture(savedProfilePic || null);

        try {
          // ✅ Fetch real credits from backend
          const response = await fetch("https://vinathaal.azhizen.com/api/get-credits", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: parsedUser.email }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch credits");
          }

          const data = await response.json();
          setUserCredits(data.credits); // ✅ Set real credits
        } catch (error) {
          console.error("Error fetching credits:", error);
          setUserCredits(0); // fallback
        }
      } else {
        setUser(null);
        setProfilePicture(null);
        // setUserCredits(0); // no user, no credits
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    // We don't need to remove the profile picture here, as it's user-specific and can be reloaded on login.
    setUser(null);
    setProfilePicture(null);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handleGeneratorClick = (path) => {
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


  useEffect(() => {
    if (!userEmail) {
      setError("User email not found");
      setLoading(false);
      return;
    }

    const fetchRecentPapers = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3001/api/get-questions-paper-history",
          { email: userEmail }
        );
        // Map backend fields to your UI fields
        const mapped = res.data.data.map((item, idx) => ({
          id: idx,
          subject: item.subjectName || "N/A",
          university: "N/A", // if available, replace with actual
          marks: "-",         // if available from DB
          sections: "-",      // if available from DB
          date: item.created_at,
          objectUrl: item.objectUrl
        }));
        setRecentPapers(mapped);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch papers");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPapers();
  }, [userEmail]);

  const features = [
    {
      icon: <Upload className="w-6 h-6" />,
      title: "Upload Syllabus",
      description: "Simply upload your syllabus image and let AI understand the content"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Generation",
      description: "Our advanced AI generates relevant questions based on your requirements"
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: "Export Options",
      description: "Download your question papers in PDF or Word format instantly"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="bg-card/90 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <ScrollLink to="hero" smooth={true} duration={800} offset={-70}>
              <div className="flex items-center space-x-2 cursor-pointer">
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
              </div>
            </ScrollLink>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {!user ? (
                <>
                  <Link
                    to="/pricing"
                    className="relative font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[5px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform"
                  >
                    Pricing
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="relative font-medium flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[5px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform"
                    >
                      <span>Generator</span>
                      <ChevronDown className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-64 p-2 rounded-xl shadow-lg border border-border bg-popover"
                    >
                      <DropdownMenuItem asChild>
                        <Link
                          to="/mcq-generator"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gradient-primary text-sm transition-all text-foreground"
                        >
                          <Brain className="w-4 h-4" />
                          MCQ Generator
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/generator"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gradient-primary text-sm transition-all text-foreground"
                        >
                          <Upload className="w-4 h-4" />
                          Generator Syllabus
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/generator"
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gradient-primary text-sm transition-all text-foreground"
                        >
                          <FileText className="w-4 h-4" />
                          Generator using Question Bank
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link
                    to="/support"
                    className="relative font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[5px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform"
                  >
                    Support
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/mcq-generator"
                    className="relative font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[5px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform"
                  >
                    MCQ Generator
                  </Link>
                  <Link
                    to="/generator"
                    className="relative font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[5px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform"
                  >
                    Syllabus Generator
                  </Link>
                  <Link
                    to="/generator?mode=questionbank"
                    className="relative font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[5px] after:bg-gradient-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:origin-center after:transition-transform"
                  >
                    Question Bank Generator
                  </Link>
                </>
              )}
            </div>

            {/* Profile Section */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  
                  <div className="text-right hidden md:block leading-tight">
                    <p className="text-sm text-muted-foreground">Hi,</p>
                    <p className="text-base font-semibold text-foreground">{user.name || user.email}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-br from-gray-200 to-gray-500 hover:brightness-110 transition-all shadow-md cursor-pointer">
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-primary text-white font-bold text-lg">
                            <span className="leading-none">{userInitial}</span>
                          </div>
                        )}
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-[312px] mt-2 rounded-xl border border-border bg-white backdrop-blur-lg shadow-xl ring-1 ring-border right-0"
                    >
                      {/* Credits Display */}
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-yellow-500/10">
                            <Coins className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Credits Remaining</p>
                            <p className="text-lg font-bold text-yellow-600">{userCredits}</p>
                          </div>
                        </div>
                      </div>

                      {/* My Profile */}
                      <DropdownMenuItem asChild>
                        <Link
                          to="/profile"
                          className="group flex items-center gap-3 px-4 py-3 rounded-md w-full transition-all hover:bg-gradient-primary"
                        >
                          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-white/20 transition">
                            <User className="w-5 h-5 text-primary group-hover:text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-white transition">
                            My Profile
                          </span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Create Community */}
                      <DropdownMenuItem asChild>
                        <Link
                          to="/create-community"
                          className="group flex items-center gap-3 px-4 py-3 rounded-md w-full transition-all hover:bg-gradient-primary"
                        >
                          <div className="p-2 rounded-full bg-purple-500/10 group-hover:bg-white/20 transition">
                            <Users className="w-5 h-5 text-purple-500 group-hover:text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-white transition">
                            Create Team
                          </span>
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {/* Get More Credits */}
                      <DropdownMenuItem asChild>
                        <Link
                          to="/pricing"
                          className="group flex items-center gap-3 px-4 py-3 rounded-md w-full transition-all hover:bg-gradient-primary"
                        >
                          <div className="p-2 rounded-full bg-primary/10 group-hover:bg-white/20 transition">
                            <Wallet className="w-5 h-5 text-primary group-hover:text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-white transition">
                            Get More Credits
                          </span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Support */}
                      <DropdownMenuItem asChild>
                        <Link
                          to="/support"
                          className="group flex items-center gap-3 px-4 py-3 rounded-md w-full transition-all hover:bg-gradient-primary"
                        >
                          <div className="p-2 rounded-full bg-blue-500/10 group-hover:bg-white/20 transition">
                            <HelpCircle className="w-5 h-5 text-blue-500 group-hover:text-white" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-white transition">
                            Support
                          </span>
                        </Link>
                      </DropdownMenuItem>

                      {/* Logout */}
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="group flex items-center gap-3 px-4 py-3 rounded-md w-full cursor-pointer transition-all hover:bg-gradient-primary"
                      >
                        <div className="p-2 rounded-full bg-red-500/10 group-hover:bg-white/20 transition">
                          <LogOut className="w-5 h-5 text-red-500 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-medium text-red-500 group-hover:text-white transition">
                          Log Out
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>

                  </DropdownMenu>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login">
                    <Button variant="outline" className="px-8 py-3 hover:bg-gradient-primary hover:text-white transition-all">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="px-8 py-3 bg-gradient-primary hover:brightness-110 transition-all">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Hero Section - Always shown */}
      <section
        id="hero"
        className="relative min-h-screen py-20 flex items-center overflow-hidden"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='100%25' gradientTransform='rotate(240)'%3E%3Cstop offset='0' stop-color='%23ffffff'/%3E%3Cstop offset='1' stop-color='%234FE'/%3E%3C/linearGradient%3E%3Cpattern patternUnits='userSpaceOnUse' id='b' width='540' height='450' x='0' y='0' viewBox='0 0 1080 900'%3E%3Cg fill-opacity='0.1'%3E%3Cpolygon fill='%23444' points='90 150 0 300 180 300'/%3E%3Cpolygon points='90 150 180 0 0 0'/%3E%3Cpolygon fill='%23AAA' points='270 150 360 0 180 0'/%3E%3Cpolygon fill='%23DDD' points='450 150 360 300 540 300'/%3E%3Cpolygon fill='%23999' points='450 150 540 0 360 0'/%3E%3Cpolygon points='630 150 540 300 720 300'/%3E%3Cpolygon fill='%23DDD' points='630 150 720 0 540 0'/%3E%3Cpolygon fill='%23444' points='810 150 720 300 900 300'/%3E%3Cpolygon fill='%23FFF' points='810 150 900 0 720 0'/%3E%3Cpolygon fill='%23DDD' points='990 150 900 300 1080 300'/%3E%3Cpolygon fill='%23444' points='990 150 1080 0 900 0'/%3E%3Cpolygon fill='%23DDD' points='90 450 0 600 180 600'/%3E%3Cpolygon points='90 450 180 300 0 300'/%3E%3Cpolygon fill='%23666' points='270 450 180 600 360 600'/%3E%3Cpolygon fill='%23AAA' points='270 450 360 300 180 300'/%3E%3Cpolygon fill='%23DDD' points='450 450 360 600 540 600'/%3E%3Cpolygon fill='%23999' points='450 450 540 300 360 300'/%3E%3Cpolygon fill='%23999' points='630 450 540 600 720 600'/%3E%3Cpolygon fill='%23FFF' points='630 450 720 300 540 300'/%3E%3Cpolygon points='810 450 720 600 900 600'/%3E%3Cpolygon fill='%23DDD' points='810 450 900 300 720 300'/%3E%3Cpolygon fill='%23AAA' points='990 450 900 600 1080 600'/%3E%3Cpolygon fill='%23444' points='990 450 1080 300 900 300'/%3E%3Cpolygon fill='%23222' points='90 750 0 900 180 900'/%3E%3Cpolygon points='270 750 180 900 360 900'/%3E%3Cpolygon fill='%23DDD' points='270 750 360 600 180 600'/%3E%3Cpolygon points='450 750 540 600 360 600'/%3E%3Cpolygon points='630 750 540 900 720 900'/%3E%3Cpolygon fill='%23444' points='630 750 720 600 540 600'/%3E%3Cpolygon fill='%23AAA' points='810 750 720 900 900 900'/%3E%3Cpolygon fill='%23666' points='810 750 900 600 720 600'/%3E%3Cpolygon fill='%23999' points='990 750 900 900 1080 900'/%3E%3Cpolygon fill='%23999' points='180 0 90 150 270 150'/%3E%3Cpolygon fill='%23444' points='360 0 270 150 450 150'/%3E%3Cpolygon fill='%23FFF' points='540 0 450 150 630 150'/%3E%3Cpolygon points='900 0 810 150 990 150'/%3E%3Cpolygon fill='%23222' points='0 300 -90 450 90 450'/%3E%3Cpolygon fill='%23FFF' points='0 300 90 150 -90 150'/%3E%3Cpolygon fill='%23FFF' points='180 300 90 450 270 450'/%3E%3Cpolygon fill='%23666' points='180 300 270 150 90 150'/%3E%3Cpolygon fill='%23222' points='360 300 270 450 450 450'/%3E%3Cpolygon fill='%23FFF' points='360 300 450 150 270 150'/%3E%3Cpolygon fill='%23444' points='540 300 450 450 630 450'/%3E%3Cpolygon fill='%23222' points='540 300 630 150 450 150'/%3E%3Cpolygon fill='%23AAA' points='720 300 630 450 810 450'/%3E%3Cpolygon fill='%23666' points='720 300 810 150 630 150'/%3E%3Cpolygon fill='%23FFF' points='900 300 810 450 990 450'/%3E%3Cpolygon fill='%23999' points='900 300 990 150 810 150'/%3E%3Cpolygon points='0 600 -90 750 90 750'/%3E%3Cpolygon fill='%23666' points='0 600 90 450 -90 450'/%3E%3Cpolygon fill='%23AAA' points='180 600 90 750 270 750'/%3E%3Cpolygon fill='%23444' points='180 600 270 450 90 450'/%3E%3Cpolygon fill='%23444' points='360 600 270 750 450 750'/%3E%3Cpolygon fill='%23999' points='360 600 450 450 270 450'/%3E%3Cpolygon fill='%23666' points='540 600 630 450 450 450'/%3E%3Cpolygon fill='%23222' points='720 600 630 750 810 750'/%3E%3Cpolygon fill='%23FFF' points='900 600 810 750 990 750'/%3E%3Cpolygon fill='%23222' points='900 600 990 450 810 450'/%3E%3Cpolygon fill='%23DDD' points='0 900 90 750 -90 750'/%3E%3Cpolygon fill='%23444' points='180 900 270 750 90 750'/%3E%3Cpolygon fill='%23FFF' points='360 900 450 750 270 750'/%3E%3Cpolygon fill='%23AAA' points='540 900 630 750 450 750'/%3E%3Cpolygon fill='%23FFF' points='720 900 810 750 630 750'/%3E%3Cpolygon fill='%23222' points='900 900 990 750 810 750'/%3E%3Cpolygon fill='%23222' points='1080 300 990 450 1170 450'/%3E%3Cpolygon fill='%23FFF' points='1080 300 1170 150 990 150'/%3E%3Cpolygon points='1080 600 990 750 1170 750'/%3E%3Cpolygon fill='%23666' points='1080 600 1170 450 990 450'/%3E%3Cpolygon fill='%23DDD' points='1080 900 1170 750 990 750'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect x='0' y='0' fill='url(%23b)' width='100%25' height='100%25'/%3E%3C/svg%3E")`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Generate Question Papers with{" "}
            <span className="inline-block overflow-hidden whitespace-nowrap bg-gradient-primary bg-clip-text text-transparent">
              AI Precision
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Create professional question papers instantly with customizable sections, difficulty levels,
            and automated answer keys. Perfect for educators and institutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 py-3 bg-gradient-primary hover:opacity-90" onClick={() => handleGeneratorClick("/generator")}>
              <FileText className="w-5 h-5 mr-2" />
              Start Generating
            </Button>
            <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-gradient-primary hover:text-primary-foreground" onClick={() => handleGeneratorClick("/mcq-generator")}>
              <Brain className="w-5 h-5 mr-2" />
              MCQ Generator
            </Button>
          </div>
        </div>
      </section>

      {user && (
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {recentPapers.length > 0 && (
              <>
                {/* Title */}
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-foreground mb-2">Your Recently Created Papers</h2>
                  <p className="text-muted-foreground text-lg">
                    Continue editing or reviewing your previously generated question papers.
                  </p>
                </div>

                {/* Paper Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {recentPapers.map((paper) => (
                    <Card
                      key={paper.id}
                      className="relative group p-6 border border-border rounded-2xl shadow-sm hover:shadow-xl transition-shadow bg-card cursor-pointer"
                    >
                      {/* Header */}
                      <div className="mb-4">
                        <CardTitle className="text-xl font-semibold text-primary group-hover:underline">
                          {paper.subject}
                        </CardTitle>
                      </div>

                      {/* Details */}
                      <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                          </div>
                          <div className="text-xs text-muted-foreground/80">
                            📅 Created: {new Date(paper.date).toLocaleDateString()}
                          </div>
                        </div>

                        {/* View Button */}
                        <Button
                          variant="outline"
                          className="px-8 py-3 w-full hover:bg-gradient-primary transition-all"
                          onClick={() => window.open(paper.objectUrl, "_blank")}
                        >
                          View Paper
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div></>
            )}
          </div>
        </section>
      )}

      {/* Dashboard Stats Section - Only show when NOT logged in */}
      {!user && <DashboardStats />}

      {/* How It Works Section - Only show when NOT logged in */}
      {!user && <HowItWorks />}

      {/* Popular Question Papers Section - Always shown */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Question Paper Templates</h2>
            <p className="text-xl text-muted-foreground">Select a template to begin creating your question paper</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-100 gap-y-6">
            {[
              { preview: "question-paper.jpg" },
              { preview: "question-paper1.jpg" },
              { preview: "question-paper.jpg" },
              { preview: "question-paper1.jpg" },
              { preview: "question-paper.jpg" },
              { preview: "question-paper1.jpg" },
            ].map((template, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-full max-w-[300px] group transition-transform duration-300 hover:scale-105">
                  <div className="relative w-full h-[340px] rounded-xl overflow-hidden border border-border/100 transition-all duration-300 bg-white/10 dark:bg-slate-800/20 backdrop-blur-md">
                    <img
                      src={template.preview}
                      alt="Template Preview"
                      className="w-full h-full object-cover object-top rounded-xl"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  className="mt-4 px-6 py-2 bg-gradient-primary hover:opacity-90"
                  onClick={() => handleGeneratorClick("/generator")}
                >
                  Choose Template
                </Button>
              </div>
            ))}
          </div>

          {/* View All Templates Button */}
          <div className="text-center mt-12">
            <Link to="/templates">
              <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-gradient-primary hover:text-primary-foreground">
                View All Templates
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid - Only show when NOT logged in */}
      {!user && (
        <section className="py-20 bg-gradient-features">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Everything You Need for Question Paper Creation
              </h2>
              <p className="text-xl text-muted-foreground">
                Powerful features designed for modern education
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Zap />}
                title="AI-Powered Generation"
                description="Leverage AI to create relevant, structured questions tailored to your syllabus."
              />
              <FeatureCard
                icon={<Settings />}
                title="Customizable Sections"
                description="Configure sections with different difficulty levels, marks, and question counts."
              />
              <FeatureCard
                icon={<Download />}
                title="Multiple Export Formats"
                description="Download your question papers in PDF or Word format instantly."
              />
              <FeatureCard
                icon={<Image />}
                title="Custom Headers"
                description="Upload your institution's logo for branded question papers."
              />
              <FeatureCard
                icon={<FileKey />}
                title="Answer Key Generation"
                description="Auto-generate comprehensive answer keys with explanations."
              />
              <FeatureCard
                icon={<Brain />}
                title="MCQ Generator"
                description="Tool for creating multiple choice question papers with options."
              />
              <FeatureCard
                icon={<Share />}
                title="Easy Sharing"
                description="Share question papers via email, WhatsApp, or Google Drive."
              />
              <FeatureCard
                icon={<Clock />}
                title="Time Configuration"
                description="Set exam duration and dates with automatic formatting."
              />
              <FeatureCard
                icon={<BookOpen />}
                title="Unit-wise Questions"
                description="Organize questions by syllabus units for full coverage."
              />
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Always shown */}
      <section className="py-20 bg-gradient-cta">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Question Paper Creation?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join thousands of educators who have already made the switch to AI-powered question generation.
          </p>
          <Button size="lg" className="px-8 py-3 bg-white text-primary hover:bg-white/90" onClick={() => handleGeneratorClick("/generator")}>
            Get Started for Free
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
