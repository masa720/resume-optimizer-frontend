"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProfile, updateProfile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Message = { type: "success" | "error"; text: string } | null;

const MessageText = ({ message }: { message: Message }) => {
  if (!message) return null;
  return (
    <p
      className={`text-[13px] ${
        message.type === "success" ? "text-emerald-600" : "text-destructive"
      }`}
    >
      {message.text}
    </p>
  );
};

const SettingsPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);

  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState<Message>(null);

  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState<Message>(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<Message>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setEmail(data.user.email);
      }

      try {
        const profile = await fetchProfile();
        setUsername(profile.username);
      } catch {
        // Profile not found
      }

      setLoading(false);
    };
    load();
  }, []);

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    setSavingUsername(true);
    setUsernameMsg(null);

    try {
      const profile = await updateProfile(trimmed);
      setUsername(profile.username);
      setUsernameMsg({ type: "success", text: "Username updated." });
      window.dispatchEvent(
        new CustomEvent("profile-updated", {
          detail: { username: profile.username },
        }),
      );
    } catch {
      setUsernameMsg({ type: "error", text: "Failed to update username." });
    } finally {
      setSavingUsername(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    setSavingEmail(true);
    setEmailMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ email: trimmed });
      if (error) throw error;
      setEmailMsg({
        type: "success",
        text: "Confirmation email sent. Please check your inbox.",
      });
    } catch {
      setEmailMsg({ type: "error", text: "Failed to update email." });
    } finally {
      setSavingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);

    try {
      const supabase = createClient();

      // Verify current password by re-signing in
      const { data: userData } = await supabase.auth.getUser();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.user?.email ?? "",
        password: currentPassword,
      });
      if (signInError) {
        setPasswordMsg({
          type: "error",
          text: "Current password is incorrect.",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMsg({ type: "success", text: "Password updated." });
    } catch {
      setPasswordMsg({ type: "error", text: "Failed to update password." });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const labelClass = "text-[13px] font-medium text-foreground";

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>

      {/* Username */}
      <form
        onSubmit={handleUsernameSubmit}
        className="card-surface space-y-4 p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Username</h2>
        <div className="space-y-1.5">
          <label htmlFor="username" className={labelClass}>
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="h-10"
          />
        </div>
        <MessageText message={usernameMsg} />
        <Button type="submit" disabled={savingUsername || !username.trim()}>
          {savingUsername ? "Saving..." : "Save"}
        </Button>
      </form>

      {/* Email */}
      <form
        onSubmit={handleEmailSubmit}
        className="card-surface space-y-4 p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">
          Email Address
        </h2>
        <div className="space-y-1.5">
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-10"
          />
        </div>
        <MessageText message={emailMsg} />
        <Button type="submit" disabled={savingEmail || !email.trim()}>
          {savingEmail ? "Saving..." : "Update Email"}
        </Button>
      </form>

      {/* Password */}
      <form
        onSubmit={handlePasswordSubmit}
        className="card-surface space-y-4 p-6"
      >
        <h2 className="text-sm font-semibold text-foreground">Password</h2>
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className={labelClass}>
            Current Password
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className={labelClass}>
            New Password
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm New Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="h-10"
          />
        </div>
        <MessageText message={passwordMsg} />
        <Button
          type="submit"
          disabled={
            savingPassword || !currentPassword || !newPassword || !confirmPassword
          }
        >
          {savingPassword ? "Saving..." : "Update Password"}
        </Button>
      </form>
    </div>
  );
};

export default SettingsPage;
