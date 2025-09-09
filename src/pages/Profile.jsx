import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { User, Mail, Edit, Save, GraduationCap, Coins, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  const [creditsUsedTotal, setCreditsUsedTotal] = useState(240);
  const [creditsUsedMonth, setCreditsUsedMonth] = useState(50);
  const monthlyLimit = 100;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setEditedUser(parsedUser);

      const savedProfilePic = localStorage.getItem(`profilePicture_${parsedUser.email}`);
      if (savedProfilePic) {
        setProfilePicture(savedProfilePic);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && user?.email) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfilePicture(reader.result);
          localStorage.setItem(`profilePicture_${user.email}`, reader.result);
          toast.success("Profile picture updated!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!editedUser.name || editedUser.name.trim() === "") {
      toast.error("Name cannot be empty.");
      return;
    }

    localStorage.setItem("user", JSON.stringify(editedUser));
    setUser(editedUser);
    setIsEditing(false);
    toast.success("Profile updated successfully!");
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img
                src="/vinathaal%20logo.png"
                alt="Vinathaal Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header section with profile picture */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Profile picture section */}
            <div className="relative w-20 h-20">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-2 border-blue-600"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white text-4xl font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || "?"}
                </div>
              )}
              {/* Profile picture upload button */}
              <label htmlFor="profile-picture-upload" className="absolute bottom-0 right-0 p-1 bg-white rounded-full border-2 border-blue-600 cursor-pointer shadow-md">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Heading and Description */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
              <p className="text-gray-500 text-lg mt-2">Manage your personal information and account settings</p>
            </div>
          </div>

          {/* User Info Card */}
          <Card className="p-6 border border-border rounded-xl bg-gradient-to-br from-white to-gray-50 text-left">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-4">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                User Information
              </CardTitle>
              <Button
                variant="outline"
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                className="border-2 border-blue-600 text-blue-600 hover:bg-gradient-primary text-sm transition-all text-foreground"
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              {/* Name */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-1">
                    Name
                  </label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={editedUser?.name || ""}
                      onChange={handleInputChange}
                      className="w-full text-lg"
                    />
                  ) : (
                    <p className="text-lg font-medium">{user.name || "N/A"}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-1">
                    Email
                  </label>
                  <p className="text-lg font-medium">{user.email || "N/A"}</p>
                  <span className="text-xs text-muted-foreground italic">
                    Email cannot be changed
                  </span>
                </div>
              </div>

              {/* University */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-lg">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-muted-foreground mb-1">
                    University / College
                  </label>
                  {isEditing ? (
                    <Input
                      name="university"
                      value={editedUser?.university || ""}
                      onChange={handleInputChange}
                      className="w-full text-lg"
                    />
                  ) : (
                    <p className="text-lg font-medium">
                      {user.university || "Not Provided"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Credits Usage Card */}
          <Card className="p-6 border border-border rounded-xl text-left">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-semibold text-gray-800">
                Credits Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Coins className="w-6 h-6 mx-auto text-blue-600 mb-2" />
                  <p className="text-sm text-gray-500">Total Used</p>
                  <p className="text-lg font-semibold text-gray-700">{creditsUsedTotal}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">This Month</p>
                  <p className="text-lg font-semibold text-gray-700">{creditsUsedMonth}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-500">
                    Remaining (Monthly)
                  </p>
                  <p className="text-lg font-semibold text-gray-700">
                    {monthlyLimit - creditsUsedMonth}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm mb-1 text-gray-500">Monthly Usage</p>
                <Progress
                  value={(creditsUsedMonth / monthlyLimit) * 100}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;