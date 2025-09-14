"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card/Card';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { useTheme } from '@/providers/ThemeProvider';
import { CogIcon, UserIcon, BellIcon, LockIcon, ColorWheelIcon } from '@sanity/icons';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  
  // Mock user data for development
  const [userSettings, setUserSettings] = useState({
    name: 'John Smith',
    email: 'john@example.com',
    notifications: {
      assignments: true,
      grades: true,
      deadlines: true,
      email: false
    },
    preferences: {
      defaultView: 'dashboard',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
    }
  });

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving settings:', userSettings);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setUserSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  return (
    <div style={{ display: 'grid', gap: '28px' }}>
      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserIcon />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Full Name
              </label>
              <Input
                value={userSettings.name}
                onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Email Address
              </label>
              <Input
                type="email"
                value={userSettings.email}
                onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email address"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ColorWheelIcon />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
              Theme
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setTheme('light')}
                style={{
                  padding: '8px 16px',
                  border: theme === 'light' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '6px',
                  backgroundColor: theme === 'light' ? 'var(--color-primary-light)' : 'transparent',
                  color: 'var(--color-fg)',
                  cursor: 'pointer'
                }}
              >
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                style={{
                  padding: '8px 16px',
                  border: theme === 'dark' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '6px',
                  backgroundColor: theme === 'dark' ? 'var(--color-primary-light)' : 'transparent',
                  color: 'var(--color-fg)',
                  cursor: 'pointer'
                }}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                style={{
                  padding: '8px 16px',
                  border: theme === 'system' ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  borderRadius: '6px',
                  backgroundColor: theme === 'system' ? 'var(--color-primary-light)' : 'transparent',
                  color: 'var(--color-fg)',
                  cursor: 'pointer'
                }}
              >
                System
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BellIcon />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>Assignment Updates</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Get notified when assignments are created or updated</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.notifications.assignments}
                onChange={(e) => handleNotificationChange('assignments', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>Grade Updates</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Get notified when new grades are posted</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.notifications.grades}
                onChange={(e) => handleNotificationChange('grades', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>Deadline Reminders</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Get reminded about upcoming assignment deadlines</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.notifications.deadlines}
                onChange={(e) => handleNotificationChange('deadlines', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>Email Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Receive notifications via email</div>
              </div>
              <input
                type="checkbox"
                checked={userSettings.notifications.email}
                onChange={(e) => handleNotificationChange('email', e.target.checked)}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CogIcon />
            Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '20px', maxWidth: '400px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Default View
              </label>
              <select
                value={userSettings.preferences.defaultView}
                onChange={(e) => setUserSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, defaultView: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-fg)'
                }}
              >
                <option value="dashboard">Dashboard</option>
                <option value="assignments">Assignments</option>
                <option value="calendar">Calendar</option>
                <option value="grades">Grades</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Time Format
              </label>
              <select
                value={userSettings.preferences.timeFormat}
                onChange={(e) => setUserSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, timeFormat: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-fg)'
                }}
              >
                <option value="12h">12 Hour (AM/PM)</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Date Format
              </label>
              <select
                value={userSettings.preferences.dateFormat}
                onChange={(e) => setUserSettings(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, dateFormat: e.target.value }
                }))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-bg)',
                  color: 'var(--color-fg)'
                }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card>
        <CardHeader>
          <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LockIcon />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Change Password
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--color-muted)' }}>
                Update your password to keep your account secure
              </p>
              <Button variant="outline">
                Change Password
              </Button>
            </div>
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 500, color: 'var(--color-fg)' }}>
                Two-Factor Authentication
              </h4>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--color-muted)' }}>
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">
                Enable 2FA
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid var(--color-border)' }}>
        <Button variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}