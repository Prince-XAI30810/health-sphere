import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Settings,
  Activity,
  Zap,
  Monitor,
  Stethoscope,
  Sparkles,
  Brain,
  Send,
  Mail,
  Phone,
  Building2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
} from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  category: 'imaging' | 'monitoring' | 'diagnostic' | 'therapeutic' | 'laboratory';
  status: 'operational' | 'maintenance-due' | 'under-repair' | 'out-of-service';
  manufacturer: string;
}

interface MaintenanceEvent {
  id: string;
  equipmentId: string;
  taskType: 'preventive' | 'corrective' | 'calibration' | 'inspection';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in-progress' | 'completed';
  startDate: Date;
  endDate: Date;
  technician?: string;
  description: string;
  aiRecommendation?: string;
}

interface ServiceVendor {
  name: string;
  email: string;
  phone: string;
  specialization: string;
}

const equipmentData: Equipment[] = [
  { id: 'EQ-001', name: 'MRI Scanner', model: 'Siemens MAGNETOM Vida', serialNumber: 'MRI-2024-001', location: 'Radiology - Room 101', category: 'imaging', status: 'operational', manufacturer: 'Siemens Healthineers' },
  { id: 'EQ-002', name: 'CT Scanner', model: 'GE Revolution CT', serialNumber: 'CT-2023-045', location: 'Radiology - Room 102', category: 'imaging', status: 'maintenance-due', manufacturer: 'GE Healthcare' },
  { id: 'EQ-003', name: 'Ventilator Unit 1', model: 'Philips V60 Plus', serialNumber: 'VENT-2024-012', location: 'ICU - Bed 4', category: 'therapeutic', status: 'operational', manufacturer: 'Philips Healthcare' },
  { id: 'EQ-004', name: 'Patient Monitor', model: 'Mindray BeneVision N22', serialNumber: 'MON-2024-089', location: 'ICU - Bed 6', category: 'monitoring', status: 'under-repair', manufacturer: 'Mindray' },
  { id: 'EQ-005', name: 'Defibrillator', model: 'Zoll R Series', serialNumber: 'DEF-2023-034', location: 'Emergency Ward', category: 'therapeutic', status: 'operational', manufacturer: 'Zoll Medical' },
  { id: 'EQ-006', name: 'X-Ray Machine', model: 'Carestream DRX-Evolution', serialNumber: 'XR-2022-015', location: 'Radiology - Room 103', category: 'imaging', status: 'maintenance-due', manufacturer: 'Carestream Health' },
  { id: 'EQ-007', name: 'ECG Machine', model: 'GE MAC 2000', serialNumber: 'ECG-2024-067', location: 'Cardiology OPD', category: 'diagnostic', status: 'operational', manufacturer: 'GE Healthcare' },
  { id: 'EQ-008', name: 'Ultrasound System', model: 'Samsung HS60', serialNumber: 'US-2023-023', location: 'Radiology - Room 104', category: 'imaging', status: 'operational', manufacturer: 'Samsung Healthcare' },
  { id: 'EQ-009', name: 'Anesthesia Machine', model: 'Drager Fabius GS', serialNumber: 'AN-2023-008', location: 'OT - Room 1', category: 'therapeutic', status: 'out-of-service', manufacturer: 'Drager' },
  { id: 'EQ-010', name: 'Blood Analyzer', model: 'Sysmex XN-1000', serialNumber: 'LAB-2024-045', location: 'Laboratory', category: 'laboratory', status: 'operational', manufacturer: 'Sysmex Corporation' },
];

// Generate dates relative to current date
const today = new Date();
const getDate = (dayOffset: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + dayOffset);
  return date;
};

