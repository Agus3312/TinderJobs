"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { User, FileText, MapPin, DollarSign, Briefcase, Globe, Check } from "lucide-react";
import { useAppStore } from "@/hooks/useStore";
import type { CandidateProfile } from "@/types/candidate";
import type { ExperienceLevel, RemotePreference } from "@/types/candidate";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function computeInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1 && parts[0]) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "");
}

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string }[] = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
];

const REMOTE_OPTIONS: { value: RemotePreference; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "On-site" },
];

// ── Shared input style ─────────────────────────────────────────────────────

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "var(--radius-sm)",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  fontFamily: "var(--font-sans), Inter, system-ui, sans-serif",
  outline: "none",
  transition: "border-color 0.15s ease",
  width: "100%",
};

const textareaBaseStyle: React.CSSProperties = {
  ...inputBaseStyle,
  minHeight: "80px",
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  color: "var(--text-secondary)",
  fontSize: "0.8125rem",
  fontWeight: 500,
  marginBottom: "0.25rem",
  display: "block",
};

const errorStyle: React.CSSProperties = {
  color: "var(--danger)",
  fontSize: "0.75rem",
  marginTop: "0.25rem",
};

// ── Component ──────────────────────────────────────────────────────────────

export function CandidateProfileForm() {
  const userId = useAppStore((s) => s.userId);
  const existingProfile = useAppStore((s) => s.candidateProfile);
  const setCandidateProfile = useAppStore((s) => s.setCandidateProfile);

  // Form state
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>("mid");
  const [location, setLocation] = useState("");
  const [remotePreference, setRemotePreference] = useState<RemotePreference>("remote");
  const [salaryExpectation, setSalaryExpectation] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success message
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate from existing profile on mount
  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.fullName ?? "");
      setHeadline(existingProfile.headline ?? "");
      setSkillsInput(existingProfile.skills?.join(", ") ?? "");
      setExperienceLevel(existingProfile.experienceLevel ?? "mid");
      setLocation(existingProfile.location ?? "");
      setRemotePreference(existingProfile.remotePreference ?? "remote");
      setSalaryExpectation(existingProfile.salaryExpectation ?? "");
    }
  }, []); // only on mount

  // Auto-hide success message
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const validate = useCallback((): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = "Full name is required";
    if (!headline.trim()) errs.headline = "Headline is required";
    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (skills.length === 0) errs.skills = "At least one skill is required";
    if (!location.trim()) errs.location = "Location is required";
    if (salaryExpectation.trim() && !/^[0-9]+k?$/i.test(salaryExpectation.trim())) {
      errs.salaryExpectation = "Enter a number (e.g. 90000 or 90k)";
    }
    return errs;
  }, [fullName, headline, skillsInput, location, salaryExpectation]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});

      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const profile: CandidateProfile = {
        id: existingProfile?.id ?? generateId(),
        userId: userId ?? generateId(),
        fullName: fullName.trim(),
        headline: headline.trim(),
        skills: skillsArray,
        experienceLevel,
        location: location.trim(),
        remotePreference,
        salaryExpectation: salaryExpectation.trim() || undefined,
        avatarInitials: existingProfile?.avatarInitials ?? computeInitials(fullName),
      };

      setCandidateProfile(profile);
      setShowSuccess(true);
    },
    [
      validate,
      skillsInput,
      existingProfile,
      userId,
      fullName,
      headline,
      experienceLevel,
      location,
      remotePreference,
      salaryExpectation,
      setCandidateProfile,
    ],
  );

  // Focus accent handler
  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--accent)";
  };

  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const fieldName = e.currentTarget.getAttribute("data-field");
    if (fieldName && errors[fieldName]) {
      e.currentTarget.style.borderColor = "var(--danger)";
    } else {
      e.currentTarget.style.borderColor = "var(--border)";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto px-4 py-8">
      {/* Success banner */}
      {showSuccess && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm"
          style={{
            backgroundColor: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            color: "var(--accent)",
          }}
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Profile saved!</span>
        </div>
      )}

      {/* fullName */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-fullName" style={labelStyle}>Full Name *</label>
        <input
          id="cf-fullName"
          data-field="fullName"
          type="text"
          placeholder="e.g. Elena Rodríguez"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.fullName ? "var(--danger)" : undefined,
          }}
        />
        {errors.fullName && <span style={errorStyle}>{errors.fullName}</span>}
      </fieldset>

      {/* headline */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-headline" style={labelStyle}>Headline *</label>
        <input
          id="cf-headline"
          data-field="headline"
          type="text"
          placeholder="e.g. Senior Frontend Engineer · 7+ years building design systems"
          value={headline}
          onChange={(e) => {
            setHeadline(e.target.value);
            if (errors.headline) setErrors((prev) => ({ ...prev, headline: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.headline ? "var(--danger)" : undefined,
          }}
        />
        {errors.headline && <span style={errorStyle}>{errors.headline}</span>}
      </fieldset>

      {/* skills */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-skills" style={labelStyle}>Skills * (comma-separated)</label>
        <input
          id="cf-skills"
          data-field="skills"
          type="text"
          placeholder="e.g. React, TypeScript, Next.js, Figma"
          value={skillsInput}
          onChange={(e) => {
            setSkillsInput(e.target.value);
            if (errors.skills) setErrors((prev) => ({ ...prev, skills: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.skills ? "var(--danger)" : undefined,
          }}
        />
        {errors.skills && <span style={errorStyle}>{errors.skills}</span>}
      </fieldset>

      {/* experienceLevel */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-experienceLevel" style={labelStyle}>Experience Level</label>
        <select
          id="cf-experienceLevel"
          data-field="experienceLevel"
          value={experienceLevel}
          onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            paddingRight: "2rem",
          }}
        >
          {EXPERIENCE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </fieldset>

      {/* location */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-location" style={labelStyle}>Location *</label>
        <input
          id="cf-location"
          data-field="location"
          type="text"
          placeholder="e.g. Barcelona, Spain"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            if (errors.location) setErrors((prev) => ({ ...prev, location: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.location ? "var(--danger)" : undefined,
          }}
        />
        {errors.location && <span style={errorStyle}>{errors.location}</span>}
      </fieldset>

      {/* remotePreference */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-remotePref" style={labelStyle}>Remote Preference</label>
        <select
          id="cf-remotePref"
          data-field="remotePreference"
          value={remotePreference}
          onChange={(e) => setRemotePreference(e.target.value as RemotePreference)}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            paddingRight: "2rem",
          }}
        >
          {REMOTE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </fieldset>

      {/* salaryExpectation */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cf-salary" style={labelStyle}>Salary Expectation (optional)</label>
        <input
          id="cf-salary"
          data-field="salaryExpectation"
          type="text"
          inputMode="numeric"
          pattern="[0-9kK]*"
          placeholder="e.g. 90000"
          value={salaryExpectation}
          onChange={(e) => {
            // Only allow digits and 'k'
            const val = e.target.value.replace(/[^0-9kK]/g, "");
            setSalaryExpectation(val);
            if (errors.salaryExpectation) setErrors((prev) => ({ ...prev, salaryExpectation: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.salaryExpectation ? "var(--danger)" : undefined,
          }}
        />
        {errors.salaryExpectation && <span style={errorStyle}>{errors.salaryExpectation}</span>}
      </fieldset>

      {/* Submit */}
      <button
        type="submit"
        className="mt-2 py-2.5 px-6 rounded-md text-sm font-semibold transition-opacity duration-150 active:scale-[0.98] cursor-pointer"
        style={{
          backgroundColor: "var(--accent)",
          color: "#000",
          fontFamily: "var(--font-mono), JetBrains Mono, monospace",
          border: "none",
        }}
      >
        Save Profile
      </button>
    </form>
  );
}

export default CandidateProfileForm;
