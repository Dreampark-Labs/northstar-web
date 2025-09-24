"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import { useAuth as useExternalAuth } from "@/providers/ExternalAuthProvider";
import { useSidebar } from "@/providers/SidebarProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { useTermSelector } from "@/providers/TermSelectorProvider";
import { Logo } from "@/components/ui/Logo/Logo";
import { SearchBar } from "../SearchBar/SearchBar";
import { ProfileDropdown } from "@/components/ui/ProfileDropdown/ProfileDropdown";
import { useAppSettings, useFooterSettings } from "@/hooks/useAppSettings";
import { AppSettings, FooterSettings } from "@/lib/sanity";
import { useCourseModalContext } from "@/providers/CourseModalProvider";
import { useAssignmentModalContext } from "@/providers/AssignmentModalProvider";
import { LogOut, Wrench } from "lucide-react";
import {
  BarChart3,
  FileText,
  Calendar,
  Paperclip,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  BookOpen,
  FolderOpen,
  Trophy,
  Settings,
  Plus,
} from "lucide-react";
import styles from "./Sidebar.module.css";

// Check if Clerk is properly configured
const isClerkConfigured = () => {
  return !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
};

interface NavigationItem {
  name: string;
  page: string; // The page name (e.g., 'dashboard', 'assignments')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  { name: "Dashboard", page: "dashboard", icon: BarChart3 },
  { name: "Assignments", page: "assignments", icon: FileText },
  { name: "Calendar", page: "calendar", icon: Calendar },
  { name: "Courses", page: "courses", icon: BookOpen },
  { name: "Files", page: "files", icon: FolderOpen },
  { name: "Grades", page: "grades", icon: Trophy },
];

interface SidebarProps {
  appSettings?: AppSettings;
  footerSettings?: FooterSettings;
}

export function Sidebar({
  appSettings: propsAppSettings,
  footerSettings: propsFooterSettings,
}: SidebarProps = {}) {
  // Always use the auth version since we're using external auth
  return (
    <SidebarWithAuth
      appSettings={propsAppSettings}
      footerSettings={propsFooterSettings}
    />
  );
}

// Sidebar component with Clerk authentication
function SidebarWithAuth({
  appSettings: propsAppSettings,
  footerSettings: propsFooterSettings,
}: SidebarProps = {}) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { theme } = useTheme();

  // Safely get term selector context - will be undefined during SSR
  let currentSlug: string | undefined;
  try {
    const termSelector = useTermSelector();
    currentSlug = termSelector.currentSlug;
  } catch (error) {
    // Context not available during SSR - use fallback
    currentSlug = undefined;
  }

  const pathname = usePathname();
  const router = useRouter();
  const { appSettings: hookAppSettings } = useAppSettings();
  const { footerSettings: hookFooterSettings } = useFooterSettings();

  // Use external auth system
  const { user: externalUser, logout: externalLogout } = useExternalAuth();

  // Use props if provided (server-side preloaded), otherwise fall back to hooks (client-side)
  const appSettings = propsAppSettings || hookAppSettings;
  const footerSettings = propsFooterSettings || hookFooterSettings;

  // Note: Course terms are now handled in the Calendar page's scheduling section

  // Use actual user data from external auth or fallback to mock data
  const currentUser = externalUser
    ? {
        firstName: externalUser.id.split("-")[0] || "User", // Simple extraction from user ID
        fullName: `User ${externalUser.id}`, // Use user ID as display name
        emailAddress: `${externalUser.id}@example.com`, // Generate email from user ID
      }
    : {
        firstName: "John",
        fullName: "John Smith",
        emailAddress: "john@example.com",
      };

  const handleSignOut = async () => {
    try {
      externalLogout(); // This will redirect to localhost:3002/logout
    } catch (error) {
      console.error("Sign out error:", error);
      // Fallback redirect
      window.location.href = "http://localhost:3002/logout";
    }
  };

  const handleSettingsClick = () => {
    router.push("/app/v1/settings");
  };

  return (
    <SidebarContent
      appSettings={appSettings}
      footerSettings={footerSettings}
      currentUser={currentUser}
      handleSignOut={handleSignOut}
      handleSettingsClick={handleSettingsClick}
      isCollapsed={isCollapsed}
      toggleSidebar={toggleSidebar}
      theme={theme}
      currentSlug={currentSlug}
      pathname={pathname}
    />
  );
}

// Sidebar component without Clerk authentication (fallback)
function SidebarWithoutAuth({
  appSettings: propsAppSettings,
  footerSettings: propsFooterSettings,
}: SidebarProps = {}) {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { theme } = useTheme();

  // Safely get term selector context - will be undefined during SSR
  let currentSlug: string | undefined;
  try {
    const termSelector = useTermSelector();
    currentSlug = termSelector.currentSlug;
  } catch (error) {
    // Context not available during SSR - use fallback
    currentSlug = undefined;
  }

  const pathname = usePathname();
  const router = useRouter();
  const { appSettings: hookAppSettings } = useAppSettings();
  const { footerSettings: hookFooterSettings } = useFooterSettings();

  // Use props if provided (server-side preloaded), otherwise fall back to hooks (client-side)
  const appSettings = propsAppSettings || hookAppSettings;
  const footerSettings = propsFooterSettings || hookFooterSettings;

  // Use mock user data when Clerk is not configured
  const currentUser = {
    firstName: "Demo",
    fullName: "Demo User",
    emailAddress: "demo@example.com",
  };

  const handleSignOut = async () => {
    // Fallback redirect when no auth is configured
    window.location.href = "http://localhost:3000";
  };

  const handleSettingsClick = () => {
    router.push("/app/v1/settings");
  };

  return (
    <SidebarContent
      appSettings={appSettings}
      footerSettings={footerSettings}
      currentUser={currentUser}
      handleSignOut={handleSignOut}
      handleSettingsClick={handleSettingsClick}
      isCollapsed={isCollapsed}
      toggleSidebar={toggleSidebar}
      theme={theme}
      currentSlug={currentSlug}
      pathname={pathname}
    />
  );
}

