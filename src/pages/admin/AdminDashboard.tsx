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

// AI Insights and Alerts Data
const aiInsights = [
  {
    id: 1,
    type: 'prediction',
    title: 'Peak Admission Forecast',
    description: 'Based on historical data, expect 15-20 new admissions tomorrow between 10 AM - 2 PM. Consider preparing 5-8 additional beds.',
    icon: TrendingUp,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    priority: 'high',
  },
  {
    id: 2,
    type: 'optimization',
    title: 'Staff Allocation Suggestion',
    description: 'ICU ward shows 85% occupancy. Recommend shifting 2 nurses from General Ward to ICU for optimal coverage.',
    icon: Users,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    priority: 'medium',
  },
  {
    id: 3,
    type: 'efficiency',
    title: 'Wait Time Optimization',
    description: 'Average wait time reduced by 23% this week. Current staffing levels are optimal for current patient load.',
    icon: Clock,
    color: 'text-success',
    bgColor: 'bg-success/10',
    priority: 'low',
  },
];

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* AI Insights */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">AI Insights</h2>
                <p className="text-sm text-muted-foreground">Predictive analytics & recommendations</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="w-3 h-3" />
              Live
            </Badge>
          </div>

          <div className="space-y-4">
            {aiInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl border ${insight.bgColor} border-border/50 hover:border-border transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${insight.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground">{insight.title}</h4>
                        {insight.priority === 'high' && (
                          <Badge variant="destructive" className="text-xs">High Priority</Badge>
                        )}
                        {insight.priority === 'medium' && (
                          <Badge variant="warning" className="text-xs">Medium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
                      <Icon className={`w-4 h-4 ${
                        alert.urgency === 'critical' ? 'text-destructive' :
                        alert.urgency === 'high' ? 'text-warning' : 'text-blue-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
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
                              className={`h-full ${
                                alert.urgency === 'critical' ? 'bg-destructive' :
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
