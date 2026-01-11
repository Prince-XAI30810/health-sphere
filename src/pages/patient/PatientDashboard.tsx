import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


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
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{apt.doctor}</h4>
                    <p className="text-sm text-muted-foreground">{apt.specialty}</p>
                  </div>
                  <Badge variant={apt.status === 'upcoming' ? 'success' : 'info'}>
                    {apt.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {apt.date}
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
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{record.title}</h4>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                </div>
                <Badge variant="outline" className="text-xs">{record.type}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
