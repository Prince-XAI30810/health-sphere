import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  getActivePrescriptions,
  getActivePrescriptionCount,
  downloadPrescriptionPDF,
  Prescription,
} from '@/data/prescriptions';
import { getComplianceStats } from '@/data/medicineWallet';
import {
  Calendar,
  MessageSquare,
  Video,
  CreditCard,
  FileText,
  Clock,
  ChevronRight,
  Pill,
  Activity,
  Heart,
  Thermometer,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Info,
  Droplet,
  Zap,
  Eye,
  User,
  Download,
} from 'lucide-react';

const upcomingAppointments = [
  {
    id: 1,
    doctor: 'Dr. Priya Patel',
    specialty: 'General Physician',
    date: 'Today, 3:00 PM',
    type: 'Video Consultation',
    status: 'upcoming',
  },
  {
    id: 2,
    doctor: 'Dr. Arjun Singh',
    specialty: 'Cardiologist',
    date: 'Jan 15, 10:30 AM',
    type: 'In-person',
    status: 'scheduled',
  },
];

const recentRecords = [
  { id: 1, title: 'Blood Test Results', date: 'Jan 8, 2026', type: 'Lab Report' },
  { id: 2, title: 'Chest X-Ray', date: 'Jan 5, 2026', type: 'Imaging' },
  { id: 3, title: 'Prescription - Antibiotics', date: 'Jan 3, 2026', type: 'Prescription' },
];

