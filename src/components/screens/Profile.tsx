import { useState } from 'react';
import {
  User, Mail, Phone, Bell, Globe, Moon, HelpCircle,
  ChevronRight, LogOut, Shield, FileText, Settings
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileProps {
  onNavigate: (screen: string) => void;
}

export function Profile({ onNavigate }: ProfileProps) {
  const { profile, user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(profile?.notification_enabled ?? true);

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut();
    }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Full Name', value: profile?.full_name || 'Not set', action: null },
        { icon: Mail, label: 'Email', value: user?.email || 'Not set', action: null },
        { icon: Phone, label: 'Phone', value: profile?.phone || 'Not set', action: 'edit' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', value: null, action: 'toggle', checked: notifications },
        { icon: Globe, label: 'Language', value: 'English', action: 'select' },
        { icon: Moon, label: 'Dark Mode', value: null, action: 'toggle', checked: darkMode },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', value: null, action: 'navigate' },
        { icon: FileText, label: 'Terms of Service', value: null, action: 'navigate' },
        { icon: Shield, label: 'Privacy Policy', value: null, action: 'navigate' },
      ],
    },
  ];

  const stats = [
    { label: 'Total Complaints', value: '0', color: 'bg-blue-500' },
    { label: 'Resolved', value: '0', color: 'bg-green-500' },
    { label: 'Pending', value: '0', color: 'bg-amber-500' },
  ];

  const handleToggle = (label: string) => {
    if (label === 'Notifications') {
      setNotifications(!notifications);
    } else if (label === 'Dark Mode') {
      setDarkMode(!darkMode);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 pt-12 pb-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border-4 border-white/30">
            <User className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{profile?.full_name || 'User'}</h1>
          <p className="text-blue-100">{user?.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} glass className="p-3 text-center">
              <div className={`${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-lg`}>
                <span className="text-white font-bold text-lg">{stat.value}</span>
              </div>
              <p className="text-xs text-white font-medium">{stat.label}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-6 mt-6 space-y-6">
        {profileSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <Card className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <button
                    key={itemIndex}
                    onClick={() => {
                      if (item.action === 'toggle') {
                        handleToggle(item.label);
                      }
                    }}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        {item.value && (
                          <p className="text-sm text-gray-600">{item.value}</p>
                        )}
                      </div>
                    </div>
                    {item.action === 'toggle' ? (
                      <div
                        className={`w-12 h-6 rounded-full transition-colors ${
                          item.checked ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform mt-0.5 ${
                            item.checked ? 'translate-x-6 ml-0.5' : 'translate-x-0.5'
                          }`}
                        />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Card hover onClick={() => onNavigate('track')} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">View Complaint History</h3>
                    <p className="text-sm text-gray-600">See all your past reports</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>

            {profile?.is_admin && (
              <Card hover onClick={() => onNavigate('admin')} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <Settings className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
                      <p className="text-sm text-gray-600">Manage complaints and users</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            )}
          </div>
        </div>

        <Button
          fullWidth
          variant="outline"
          onClick={handleSignOut}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>

        <div className="text-center text-sm text-gray-500 py-6">
          <p className="mb-1">Nivaran v1.0.0</p>
          <p>Your City, Your Responsibility</p>
        </div>
      </div>
    </div>
  );
}
