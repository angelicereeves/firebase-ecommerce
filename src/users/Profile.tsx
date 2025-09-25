// src/users/Profile.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {  doc,  getDoc,  setDoc,  updateDoc,  deleteDoc,  serverTimestamp,  type Timestamp,} from "firebase/firestore";

interface UserDoc {
  uid: string;
  email: string;
  name?: string;
  address?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Load current user's profile document (if present)
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      setMsg(null);

      const u = auth.currentUser;
      if (!u) {
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as UserDoc;
          setProfile(data);
          setName(data.name ?? "");
          setAddress(data.address ?? "");
        } else {
          // No doc yet — show email and allow saving to create one
          setProfile({ uid: u.uid, email: u.email ?? "" });
        }
      } catch (e: unknown) {
        const message =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: string }).message)
            : "Failed to load profile.";
        setErr(message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Save/update profile (creates doc if it doesn't exist)
  const handleSave = async () => {
    const u = auth.currentUser;
    if (!u) return;

    setErr(null);
    setMsg(null);

    if (!name.trim() || !address.trim()) {
      setErr("Please enter both name and address.");
      return;
    }

    try {
      setSaving(true);
      const ref = doc(db, "users", u.uid);

      // Use update if doc exists, otherwise set to create
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, {
          name: name.trim(),
          address: address.trim(),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(ref, {
          uid: u.uid,
          email: u.email ?? "",
          name: name.trim(),
          address: address.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setMsg("Profile saved.");
      setProfile((p) =>
        p ? { ...p, name: name.trim(), address: address.trim() } : p
      );
    } catch (e: unknown) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to save profile.";
      setErr(message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Firestore user data + Auth account
  const handleDeleteAccount = async () => {
    const u = auth.currentUser;
    if (!u) return;

    const ok = confirm(
      "This will permanently delete your account and profile data. Continue?"
    );
    if (!ok) return;

    setErr(null);
    setMsg(null);

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "users", u.uid));
      await u.delete();
      alert("Your account has been deleted.");
    } catch (e: unknown) {
      const code =
        e && typeof e === "object" && "code" in e
          ? String((e as { code?: string }).code)
          : undefined;
      const message =
        code === "auth/requires-recent-login"
          ? "For security, please log in again and then delete your account."
          : e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to delete account.";
      setErr(message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">My Profile</h2>
          <p className="auth-subtitle">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!auth.currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">My Profile</h2>
          <p className="auth-subtitle">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  const email = profile?.email ?? auth.currentUser.email ?? "";

  return (
    <div className="auth-container">
      <div className="auth-card auth-card--left">
        <h2 className="auth-title">My Profile</h2>
        <p className="auth-subtitle">Update your personal information.</p>

        <div className="auth-form">
          <label className="auth-label">Email</label>
          <input
            className="auth-input"
            value={email}
            readOnly
            aria-readonly="true"
          />

          <label htmlFor="name" className="auth-label">
            Full name
          </label>
          <input
            id="name"
            className="auth-input"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="address" className="auth-label">
            Shipping address
          </label>
          <input
            id="address"
            className="auth-input"
            placeholder="123 Main St, City, ST"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="btn-row">
            <button
              className="auth-btn primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            <button
              className="auth-btn danger"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </div>

          {msg && <p className="auth-feedback auth-feedback--ok">{msg}</p>}
          {err && <p className="auth-feedback auth-feedback--err">{err}</p>}
        </div>
      </div>
    </div>
  );
};


//export
export default Profile;
