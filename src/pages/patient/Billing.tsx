import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  IndianRupee,
  Wallet,
} from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  type: 'consultation' | 'lab' | 'pharmacy' | 'procedure';
}

const invoices: Invoice[] = [
  {
    id: 'INV-2026-001',
    date: 'Jan 10, 2026',
    description: 'Video Consultation - Dr. Priya Patel',
    amount: 500,
    status: 'pending',
    type: 'consultation',
  },
  {
    id: 'INV-2026-002',
    date: 'Jan 8, 2026',
    description: 'Complete Blood Count (CBC)',
    amount: 450,
    status: 'pending',
    type: 'lab',
  },
  {
    id: 'INV-2026-003',
    date: 'Jan 5, 2026',
    description: 'Chest X-Ray',
    amount: 1500,
    status: 'pending',
    type: 'procedure',
  },
  {
    id: 'INV-2025-089',
    date: 'Dec 28, 2025',
    description: 'General Checkup - Dr. Arjun Singh',
    amount: 800,
    status: 'paid',
    type: 'consultation',
  },
  {
    id: 'INV-2025-088',
    date: 'Dec 20, 2025',
    description: 'Pharmacy - Prescription Medications',
    amount: 1200,
    status: 'paid',
    type: 'pharmacy',
  },
];

export const Billing: React.FC = () => {
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const pendingInvoices = invoices.filter((inv) => inv.status === 'pending');
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handlePayNow = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setTimeout(() => {
      setShowPaymentSuccess(true);
    }, 500);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Paid</Badge>;
      case 'pending':
        return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'overdue':
        return <Badge variant="error"><AlertCircle className="w-3 h-3 mr-1" /> Overdue</Badge>;
    }
  };

  const getTypeIcon = (type: Invoice['type']) => {
    const baseClass = 'w-10 h-10 rounded-lg flex items-center justify-center';
    switch (type) {
      case 'consultation':
        return <div className={`${baseClass} bg-primary/10`}><FileText className="w-5 h-5 text-primary" /></div>;
      case 'lab':
        return <div className={`${baseClass} bg-secondary/10`}><FileText className="w-5 h-5 text-secondary" /></div>;
      case 'pharmacy':
        return <div className={`${baseClass} bg-warning/10`}><FileText className="w-5 h-5 text-warning" /></div>;
      case 'procedure':
        return <div className={`${baseClass} bg-destructive/10`}><FileText className="w-5 h-5 text-destructive" /></div>;
    }
  };

  return (
    <DashboardLayout
      title="Medical Wallet & Billing"
      subtitle="Manage your healthcare payments and invoices"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Outstanding"
          value={`₹${totalPending.toLocaleString()}`}
          change={`${pendingInvoices.length} invoices pending`}
          changeType="negative"
          icon={Wallet}
          iconColor="text-warning"
        />
        <StatCard
          title="This Month's Spend"
          value="₹3,250"
          change="+₹450 from last month"
          changeType="neutral"
          icon={IndianRupee}
          iconColor="text-primary"
        />
        <StatCard
          title="Insurance Coverage"
          value="80%"
          change="Star Health Insurance"
          icon={CreditCard}
          iconColor="text-secondary"
        />
        <StatCard
          title="Saved via Insurance"
          value="₹12,400"
          change="This year"
          changeType="positive"
          icon={CheckCircle}
          iconColor="text-success"
        />
      </div>

      {/* Quick Pay Section */}
      {pendingInvoices.length > 0 && (
        <div className="card-elevated p-6 mb-8 border-warning/30 bg-warning/5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                Outstanding Balance
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                You have {pendingInvoices.length} pending invoices totaling ₹{totalPending.toLocaleString()}
              </p>
            </div>
            <Button variant="warning" size="lg" onClick={() => handlePayNow(pendingInvoices[0])}>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay All (₹{totalPending.toLocaleString()})
            </Button>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div className="card-elevated">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">All Invoices</h2>
        </div>
        <div className="divide-y divide-border">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6 flex items-center gap-4 hover:bg-muted/30 transition-colors">
              {getTypeIcon(invoice.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-medium text-foreground truncate">{invoice.description}</h3>
                  {getStatusBadge(invoice.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{invoice.id}</span>
                  <span>•</span>
                  <span>{invoice.date}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">₹{invoice.amount.toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Receipt
                  </Button>
                  {invoice.status === 'pending' && (
                    <Button size="sm" onClick={() => handlePayNow(invoice)}>
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Success Dialog */}
      <Dialog open={showPaymentSuccess} onOpenChange={setShowPaymentSuccess}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="w-20 h-20 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <DialogTitle className="text-2xl">Payment Successful!</DialogTitle>
            <DialogDescription className="text-base">
              Your payment of ₹{selectedInvoice?.amount.toLocaleString()} has been processed successfully.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-xl p-4 mt-4">
            <p className="text-sm text-muted-foreground">Transaction ID</p>
            <p className="font-mono font-medium text-foreground">TXN-{Date.now()}</p>
          </div>
          <Button className="w-full mt-4" onClick={() => setShowPaymentSuccess(false)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Billing;
