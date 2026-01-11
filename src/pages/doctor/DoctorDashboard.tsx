import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Video,
  ClipboardList,
  Clock,
  ChevronRight,
  Stethoscope,
  AlertCircle,
  CheckCircle,
  Calendar,
  Activity,
} from 'lucide-react';

interface QueuePatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  triageLevel: 'high' | 'medium' | 'low';
  waitTime: string;
  status: 'waiting' | 'in-progress' | 'checked-in';
}

const patientQueue: QueuePatient[] = [
  {
    id: 'P001',
    name: 'Arun Mehta',
    age: 45,
    gender: 'Male',
    chiefComplaint: 'Chest discomfort, shortness of breath',
    triageLevel: 'high',
    waitTime: '2 min',
    status: 'waiting',
  },
  {
    id: 'P002',
    name: 'Sneha Gupta',
    age: 32,
    gender: 'Female',
    chiefComplaint: 'Persistent fever, headache',
    triageLevel: 'medium',
    waitTime: '15 min',
    status: 'checked-in',
  },
  {
    id: 'P003',
    name: 'Vikram Joshi',
    age: 28,
    gender: 'Male',
    chiefComplaint: 'Routine follow-up',
    triageLevel: 'low',
    waitTime: '25 min',
    status: 'waiting',
  },
  {
    id: 'P004',
    name: 'Priya Sharma',
    age: 55,
    gender: 'Female',
    chiefComplaint: 'Blood pressure monitoring',
    triageLevel: 'medium',
    waitTime: '30 min',
    status: 'waiting',
  },
];

const upcomingConsultations = [
  { id: 1, patient: 'Rahul Sharma', time: '3:00 PM', type: 'Video', status: 'confirmed' },
  { id: 2, patient: 'Anita Verma', time: '3:30 PM', type: 'In-person', status: 'confirmed' },
  { id: 3, patient: 'Ravi Kumar', time: '4:00 PM', type: 'Video', status: 'pending' },
];

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  const getTriageBadge = (level: QueuePatient['triageLevel']) => {
    switch (level) {
      case 'high':
        return <Badge variant="triage-high">HIGH</Badge>;
      case 'medium':
        return <Badge variant="triage-medium">MEDIUM</Badge>;
      case 'low':
        return <Badge variant="triage-low">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: QueuePatient['status']) => {
    switch (status) {
      case 'in-progress':
        return <Badge variant="info">In Progress</Badge>;
      case 'checked-in':
        return <Badge variant="success">Checked In</Badge>;
      default:
        return <Badge variant="outline">Waiting</Badge>;
    }
  };

  return (
    <DashboardLayout
      title={`Good afternoon, ${user?.name}!`}
      subtitle="Here's your clinical overview for today"
    >
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/doctor/video">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Start Video Consult</h3>
                <p className="text-sm text-muted-foreground">3 patients waiting</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/doctor/prescriptions">
          <div className="card-elevated p-6 hover:border-secondary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Write Prescription</h3>
                <p className="text-sm text-muted-foreground">Quick e-prescription</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/doctor/consultations">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Stethoscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Consultation Room</h3>
                <p className="text-sm text-muted-foreground">Full patient view</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Queue"
          value={patientQueue.length}
          change="2 high priority"
          changeType="negative"
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Consultations Done"
          value="12"
          change="+3 from yesterday"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
        <StatCard
          title="Avg. Wait Time"
          value="18 min"
          change="-5 min improvement"
          changeType="positive"
          icon={Clock}
          iconColor="text-warning"
        />
        <StatCard
          title="Prescriptions Today"
          value="9"
          change="All verified"
          icon={ClipboardList}
          iconColor="text-secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient Queue */}
        <div className="lg:col-span-2 card-elevated">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Today's Queue</h2>
              <p className="text-sm text-muted-foreground">Patients waiting for consultation</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/doctor/queue">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {patientQueue.map((patient, index) => (
              <div
                key={patient.id}
                className={`p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors ${
                  patient.triageLevel === 'high' ? 'bg-destructive/5' : ''
                }`}
              >
                <div className="w-8 text-center">
                  <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-foreground">{patient.name}</h4>
                    {getTriageBadge(patient.triageLevel)}
                    {getStatusBadge(patient.status)}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {patient.age}y {patient.gender} • {patient.chiefComplaint}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {patient.waitTime}
                  </div>
                </div>
                <Button size="sm">
                  {patient.status === 'checked-in' ? 'Start Consult' : 'Call In'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Consultations */}
        <div className="card-elevated">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Today</h2>
          </div>
          <div className="p-4 space-y-3">
            {upcomingConsultations.map((consult) => (
              <div key={consult.id} className="p-4 border border-border rounded-xl hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{consult.patient}</h4>
                  <Badge variant={consult.type === 'Video' ? 'info' : 'outline'}>
                    {consult.type === 'Video' && <Video className="w-3 h-3 mr-1" />}
                    {consult.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {consult.time}
                  </div>
                  {consult.status === 'pending' && (
                    <Badge variant="warning">Pending Confirm</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/doctor/consultations">
                <Calendar className="w-4 h-4 mr-2" />
                View Full Schedule
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
