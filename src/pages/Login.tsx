import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
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
  Cross,
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
      toast.success('Login successful!', {
        description: `Welcome to the ${role} portal`,
      });
      navigate(`/${role}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      toast.error('Login failed', {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = roleIcons[role];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Branding Bar */}
      <header className="w-full bg-slate-800 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-teal-500 rounded-lg">
            <Cross className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight">Tech-AI-Thon</span>
            <span className="text-xs text-teal-400 ml-2 font-medium">2026</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold tracking-tight text-white">Xebia</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Video Background */}
        <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="https://cdn.pixabay.com/video/2019/07/24/25315-350578347_large.mp4" type="video/mp4" />
          </video>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-teal-900/80"></div>

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 py-16">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">MediVerse</h1>
                <p className="text-teal-300 text-sm font-medium">Healthcare Ecosystem</p>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-3xl xl:text-4xl font-bold text-white mb-4 leading-tight max-w-lg">
              Transforming Healthcare with Technology
            </h2>
            <p className="text-base text-slate-300 mb-10 max-w-md leading-relaxed">
              A comprehensive platform connecting patients, doctors, and administrators
              for seamless healthcare delivery.
            </p>

            {/* Role Cards */}
            <div className="space-y-3">
              {(['patient', 'doctor', 'admin'] as UserRole[]).map((r) => {
                const Icon = roleIcons[r];
                const isActive = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 border ${isActive
                        ? 'bg-teal-500/20 border-teal-400/50 shadow-lg shadow-teal-500/10'
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive ? 'bg-teal-500' : 'bg-white/10'
                      }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-white capitalize text-sm">{r} Portal</p>
                      <p className="text-xs text-slate-400">{roleDescriptions[r]}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-md">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">MediVerse</h1>
                <p className="text-xs text-slate-500">Healthcare Ecosystem</p>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-slate-500 mt-1 text-sm">
                Sign in to access your healthcare portal
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Role Selector */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium text-sm">Select Your Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <SelectTrigger className="h-12 bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4 text-teal-600" />
                        <span className="capitalize text-slate-700">{role}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(['patient', 'doctor', 'admin'] as UserRole[]).map((r) => {
                      const Icon = roleIcons[r];
                      return (
                        <SelectItem key={r} value={r}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-teal-600" />
                            <span className="capitalize">{r}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">{roleDescriptions[role]}</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 font-medium text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 bg-slate-50 border-slate-200 focus:border-teal-500 focus:ring-teal-500/20 placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white font-semibold shadow-lg shadow-teal-500/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in to {role} Portal
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 mt-8">
              Need help?{' '}
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
