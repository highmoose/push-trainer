import { useState, useCallback, useEffect } from "react";
import axios from "@/lib/axios";
import { useSelector } from "react-redux";

export const useTeamManagement = () => {
  const user = useSelector((state) => state.auth.user);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/teams/my-team");
      setTeam(response.data.team);
      setUserRole(response.data.user_role);
    } catch (err) {
      if (err.response?.status === 404) {
        // User is not part of any team
        setTeam(null);
        setUserRole(null);
      } else {
        setError(err.response?.data?.message || "Failed to fetch team");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const createTeam = useCallback(async (teamData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/teams", teamData);
      setTeam(response.data.team);
      setUserRole("owner");
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create team");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTeam = useCallback(async (teamId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(`/api/teams/${teamId}`, updates);
      setTeam(response.data.team);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update team");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inviteMember = useCallback(
    async (teamId, inviteData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          `/api/teams/${teamId}/invite`,
          inviteData
        );
        // Refresh team data to get updated members/invitations
        await fetchTeam();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || "Failed to invite member");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTeam]
  );

  const updateMember = useCallback(async (teamId, memberId, updates) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.put(
        `/api/teams/${teamId}/members/${memberId}`,
        updates
      );
      // Update team state optimistically
      setTeam((prev) => ({
        ...prev,
        members: prev.members.map((member) =>
          member.id === memberId ? { ...member, ...updates } : member
        ),
      }));
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeMember = useCallback(async (teamId, memberId) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/teams/${teamId}/members/${memberId}`);
      // Update team state optimistically
      setTeam((prev) => ({
        ...prev,
        members: prev.members.filter((member) => member.id !== memberId),
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove member");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const leaveTeam = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`/api/teams/${teamId}/leave`);
      setTeam(null);
      setUserRole(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave team");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTeam = useCallback(async (teamId) => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`/api/teams/${teamId}`);
      setTeam(null);
      setUserRole(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete team");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const acceptInvitation = useCallback(async (token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `/api/teams/invitations/${token}/accept`
      );
      setTeam(response.data.team);
      setUserRole(response.data.user_role);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept invitation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const declineInvitation = useCallback(async (token) => {
    setLoading(true);
    setError(null);

    try {
      await axios.post(`/api/teams/invitations/${token}/decline`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to decline invitation");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTeam();
    }
  }, [user, fetchTeam]);

  return {
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
    acceptInvitation,
    declineInvitation,
    fetchTeam,
  };
};
