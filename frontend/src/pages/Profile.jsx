import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  User,
  Mail,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sliders,
  Sparkles,
  Save,
} from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();

  // Personal info state
  const [name, setName] = useState(user?.name || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Interview preferences state (persisted locally)
  const [targetRole, setTargetRole] = useState(
    () => localStorage.getItem("ai_coach_pref_role") || "Full Stack Engineer"
  );
  const [defaultDifficulty, setDefaultDifficulty] = useState(
    () => localStorage.getItem("ai_coach_pref_difficulty") || "Intermediate"
  );
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess("");
    setProfileError("");

    try {
      const res = await api.put("/auth/profile", { name });
      if (res.data?.success) {
        if (updateUser) {
          updateUser({ name: res.data.user.name });
        }
        setProfileSuccess("Profile updated successfully!");
        setTimeout(() => setProfileSuccess(""), 4000);
      }
    } catch (err) {
      setProfileError(
        err.response?.data?.message || err.message || "Failed to update profile."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess("");
    setPasswordError("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSuccess(""), 4000);
      }
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
          err.message ||
          "Failed to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handlePreferencesSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("ai_coach_pref_role", targetRole);
    localStorage.setItem("ai_coach_pref_difficulty", defaultDifficulty);
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-teal-400 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-indigo-500/30">
          {user?.name ? user.name[0].toUpperCase() : "U"}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Candidate Account</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {user?.name || "Candidate"}
          </h1>
          <p className="text-sm text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-2">
            <Mail className="w-4 h-4 text-slate-500" />
            <span>{user?.email}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Personal Details Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              <p className="text-xs text-slate-400">
                Update your name and candidate identification
              </p>
            </div>
          </div>

          {profileSuccess && (
            <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}
          {profileError && (
            <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-400 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Account email is permanent and used for interview history verification.
              </p>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? "Saving Changes..." : "Save Profile"}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security & Password</h2>
              <p className="text-xs text-slate-400">
                Keep your account secure with a strong password
              </p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}
          {passwordError && (
            <div className="flex items-center space-x-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/30 transition-all disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4" />
              <span>{passwordSaving ? "Updating Password..." : "Update Password"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Target Interview Preferences Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Default Interview Preferences</h2>
            <p className="text-xs text-slate-400">
              Customize default role and difficulty auto-selected for new mock sessions
            </p>
          </div>
        </div>

        {prefSaved && (
          <div className="flex items-center space-x-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Interview preferences saved!</span>
          </div>
        )}

        <form onSubmit={handlePreferencesSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Preferred Target Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Briefcase className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, DevOps Engineer"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Will pre-fill the job role field when setting up new interview drills.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Default Difficulty Level
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Sparkles className="w-4 h-4" />
              </div>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="Beginner">Beginner (Entry-level fundamentals)</option>
                <option value="Intermediate">Intermediate (Mid-level architectural)</option>
                <option value="Advanced">Advanced (Senior / Staff level deep dives)</option>
              </select>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Controls question rigor and rubric depth across mock simulations.
            </p>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-semibold shadow-md shadow-purple-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