// Get prescriptions from shared data
const activePrescriptions = getActivePrescriptions();
const activePrescriptionCount = getActivePrescriptionCount();

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [showPrescriptionsModal, setShowPrescriptionsModal] = useState(false);

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0]}!`}
      subtitle="Here's an overview of your health journey"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/patient/triage">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <MessageSquare className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Start Symptom Check</h3>
                <p className="text-sm text-muted-foreground">AI-powered triage assessment</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/appointments">
          <div className="card-elevated p-6 hover:border-secondary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Book Appointment</h3>
                <p className="text-sm text-muted-foreground">Schedule with specialists</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/patient/telehealth">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Join Video Call</h3>
                <p className="text-sm text-muted-foreground">Connect with your doctor</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* AI Health Insights Section */}
      <div className="card-elevated p-6 mb-8 bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/10 dark:to-purple-950/10 border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">AI Health Insights</h2>
            <p className="text-sm text-muted-foreground">Personalized analysis based on your health records</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* AI Health Score with Info */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-violet-100 dark:border-violet-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Health Score</span>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-full transition-colors">
                      <Info className="w-4 h-4 text-violet-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 max-h-[600px] overflow-y-auto" align="end">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-600" />
                        How Your Score is Calculated
                      </h4>

                      {/* Before/After Comparison */}
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-foreground">Score Change Justification:</p>
                        <div className="space-y-2.5">
                          {/* Blood Glucose */}
                          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                            <p className="text-xs font-medium text-foreground">Blood Glucose & CBC</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Before:</span>
                                <span className="font-medium">98 mg/dL (Elevated)</span>
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Now:</span>
                                <span className="font-medium text-green-600">92 mg/dL (Normal)</span>
                              </div>
                            </div>
                            <p className="text-xs text-green-600 mt-1">✓ Improved: Glucose normalized with diet changes</p>
                          </div>

                          {/* Hemoglobin */}
                          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                            <p className="text-xs font-medium text-foreground">Hemoglobin & Oxygen</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Before:</span>
                                <span className="font-medium">13.2 g/dL (Low)</span>
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Now:</span>
                                <span className="font-medium text-green-600">14.8 g/dL (Healthy)</span>
                              </div>
                            </div>
                            <p className="text-xs text-green-600 mt-1">✓ Improved: Hemoglobin increased, SpO2 stable at 98%</p>
                          </div>

                          {/* Cholesterol */}
                          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                            <p className="text-xs font-medium text-foreground">LDL Cholesterol</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Before:</span>
                                <span className="font-medium">158 mg/dL (High)</span>
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Now:</span>
                                <span className="font-medium text-amber-600">145 mg/dL (Borderline)</span>
                              </div>
                            </div>
                            <p className="text-xs text-amber-600 mt-1">⚠ Improved but needs monitoring: Reduced from high to borderline</p>
                          </div>

                          {/* Thyroid */}
                          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                            <p className="text-xs font-medium text-foreground">Thyroid Function (TSH)</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Before:</span>
                                <span className="font-medium">5.2 mIU/L (Borderline)</span>
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Now:</span>
                                <span className="font-medium text-red-600">6.8 mIU/L (Abnormal)</span>
                              </div>
                            </div>
                            <p className="text-xs text-red-600 mt-1">✗ Worsened: TSH increased, requires endocrinologist consultation</p>
                          </div>

                          {/* Infection Status */}
                          <div className="bg-muted/30 rounded-lg p-2.5 space-y-1.5">
                            <p className="text-xs font-medium text-foreground">Infection & Concerns</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Before:</span>
                                <span className="font-medium">Minor infection signs</span>
                              </div>
                              <span className="text-muted-foreground">→</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Now:</span>
                                <span className="font-medium text-green-600">No signs detected</span>
                              </div>
                            </div>
                            <p className="text-xs text-green-600 mt-1">✓ Improved: Previous infection resolved, all markers normal</p>
                          </div>
                        </div>

                        {/* Overall Summary */}
                        <div className="bg-violet-50 dark:bg-violet-950/20 rounded-lg p-2.5 border border-violet-200 dark:border-violet-800">
                          <p className="text-xs font-semibold text-foreground mb-1">Overall Score Change: 82 → 85 (+3 points)</p>
                          <p className="text-xs text-muted-foreground">
                            Your score improved due to better glucose control, improved hemoglobin levels, and resolved infection.
                            However, thyroid function needs attention. Continue monitoring cholesterol.
                          </p>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Heart className="w-4 h-4 text-violet-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-violet-600">85</span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-xs text-success">
              <TrendingUp className="w-3 h-3" />
              <span>+3 from last month</span>
            </div>
          </div>

          {/* Blood Glucose */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-green-100 dark:border-green-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Blood Glucose</span>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-colors">
                      <Info className="w-3.5 h-3.5 text-green-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-2.5">
                      <h4 className="font-semibold text-sm text-foreground">Report Details</h4>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Report:</span>
                          <span className="font-medium text-foreground">Blood Glucose Test</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-foreground">Dec 15, 2025</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doctor:</span>
                          <span className="font-medium text-foreground">Dr. Arjun Singh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lab:</span>
                          <span className="font-medium text-foreground">City Health Lab</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Droplet className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-green-600">92</span>
              <span className="text-xs text-muted-foreground">mg/dL</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Normal (70-100)</p>
            <Badge variant="success" className="mt-2 text-xs">Healthy</Badge>
          </div>

          {/* Cholesterol (LDL) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-amber-100 dark:border-amber-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">LDL Cholesterol</span>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-full transition-colors">
                      <Info className="w-3.5 h-3.5 text-amber-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-2.5">
                      <h4 className="font-semibold text-sm text-foreground">Report Details</h4>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Report:</span>
                          <span className="font-medium text-foreground">Lipid Profile</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-foreground">Dec 15, 2025</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doctor:</span>
                          <span className="font-medium text-foreground">Dr. Arjun Singh</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lab:</span>
                          <span className="font-medium text-foreground">City Health Lab</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-amber-600">145</span>
              <span className="text-xs text-muted-foreground">mg/dL</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Target: &lt;100</p>
            <Badge variant="warning" className="mt-2 text-xs">Borderline</Badge>
          </div>

          {/* Thyroid (TSH) */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-red-100 dark:border-red-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Thyroid (TSH)</span>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors">
                      <Info className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64" align="end">
                    <div className="space-y-2.5">
                      <h4 className="font-semibold text-sm text-foreground">Report Details</h4>
                      <div className="text-xs space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Report:</span>
                          <span className="font-medium text-foreground">Thyroid Function Test</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-foreground">Nov 20, 2025</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Doctor:</span>
                          <span className="font-medium text-foreground">Dr. Sarah Khan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Lab:</span>
                          <span className="font-medium text-foreground">Apollo Diagnostics</span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Zap className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-red-600">6.8</span>
              <span className="text-xs text-muted-foreground">mIU/L</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Normal: 0.4-4.0</p>
            <Badge variant="destructive" className="mt-2 text-xs">Abnormal</Badge>
          </div>

          {/* Next Action */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-blue-100 dark:border-blue-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Next Action</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-sm font-semibold text-blue-600 mb-1">Thyroid Follow-up</div>
            <p className="text-xs text-muted-foreground">Schedule within 2 weeks</p>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-violet-600" />
              <h3 className="font-semibold text-sm">Personalized Recommendations</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-full transition-colors">
                    <Info className="w-3.5 h-3.5 text-violet-600" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      About These Recommendations
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      These personalized recommendations are generated from your <span className="font-semibold text-foreground">latest health report</span> analysis, including:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      <li className="flex gap-2">
                        <span className="text-violet-600">•</span>
                        <span>Blood Test Results (Jan 8, 2026)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-violet-600">•</span>
                        <span>Lipid Profile (Dec 15, 2025)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-violet-600">•</span>
                        <span>Thyroid Function Test (Nov 20, 2025)</span>
                      </li>
                    </ul>
                    <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                      AI analyzes your complete medical history to provide tailored health guidance.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-violet-600 shrink-0">•</span>
                <span>Based on your lipid profile, increase omega-3 intake through fish or supplements</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600 shrink-0">•</span>
                <span>Your thyroid results suggest scheduling an endocrinologist consultation</span>
              </li>
              <li className="flex gap-2">
                <span className="text-violet-600 shrink-0">•</span>
                <span>Maintain your healthy glucose levels with regular exercise (30 min daily)</span>
              </li>
            </ul>
          </div>

          {/* Risk Alerts */}
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <h3 className="font-semibold text-sm">Health Alerts</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex gap-2 items-start">
                <Badge variant="warning" className="shrink-0 text-xs">Attention</Badge>
                <span>Borderline cholesterol - dietary changes recommended</span>
              </li>
              <li className="flex gap-2 items-start">
                <Badge variant="destructive" className="shrink-0 text-xs">Action</Badge>
                <span>Abnormal thyroid function - follow up required</span>
              </li>
              <li className="flex gap-2 items-start">
                <Badge variant="success" className="shrink-0 text-xs">Good</Badge>
                <span>All other vitals within normal ranges</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Next Appointment"
          value="Today"
          change="3:00 PM with Dr. Priya"
          icon={Calendar}
          iconColor="text-primary"
        />
        <StatCard
          title="Active Prescriptions"
          value={activePrescriptionCount}
          change="1 refill needed"
          changeType="negative"
          icon={Pill}
          iconColor="text-secondary"
          onClick={() => setShowPrescriptionsModal(true)}
        />
        {/* Medicine Intake Card with AI Analysis */}
        <div className="card-elevated p-6 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medicine Intake</p>
                <p className="text-2xl font-bold text-foreground">
                  {(() => {
                    const stats = getComplianceStats();
                    return `${stats.complianceRate}%`;
                  })()}
                </p>
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                  <Info className="w-5 h-5 text-primary" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 max-h-[500px] overflow-y-auto" align="end">
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                    AI Medicine Intake Analysis
                  </h4>

                  {/* Compliance Overview */}
                  <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <p className="text-xs font-medium text-foreground">Your Compliance Summary:</p>
                    {(() => {
                      const stats = getComplianceStats();
                      return (
                        <>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Weekly Compliance:</span>
                            <span className={`font-semibold ${stats.complianceRate >= 80 ? 'text-green-600' : stats.complianceRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                              {stats.complianceRate}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Today's Progress:</span>
                            <span className="font-semibold text-foreground">
                              {stats.todayProgress.taken}/{stats.todayProgress.total} doses
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Current Streak:</span>
                            <span className="font-semibold text-orange-600">{stats.streak} days</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* AI Insights */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground">AI Insights on Your Pattern:</p>

                    {(() => {
                      const stats = getComplianceStats();
                      const insights = [];

                      if (stats.complianceRate < 70) {
                        insights.push({
                          type: 'warning',
                          icon: '⚠️',
                          text: 'Your medication adherence is below optimal. Missing doses can reduce treatment effectiveness by up to 50%.',
                          suggestion: 'Set additional reminders or ask a family member to help remind you.'
                        });
                      }

                      if (stats.todayProgress.taken < stats.todayProgress.total) {
                        insights.push({
                          type: 'info',
                          icon: '💊',
                          text: `You have ${stats.todayProgress.total - stats.todayProgress.taken} pending dose(s) for today.`,
                          suggestion: 'Check your Medicine Schedule to mark them as taken.'
                        });
                      }

                      if (stats.complianceRate >= 80) {
                        insights.push({
                          type: 'success',
                          icon: '✓',
                          text: 'Excellent medication adherence! Maintaining this consistency improves treatment outcomes significantly.',
                          suggestion: 'Keep up the great work!'
                        });
                      }

                      if (stats.streak === 0) {
                        insights.push({
                          type: 'warning',
                          icon: '🔔',
                          text: 'Your streak was broken. Consistent medication timing helps maintain drug levels in your body.',
                          suggestion: 'Try to take medicines at the same time each day.'
                        });
                      } else if (stats.streak >= 7) {
                        insights.push({
                          type: 'success',
                          icon: '🔥',
                          text: `Amazing! You've maintained a ${stats.streak}-day streak. This consistency greatly improves treatment effectiveness.`,
                          suggestion: 'You\'re building a healthy habit!'
                        });
                      }

                      // Add general insight if few specific ones
                      if (insights.length < 2) {
                        insights.push({
                          type: 'info',
                          icon: '💡',
                          text: 'Taking medications with meals can help you remember and reduce stomach upset for some medicines.',
                          suggestion: 'Check instructions for each medicine about food timing.'
                        });
                      }

                      return insights.map((insight, idx) => (
                        <div key={idx} className={`rounded-lg p-2.5 text-xs ${insight.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800' :
                            insight.type === 'success' ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' :
                              'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'
                          }`}>
                          <p className="font-medium mb-1">
                            <span className="mr-1">{insight.icon}</span>
                            {insight.text}
                          </p>
                          <p className="text-muted-foreground italic">💡 {insight.suggestion}</p>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Action Link */}
                  <div className="pt-2 border-t border-border">
                    <Link
                      to="/patient/medicine-wallet"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      View Full Medicine Schedule
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {(() => {
              const stats = getComplianceStats();
              const missedToday = stats.todayProgress.total - stats.todayProgress.taken;
              if (missedToday > 0) {
                return (
                  <span className="text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {missedToday} pending today
                  </span>
                );
              }
              return (
                <span className="text-success flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  All doses taken today
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/appointments">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div key={apt.id} className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground mb-1">{apt.doctor}</h4>
                    <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                  </div>
                  <Badge variant={apt.status === 'upcoming' ? 'success' : 'info'} className="ml-2 shrink-0">
                    {apt.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{apt.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Records */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Recent Records</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/patient/records">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {recentRecords.map((record) => (
              <div key={record.id} className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-lg transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate mb-0.5">{record.title}</h4>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{record.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prescriptions Modal */}
      <Dialog open={showPrescriptionsModal} onOpenChange={setShowPrescriptionsModal}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-secondary" />
              Active Prescriptions
            </DialogTitle>
            <DialogDescription>
              All your current active prescriptions and medications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {activePrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-5 border border-border rounded-xl hover:border-secondary/30 transition-colors bg-card"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{prescription.doctor}</h4>
                      <p className="text-sm text-muted-foreground">{prescription.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" className="mb-1">Active</Badge>
                    <p className="text-xs text-muted-foreground">{prescription.date}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <Badge variant="outline">{prescription.diagnosis}</Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Medications:</p>
                  {prescription.medications.map((med, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <Pill className="w-4 h-4 text-secondary shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{med.name}</span>
                          <span className="text-xs text-muted-foreground">- {med.dosage}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {med.frequency} • {med.duration}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPrescriptionPDF(prescription)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/patient/prescriptions">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <Button className="w-full" asChild>
              <Link to="/patient/prescriptions">
                View All Prescriptions
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PatientDashboard;
