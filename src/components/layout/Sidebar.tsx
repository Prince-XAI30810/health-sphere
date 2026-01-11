import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Home,
  Calendar,
  MessageSquare,
  Video,
  FileText,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Users,
  Stethoscope,
  ClipboardList,
  Pill,
  BedDouble,
  Package,
  FlaskConical,
  UserCog,
  Activity,
  Heart,
  Wallet,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const patientNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/patient', icon: Home },
  { label: 'AI Triage', href: '/patient/triage', icon: MessageSquare },
  { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
  { label: 'Telehealth', href: '/patient/telehealth', icon: Video },
  { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
  { label: 'Medicine Schedule', href: '/patient/medicine-wallet', icon: Wallet },
  { label: 'Health Records', href: '/patient/records', icon: FileText },
  { label: 'Notifications', href: '/patient/notifications', icon: Bell },
];

const doctorNavItems: NavItem[] = [
  { label: 'Patient Queue', href: '/doctor/queue', icon: Users },
  { label: 'Video Consult', href: '/doctor/video', icon: Video },
  { label: 'Consultations', href: '/doctor/consultations', icon: Stethoscope },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: Home },
  { label: 'Bed Management', href: '/admin/beds', icon: BedDouble },
  { label: 'Roster', href: '/admin/roster', icon: UserCog },
  { label: 'Inventory', href: '/admin/inventory', icon: Package },
  { label: 'Equipment', href: '/admin/lab', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getNavItems = (): NavItem[] => {
    switch (user?.role) {
      case 'patient':
        return patientNavItems;
      case 'doctor':
        return doctorNavItems;
      case 'admin':
        return adminNavItems;
      default:
        return [];
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'patient':
        return 'from-primary to-primary-dark';
      case 'doctor':
        return 'from-secondary to-emerald-600';
      case 'admin':
        return 'from-violet-500 to-violet-600';
      default:
        return 'from-primary to-primary-dark';
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor()} flex items-center justify-center shadow-md`}>
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">MediVerse</h1>
          <p className="text-xs text-muted-foreground capitalize">{user?.role} Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor()} flex items-center justify-center text-white text-sm font-semibold shadow-sm`}>
            {user?.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="flex-1 justify-start text-muted-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={logout} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
