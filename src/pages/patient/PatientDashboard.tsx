import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
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



export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();

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
          value="3"
          change="1 refill needed"
          changeType="negative"
          icon={Pill}
          iconColor="text-secondary"
        />
        <StatCard
          title="Outstanding Bills"
          value="₹2,450"
          change="Due in 5 days"
          changeType="negative"
          icon={CreditCard}
          iconColor="text-warning"
        />
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
    </DashboardLayout>
  );
};

export default PatientDashboard;
