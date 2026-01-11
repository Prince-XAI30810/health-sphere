import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/contexts/AuthContext';
import {
  BedDouble,
  Users,
  IndianRupee,
  Clock,
  Package,
  AlertTriangle,
  TrendingUp,
  Activity,
  FlaskConical,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';

const bedStats = {
  total: 120,
  occupied: 87,
  available: 28,
  reserved: 5,
};



const criticalAlerts = [
  {
    id: 1,
    type: 'inventory',
    title: 'Medicine Stock Critical',
    message: 'Paracetamol 500mg will run out in 2-3 days at current usage rate',
    item: 'Paracetamol 500mg',
    currentStock: 45,
    threshold: 100,
    urgency: 'critical',
    action: 'Reorder Now',
    icon: Package,
    aiReason: 'Consumption rate increased by 15% due to seasonal flu outbreak. Predictive model suggests stockout in 48h.',
  },
  {
    id: 2,
    type: 'bed',
    title: 'Bed Cleaning Required',
    message: 'Bed 104 (ICU) will be available in 4 hours. Schedule cleaning and sanitization.',
    bedNumber: '104',
    ward: 'ICU',
    availableIn: '4 hours',
    urgency: 'high',
    action: 'Schedule Cleaning',
    icon: BedDouble,
  },
  {
    id: 3,
    type: 'inventory',
    title: 'Supply Running Low',
    message: 'Surgical Gloves (L) will be below threshold in 5-7 days',
    item: 'Surgical Gloves (L)',
    currentStock: 120,
    threshold: 500,
    urgency: 'medium',
    action: 'Plan Reorder',
    icon: Package,
    aiReason: 'Historical usage patterns indicate peak demand in upcoming week. Reorder recommended to maintain safety stock.',
  },
  {
    id: 4,
    type: 'bed',
    title: 'Bed Maintenance Alert',
    message: 'Bed 106 (ICU) in maintenance. Expected completion in 6 hours.',
    bedNumber: '106',
    ward: 'ICU',
    availableIn: '6 hours',
    urgency: 'medium',
    action: 'Track Progress',
    icon: BedDouble,
  },
  {
    id: 5,
    type: 'inventory',
    title: 'Equipment Check Needed',
    message: 'IV Cannula 20G stock depleting faster than usual. Review usage patterns.',
    item: 'IV Cannula 20G',
    currentStock: 30,
    threshold: 100,
    urgency: 'high',
    action: 'Investigate',
    icon: FlaskConical,
    aiReason: 'Abnormal depletion rate detected. Possible wastage or unrecorded usage in Emergency Ward.',
  },
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

      {/* AI Insights & Alerts Section */}


      <div className="mt-8">
        {/* Critical Alerts */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-destructive to-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Critical Alerts</h2>
                <p className="text-sm text-muted-foreground">{criticalAlerts.length} active alerts</p>
              </div>
            </div>
            <Badge variant="destructive" className="gap-1">
              <Activity className="w-3 h-3" />
              {criticalAlerts.filter(a => a.urgency === 'critical' || a.urgency === 'high').length}
            </Badge>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
            {criticalAlerts.map((alert) => {
              const Icon = alert.icon;
              const urgencyColors = {
                critical: 'border-destructive bg-destructive/10',
                high: 'border-warning bg-warning/10',
                medium: 'border-blue-500/50 bg-blue-500/5',
              };

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border-2 ${urgencyColors[alert.urgency]} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${urgencyColors[alert.urgency]} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${alert.urgency === 'critical' ? 'text-destructive' :
                        alert.urgency === 'high' ? 'text-warning' : 'text-blue-500'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          {alert.title}
                          {alert.type === 'inventory' && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="inline-flex items-center justify-center rounded-full hover:bg-violet-50 p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/20">
                                  <Sparkles className="w-3 h-3 text-violet-500 cursor-pointer" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2 border-b border-border pb-2">
                                    <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
                                      <Sparkles className="w-3 h-3 text-violet-600" />
                                    </div>
                                    <h4 className="font-semibold text-sm text-foreground">AI Analysis</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {/* @ts-ignore */}
                                    {alert.aiReason}
                                  </p>
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </h4>
                        <Badge
                          variant={alert.urgency === 'critical' ? 'destructive' : alert.urgency === 'high' ? 'warning' : 'secondary'}
                          className="text-xs flex-shrink-0"
                        >
                          {alert.urgency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>

                      {alert.type === 'inventory' && (
                        <div className="flex items-center gap-4 mb-3">
                          <div className="text-xs">
                            <span className="text-destructive font-bold">{alert.currentStock}</span>
                            <span className="text-muted-foreground"> / {alert.threshold} threshold</span>
                          </div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${alert.urgency === 'critical' ? 'bg-destructive' :
                                alert.urgency === 'high' ? 'bg-warning' : 'bg-blue-500'
                                }`}
                              style={{ width: `${Math.min((alert.currentStock / alert.threshold) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {alert.type === 'bed' && (
                        <div className="flex items-center gap-2 mb-3 text-xs">
                          <BedDouble className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {alert.ward} • Bed {alert.bedNumber} • Available in {alert.availableIn}
                          </span>
                        </div>
                      )}

                      <Button
                        size="sm"
                        variant={alert.urgency === 'critical' ? 'destructive' : 'outline'}
                        className="w-full"
                        asChild
                      >
                        <Link to={alert.type === 'inventory' ? '/admin/inventory' : '/admin/beds'}>
                          {alert.action}
                          <ArrowRight className="w-3 h-3 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
