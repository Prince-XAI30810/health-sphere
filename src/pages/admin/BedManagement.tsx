import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  BedDouble,
  User,
  Clock,
  ArrowRight,
  Plus,
  Filter,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Bed {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  patient?: {
    name: string;
    age: number;
    admission: string;
    diagnosis: string;
  };
}

interface Ward {
  name: string;
  beds: Bed[];
}

const initialWardsData: Ward[] = [
  {
    name: 'ICU',
    beds: [
      { id: 'icu-1', number: '101', status: 'occupied', patient: { name: 'Rakesh Verma', age: 58, admission: 'Jan 9, 2026', diagnosis: 'Post-operative care' } },
      { id: 'icu-2', number: '102', status: 'occupied', patient: { name: 'Kamla Devi', age: 72, admission: 'Jan 8, 2026', diagnosis: 'Cardiac monitoring' } },
      { id: 'icu-3', number: '103', status: 'reserved' },
      { id: 'icu-4', number: '104', status: 'occupied', patient: { name: 'Suresh Kumar', age: 45, admission: 'Jan 10, 2026', diagnosis: 'Respiratory distress' } },
      { id: 'icu-5', number: '105', status: 'available' },
      { id: 'icu-6', number: '106', status: 'maintenance' },
    ],
  },
  {
    name: 'General Ward',
    beds: [
      { id: 'gen-1', number: '201', status: 'occupied', patient: { name: 'Anita Sharma', age: 34, admission: 'Jan 10, 2026', diagnosis: 'Dengue fever' } },
      { id: 'gen-2', number: '202', status: 'available' },
      { id: 'gen-3', number: '203', status: 'available' },
      { id: 'gen-4', number: '204', status: 'occupied', patient: { name: 'Ravi Shankar', age: 28, admission: 'Jan 11, 2026', diagnosis: 'Fracture - Right leg' } },
      { id: 'gen-5', number: '205', status: 'occupied', patient: { name: 'Meera Joshi', age: 42, admission: 'Jan 9, 2026', diagnosis: 'Appendectomy recovery' } },
      { id: 'gen-6', number: '206', status: 'available' },
      { id: 'gen-7', number: '207', status: 'reserved' },
      { id: 'gen-8', number: '208', status: 'available' },
    ],
  },
  {
    name: 'Emergency',
    beds: [
      { id: 'em-1', number: 'E-01', status: 'occupied', patient: { name: 'Mohan Lal', age: 65, admission: 'Today', diagnosis: 'Chest pain - Under observation' } },
      { id: 'em-2', number: 'E-02', status: 'available' },
      { id: 'em-3', number: 'E-03', status: 'occupied', patient: { name: 'Priti Singh', age: 25, admission: 'Today', diagnosis: 'Road accident - Stabilized' } },
      { id: 'em-4', number: 'E-04', status: 'available' },
      { id: 'em-5', number: 'E-05', status: 'occupied', patient: { name: 'Vijay Malhotra', age: 50, admission: 'Today', diagnosis: 'Food poisoning' } },
    ],
  },
];

