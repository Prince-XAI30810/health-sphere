import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Heart,
  User,
  Stethoscope,
  Shield,
  Mail,
  Lock,
  ArrowRight,
  Activity,
} from 'lucide-react';

const roleIcons: Record<UserRole, React.ElementType> = {
  patient: User,
  doctor: Stethoscope,
  admin: Shield,
};

const roleDescriptions: Record<UserRole, string> = {
  patient: 'Access your health records, appointments & telehealth',
  doctor: 'Manage patients, consultations & prescriptions',
  admin: 'Hospital operations, inventory & analytics',
};

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password, role);
      navigate(`/${role}`);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = roleIcons[role];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">MediVerse</h1>
              <p className="text-white/80">Healthcare Ecosystem</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4 leading-tight">
            Transforming Healthcare<br />
            with Technology
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            A comprehensive platform connecting patients, doctors, and administrators
            for seamless healthcare delivery.
          </p>

          <div className="space-y-4">
            {(['patient', 'doctor', 'admin'] as UserRole[]).map((r) => {
              const Icon = roleIcons[r];
              return (
                <div
                  key={r}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    role === r
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-semibold capitalize">{r} Portal</p>
                    <p className="text-sm text-white/70">{roleDescriptions[r]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute bottom-10 right-10 opacity-20">
          <Activity className="w-32 h-32" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">MediVerse</h1>
              <p className="text-sm text-muted-foreground">Healthcare Ecosystem</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">
              Sign in to access your healthcare portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selector */}
            <div className="space-y-2">
              <Label>Select Your Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="h-12">
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <RoleIcon className="w-4 h-4" />
                      <span className="capitalize">{role}</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(['patient', 'doctor', 'admin'] as UserRole[]).map((r) => {
                    const Icon = roleIcons[r];
                    return (
                      <SelectItem key={r} value={r}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span className="capitalize">{r}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{roleDescriptions[role]}</p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 h-12"
                />
              </div>
            </div>

            {/* Demo Notice */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <p className="text-sm text-primary font-medium">🎯 Demo Mode</p>
              <p className="text-xs text-muted-foreground mt-1">
                Select a role and click login to explore the {role} portal.
                No credentials required for demo.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in to {role} Portal
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Need help?{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
