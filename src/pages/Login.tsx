
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";
import { toast } from "sonner";
//import { GoogleLogin } from "@react-oauth/google";
import { LoginSocialGoogle } from 'reactjs-social-login'
import { FcGoogle } from "react-icons/fc";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    
    try {
      const res = await fetch("https://vinathaal.azhizen.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful! Welcome back.");

        // Store user data in localStorage for persistence
        const userData = {
          name: data.user?.name || email.split('@')[0],
          email: email,
          token: data.token || "demo-token-" + Date.now(),
          loginTime: new Date().toISOString(),
          api_token: data.user?.api_token,
        };

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("apiToken", userData.api_token);

        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
        if (redirectPath) {
          sessionStorage.removeItem("redirectAfterLogin");
          navigate(redirectPath);
        } else {
          navigate("/");
        }
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-primary hover:text-accent">
            <img src="/vinathaal_icon.png" alt="Vinathaal Icon" className="w-14 h-14 object-contain" />
            <span className="text-2xl font-semibold">Vinathaal</span>
          </Link>
          <Link to="/" className="absolute top-6 left-14 flex items-center text-primary hover:text-accent">
            <ArrowLeft className="w-6 h-6" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <Card className="bg-gradient-card border-accent/20 shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full bg-gradient-primary" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-text-secondary">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="text-primary hover:text-accent font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
              <p className="text-sm text-text-secondary mt-2">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:text-accent font-medium"
                >
                  Forgot your password?
                </Link>
              </p>
            </div>

            {/* Google Sign-In */}
            <div className="mt-6">
              <div className="flex justify-center">
                <LoginSocialGoogle
                  client_id="961571231420-2vc0uud6mp86tmg6649htncnenh32tll.apps.googleusercontent.com"
                  onResolve={async ({ data }) => {
                    try {
                      const token = data.access_token; // reactjs-social-login provides access_token here
                      if (!token) {
                        toast.error("No Google token received");
                        return;
                      }

                      setIsLoading(true);

                      const res = await fetch("https://vinathaal.azhizen.com/api/auth/google", {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token }), // match backend's expected field
                      });

                      const responseData = await res.json();

                      if (res.ok && responseData.success) {
                        console.log("Google backend response:", responseData);
                        toast.success("Google Sign-In successful!");

                        // Store user data in consistent format
                        const userData = {
                          name: responseData.user?.name,
                          email: responseData.user?.email,
                          picture: responseData.user?.picture,
                          token: responseData.token,
                          loginTime: new Date().toISOString(),
                          googleId: responseData.user?.googleId,
                        };

                        localStorage.setItem("user", JSON.stringify(userData));
                        localStorage.setItem("authToken", responseData.token);

                        // Redirect if a saved path exists
                        const redirectPath = sessionStorage.getItem("redirectAfterLogin");
                        if (redirectPath) {
                          sessionStorage.removeItem("redirectAfterLogin");
                          navigate(redirectPath);
                        } else {
                          navigate("/"); // default to home
                        }
                      } else {
                        toast.error(responseData.error || "Google login failed");
                      }
                    } catch (err) {
                      console.error("Google Sign-In error:", err);
                      toast.error("Google Sign-In failed");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  onReject={(err) => {
                    toast.error("Google Sign-In failed");
                    console.error(err);
                  }}
                >

                  <button className="flex items-center gap-3 bg-white border px-6 py-2 rounded-lg shadow hover:shadow-lg transition-shadow">
                    <FcGoogle size={24} />
                    <span className="text-gray-700">Sign in with Google</span>
                  </button>
                </LoginSocialGoogle>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;