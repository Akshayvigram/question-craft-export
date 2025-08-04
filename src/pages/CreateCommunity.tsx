
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Plus, X, Mail, User, Shield } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
}

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [communityName, setCommunityName] = useState("");
  const [communityDescription, setCommunityDescription] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMember = () => {
    if (!memberName || !memberEmail || !memberRole) {
      toast.error("Please fill in all member fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(memberEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    const existingMember = members.find(member => member.email === memberEmail);
    if (existingMember) {
      toast.error("Member with this email already exists");
      return;
    }

    const newMember: Member = {
      id: Date.now().toString(),
      name: memberName,
      email: memberEmail,
      role: memberRole,
    };

    setMembers([...members, newMember]);
    setMemberName("");
    setMemberEmail("");
    setMemberRole("");
    toast.success("Member added successfully");
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(member => member.id !== id));
    toast.success("Member removed");
  };

  const editMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      setMemberName(member.name);
      setMemberEmail(member.email);
      setMemberRole(member.role);
      removeMember(id);
    }
  };

  const handleCreateCommunity = async () => {
    if (!communityName || !communityDescription) {
      toast.error("Please fill in community name and description");
      return;
    }

    if (members.length === 0) {
      toast.error("Please add at least one member to the community");
      return;
    }

    setIsLoading(true);

    try {
      // Mock API call - in real app this would create the community
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success("Community created successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Failed to create community. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-primary hover:text-accent transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </Link>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Community</h1>
            <p className="text-muted-foreground">Build and manage your educational community</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Community Details */}
          <Card className="bg-gradient-card border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Community Details</CardTitle>
              <CardDescription>
                Set up your community's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name</Label>
                <Input
                  id="name"
                  placeholder="Enter community name"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your community's purpose and goals"
                  value={communityDescription}
                  onChange={(e) => setCommunityDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Members */}
          <Card className="bg-gradient-card border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Add Members</CardTitle>
              <CardDescription>
                Invite members to join your community
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Name</Label>
                <Input
                  id="member-name"
                  placeholder="Enter member name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="Enter member email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-role">Role</Label>
                <Select value={memberRole} onValueChange={setMemberRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={addMember}
                className="w-full bg-gradient-primary hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        {members.length > 0 && (
          <Card className="mt-8 bg-gradient-card border-accent/20 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Community Members ({members.length})</CardTitle>
              <CardDescription>
                Manage your community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{member.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Shield className="w-3 h-3" />
                            <span className="capitalize">{member.role}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editMember(member.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Button */}
        <div className="mt-8 text-center">
          <Button
            onClick={handleCreateCommunity}
            disabled={isLoading}
            className="px-12 py-3 bg-gradient-primary hover:opacity-90 text-lg"
          >
            {isLoading ? "Creating Community..." : "Create Community"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;
