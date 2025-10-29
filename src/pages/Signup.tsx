
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
import { LoginSocialGoogle } from 'reactjs-social-login';

import { FcGoogle } from "react-icons/fc";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("https://vinathaal.azhizen.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Account created successfully! Welcome to QuestionCraft.");

        // Store user data consistently
        const userData = {
          name: formData.name,
          email: formData.email,
          token: "demo-token-" + Date.now(),
          loginTime: new Date().toISOString(),
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", userData.token);

        setTimeout(() => {
        const redirectPath = sessionStorage.getItem("redirectAfterSignup");
        sessionStorage.removeItem("redirectAfterSignup");
        navigate(redirectPath || "/");
      }, 200);

      } else {
        toast.error(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-primary hover:text-accent transition-colors"
          >
            <img
              src="/vinathaal_icon.png"
              alt="Vinathaal Icon"
              className="w-14 h-14 object-contain"
            />
            <span className="text-2xl font-semibold">Vinathaal</span>
          </Link>
          <Link
            to="/"
            className="absolute top-6 left-14 inline-flex items-center space-x-2 text-primary hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <Card className="bg-gradient-card border-accent/20 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Create Account</CardTitle>
            <CardDescription className="text-text-secondary">
              Join thousands of educators using AI to create better question papers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-primary hover:text-accent font-medium transition-colors"
                >
                  Sign in
                </Link>

              </p>
            </div>
            {/* Google Sign-In */}
            <div className="mt-6">
              <div className="flex justify-center"></div>

              <LoginSocialGoogle
                client_id="961571231420-2vc0uud6mp86tmg6649htncnenh32tll.apps.googleusercontent.com"
                onResolve={async ({ data }) => {
                  try {
                    const token = data.id_token; // ✅ Use id_token instead of access_token
                    if (!token) {
                      toast.error("No Google ID token received");
                      return;
                    }

                    setIsLoading(true);

                    const res = await fetch("https://vinathaal.azhizen.com/api/auth/google-signup", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ token }),
                    });

                    const responseData = await res.json();

                    if (res.ok && responseData.token) {
                      toast.success("Google Sign-Up successful!");
                      const userData = {
                        name: responseData.user?.name,
                        email: responseData.user?.email,
                        picture: responseData.user?.picture,
                        token: responseData.token,
                        signupTime: new Date().toISOString(),
                        googleId: responseData.user?.googleId,
                      };
                      localStorage.setItem("user", JSON.stringify(userData));
                      localStorage.setItem("authToken", responseData.token);

                      const redirectPath = sessionStorage.getItem("redirectAfterSignup");
                      if (redirectPath) {
                        sessionStorage.removeItem("redirectAfterSignup");
                        navigate(redirectPath);
                      } else {
                        navigate("/");
                      }
                    } else {
                      toast.error(responseData.error || "Google signup failed");
                    }
                  } catch (err) {
                    console.error("Google Sign-Up error:", err);
                    toast.error("Google Sign-Up failed");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                onReject={(err) => {
                  toast.error("Google Sign-Up failed");
                  console.error(err);
                }}
              >
                <button className="flex items-center gap-3 bg-white border px-6 py-2 rounded-lg shadow hover:shadow-lg transition-shadow">
                  <FcGoogle size={24} />
                  <span className="text-gray-700">Sign up with Google</span>
                </button>
              </LoginSocialGoogle>



            </div>


          </CardContent>
        </Card>
      </div>
    </div >
  );
};

export default Signup;
