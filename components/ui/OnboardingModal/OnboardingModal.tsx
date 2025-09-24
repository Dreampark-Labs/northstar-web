"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSafePortal, useSafeBodyStyle } from "@/hooks/useSafePortal";
import styles from "../TermSelectorModal/TermSelectorModal.module.css";

type Props = {
  isOpen: boolean;
  onCompleted: (createdTermId?: string) => void;
};

export default function OnboardingModal({ isOpen, onCompleted }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use safe portal hook
  const { createSafePortal } = useSafePortal();
  
  // Use safe body style management
  useSafeBodyStyle(isOpen, 'overflow', 'hidden', 'unset');

  // Queries for dropdowns
  const schools = useQuery(api.schools.list) ?? [];
  const sortedSchools = useMemo(() => {
    const copy = [...schools];
    copy.sort((a: any, b: any) => String(a?.name || "").localeCompare(String(b?.name || "")));
    return copy;
  }, [schools]);
  const categories = useQuery(api.majorCategories.list) ?? [];
  const ethnicities = useQuery(api.ethnicities.list) ?? [];

  // Mutations
  const updateProfile = useMutation(api.users.updateUserProfile);
  const updateAcademic = useMutation(api.users.updateAcademicInfo);
  const createTerm = useMutation(api.terms.create);

  // Step 1 fields
  const [birthday, setBirthday] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [ethnicity, setEthnicity] = useState<string>("");

  // Step 2 fields
  const [school, setSchool] = useState<string>("");
  const [majorCategory, setMajorCategory] = useState<string>("");
  const [major, setMajor] = useState<string>("");
  const [minor, setMinor] = useState<string>("");
  const [currentYear, setCurrentYear] = useState<string>("");

  // Step 3 fields
  const [termName, setTermName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    
    return () => { 
      isMountedRef.current = false;
    };
  }, [isOpen]);

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!birthday || !gender || !ethnicity) return "All fields are required.";
    }
    if (step === 2) {
      if (!school || !majorCategory || !currentYear) return "School, major category, and current year are required.";
    }
    if (step === 3) {
      if (!termName || !startDate || !endDate) return "Please complete all term fields.";
      if (new Date(endDate) <= new Date(startDate)) return "End date must be after start date.";
    }
    return null;
  };

  const next = async () => {
    if (!isMountedRef.current) return;
    setError(null);
    const v = validateStep();
    if (v) { setError(v); return; }
    setLoading(true);
    try {
      if (step === 1) {
        await updateProfile({
          birthday: new Date(birthday).getTime(),
          gender,
          ethnicity,
        });
        // Advance to School step and sync URL param
        if (isMountedRef.current) {
          setStep(2);
          try {
            const u = new URL(window.location.href);
            u.searchParams.set('onboarding', 'school');
            window.history.replaceState({}, '', u.toString());
          } catch {}
        }
      } else if (step === 2) {
        await updateAcademic({ school, major, majorCategory, minor, currentYear });
        // Advance to First Term step and sync URL param
        if (isMountedRef.current) {
          setStep(3);
          try {
            const u = new URL(window.location.href);
            u.searchParams.set('onboarding', 'term');
            window.history.replaceState({}, '', u.toString());
          } catch {}
        }
      } else if (step === 3) {
        const termId = await createTerm({ name: termName, startDate, endDate, status: "current" });
        if (isMountedRef.current) {
          onCompleted(String(termId));
        }
      }
    } catch (e: any) {
      if (isMountedRef.current) {
        setError(e?.message || "Something went wrong");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  const title = step === 1 ? "Onboarding - Demographics" : step === 2 ? "Onboarding - School" : "Onboarding - First Term";

  const modalContent = (
    <div className={styles.overlay}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.titleBar}>
          <div className={styles.titleText}>{title}</div>
        </div>

        <div className={styles.resultsSection}>
          {step === 1 && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Birthday</label>
                <input className={styles.input} type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Gender</label>
                <select className={styles.select} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Non-binary</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Ethnicity</label>
                <select className={styles.select} value={ethnicity} onChange={(e) => setEthnicity(e.target.value)}>
                  <option value="">Select</option>
                  {ethnicities.map((e: any) => (
                    <option key={e._id} value={e.name}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>School</label>
                <input
                  className={styles.input}
                  list="schools-list"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Select school"
                />
                <datalist id="schools-list">
                  {sortedSchools.map((s: any) => (
                    <option key={s._id} value={s.name} />
                  ))}
                </datalist>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Major Category</label>
                <select className={styles.select} value={majorCategory} onChange={(e) => setMajorCategory(e.target.value)}>
                  <option value="">Select major category</option>
                  {categories.map((c: any) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Major</label>
                <input className={styles.input} value={major} onChange={(e) => setMajor(e.target.value)} placeholder="Major" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Minor</label>
                <input className={styles.input} value={minor} onChange={(e) => setMinor(e.target.value)} placeholder="Minor (optional)" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Current Year</label>
                <select className={styles.select} value={currentYear} onChange={(e) => setCurrentYear(e.target.value)}>
                  <option value="">Select year</option>
                  <option>Freshman</option>
                  <option>Sophomore</option>
                  <option>Junior</option>
                  <option>Senior</option>
                  <option>Graduate</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Term Name</label>
                <input className={styles.input} value={termName} onChange={(e) => setTermName(e.target.value)} placeholder="Fall 2025" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Start Date</label>
                <input className={styles.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>End Date</label>
                <input className={styles.input} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          )}

          {error && (
            <div className={styles.emptyState}>
              <div style={{ color: "#ef4444" }}>{error}</div>
            </div>
          )}

          <div className={styles.actionsRow}>
            <button disabled={loading} onClick={next} className={styles.primaryPill}>
              {step === 3 ? (loading ? "Creating..." : "Finish") : (loading ? "Saving..." : "Next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document.body level to avoid DOM conflicts
  if (!isOpen) return null;
  
  return createSafePortal(modalContent);
}


