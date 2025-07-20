"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Settings,
  Mail,
  Shield,
  Crown,
  UserCheck,
  UserMinus,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  BarChart3,
  DollarSign,
  Calendar,
  Activity,
  AlertCircle,
  Clock,
  Check,
  X,
  Send,
} from "lucide-react";
import { useTeamManagement } from "@/hooks/team/useTeamManagement";

export default function TeamManagement() {
  const {
    team,
    loading,
    error,
    userRole,
    createTeam,
    updateTeam,
    inviteMember,
    updateMember,
    removeMember,
    leaveTeam,
    deleteTeam,
    fetchTeam,
  } = useTeamManagement();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchTeam}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!team) {
    return <NoTeamState onCreateTeam={() => setShowCreateModal(true)} />;
  }

  return (
    <div className="w-full h-full bg-zinc-950 text-white overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                <p className="text-zinc-400">
                  {team.description || "Team collaboration workspace"}
                </p>
              </div>
              {userRole === "owner" && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600/20 border border-yellow-600/30 rounded-lg">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-yellow-400 font-medium">
                    Owner
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {userRole === "owner" && (
                <>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    Invite Member
                  </button>
                  <button
                    onClick={() => setShowSettingsModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                </>
              )}
              {userRole !== "owner" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to leave this team?")) {
                      leaveTeam();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <UserMinus className="h-4 w-4" />
                  Leave Team
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Team Stats */}
        <div className="p-6 border-b border-zinc-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Team Members"
              value={team.stats?.total_members || 0}
              color="blue"
            />
            <StatCard
              icon={Activity}
              label="Total Clients"
              value={team.stats?.total_clients || 0}
              color="green"
            />
            <StatCard
              icon={Calendar}
              label="Active Sessions"
              value={team.stats?.active_sessions || 0}
              color="purple"
            />
            <StatCard
              icon={Mail}
              label="Pending Invites"
              value={team.stats?.pending_invitations || 0}
              color="yellow"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
            {/* Team Members */}
            <div className="border-r border-zinc-800 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Team Members
                </h2>
                <span className="text-sm text-zinc-400">
                  {(team.members?.length || 0) + 1} members
                </span>
              </div>

              <div className="space-y-4">
                {/* Team Owner */}
                <MemberCard
                  member={{
                    id: team.owner?.id,
                    trainer: team.owner,
                    role: "owner",
                    status: "active",
                    commission_rate: 0,
                    joined_at: team.created_at,
                  }}
                  isOwner={true}
                  userRole={userRole}
                  onEdit={null}
                  onRemove={null}
                />

                {/* Team Members */}
                {team.members?.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isOwner={false}
                    userRole={userRole}
                    onEdit={() => setEditingMember(member)}
                    onRemove={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove ${member.trainer?.name} from the team?`
                        )
                      ) {
                        removeMember(member.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pending Invitations */}
            <div className="p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Pending Invitations
                </h2>
                <span className="text-sm text-zinc-400">
                  {team.pending_invitations?.length || 0} pending
                </span>
              </div>

              <div className="space-y-4">
                {team.pending_invitations?.length > 0 ? (
                  team.pending_invitations.map((invitation) => (
                    <InvitationCard
                      key={invitation.id}
                      invitation={invitation}
                      userRole={userRole}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No pending invitations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={createTeam}
        />
      )}

      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onSubmit={inviteMember}
        />
      )}

      {showSettingsModal && (
        <TeamSettingsModal
          team={team}
          onClose={() => setShowSettingsModal(false)}
          onUpdate={updateTeam}
          onDelete={() => {
            if (
              confirm(
                "Are you sure you want to delete this team? This action cannot be undone."
              )
            ) {
              deleteTeam();
              setShowSettingsModal(false);
            }
          }}
        />
      )}

      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSubmit={(data) => {
            updateMember(editingMember.id, data);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
}

// Component: No Team State
function NoTeamState({ onCreateTeam }) {
  return (
    <div className="flex items-center justify-center h-full bg-zinc-950">
      <div className="text-center max-w-md">
        <div className="p-4 bg-zinc-900 rounded-full w-fit mx-auto mb-6">
          <Users className="h-16 w-16 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Create Your Team</h2>
        <p className="text-zinc-400 mb-8">
          Collaborate with other trainers, share clients, and manage your
          fitness business together.
        </p>
        <button
          onClick={onCreateTeam}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mx-auto"
        >
          <Plus className="h-5 w-5" />
          Create Team
        </button>
      </div>
    </div>
  );
}

// Component: Stat Card
function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-400/20 border-blue-400/30",
    green: "text-green-400 bg-green-400/20 border-green-400/30",
    purple: "text-purple-400 bg-purple-400/20 border-purple-400/30",
    yellow: "text-yellow-400 bg-yellow-400/20 border-yellow-400/30",
  };

  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

// Component: Member Card
function MemberCard({ member, isOwner, userRole, onEdit, onRemove }) {
  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case "manager":
        return <Shield className="h-4 w-4 text-blue-400" />;
      default:
        return <UserCheck className="h-4 w-4 text-green-400" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "owner":
        return "text-yellow-400 bg-yellow-400/20";
      case "manager":
        return "text-blue-400 bg-blue-400/20";
      case "senior_trainer":
        return "text-purple-400 bg-purple-400/20";
      case "trainer":
        return "text-green-400 bg-green-400/20";
      case "assistant":
        return "text-orange-400 bg-orange-400/20";
      default:
        return "text-zinc-400 bg-zinc-400/20";
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {member.trainer?.name?.charAt(0).toUpperCase() || "?"}
          </div>
          <div>
            <h3 className="font-semibold text-white">
              {member.trainer?.name || "Unknown"}
            </h3>
            <p className="text-sm text-zinc-400">{member.trainer?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
              member.role
            )}`}
          >
            {getRoleIcon(member.role)}
            {member.role.replace("_", " ")}
          </div>
          {userRole === "owner" && !isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={onRemove}
                className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      {!isOwner && member.commission_rate > 0 && (
        <div className="mt-3 pt-3 border-t border-zinc-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-400">Commission Rate</span>
            <span className="text-white font-medium">
              {member.commission_rate}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Component: Invitation Card
function InvitationCard({ invitation, userRole }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-400/20";
      case "expired":
        return "text-red-400 bg-red-400/20";
      default:
        return "text-zinc-400 bg-zinc-400/20";
    }
  };

  const copyInviteLink = () => {
    if (invitation.invitation_token) {
      const url = `${window.location.origin}/team/invitation/${invitation.invitation_token}`;
      navigator.clipboard.writeText(url);
      // You could add a toast notification here
    }
  };

  return (
    <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">
            {invitation.name || invitation.email}
          </h3>
          <p className="text-sm text-zinc-400">{invitation.email}</p>
        </div>
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            invitation.status
          )}`}
        >
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {invitation.status}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-400">
          Role: <span className="text-white">{invitation.role}</span>
        </div>
        {userRole === "owner" && invitation.status === "pending" && (
          <button
            onClick={copyInviteLink}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
          >
            <Copy className="h-3 w-3" />
            Copy Link
          </button>
        )}
      </div>
    </div>
  );
}

// Modal Components would go here - CreateTeamModal, InviteMemberModal, etc.
// For brevity, I'll create these as separate components

function CreateTeamModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to create team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Create Team</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Enter team name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Describe your team..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Team
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteMemberModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "trainer",
    commission_rate: 30,
    permissions: [],
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePermissions = [
    { id: "invite_members", label: "Invite Members" },
    { id: "manage_clients", label: "Manage Clients" },
    { id: "manage_schedules", label: "Manage Schedules" },
    { id: "view_team_stats", label: "View Team Stats" },
    { id: "assign_sessions", label: "Assign Sessions" },
    { id: "manage_plans", label: "Manage Plans" },
    { id: "view_team_revenue", label: "View Team Revenue" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to invite member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionId) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter((p) => p !== permissionId)
        : [...formData.permissions, permissionId],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Invite Team Member
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="trainer@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="Trainer name"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="trainer">Trainer</option>
                <option value="senior_trainer">Senior Trainer</option>
                <option value="manager">Manager</option>
                <option value="assistant">Assistant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_rate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded border border-zinc-700 cursor-pointer hover:bg-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-zinc-300">
                    {permission.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Message (Optional)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Welcome to our team! We're excited to work with you."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Invitation
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TeamSettingsModal({ team, onClose, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    name: team.name || "",
    description: team.description || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md border border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Team Settings</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check className="h-4 w-4" />
              )}
              Update
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        <div className="mt-6 pt-6 border-t border-zinc-700">
          <h3 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h3>
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete Team
          </button>
        </div>
      </div>
    </div>
  );
}

function EditMemberModal({ member, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    role: member.role || "trainer",
    commission_rate: member.commission_rate || 30,
    permissions: member.permissions || [],
    status: member.status || "active",
    notes: member.notes || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availablePermissions = [
    { id: "invite_members", label: "Invite Members" },
    { id: "manage_clients", label: "Manage Clients" },
    { id: "manage_schedules", label: "Manage Schedules" },
    { id: "view_team_stats", label: "View Team Stats" },
    { id: "assign_sessions", label: "Assign Sessions" },
    { id: "manage_plans", label: "Manage Plans" },
    { id: "view_team_revenue", label: "View Team Revenue" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permissionId) => {
    setFormData({
      ...formData,
      permissions: formData.permissions.includes(permissionId)
        ? formData.permissions.filter((p) => p !== permissionId)
        : [...formData.permissions, permissionId],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Edit Member: {member.trainer?.name}
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="trainer">Trainer</option>
                <option value="senior_trainer">Senior Trainer</option>
                <option value="manager">Manager</option>
                <option value="assistant">Assistant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Commission Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.commission_rate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    commission_rate: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <label
                  key={permission.id}
                  className="flex items-center gap-2 p-2 bg-zinc-800/50 rounded border border-zinc-700 cursor-pointer hover:bg-zinc-800"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => togglePermission(permission.id)}
                    className="rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-zinc-300">
                    {permission.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full p-2 bg-zinc-800 text-white rounded border border-zinc-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="Add notes about this team member..."
              rows={3}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Check className="h-4 w-4" />
              )}
              Update Member
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
