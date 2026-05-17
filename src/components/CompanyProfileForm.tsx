"use client";

import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Building2, Globe, MapPin, Users, FileText, Check } from "lucide-react";
import { useAppStore } from "@/hooks/useStore";
import type { CompanyProfile } from "@/types/company";
import type { CompanySize, RemotePolicy } from "@/types/company";

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

function isValidUrl(value: string): boolean {
  if (!value) return true; // optional field
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const SIZE_OPTIONS: { value: CompanySize; label: string }[] = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "51-200", label: "51–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1000+", label: "1,000+ employees" },
];

const REMOTE_OPTIONS: { value: RemotePolicy; label: string }[] = [
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
  minHeight: "100px",
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

export function CompanyProfileForm() {
  const userId = useAppStore((s) => s.userId);
  const existingProfile = useAppStore((s) => s.companyProfile);
  const setCompanyProfile = useAppStore((s) => s.setCompanyProfile);

  // Form state
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState<CompanySize>("11-50");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [remotePolicy, setRemotePolicy] = useState<RemotePolicy>("remote");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success message
  const [showSuccess, setShowSuccess] = useState(false);

  // Populate from existing profile on mount
  useEffect(() => {
    if (existingProfile) {
      setCompanyName(existingProfile.companyName ?? "");
      setDescription(existingProfile.description ?? "");
      setIndustry(existingProfile.industry ?? "");
      setSize(existingProfile.size ?? "11-50");
      setWebsite(existingProfile.website ?? "");
      setLocation(existingProfile.location ?? "");
      setRemotePolicy(existingProfile.remotePolicy ?? "remote");
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
    if (!companyName.trim()) errs.companyName = "Company name is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!industry.trim()) errs.industry = "Industry is required";
    if (!location.trim()) errs.location = "Location is required";
    if (website.trim() && !isValidUrl(website.trim())) {
      errs.website = "Enter a valid URL (e.g. https://example.com)";
    }
    return errs;
  }, [companyName, description, industry, location, website]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});

      const profile: CompanyProfile = {
        id: existingProfile?.id ?? generateId(),
        userId: userId ?? generateId(),
        companyName: companyName.trim(),
        description: description.trim(),
        industry: industry.trim(),
        size,
        website: website.trim() || undefined,
        location: location.trim(),
        remotePolicy,
      };

      setCompanyProfile(profile);
      setShowSuccess(true);
    },
    [
      validate,
      existingProfile,
      userId,
      companyName,
      description,
      industry,
      size,
      website,
      location,
      remotePolicy,
      setCompanyProfile,
    ],
  );

  // Focus accent handler
  const focusBorder = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    e.currentTarget.style.borderColor = "var(--accent)";
  };

  const blurBorder = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
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

      {/* companyName */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-companyName" style={labelStyle}>
          Company Name *
        </label>
        <input
          id="cp-companyName"
          data-field="companyName"
          type="text"
          placeholder="e.g. Spotify"
          value={companyName}
          onChange={(e) => {
            setCompanyName(e.target.value);
            if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.companyName ? "var(--danger)" : undefined,
          }}
        />
        {errors.companyName && <span style={errorStyle}>{errors.companyName}</span>}
      </fieldset>

      {/* description */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-description" style={labelStyle}>
          Description *
        </label>
        <textarea
          id="cp-description"
          data-field="description"
          placeholder="Tell candidates about your company, mission, and culture..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors((prev) => ({ ...prev, description: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...textareaBaseStyle,
            borderColor: errors.description ? "var(--danger)" : undefined,
          }}
        />
        {errors.description && <span style={errorStyle}>{errors.description}</span>}
      </fieldset>

      {/* industry */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-industry" style={labelStyle}>
          Industry *
        </label>
        <input
          id="cp-industry"
          data-field="industry"
          type="text"
          placeholder="e.g. Fintech / Payments"
          value={industry}
          onChange={(e) => {
            setIndustry(e.target.value);
            if (errors.industry) setErrors((prev) => ({ ...prev, industry: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.industry ? "var(--danger)" : undefined,
          }}
        />
        {errors.industry && <span style={errorStyle}>{errors.industry}</span>}
      </fieldset>

      {/* size */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-size" style={labelStyle}>
          Company Size
        </label>
        <select
          id="cp-size"
          data-field="size"
          value={size}
          onChange={(e) => setSize(e.target.value as CompanySize)}
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
          {SIZE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </fieldset>

      {/* website */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-website" style={labelStyle}>
          Website (optional)
        </label>
        <input
          id="cp-website"
          data-field="website"
          type="text"
          placeholder="e.g. https://stripe.com"
          value={website}
          onChange={(e) => {
            setWebsite(e.target.value);
            if (errors.website) setErrors((prev) => ({ ...prev, website: "" }));
          }}
          onFocus={focusBorder}
          onBlur={blurBorder}
          style={{
            ...inputBaseStyle,
            borderColor: errors.website ? "var(--danger)" : undefined,
          }}
        />
        {errors.website && <span style={errorStyle}>{errors.website}</span>}
      </fieldset>

      {/* location */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-location" style={labelStyle}>
          Location *
        </label>
        <input
          id="cp-location"
          data-field="location"
          type="text"
          placeholder="e.g. San Francisco, CA"
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

      {/* remotePolicy */}
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="cp-remotePolicy" style={labelStyle}>
          Remote Policy
        </label>
        <select
          id="cp-remotePolicy"
          data-field="remotePolicy"
          value={remotePolicy}
          onChange={(e) => setRemotePolicy(e.target.value as RemotePolicy)}
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

export default CompanyProfileForm;
