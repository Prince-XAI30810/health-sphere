import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  className,
  onClick,
}) => {
  const changeColors = {
    positive: 'text-success',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  // Map icon colors to background colors
  const getBackgroundColor = (iconColor: string) => {
    if (iconColor === 'text-primary') return 'bg-primary/10';
    if (iconColor === 'text-secondary') return 'bg-secondary/10';
    if (iconColor === 'text-warning') return 'bg-warning/10';
    if (iconColor === 'text-success') return 'bg-success/10';
    if (iconColor === 'text-destructive') return 'bg-destructive/10';
    return 'bg-primary/10';
  };

  return (
    <div
      className={cn(
        'card-stat animate-fade-in',
        onClick && 'cursor-pointer hover:border-primary/30 hover:shadow-md transition-all',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
          {change && (
            <p className={cn('text-sm mt-1', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', getBackgroundColor(iconColor))}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </div>
  );
};