const maintenanceEvents: MaintenanceEvent[] = [
  { id: 'ME-001', equipmentId: 'EQ-001', taskType: 'preventive', priority: 'medium', status: 'scheduled', startDate: getDate(5), endDate: getDate(5), description: 'Quarterly helium level check', aiRecommendation: 'Helium at 78%. Schedule refill in 8 months based on consumption.' },
  { id: 'ME-002', equipmentId: 'EQ-002', taskType: 'preventive', priority: 'high', status: 'scheduled', startDate: getDate(1), endDate: getDate(2), technician: 'Rajesh Kumar', description: 'Tube cooling system maintenance', aiRecommendation: 'AI detected 15% slower scan times. Check gantry rotation.' },
  { id: 'ME-003', equipmentId: 'EQ-002', taskType: 'calibration', priority: 'medium', status: 'scheduled', startDate: getDate(8), endDate: getDate(8), description: 'Annual radiation calibration' },
  { id: 'ME-004', equipmentId: 'EQ-003', taskType: 'inspection', priority: 'low', status: 'completed', startDate: getDate(-2), endDate: getDate(-2), technician: 'Suresh Patel', description: 'Monthly flow sensor check' },
  { id: 'ME-005', equipmentId: 'EQ-004', taskType: 'corrective', priority: 'critical', status: 'in-progress', startDate: getDate(0), endDate: getDate(1), technician: 'Amit Sharma', description: 'Display flickering - backlight repair', aiRecommendation: 'Similar issue in MON-088. Backlight inverter replacement resolved it.' },
  { id: 'ME-006', equipmentId: 'EQ-005', taskType: 'inspection', priority: 'medium', status: 'scheduled', startDate: getDate(3), endDate: getDate(3), description: 'Battery and electrode inspection' },
  { id: 'ME-007', equipmentId: 'EQ-006', taskType: 'calibration', priority: 'high', status: 'scheduled', startDate: getDate(2), endDate: getDate(3), description: 'Radiation safety calibration', aiRecommendation: 'Warranty expired. Consider AMC renewal - ₹2.5L/year.' },
  { id: 'ME-008', equipmentId: 'EQ-007', taskType: 'preventive', priority: 'low', status: 'completed', startDate: getDate(-5), endDate: getDate(-5), technician: 'Vikram Singh', description: 'Lead wire inspection' },
  { id: 'ME-009', equipmentId: 'EQ-008', taskType: 'calibration', priority: 'medium', status: 'scheduled', startDate: getDate(6), endDate: getDate(6), description: 'Probe calibration' },
  { id: 'ME-010', equipmentId: 'EQ-009', taskType: 'corrective', priority: 'critical', status: 'scheduled', startDate: getDate(0), endDate: getDate(2), description: 'Flow sensor replacement', aiRecommendation: 'URGENT: 3 surgeries tomorrow. Prioritize or use OT Room 2 backup.' },
  { id: 'ME-011', equipmentId: 'EQ-010', taskType: 'calibration', priority: 'low', status: 'completed', startDate: getDate(-1), endDate: getDate(-1), technician: 'Priya Devi', description: 'Reagent quality control' },
  { id: 'ME-012', equipmentId: 'EQ-001', taskType: 'calibration', priority: 'medium', status: 'scheduled', startDate: getDate(12), endDate: getDate(12), description: 'Gradient coil calibration' },
];

const serviceVendors: Record<string, ServiceVendor> = {
  'Siemens Healthineers': { name: 'Siemens Healthineers India', email: 'service.india@siemens-healthineers.com', phone: '+91 1800 209 1800', specialization: 'MRI, CT, X-Ray' },
  'GE Healthcare': { name: 'GE Healthcare Service', email: 'india.service@ge.com', phone: '+91 1800 102 4544', specialization: 'CT, ECG, Ultrasound' },
  'Philips Healthcare': { name: 'Philips Healthcare India', email: 'healthcare.india@philips.com', phone: '+91 1800 103 3282', specialization: 'Ventilators, Monitoring' },
  'Default': { name: 'MediEquip Services', email: 'support@mediequip.in', phone: '+91 98765 44444', specialization: 'General Equipment' },
};

