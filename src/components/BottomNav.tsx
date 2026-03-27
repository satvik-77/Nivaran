import { Home, FileText, ClipboardList, Briefcase, MessageCircle, User } from 'lucide-react';

type NavItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'track', label: 'Track', icon: ClipboardList },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'ai-help', label: 'AI Help', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  active: string;
  onChange: (id: string) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-all duration-200 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-blue-100 scale-110' : ''
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
