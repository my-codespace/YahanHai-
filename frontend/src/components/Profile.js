import React, { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile } from "../api/index";

const AVATAR_CHOICES = [
  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  "https://cdn-icons-png.flaticon.com/512/1946/1946429.png",
  "https://cdn-icons-png.flaticon.com/512/1828/1828843.png",
  "https://cdn-icons-png.flaticon.com/512/616/616408.png",
];

export default function Profile({ userId, onClose }) {
  const [profile, setProfile] = useState({ name: "", avatarUrl: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserProfile(userId)
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Could not load profile");
        setLoading(false);
      });
  }, [userId]);

  const handleSave = () => {
    setSaving(true);
    updateUserProfile(userId, profile)
      .then(() => {
        setSaving(false);
        if (onClose) onClose();
      })
      .catch(() => {
        setError("Could not save profile");
        setSaving(false);
      });
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 8,
        padding: 24,
        maxWidth: 350,
        margin: "40px auto",
        boxShadow: "0 2px 16px #0001",
      }}
    >
      <h2>Edit Profile</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <label>
              Name:
              <input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
                style={{ marginLeft: 8, padding: 4 }}
              />
            </label>
          </div>
          <div>
            <div>Choose Avatar:</div>
            <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
              {AVATAR_CHOICES.map((url) => (
                <img
                  key={url}
                  src={url}
                  alt="avatar"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border:
                      profile.avatarUrl === url
                        ? "3px solid #1976d2"
                        : "2px solid #ccc",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setProfile((p) => ({ ...p, avatarUrl: url }))
                  }
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              marginTop: 16,
              background: "#1976d2",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={onClose}
            style={{
              marginLeft: 12,
              background: "#eee",
              color: "#333",
              border: "none",
              padding: "8px 16px",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
}
