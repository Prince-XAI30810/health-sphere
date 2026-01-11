import React from 'react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface AIInsightPopoverProps {
    insights: string[];
    triggerText?: string;
}

export const AIInsightPopover: React.FC<AIInsightPopoverProps> = ({
    insights,
    triggerText = 'AI Insight',
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="inline-flex">
                    <Badge
                        className="cursor-pointer bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 gap-1 transition-all hover:scale-105"
                    >
                        <Sparkles className="w-3 h-3" />
                        {triggerText}
                    </Badge>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-4 border-b border-violet-200 dark:border-violet-800">
                    <div className="flex items-center gap-2 text-violet-900 dark:text-violet-100 font-semibold">
                        <Sparkles className="w-4 h-4" />
                        <span>AI Analysis</span>
                    </div>
                </div>
                <div className="p-4 space-y-2">
                    {insights.map((insight, index) => (
                        <div key={index} className="flex gap-2 text-sm">
                            <span className="text-violet-600 dark:text-violet-400 font-bold shrink-0">•</span>
                            <p className="text-foreground leading-relaxed">{insight}</p>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};
