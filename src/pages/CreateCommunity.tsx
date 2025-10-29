import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Users, Pencil, Trash, Lock, Unlock } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  creditsUsed: number;
  email: string;
}

const CreateTeam = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewDashboard, setViewDashboard] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "student",
    email: "",
  });
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [memberToDeleteId, setMemberToDeleteId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitMember = () => {
    const { name, role, email } = formData;

    if (!name || !role || !email) {
      toast.error("All fields are required.");
      return;
    }

    if (editingMemberId) {
      setMembers((prev) =>
        prev.map((member) =>
          member.id === editingMemberId ? { ...member, name, role, email } : member
        )
      );
      toast.success("Member updated successfully!");
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        name,
        role,
        email,
        isActive: true,
        creditsUsed: Math.floor(Math.random() * 100),
      };
      setMembers([...members, newMember]);
      toast.success("Invitation sent successfully!");
    }

    setFormData({ name: "", role: "student", email: "" });
    setEditingMemberId(null);
    setShowForm(false);
  };

  const handleEditMember = (member: Member) => {
    setFormData({ name: member.name, role: member.role, email: member.email });
    setEditingMemberId(member.id);
    setShowForm(true);
  };

  const handleDeleteMember = (id: string) => {
    setMemberToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteMember = () => {
    if (memberToDeleteId) {
      setMembers((prev) => prev.filter((member) => member.id !== memberToDeleteId));
      toast.success("Member deleted successfully!");
    }
    setMemberToDeleteId(null);
    setShowDeleteConfirm(false);
  };

  const handleToggleActive = (id: string) => {
    setMembers((prev) =>
      prev.map((member) => {
        if (member.id === id) {
          const newStatus = !member.isActive;
          if (newStatus) {
            toast.success("Member activated successfully!");
          } else {
            toast("Member deactivated.", {
              description: "You can activate them again anytime.",
              className: "bg-yellow-100 text-yellow-800"
            });
          }
          return { ...member, isActive: newStatus };
        }
        return member;
      })
    );
  };

  const totalCredits = members.reduce(
    (acc, member) => acc + member.creditsUsed,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased text-gray-800">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm mb-6 sm:mb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
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

      {/* Main Title Section */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-primary rounded-full mb-2 sm:mb-4">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-foreground mb-1 sm:mb-2">
          Create Team
        </h1>
        <p className="text-sm sm:text-lg text-muted-foreground">
          Build and manage your educational team
        </p>
      </div>

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 px-4">
        <Button
          variant="outline"
          onClick={() => setViewDashboard(!viewDashboard)}
          className="w-full sm:w-auto px-8 py-3 text-primary hover:bg-gradient-primary hover:text-primary-foreground"
        >
          {viewDashboard ? "Hide Dashboard" : "View Dashboard"}
        </Button>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingMemberId(null);
            setFormData({ name: "", role: "student", email: "" });
          }}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-primary hover:opacity-90"
        >
          Add New Member
        </Button>
      </div>

      {/* Dashboard Section */}
      {viewDashboard && (
        <div className="max-w-6xl mx-auto mb-8 px-4">
          <Card className="rounded-xl shadow-lg border border-gray-200 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
                Team Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-extrabold text-blue-600">
                {totalCredits} <span className="text-gray-500 text-sm sm:text-base font-normal">credits used</span>
              </p>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Total credits consumed by all team members.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add/Edit Member Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative transform transition-all duration-300 scale-100 opacity-100">
            <Card className="border-none shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="text-center text-2xl sm:text-3xl font-bold text-gray-800">
                  {editingMemberId ? "Edit Member Details" : "Add New Member"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1 block">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Jane Doe"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700 mb-1 block">
                      Role
                    </Label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200 appearance-none"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1 block">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      placeholder="e.g., jane.doe@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200 text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 sm:gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMemberId(null);
                      setFormData({ name: "", role: "student", email: "" });
                    }}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-3 text-primary hover:bg-gradient-primary hover:text-primary-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitMember}
                    className="w-full sm:w-auto px-4 py-2 sm:px-8 sm:py-3 bg-gradient-primary hover:opacity-90"
                  >
                    {editingMemberId ? "Update Member" : "Send Invite"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xs rounded-xl shadow-2xl p-6 relative transform transition-all duration-300 scale-100 opacity-100 text-center">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete this member?</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setMemberToDeleteId(null);
                  setShowDeleteConfirm(false);
                }}
                className="w-full px-4 py-2 rounded-lg shadow-sm hover:bg-gray-900 transition-colors duration-200 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteMember}
                className="w-full px-4 py-2 rounded-lg shadow-md bg-red-600 text-white hover:bg-red-700 transition-all duration-300"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="max-w-6xl mx-auto mb-10 px-4">
        <Card className="rounded-xl shadow-lg border border-gray-200 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
              Current Team Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Credits Used
                    </th>
                    <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 text-sm sm:text-lg">
                        No members added yet. Click "Add New Member" to get started!
                      </td>
                    </tr>
                  ) : (
                    members.map((member, idx) => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                          {member.name}
                        </td>
                        <td className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                          {member.role}
                        </td>
                        <td className="hidden sm:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-700">
                          {member.creditsUsed}
                        </td>
                        <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-1 sm:flex-row sm:gap-2">
                            <button
                              onClick={() => handleEditMember(member)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors duration-200"
                              title="Edit Member"
                            >
                              <Pencil className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors duration-200"
                              title="Delete Member"
                            >
                              <Trash className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                            <button
                              onClick={() => handleToggleActive(member.id)}
                              className={`flex-1 sm:flex-none inline-flex items-center justify-center px-2 py-1 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-white rounded-md shadow-sm transition-colors duration-200 ${
                                member.isActive
                                  ? 'bg-gray-500 hover:bg-gray-600'
                                  : 'bg-green-600 hover:bg-green-700'
                              }`}
                              title={member.isActive ? "Deactivate Member" : "Activate Member"}
                            >
                              {member.isActive ? <Lock className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" /> : <Unlock className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />}
                              <span className="hidden sm:inline">
                                {member.isActive ? 'Deactivate' : 'Activate'}
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateTeam;