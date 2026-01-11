import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import {
  BedDouble,
  Users,
  IndianRupee,
  Clock,
  ChevronRight,
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
  FlaskConical,
} from 'lucide-react';

const bedStats = {
  total: 120,
  occupied: 87,
  available: 28,
  reserved: 5,
};

const lowStockItems = [
  { name: 'Paracetamol 500mg', sku: 'MED-001', quantity: 45, threshold: 100 },
  { name: 'Surgical Gloves (L)', sku: 'SUP-023', quantity: 120, threshold: 500 },
  { name: 'IV Cannula 20G', sku: 'SUP-045', quantity: 30, threshold: 100 },
];

const recentAdmissions = [
  { id: 'ADM-001', patient: 'Rakesh Verma', ward: 'ICU', bed: '104', time: '2 hours ago' },
  { id: 'ADM-002', patient: 'Sunita Devi', ward: 'General', bed: '212', time: '4 hours ago' },
  { id: 'ADM-003', patient: 'Mohan Lal', ward: 'Emergency', bed: 'E-05', time: '5 hours ago' },
];

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const occupancyRate = Math.round((bedStats.occupied / bedStats.total) * 100);

  return (
    <DashboardLayout
      title={`Welcome, ${user?.name}!`}
      subtitle="Hospital operations overview for today"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Bed Occupancy"
          value={`${occupancyRate}%`}
          change={`${bedStats.available} beds available`}
          changeType={occupancyRate > 80 ? 'negative' : 'positive'}
          icon={BedDouble}
          iconColor="text-primary"
        />
        <StatCard
          title="Today's Admissions"
          value="24"
          change="+8 from yesterday"
          changeType="positive"
          icon={Users}
          iconColor="text-secondary"
        />
        <StatCard
          title="Average Wait Time"
          value="18 min"
          change="-5 min improvement"
          changeType="positive"
          icon={Clock}
          iconColor="text-warning"
        />
        <StatCard
          title="Today's Revenue"
          value="₹4.2L"
          change="+12% vs last week"
          changeType="positive"
          icon={IndianRupee}
          iconColor="text-success"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bed Overview */}
        <div className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Bed Management Overview</h2>
              <p className="text-sm text-muted-foreground">Real-time bed status across wards</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/beds">
                Manage Beds <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>

          {/* Mini Bed Grid */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-success"></span>
                <span className="text-sm text-muted-foreground">Available ({bedStats.available})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-destructive"></span>
                <span className="text-sm text-muted-foreground">Occupied ({bedStats.occupied})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded bg-warning"></span>
                <span className="text-sm text-muted-foreground">Reserved ({bedStats.reserved})</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1.5">
              {Array.from({ length: bedStats.total }).map((_, i) => {
                let colorClass = 'bg-success';
                if (i < bedStats.occupied) colorClass = 'bg-destructive';
                else if (i < bedStats.occupied + bedStats.reserved) colorClass = 'bg-warning';

                return (
                  <div
                    key={i}
                    className={`h-6 rounded ${colorClass} hover:opacity-80 transition-opacity cursor-pointer`}
                    title={`Bed ${i + 1}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Recent Admissions */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Recent Admissions</h3>
            <div className="space-y-2">
              {recentAdmissions.map((admission) => (
                <div key={admission.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{admission.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {admission.ward} • Bed {admission.bed}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">{admission.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h2 className="text-lg font-semibold text-foreground">Low Stock Alerts</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/inventory">View all</Link>
            </Button>
          </div>

          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="p-4 border border-warning/30 bg-warning/5 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.sku}</p>
                  </div>
                  <Badge variant="warning">Low Stock</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-destructive font-bold">{item.quantity}</span>
                    <span className="text-muted-foreground"> / {item.threshold}</span>
                  </div>
                  <Button size="sm" variant="warning">Reorder</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
        <Link to="/admin/beds">
          <div className="card-elevated p-6 hover:border-primary/30 transition-colors cursor-pointer group">
            <BedDouble className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground">Bed Management</h3>
            <p className="text-sm text-muted-foreground">ADT & Ward View</p>
          </div>
        </Link>
        <Link to="/admin/roster">
          <div className="card-elevated p-6 hover:border-secondary/30 transition-colors cursor-pointer group">
            <Users className="w-8 h-8 text-secondary mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground">Staff Roster</h3>
            <p className="text-sm text-muted-foreground">Shift Planning</p>
          </div>
        </Link>
        <Link to="/admin/inventory">
          <div className="card-elevated p-6 hover:border-warning/30 transition-colors cursor-pointer group">
            <Package className="w-8 h-8 text-warning mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground">Inventory</h3>
            <p className="text-sm text-muted-foreground">Pharmacy & Supplies</p>
          </div>
        </Link>
        <Link to="/admin/lab">
          <div className="card-elevated p-6 hover:border-destructive/30 transition-colors cursor-pointer group">
            <FlaskConical className="w-8 h-8 text-destructive mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-foreground">Lab & Imaging</h3>
            <p className="text-sm text-muted-foreground">Test Tracking</p>
          </div>
        </Link>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