export const BedManagement: React.FC = () => {
  const [wards, setWards] = useState<Ward[]>(initialWardsData);
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [targetBedId, setTargetBedId] = useState<string>('');
  const { toast } = useToast();

  const handleDischarge = () => {
    if (!selectedBed) return;

    const newWards = wards.map(ward => ({
      ...ward,
      beds: ward.beds.map(bed => {
        if (bed.id === selectedBed.id) {
          return { ...bed, status: 'available' as const, patient: undefined };
        }
        return bed;
      })
    }));

    setWards(newWards);
    setSelectedBed(null);

    toast({
      title: "Patient Discharged",
      description: `Patient ${selectedBed.patient?.name} has been discharged successfully.`,
      variant: "default",
    });
  };

  const handleTransfer = () => {
    if (!selectedBed || !targetBedId) return;

    // Find target bed details
    let targetBedFound = false;
    let newWards = [...wards];

    // Remove patient from current bed
    newWards = newWards.map(ward => ({
      ...ward,
      beds: ward.beds.map(bed => {
        if (bed.id === selectedBed.id) {
          return { ...bed, status: 'available' as const, patient: undefined };
        }
        return bed;
      })
    }));

    // Add patient to new bed
    newWards = newWards.map(ward => ({
      ...ward,
      beds: ward.beds.map(bed => {
        if (bed.id === targetBedId) {
          return { ...bed, status: 'occupied' as const, patient: selectedBed.patient };
        }
        return bed;
      })
    }));

    setWards(newWards);
    setShowTransferDialog(false);
    setSelectedBed(null);
    setTargetBedId('');
  };

  // Get all available beds for transfer
  const availableBedsList = wards.flatMap(ward =>
    ward.beds
      .filter(bed => bed.status === 'available')
      .map(bed => ({ ...bed, wardName: ward.name }))
  );

  const getBedColor = (status: Bed['status']) => {
    switch (status) {
      case 'available':
        return 'bg-success hover:bg-success/80 text-success-foreground';
      case 'occupied':
        return 'bg-destructive hover:bg-destructive/80 text-destructive-foreground';
      case 'reserved':
        return 'bg-warning hover:bg-warning/80 text-warning-foreground';
      case 'maintenance':
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: Bed['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="success">Available</Badge>;
      case 'occupied':
        return <Badge variant="error">Occupied</Badge>;
      case 'reserved':
        return <Badge variant="warning">Reserved</Badge>;
      case 'maintenance':
        return <Badge variant="outline">Maintenance</Badge>;
    }
  };

  const totalBeds = wards.reduce((sum, ward) => sum + ward.beds.length, 0);
  const occupiedBeds = wards.reduce(
    (sum, ward) => sum + ward.beds.filter((b) => b.status === 'occupied').length,
    0
  );
  const availableBeds = wards.reduce(
    (sum, ward) => sum + ward.beds.filter((b) => b.status === 'available').length,
    0
  );

  return (
    <DashboardLayout
      title="Bed Management"
      subtitle="Real-time bed status and patient allocation"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BedDouble className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Beds</p>
              <p className="text-2xl font-bold text-foreground">{totalBeds}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <User className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupied</p>
              <p className="text-2xl font-bold text-foreground">{occupiedBeds}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <BedDouble className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available</p>
              <p className="text-2xl font-bold text-foreground">{availableBeds}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy Rate</p>
              <p className="text-2xl font-bold text-foreground">
                {Math.round((occupiedBeds / totalBeds) * 100)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-success"></span>
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-destructive"></span>
          <span className="text-sm text-muted-foreground">Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-warning"></span>
          <span className="text-sm text-muted-foreground">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-muted"></span>
          <span className="text-sm text-muted-foreground">Maintenance</span>
        </div>
        <div className="flex-1"></div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Bed
        </Button>
      </div>

      {/* Ward Tabs */}
      <Tabs defaultValue={wards[0].name}>
        <TabsList className="mb-6">
          {wards.map((ward) => (
            <TabsTrigger key={ward.name} value={ward.name}>
              {ward.name} ({ward.beds.length})
            </TabsTrigger>
          ))}
        </TabsList>

        {wards.map((ward) => (
          <TabsContent key={ward.name} value={ward.name}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {ward.beds.map((bed) => (
                <div
                  key={bed.id}
                  onClick={() => setSelectedBed(bed)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${getBedColor(
                    bed.status
                  )}`}
                >
                  <BedDouble className="w-8 h-8 mb-2" />
                  <span className="text-lg font-bold">Bed {bed.number}</span>
                  {bed.patient && (
                    <span className="text-xs opacity-80 truncate max-w-[90%]">
                      {bed.patient.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Bed Detail Dialog */}
      <Dialog open={!!selectedBed} onOpenChange={() => setSelectedBed(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BedDouble className="w-6 h-6" />
              Bed {selectedBed?.number}
              {selectedBed && getStatusBadge(selectedBed.status)}
            </DialogTitle>
            <DialogDescription>
              {selectedBed?.status === 'available'
                ? 'This bed is ready for new admissions'
                : selectedBed?.status === 'occupied'
                  ? 'Currently occupied by a patient'
                  : selectedBed?.status === 'reserved'
                    ? 'Reserved for incoming patient'
                    : 'Under maintenance'}
            </DialogDescription>
          </DialogHeader>

          {selectedBed?.patient && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {selectedBed.patient.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{selectedBed.patient.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedBed.patient.age} years
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Admission Date</span>
                    <span className="font-medium">{selectedBed.patient.admission}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diagnosis</span>
                    <span className="font-medium">{selectedBed.patient.diagnosis}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowTransferDialog(true)}>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
                <Button variant="destructive" className="flex-1" onClick={handleDischarge}>
                  <FileText className="w-4 h-4 mr-2" />
                  Discharge
                </Button>
              </div>
            </div>
          )}

          {selectedBed?.status === 'available' && (
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Admit New Patient
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Patient</DialogTitle>
            <DialogDescription>
              Select a new bed for {selectedBed?.patient?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Target Bed</Label>
              <Select value={targetBedId} onValueChange={setTargetBedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a bed" />
                </SelectTrigger>
                <SelectContent>
                  {availableBedsList.map(bed => (
                    <SelectItem key={bed.id} value={bed.id}>
                      {bed.wardName} - Bed {bed.number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>Cancel</Button>
            <Button onClick={handleTransfer} disabled={!targetBedId}>
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </DashboardLayout >
  );
};

export default BedManagement;
