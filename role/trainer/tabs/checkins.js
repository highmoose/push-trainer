"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  FileText,
  Camera,
  Send,
  Filter,
  Eye,
  BarChart3,
  Repeat,
} from "lucide-react";
import { useCheckIns } from "@/hooks/checkins/useCheckIns";
import { useClients } from "@/hooks/useClients";

export default function CheckIns() {
  const {
    checkIns,
    schedules,
    loading,
    error,
    pendingCount,
    createCheckIn,
    updateCheckIn,
    deleteCheckIn,
    createSchedule,
    deactivateSchedule,
    fetchCheckIns,
  } = useCheckIns();

  const { clients } = useClients();

  const [activeTab, setActiveTab] = useState("checkins");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingCheckIn, setEditingCheckIn] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  // Filter check-ins based on selected filters
  const filteredCheckIns = checkIns.filter((checkIn) => {
    const statusMatch =
      statusFilter === "all" || checkIn.status === statusFilter;
    const clientMatch =
      clientFilter === "all" || checkIn.client_id.toString() === clientFilter;
    return statusMatch && clientMatch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-white">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold">Check-Ins</h1>
          <p className="text-zinc-400 mt-1">
            Manage client check-ins and schedules
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Repeat size={18} />
            Schedule Check-In
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Create Check-In
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab("checkins")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "checkins"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Check-Ins
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("schedules")}
          className={`px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === "schedules"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Schedules
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "checkins" && (
          <div>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-zinc-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-zinc-400" />
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Check-ins List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCheckIns.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No check-ins found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredCheckIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(checkIn.status)}
                          <h3 className="font-semibold">
                            {checkIn.client?.name || "Unknown Client"}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              checkIn.status
                            )}`}
                          >
                            {checkIn.status}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-400 mb-2">
                          <p>Scheduled: {formatDate(checkIn.scheduled_date)}</p>
                          {checkIn.submitted_at && (
                            <p>Submitted: {formatDate(checkIn.submitted_at)}</p>
                          )}
                        </div>
                        {checkIn.notes && (
                          <p className="text-sm text-zinc-300 italic">
                            "{checkIn.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCheckIn(checkIn)}
                          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteCheckIn(checkIn.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "schedules" && (
          <div>
            {/* Schedules List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12">
                <Repeat size={48} className="text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-400">No recurring schedules found</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Repeat className="w-4 h-4 text-blue-500" />
                          <h3 className="font-semibold">
                            {schedule.client?.name || "Unknown Client"}
                          </h3>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {schedule.frequency_type}
                          </span>
                        </div>
                        <div className="text-sm text-zinc-400 mb-2">
                          <p>
                            Every {schedule.frequency_value}{" "}
                            {schedule.frequency_type}
                            {schedule.frequency_value > 1 ? "s" : ""}
                          </p>
                          {schedule.next_date && (
                            <p>Next: {formatDate(schedule.next_date)}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span>{schedule.fields?.length || 0} fields</span>
                          {schedule.photo_required && (
                            <span className="flex items-center gap-1">
                              <Camera size={12} />
                              Photos required
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => deactivateSchedule(schedule.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Check-In Modal */}
      {showCreateModal && (
        <CreateCheckInModal
          clients={clients}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createCheckIn}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleModal
          clients={clients}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={createSchedule}
        />
      )}

      {/* Edit Check-In Modal */}
      {editingCheckIn && (
        <EditCheckInModal
          checkIn={editingCheckIn}
          onClose={() => setEditingCheckIn(null)}
          onSubmit={(updates) => updateCheckIn(editingCheckIn.id, updates)}
        />
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}

// Create Check-In Modal Component
function CreateCheckInModal({ clients, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    client_id: "",
    scheduled_date: "",
    fields: [],
    photo_required: false,
    notes: "",
  });

  const [customFields, setCustomFields] = useState([
    { name: "Weight", type: "number", required: true },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({
        ...formData,
        fields: customFields,
      });
      onClose();
    } catch (error) {
      console.error("Error creating check-in:", error);
    }
  };

  const addField = () => {
    setCustomFields([
      ...customFields,
      { name: "", type: "text", required: false },
    ]);
  };

  const removeField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const updateField = (index, field) => {
    const updated = [...customFields];
    updated[index] = field;
    setCustomFields(updated);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Create Check-In Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              value={formData.client_id}
              onChange={(e) =>
                setFormData({ ...formData, client_id: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Scheduled Date
            </label>
            <input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) =>
                setFormData({ ...formData, scheduled_date: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">
                Fields to Track
              </label>
              <button
                type="button"
                onClick={addField}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                + Add Field
              </button>
            </div>
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Field name"
                  value={field.name}
                  onChange={(e) =>
                    updateField(index, { ...field, name: e.target.value })
                  }
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(index, { ...field, type: e.target.value })
                  }
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="rating">Rating</option>
                  <option value="boolean">Yes/No</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.photo_required}
                onChange={(e) =>
                  setFormData({ ...formData, photo_required: e.target.checked })
                }
                className="rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Require photos</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any notes or instructions..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white border border-zinc-600 rounded-lg hover:border-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              Create Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Schedule Modal Component (simplified for now)
function ScheduleModal({ clients, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    client_id: "",
    frequency_type: "weekly",
    frequency_value: 1,
    day_of_week: 1,
    fields: [{ name: "Weight", type: "number", required: true }],
    photo_required: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Schedule Recurring Check-In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Client</label>
            <select
              value={formData.client_id}
              onChange={(e) =>
                setFormData({ ...formData, client_id: e.target.value })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency_type}
                onChange={(e) =>
                  setFormData({ ...formData, frequency_type: e.target.value })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Every</label>
              <input
                type="number"
                min="1"
                value={formData.frequency_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency_value: parseInt(e.target.value),
                  })
                }
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.photo_required}
                onChange={(e) =>
                  setFormData({ ...formData, photo_required: e.target.checked })
                }
                className="rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">Require photos</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white border border-zinc-600 rounded-lg hover:border-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Create Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit Check-In Modal Component (simplified)
function EditCheckInModal({ checkIn, onClose, onSubmit }) {
  const [notes, setNotes] = useState(checkIn.notes || "");
  const [status, setStatus] = useState(checkIn.status);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSubmit({ notes, status });
      onClose();
    } catch (error) {
      console.error("Error updating check-in:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Edit Check-In</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Add trainer notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-white border border-zinc-600 rounded-lg hover:border-zinc-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Update Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