const taskTypeColors: Record<MaintenanceEvent['taskType'], { bg: string; border: string; text: string }> = {
  preventive: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700' },
  corrective: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-700' },
  calibration: { bg: 'bg-violet-100', border: 'border-violet-300', text: 'text-violet-700' },
  inspection: { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700' },
};

const statusColors: Record<MaintenanceEvent['status'], string> = {
  scheduled: 'opacity-100',
  'in-progress': 'opacity-100 ring-2 ring-primary ring-offset-1',
  completed: 'opacity-60',
};

const categories = ['all', 'imaging', 'monitoring', 'diagnostic', 'therapeutic', 'laboratory'];

export const LabImaging: React.FC = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serviceRequestOpen, setServiceRequestOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceEvent | null>(null);

  // Get 14 days for the Gantt chart
  const getDates = () => {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 3 + weekOffset * 7); // Start 3 days before today

    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      return date;
    });
  };

  const dates = getDates();

  // Filter equipment
  const filteredEquipment = equipmentData.filter(eq =>
    categoryFilter === 'all' || eq.category === categoryFilter
  );

  // Get events for equipment within date range
  const getEventsForEquipment = (equipmentId: string) => {
    return maintenanceEvents.filter(event => {
      if (event.equipmentId !== equipmentId) return false;
      const startOfRange = dates[0];
      const endOfRange = dates[dates.length - 1];
      return event.startDate <= endOfRange && event.endDate >= startOfRange;
    });
  };

  // Calculate position and width of event bar
  const getEventPosition = (event: MaintenanceEvent) => {
    const startOfRange = dates[0].getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const rangeMs = 14 * dayMs;

    const eventStart = Math.max(event.startDate.getTime(), startOfRange);
    const eventEnd = Math.min(event.endDate.getTime() + dayMs, startOfRange + rangeMs);

    const left = ((eventStart - startOfRange) / rangeMs) * 100;
    const width = ((eventEnd - eventStart) / rangeMs) * 100;

    return { left: `${Math.max(0, left)}%`, width: `${Math.min(100, width)}%` };
  };

  const openServiceRequest = (event: MaintenanceEvent) => {
    setSelectedEvent(event);
    setServiceRequestOpen(true);
  };

  const sendServiceRequest = () => {
    if (!selectedEvent) return;

    const equipment = equipmentData.find(e => e.id === selectedEvent.equipmentId);
    const vendor = serviceVendors[equipment?.manufacturer || 'Default'] || serviceVendors['Default'];

    toast.success('Service Request Sent', {
      description: (
        <div className="space-y-1">
          <p className="font-medium">{equipment?.name}</p>
          <p className="text-sm flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email sent to {vendor.email}
          </p>
        </div>
      ),
      duration: 5000,
    });

    setServiceRequestOpen(false);
  };

  const getEquipmentIcon = (category: Equipment['category']) => {
    switch (category) {
      case 'imaging': return <Monitor className="w-4 h-4" />;
      case 'monitoring': return <Activity className="w-4 h-4" />;
      case 'diagnostic': return <Heart className="w-4 h-4" />;
      case 'therapeutic': return <Zap className="w-4 h-4" />;
      case 'laboratory': return <Stethoscope className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: Equipment['status']) => {
    switch (status) {
      case 'operational': return <Badge variant="success" className="text-[10px] px-1">OK</Badge>;
      case 'maintenance-due': return <Badge variant="warning" className="text-[10px] px-1">Due</Badge>;
      case 'under-repair': return <Badge variant="secondary" className="text-[10px] px-1">Repair</Badge>;
      case 'out-of-service': return <Badge variant="destructive" className="text-[10px] px-1">OOS</Badge>;
    }
  };

  // Stats
  const operationalCount = equipmentData.filter(e => e.status === 'operational').length;
  const scheduledCount = maintenanceEvents.filter(e => e.status === 'scheduled').length;
  const inProgressCount = maintenanceEvents.filter(e => e.status === 'in-progress').length;
  const criticalCount = maintenanceEvents.filter(e => e.priority === 'critical' && e.status !== 'completed').length;

  return (
    <DashboardLayout
      title="Equipment Maintenance"
      subtitle="Maintenance schedule and AI-powered insights"
    >
      {/* Service Request Dialog */}
      <Dialog open={serviceRequestOpen} onOpenChange={setServiceRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Service Request
            </DialogTitle>
          </DialogHeader>

          {selectedEvent && (() => {
            const equipment = equipmentData.find(e => e.id === selectedEvent.equipmentId);
            const vendor = serviceVendors[equipment?.manufacturer || 'Default'] || serviceVendors['Default'];

            return (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2">{equipment?.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-muted-foreground">Model: <span className="text-foreground">{equipment?.model}</span></p>
                    <p className="text-muted-foreground">Location: <span className="text-foreground">{equipment?.location}</span></p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Task: {selectedEvent.taskType.charAt(0).toUpperCase() + selectedEvent.taskType.slice(1)}</h5>
                  <p className="text-sm text-muted-foreground p-3 border rounded-lg">{selectedEvent.description}</p>
                </div>

                {selectedEvent.aiRecommendation && (
                  <div className="p-3 border border-violet-200 bg-violet-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-medium text-violet-900">AI Recommendation</span>
                    </div>
                    <p className="text-xs text-violet-700">{selectedEvent.aiRecommendation}</p>
                  </div>
                )}

                <div className="p-4 border rounded-lg">
                  <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Service Vendor
                  </h5>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{vendor.name}</p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-3 h-3" /> {vendor.email}
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3 h-3" /> {vendor.phone}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setServiceRequestOpen(false)}>Cancel</Button>
            <Button onClick={sendServiceRequest} className="bg-gradient-to-r from-primary to-blue-600">
              <Send className="w-4 h-4 mr-2" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Operational</p>
              <p className="text-2xl font-bold text-foreground">{operationalCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Critical</p>
              <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev - 1)} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[200px] text-center">
              {dates[0].toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {dates[13].toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(prev => prev + 1)} className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          {weekOffset !== 0 && (
            <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>Today</Button>
          )}
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="imaging">Imaging</SelectItem>
            <SelectItem value="monitoring">Monitoring</SelectItem>
            <SelectItem value="diagnostic">Diagnostic</SelectItem>
            <SelectItem value="therapeutic">Therapeutic</SelectItem>
            <SelectItem value="laboratory">Laboratory</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Gantt Chart */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header */}
            <div className="flex border-b border-border bg-muted/50">
              <div className="w-[220px] shrink-0 p-3 font-semibold text-sm border-r border-border">
                Equipment
              </div>
              <div className="flex-1 flex">
                {dates.map((date, idx) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 p-2 text-center text-xs border-r border-border last:border-r-0 ${isToday ? 'bg-primary/10 text-primary font-bold' :
                          isWeekend ? 'bg-muted/30 text-muted-foreground' : 'text-muted-foreground'
                        }`}
                    >
                      <div className="font-medium">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</div>
                      <div>{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows */}
            {filteredEquipment.map((equipment, eqIdx) => {
              const events = getEventsForEquipment(equipment.id);
              return (
                <div
                  key={equipment.id}
                  className={`flex border-b border-border ${eqIdx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                >
                  {/* Equipment Info */}
                  <div className="w-[220px] shrink-0 p-3 border-r border-border">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${equipment.category === 'imaging' ? 'bg-blue-100 text-blue-600' :
                          equipment.category === 'monitoring' ? 'bg-emerald-100 text-emerald-600' :
                            equipment.category === 'diagnostic' ? 'bg-pink-100 text-pink-600' :
                              equipment.category === 'therapeutic' ? 'bg-amber-100 text-amber-600' :
                                'bg-violet-100 text-violet-600'
                        }`}>
                        {getEquipmentIcon(equipment.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{equipment.name}</span>
                          {getStatusBadge(equipment.status)}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{equipment.location}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="flex-1 relative h-[60px]">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex">
                      {dates.map((date, idx) => {
                        const isToday = date.toDateString() === today.toDateString();
                        return (
                          <div
                            key={idx}
                            className={`flex-1 border-r border-border/50 last:border-r-0 ${isToday ? 'bg-primary/5' : ''}`}
                          />
                        );
                      })}
                    </div>

                    {/* Event bars */}
                    <div className="absolute inset-0 p-2">
                      {events.map((event) => {
                        const position = getEventPosition(event);
                        const colors = taskTypeColors[event.taskType];
                        return (
                          <Popover key={event.id}>
                            <PopoverTrigger asChild>
                              <button
                                className={`absolute top-1/2 -translate-y-1/2 h-8 rounded-md border ${colors.bg} ${colors.border} ${colors.text} ${statusColors[event.status]} px-2 text-xs font-medium flex items-center gap-1 cursor-pointer hover:shadow-md transition-shadow truncate`}
                                style={{ left: position.left, width: position.width, minWidth: '60px' }}
                              >
                                {event.priority === 'critical' && <AlertTriangle className="w-3 h-3 shrink-0" />}
                                <span className="truncate">{event.taskType}</span>
                                {event.aiRecommendation && <Sparkles className="w-3 h-3 shrink-0 text-violet-500" />}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" side="bottom">
                              <div className="p-3 border-b border-border">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-semibold text-sm">{equipment.name}</span>
                                  <Badge variant={event.priority === 'critical' ? 'destructive' : event.priority === 'high' ? 'warning' : 'secondary'}>
                                    {event.priority}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground capitalize">{event.taskType} Maintenance</p>
                              </div>
                              <div className="p-3 space-y-2">
                                <p className="text-sm">{event.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {event.startDate.toLocaleDateString()} {event.startDate.toDateString() !== event.endDate.toDateString() && `- ${event.endDate.toLocaleDateString()}`}
                                </div>
                                {event.technician && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Wrench className="w-3 h-3" />
                                    {event.technician}
                                  </div>
                                )}
                                {event.aiRecommendation && (
                                  <div className="p-2 rounded bg-violet-50 border border-violet-200">
                                    <div className="flex items-center gap-1 mb-1">
                                      <Brain className="w-3 h-3 text-violet-600" />
                                      <span className="text-xs font-medium text-violet-700">AI Insight</span>
                                    </div>
                                    <p className="text-xs text-violet-600">{event.aiRecommendation}</p>
                                  </div>
                                )}
                                <Button size="sm" className="w-full mt-2" onClick={() => openServiceRequest(event)}>
                                  <Send className="w-3 h-3 mr-2" /> Request Service
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between gap-4 p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">Task Types:</span>
            {Object.entries(taskTypeColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${colors.bg} ${colors.border} border`} />
                <span className="text-xs text-muted-foreground capitalize">{type}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-violet-500" />
            AI Recommendation Available
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LabImaging;