// Shared sidebar content component
function SidebarContent({
  appSettings,
  footerSettings,
  currentUser,
  handleSignOut,
  handleSettingsClick,
  isCollapsed,
  toggleSidebar,
  theme,
  currentSlug,
  pathname,
}: {
  appSettings: any;
  footerSettings: any;
  currentUser: { firstName: string; fullName: string; emailAddress: string };
  handleSignOut: () => void;
  handleSettingsClick: () => void;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  theme: string;
  currentSlug: string | undefined;
  pathname: string;
}) {
  // Safely get modal contexts - will be undefined during SSR
  let openCourseModal: (() => void) | undefined;
  let openAssignmentModal: (() => void) | undefined;

  try {
    const courseModalContext = useCourseModalContext();
    openCourseModal = courseModalContext.open;
  } catch (error) {
    // Context not available during SSR - use fallback
    openCourseModal = undefined;
  }

  try {
    const assignmentModalContext = useAssignmentModalContext();
    openAssignmentModal = assignmentModalContext.open;
  } catch (error) {
    // Context not available during SSR - use fallback
    openAssignmentModal = undefined;
  }

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      <div className={styles.header}>
        <div className={styles.logoSection}>
          <Logo
            isCollapsed={isCollapsed}
            theme={theme as "light" | "dark" | "system"}
          />
        </div>

        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            className={styles.collapseButton}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <div className={styles.expandButtonSection}>
          <button
            onClick={toggleSidebar}
            className={styles.expandButton}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      <div className={styles.searchSection}>
        <SearchBar isCollapsed={isCollapsed} />
      </div>

      <nav className={styles.navigation}>
        {navigationItems.map((item) => {
          const href = `/app/v1/${currentSlug}/${item.page}`;
          const isActive = pathname === href;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
              title={isCollapsed ? item.name : undefined}
              prefetch={true}
            >
              <span className={styles.navIcon}>
                <IconComponent size={18} />
              </span>
              {!isCollapsed && (
                <span className={styles.navLabel}>{item.name}</span>
              )}
            </Link>
          );
        })}

        {/* Course Terms are now handled in the Calendar page's scheduling section */}
      </nav>

      {/* Quick Actions Section */}
      <div className={styles.quickActions}>
        {!isCollapsed && (
          <div className={styles.quickActionsHeader}>
            <h3 className={styles.quickActionsTitle}>Quick Actions</h3>
          </div>
        )}
        <div className={styles.quickActionsButtons}>
          <button
            onClick={() => openCourseModal?.()}
            className={`${styles.quickActionButton} ${isCollapsed ? styles.collapsed : ""}`}
            title={isCollapsed ? "Add Course" : undefined}
          >
            <span className={styles.quickActionIcon}>
              <Plus size={16} />
            </span>
            {!isCollapsed && (
              <span className={styles.quickActionLabel}>Add Course</span>
            )}
          </button>
          <button
            onClick={() => openAssignmentModal?.()}
            className={`${styles.quickActionButton} ${isCollapsed ? styles.collapsed : ""}`}
            title={isCollapsed ? "Add Assignment" : undefined}
          >
            <span className={styles.quickActionIcon}>
              <Plus size={16} />
            </span>
            {!isCollapsed && (
              <span className={styles.quickActionLabel}>Add Assignment</span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userSection}>
          <ProfileDropdown
            trigger={
              <div className={styles.userProfile}>
                <div className={styles.avatar}>
                  <span>{currentUser.firstName[0]}</span>
                </div>
                {!isCollapsed && (
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>
                      {currentUser.fullName}
                    </div>
                    <div className={styles.userEmail}>
                      {currentUser.emailAddress}
                    </div>
                  </div>
                )}
              </div>
            }
            align={isCollapsed ? "right" : "left"}
            position="top"
            onSettingsClick={handleSettingsClick}
            onSignOutClick={handleSignOut}
          />
        </div>

        {!isCollapsed && (
          <div className={styles.footerContent}>
            <div className={styles.simplifiedFooter}>
              <p className={styles.copyrightText}>
                &copy; {new Date().getFullYear()}{" "}
                {footerSettings?.companyName || "Dreampark Labs"}. All Rights
                Reserved | {appSettings?.appName || "Northstar"} v
                {footerSettings?.version || "0.2.0"}
                {footerSettings?.legalLinks &&
                  footerSettings.legalLinks.length > 0 && (
                    <>
                      {footerSettings.legalLinks.map(
                        (link: any, index: number) => (
                          <span key={index}>
                            {" | "}
                            <a
                              href={link.url}
                              className={styles.legalLink}
                              target={link.isExternal ? "_blank" : "_self"}
                              rel={
                                link.isExternal
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            >
                              {link.title}
                            </a>
                          </span>
                        ),
                      )}
                    </>
                  )}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
