import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const Techathon: React.FC = () => {
    return (
        <DashboardLayout title="Xebia Techathon 2026" subtitle="Innovation in Healthcare">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <h1 className="text-4xl font-bold text-primary">Welcome to Techathon 2026</h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                    Building the future of healthcare with generative AI and advanced technologies.
                </p>
                <div className="p-8 bg-card rounded-2xl shadow-lg border border-border mt-8">
                    <p className="font-mono text-sm text-primary">
                        Project: Health Sphere<br />
                        Team: Antigravity<br />
                        Mission: Revolutionize Patient Care
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Techathon;
