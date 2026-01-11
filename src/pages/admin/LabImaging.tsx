import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  ImageIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  MoveRight,
  Plus,
} from 'lucide-react';

interface LabTest {
  id: string;
  patient: string;
  testName: string;
  type: 'blood' | 'urine' | 'imaging';
  priority: 'routine' | 'urgent' | 'stat';
  status: 'pending' | 'in-progress' | 'completed';
  orderedBy: string;
  orderedAt: string;
  completedAt?: string;
}

const labTests: LabTest[] = [
  { id: 'LAB-001', patient: 'Rakesh Verma', testName: 'Complete Blood Count', type: 'blood', priority: 'stat', status: 'in-progress', orderedBy: 'Dr. Priya Patel', orderedAt: '9:30 AM' },
  { id: 'LAB-002', patient: 'Sneha Gupta', testName: 'Chest X-Ray', type: 'imaging', priority: 'urgent', status: 'pending', orderedBy: 'Dr. Arjun Singh', orderedAt: '10:15 AM' },
  { id: 'LAB-003', patient: 'Mohan Lal', testName: 'ECG', type: 'imaging', priority: 'stat', status: 'in-progress', orderedBy: 'Dr. Priya Patel', orderedAt: '10:45 AM' },
  { id: 'LAB-004', patient: 'Anita Sharma', testName: 'Liver Function Test', type: 'blood', priority: 'routine', status: 'pending', orderedBy: 'Dr. Arjun Singh', orderedAt: '11:00 AM' },
  { id: 'LAB-005', patient: 'Vikram Joshi', testName: 'Urinalysis', type: 'urine', priority: 'routine', status: 'completed', orderedBy: 'Dr. Priya Patel', orderedAt: '8:30 AM', completedAt: '10:00 AM' },
  { id: 'LAB-006', patient: 'Priya Singh', testName: 'CT Scan - Head', type: 'imaging', priority: 'urgent', status: 'completed', orderedBy: 'Dr. Arjun Singh', orderedAt: '8:00 AM', completedAt: '9:30 AM' },
  { id: 'LAB-007', patient: 'Ravi Kumar', testName: 'Blood Glucose', type: 'blood', priority: 'routine', status: 'completed', orderedBy: 'Dr. Priya Patel', orderedAt: '9:00 AM', completedAt: '9:45 AM' },
];

type KanbanColumn = 'pending' | 'in-progress' | 'completed';

export const LabImaging: React.FC = () => {
  const [tests, setTests] = useState(labTests);

  const columns: { id: KanbanColumn; title: string; icon: React.ReactNode }[] = [
    { id: 'pending', title: 'Pending', icon: <Clock className="w-5 h-5 text-warning" /> },
    { id: 'in-progress', title: 'In Progress', icon: <AlertCircle className="w-5 h-5 text-primary" /> },
    { id: 'completed', title: 'Completed', icon: <CheckCircle className="w-5 h-5 text-success" /> },
  ];

  const getTestsByStatus = (status: KanbanColumn) => tests.filter((t) => t.status === status);

  const getPriorityBadge = (priority: LabTest['priority']) => {
    switch (priority) {
      case 'stat':
        return <Badge variant="triage-high">STAT</Badge>;
      case 'urgent':
        return <Badge variant="triage-medium">Urgent</Badge>;
      case 'routine':
        return <Badge variant="triage-low">Routine</Badge>;
    }
  };

  const getTypeIcon = (type: LabTest['type']) => {
    switch (type) {
      case 'blood':
      case 'urine':
        return <FlaskConical className="w-4 h-4" />;
      case 'imaging':
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  const moveTest = (testId: string, newStatus: KanbanColumn) => {
    setTests(tests.map((t) => 
      t.id === testId 
        ? { ...t, status: newStatus, completedAt: newStatus === 'completed' ? 'Just now' : undefined }
        : t
    ));
  };

  const pendingCount = getTestsByStatus('pending').length;
  const inProgressCount = getTestsByStatus('in-progress').length;
  const completedCount = getTestsByStatus('completed').length;

  return (
    <DashboardLayout
      title="Lab & Imaging"
      subtitle="Track laboratory tests and imaging orders"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">STAT Orders</p>
              <p className="text-2xl font-bold text-foreground">
                {tests.filter((t) => t.priority === 'stat' && t.status !== 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="card-elevated">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                {column.icon}
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <Badge variant="outline">{getTestsByStatus(column.id).length}</Badge>
              </div>
              {column.id === 'pending' && (
                <Button size="sm" variant="ghost">
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            <div className="p-4 space-y-3 min-h-[400px]">
              {getTestsByStatus(column.id).map((test) => (
                <div
                  key={test.id}
                  className={`p-4 border rounded-xl bg-card hover:shadow-md transition-shadow ${
                    test.priority === 'stat' ? 'border-destructive/30 bg-destructive/5' :
                    test.priority === 'urgent' ? 'border-warning/30' : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(test.type)}
                      <span className="font-medium text-foreground">{test.testName}</span>
                    </div>
                    {getPriorityBadge(test.priority)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <User className="w-4 h-4" />
                    <span>{test.patient}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    <p>Ordered by: {test.orderedBy}</p>
                    <p>Time: {test.orderedAt}</p>
                    {test.completedAt && <p>Completed: {test.completedAt}</p>}
                  </div>
                  {column.id !== 'completed' && (
                    <div className="flex gap-2">
                      {column.id === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => moveTest(test.id, 'in-progress')}
                        >
                          Start
                          <MoveRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      {column.id === 'in-progress' && (
                        <Button
                          size="sm"
                          variant="success"
                          className="flex-1"
                          onClick={() => moveTest(test.id, 'completed')}
                        >
                          Complete
                          <CheckCircle className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {getTestsByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tests in this column</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default LabImaging;
