import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Package,
  Pill,
  AlertTriangle,
  Download,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  ShoppingCart,
  Brain,
  MessageSquare,
  Send,
  Bot,
  Lightbulb,
  BarChart3,
  CheckCircle2,
  FileText,
  Mail,
  Building2,
  Phone,
  Printer,
  Copy,
  Check,
} from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'medicine' | 'supply' | 'equipment';
  quantity: number;
  threshold: number;
  unit: string;
  expiryDate?: string;
  lastRestocked: string;
  price: number;
}

interface AIInsight {
  id: string;
  itemId: string;
  reasoning: string;
  recommendation: string;
  urgency: 'high' | 'medium' | 'low';
  trend: 'increasing' | 'decreasing' | 'stable';
  predictedStockout?: string;
  suggestedOrderQty?: number;
  costSavingTip?: string;
}

interface PurchaseOrder {
  id: string;
  itemName: string;
  itemSku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  supplier: string;
  supplierEmail: string;
  supplierPhone: string;
  createdAt: Date;
  expectedDelivery: string;
  status: 'pending' | 'sent' | 'confirmed';
}

const inventoryData: InventoryItem[] = [
  { id: '1', name: 'Paracetamol 500mg', sku: 'MED-001', category: 'medicine', quantity: 45, threshold: 100, unit: 'Strips', expiryDate: 'Dec 2026', lastRestocked: 'Jan 5, 2026', price: 25 },
  { id: '2', name: 'Azithromycin 500mg', sku: 'MED-002', category: 'medicine', quantity: 230, threshold: 100, unit: 'Tablets', expiryDate: 'Mar 2027', lastRestocked: 'Jan 8, 2026', price: 45 },
  { id: '3', name: 'Surgical Gloves (L)', sku: 'SUP-023', category: 'supply', quantity: 120, threshold: 500, unit: 'Pairs', lastRestocked: 'Dec 28, 2025', price: 15 },
  { id: '4', name: 'IV Cannula 20G', sku: 'SUP-045', category: 'supply', quantity: 30, threshold: 100, unit: 'Units', lastRestocked: 'Jan 2, 2026', price: 35 },
  { id: '5', name: 'Amoxicillin 250mg', sku: 'MED-003', category: 'medicine', quantity: 500, threshold: 200, unit: 'Capsules', expiryDate: 'Jun 2027', lastRestocked: 'Jan 10, 2026', price: 18 },
  { id: '6', name: 'Face Masks (N95)', sku: 'SUP-012', category: 'supply', quantity: 800, threshold: 500, unit: 'Pieces', lastRestocked: 'Jan 9, 2026', price: 120 },
  { id: '7', name: 'Syringe 5ml', sku: 'SUP-034', category: 'supply', quantity: 450, threshold: 300, unit: 'Units', lastRestocked: 'Jan 7, 2026', price: 8 },
  { id: '8', name: 'Omeprazole 20mg', sku: 'MED-004', category: 'medicine', quantity: 75, threshold: 150, unit: 'Tablets', expiryDate: 'Aug 2026', lastRestocked: 'Jan 3, 2026', price: 32 },
  { id: '9', name: 'Digital Thermometer', sku: 'EQP-001', category: 'equipment', quantity: 25, threshold: 20, unit: 'Units', lastRestocked: 'Dec 20, 2025', price: 450 },
  { id: '10', name: 'Blood Pressure Monitor', sku: 'EQP-002', category: 'equipment', quantity: 12, threshold: 10, unit: 'Units', lastRestocked: 'Nov 15, 2025', price: 2500 },
];

// AI Insights aligned with MediVerse Hospital data
const aiInsights: AIInsight[] = [
  {
    id: 'ai-1',
    itemId: '1',
    reasoning: 'MediVerse Emergency Ward reported 35% higher OPD footfall this week. Cross-referencing with Dr. Priya Patel\'s prescriptions shows increased Paracetamol usage for fever cases. ICU bed occupancy at 87% also indicates higher consumption. Historical winter patterns from 2024-25 confirm seasonal spike.',
    recommendation: 'Immediate reorder of 500 strips recommended to maintain 2-week buffer for current patient load.',
    urgency: 'high',
    trend: 'increasing',
    predictedStockout: '2-3 days',
    suggestedOrderQty: 500,
    costSavingTip: 'MedPharm Ltd offers 15% bulk discount. Last order delivered in 2 days.',
  },
  {
    id: 'ai-2',
    itemId: '2',
    reasoning: 'Stock at 2.3x threshold. Dr. Rajesh Kumar\'s prescription patterns show stable antibiotic usage. No respiratory infection surge detected in current admissions. General Ward patient turnover is normal.',
    recommendation: 'No immediate action. Schedule routine restock in 3 weeks.',
    urgency: 'low',
    trend: 'stable',
    costSavingTip: 'Reduce next order by 20% to optimize inventory turnover and reduce expiry risk.',
  },
  {
    id: 'ai-3',
    itemId: '3',
    reasoning: 'Critical shortage! 5 surgeries scheduled this week in MediVerse OT require min 200 pairs. Current ICU procedures consuming 40 pairs/day. Emergency Ward usage spiked after recent accident cases. Supplier lead time is 5 days.',
    recommendation: 'URGENT: Place emergency order now. Contact alternate supplier HealthSupply Co for faster 2-day delivery.',
    urgency: 'high',
    trend: 'increasing',
    predictedStockout: '3 days',
    suggestedOrderQty: 1000,
  },
  {
    id: 'ai-4',
    itemId: '4',
    reasoning: 'Abnormal 3x depletion rate detected. Cross-checking with Emergency Ward logs shows discrepancy - 45 units used but only 30 recorded. Nurse Amit Singh\'s shift has highest untracked usage. Possible wastage or documentation gap.',
    recommendation: 'Investigate Emergency Ward usage. Implement barcode scanning for real-time tracking.',
    urgency: 'high',
    trend: 'increasing',
    predictedStockout: '4 days',
    suggestedOrderQty: 300,
  },
  {
    id: 'ai-5',
    itemId: '5',
    reasoning: 'Excellent stock at 2.5x threshold. Dr. Neha Gupta\'s Pediatric prescriptions show steady demand. Current batch expiry Jun 2027 provides 18 months shelf life. No infection outbreak in Pediatrics Ward.',
    recommendation: 'Optimal level maintained. Next review in 4-5 weeks.',
    urgency: 'low',
    trend: 'stable',
    costSavingTip: 'Set auto-replenishment at 60% threshold for this consistent-demand item.',
  },
  {
    id: 'ai-6',
    itemId: '6',
    reasoning: 'Stock healthy at 1.6x threshold. Post-COVID protocols relaxed but MediVerse maintains standard PPE requirements. Minor uptick expected if flu cases increase per current Emergency Ward trends.',
    recommendation: 'Monitor for seasonal increase. Add 10% buffer in February if respiratory cases rise.',
    urgency: 'low',
    trend: 'stable',
  },
  {
    id: 'ai-7',
    itemId: '7',
    reasoning: 'Stock at 1.5x threshold. Consumption correlates with MediVerse admission rates - currently 24 admissions/day. Weekend pattern shows 15% higher usage due to Emergency Ward volume.',
    recommendation: 'Maintain current levels. Consider weekend pre-stocking for Emergency Ward.',
    urgency: 'low',
    trend: 'stable',
  },
  {
    id: 'ai-8',
    itemId: '8',
    reasoning: 'Below threshold at 50%. Dr. Rajesh Kumar\'s Gastroenterology consultations increased 25% this month. 12 current inpatients on Omeprazole regimen. Primary supplier lead time is 7 days.',
    recommendation: 'Reorder within 2 days. Quantity: 300 tablets for 3-week coverage.',
    urgency: 'medium',
    trend: 'increasing',
    predictedStockout: '8 days',
    suggestedOrderQty: 300,
  },
  {
    id: 'ai-9',
    itemId: '9',
    reasoning: 'Stock adequate at 1.25x threshold. All 25 units functional per last maintenance check. 2 units in General Ward showing battery degradation - replacement due next month.',
    recommendation: 'Schedule preventive maintenance. No procurement needed until Q2.',
    urgency: 'low',
    trend: 'stable',
    costSavingTip: 'Annual maintenance contract saves 20% on servicing. Current coverage expires Feb 2026.',
  },
  {
    id: 'ai-10',
    itemId: '10',
    reasoning: 'Slightly above threshold. High-value equipment with low turnover. Dr. Vikram Mehta requested 2 additional units for new Cardiology wing opening Q2. Last calibration 3 months ago - recalibration due per manufacturer guidelines.',
    recommendation: 'Schedule calibration for 2 units. Procure 2 new units for Cardiology expansion.',
    urgency: 'medium',
    trend: 'stable',
    suggestedOrderQty: 2,
  },
];

const suppliers = {
  medicine: { name: 'MedPharm Ltd', email: 'orders@medpharm.com', phone: '+91 98765 11111' },
  supply: { name: 'HealthSupply Co', email: 'procurement@healthsupply.in', phone: '+91 98765 22222' },
  equipment: { name: 'MediEquip India', email: 'sales@mediequip.co.in', phone: '+91 98765 33333' },
};

export const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; message: string }[]>([]);

  // Purchase Order states
  const [poDialogOpen, setPoDialogOpen] = useState(false);
  const [currentPO, setCurrentPO] = useState<PurchaseOrder | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [emailSent, setEmailSent] = useState(false);

  const getStockStatus = (quantity: number, threshold: number) => {
    const ratio = quantity / threshold;
    if (ratio < 0.5) return { label: 'Critical', variant: 'error' as const };
    if (ratio < 1) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'success' as const };
  };

  const getAIInsight = (itemId: string) => {
    return aiInsights.find(insight => insight.itemId === itemId);
  };

  const filteredItems = inventoryData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'low-stock') return matchesSearch && item.quantity < item.threshold;
    return matchesSearch && item.category === activeTab;
  });

  const lowStockCount = inventoryData.filter((item) => item.quantity < item.threshold).length;
  const totalValue = inventoryData.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // Create Purchase Order
  const createPurchaseOrder = (item: InventoryItem) => {
    const insight = getAIInsight(item.id);
    const supplier = suppliers[item.category];
    const quantity = insight?.suggestedOrderQty || Math.round(item.threshold * 1.5);

    const po: PurchaseOrder = {
      id: `PO-${Date.now().toString().slice(-8)}`,
      itemName: item.name,
      itemSku: item.sku,
      quantity,
      unit: item.unit,
      unitPrice: item.price,
      totalAmount: quantity * item.price,
      supplier: supplier.name,
      supplierEmail: supplier.email,
      supplierPhone: supplier.phone,
      createdAt: new Date(),
      expectedDelivery: '3-5 business days',
      status: 'pending',
    };

    setCurrentPO(po);
    setEmailSent(false);
    setPoDialogOpen(true);
  };

  // Confirm and send PO
  const confirmAndSendPO = () => {
    if (!currentPO) return;

    // Add to purchase orders list
    const updatedPO = { ...currentPO, status: 'sent' as const };
    setPurchaseOrders(prev => [updatedPO, ...prev]);
    setEmailSent(true);

    // Show email sent notification
    toast.success('Purchase Order Sent!', {
      description: (
        <div className="space-y-1">
          <p className="font-medium">{currentPO.id}</p>
          <p className="text-sm flex items-center gap-1">
            <Mail className="w-3 h-3" /> Email sent to {currentPO.supplierEmail}
          </p>
        </div>
      ),
      duration: 5000,
    });
  };

  const openAIChat = (item: InventoryItem) => {
    setSelectedItem(item);
    const insight = getAIInsight(item.id);
    setChatHistory([
      {
        role: 'ai',
        message: `Hello! I'm your MediVerse AI inventory assistant. I've analyzed **${item.name}** using hospital data:\n\n**Current Status:** ${item.quantity} ${item.unit} (${Math.round((item.quantity / item.threshold) * 100)}% of threshold)\n\n**Analysis:** ${insight?.reasoning || 'No specific insights available.'}\n\nHow can I help you with this item?`
      }
    ]);
    setAiChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedItem) return;

    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', message: userMsg }]);
    setChatMessage('');

    const insight = getAIInsight(selectedItem.id);

    setTimeout(() => {
      let aiResponse = '';
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes('reorder') || lowerMsg.includes('order')) {
        aiResponse = `Based on MediVerse hospital data, I recommend ordering **${insight?.suggestedOrderQty || Math.round(selectedItem.threshold * 1.5)} ${selectedItem.unit}**.\n\n📦 **Supplier:** ${suppliers[selectedItem.category].name}\n📧 **Contact:** ${suppliers[selectedItem.category].email}\n💰 **Est. Cost:** ₹${((insight?.suggestedOrderQty || selectedItem.threshold) * selectedItem.price).toLocaleString()}\n🚚 **Delivery:** 3-5 business days\n\nWould you like me to create a purchase order?`;
      } else if (lowerMsg.includes('why') || lowerMsg.includes('reason')) {
        aiResponse = `Here's my detailed reasoning based on MediVerse data:\n\n🏥 **Hospital Data Analyzed:**\n- Current patient admissions & OPD\n- Doctor prescription patterns\n- Ward-wise consumption logs\n- Historical seasonal trends\n\n📊 **Key Findings:**\n${insight?.reasoning}\n\n${insight?.costSavingTip ? `💡 **Cost Tip:** ${insight.costSavingTip}` : ''}`;
      } else if (lowerMsg.includes('trend') || lowerMsg.includes('usage')) {
        const trendEmoji = insight?.trend === 'increasing' ? '📈' : insight?.trend === 'decreasing' ? '📉' : '➡️';
        aiResponse = `${trendEmoji} **Usage Trend:** ${insight?.trend?.toUpperCase() || 'STABLE'}\n\n**MediVerse Weekly Consumption:**\n- Week 1: ${Math.round(selectedItem.threshold * 0.15)} ${selectedItem.unit}\n- Week 2: ${Math.round(selectedItem.threshold * 0.18)} ${selectedItem.unit}\n- Week 3: ${Math.round(selectedItem.threshold * 0.22)} ${selectedItem.unit}\n- Week 4 (projected): ${Math.round(selectedItem.threshold * 0.25)} ${selectedItem.unit}\n\n${insight?.predictedStockout ? `⚠️ **Stockout Risk:** ${insight.predictedStockout}` : '✅ Stock levels are healthy'}`;
      } else {
        aiResponse = `Based on MediVerse hospital records for **${selectedItem.name}**:\n\n${insight?.recommendation || 'Stock levels are manageable.'}\n\n📋 **I can help with:**\n- Usage trends from ward data\n- Reorder recommendations\n- Cost optimization\n- Stockout predictions\n\nWhat would you like to explore?`;
      }

      setChatHistory(prev => [...prev, { role: 'ai', message: aiResponse }]);
    }, 800);
  };

  return (
    <DashboardLayout
      title="Inventory & Pharmacy"
      subtitle="AI-powered medical supplies management"
    >
      {/* Purchase Order Dialog */}
      <Dialog open={poDialogOpen} onOpenChange={setPoDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Purchase Order {currentPO?.id}
            </DialogTitle>
          </DialogHeader>

          {currentPO && (
            <div className="space-y-4">
              {/* PO Header */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg border border-primary/20">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">MediVerse Hospital</h3>
                    <p className="text-sm text-muted-foreground">123 Healthcare Avenue, Mumbai 400001</p>
                  </div>
                  <Badge variant={emailSent ? 'success' : 'secondary'} className="text-xs">
                    {emailSent ? 'Sent' : 'Draft'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Created: {currentPO.createdAt.toLocaleString()}
                </div>
              </div>

              {/* Supplier Info */}
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Supplier Details
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{currentPO.supplier}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="ml-2">{currentPO.supplierPhone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 text-primary">{currentPO.supplierEmail}</span>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Item</th>
                      <th className="text-center p-3 font-medium">SKU</th>
                      <th className="text-center p-3 font-medium">Qty</th>
                      <th className="text-right p-3 font-medium">Unit Price</th>
                      <th className="text-right p-3 font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3 font-medium">{currentPO.itemName}</td>
                      <td className="p-3 text-center font-mono text-muted-foreground">{currentPO.itemSku}</td>
                      <td className="p-3 text-center">{currentPO.quantity} {currentPO.unit}</td>
                      <td className="p-3 text-right">₹{currentPO.unitPrice}</td>
                      <td className="p-3 text-right font-bold">₹{currentPO.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-muted/30">
                    <tr className="border-t">
                      <td colSpan={4} className="p-3 text-right font-semibold">Grand Total:</td>
                      <td className="p-3 text-right font-bold text-lg text-primary">₹{currentPO.totalAmount.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Delivery Info */}
              <div className="flex items-center gap-2 text-sm p-3 bg-blue-50 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Expected Delivery: {currentPO.expectedDelivery}</span>
              </div>

              {emailSent && (
                <div className="flex items-center gap-2 text-sm p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Email sent to {currentPO.supplierEmail}</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            {!emailSent ? (
              <Button onClick={confirmAndSendPO} className="bg-gradient-to-r from-primary to-blue-600">
                <Send className="w-4 h-4 mr-2" />
                Send to Supplier
              </Button>
            ) : (
              <Button variant="secondary" onClick={() => setPoDialogOpen(false)}>
                <Check className="w-4 h-4 mr-2" />
                Done
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Chat Dialog */}
      <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
        <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <span>MediVerse AI Assistant</span>
                <p className="text-xs font-normal text-muted-foreground mt-0.5">
                  Analyzing: {selectedItem?.name}
                </p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${chat.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                  {chat.role === 'ai' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-violet-500" />
                      <span className="text-xs font-medium text-violet-600">AI Analysis</span>
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">
                    {chat.message.split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about this item..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} className="bg-gradient-to-r from-violet-500 to-purple-600">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setChatMessage('Why this recommendation?')}>
                <Lightbulb className="w-3 h-3 mr-1" /> Why?
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setChatMessage('Show usage trends')}>
                <BarChart3 className="w-3 h-3 mr-1" /> Trends
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setChatMessage('How can I save costs?')}>
                <TrendingDown className="w-3 h-3 mr-1" /> Save Cost
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold text-foreground">{inventoryData.length}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold text-foreground">{lowStockCount}</p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Pill className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medicines</p>
              <p className="text-2xl font-bold text-foreground">
                {inventoryData.filter((i) => i.category === 'medicine').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-stat">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">₹{(totalValue / 1000).toFixed(1)}K</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated">
        {/* Header */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {purchaseOrders.length > 0 && (
              <Badge variant="secondary" className="h-9 px-3 flex items-center gap-2">
                <FileText className="w-3 h-3" />
                {purchaseOrders.length} PO{purchaseOrders.length > 1 ? 's' : ''} Created
              </Badge>
            )}
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low-stock" className="relative">
                Low Stock
                {lowStockCount > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                    {lowStockCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="medicine">Medicines</TabsTrigger>
              <TabsTrigger value="supply">Supplies</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AI Insight</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item.quantity, item.threshold);
                  const insight = getAIInsight(item.id);
                  return (
                    <TableRow key={item.id} className={item.quantity < item.threshold * 0.5 ? 'bg-destructive/5' : ''}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.category === 'medicine' ? 'bg-secondary/10' : item.category === 'supply' ? 'bg-primary/10' : 'bg-warning/10'}`}>
                            {item.category === 'medicine' ? <Pill className="w-5 h-5 text-secondary" /> : <Package className="w-5 h-5 text-primary" />}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={item.quantity < item.threshold * 0.5 ? 'text-destructive font-bold' : ''}>{item.quantity}</span>
                        <span className="text-muted-foreground"> / {item.threshold} {item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-all hover:shadow-md cursor-pointer ${insight?.urgency === 'high' ? 'border-destructive/50 bg-destructive/5 text-destructive hover:bg-destructive/10' : insight?.urgency === 'medium' ? 'border-warning/50 bg-warning/5 text-warning hover:bg-warning/10' : 'border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100'}`}>
                              <Sparkles className="w-3 h-3" />
                              {insight?.urgency === 'high' ? 'Urgent' : insight?.urgency === 'medium' ? 'Review' : 'Healthy'}
                              {insight?.trend === 'increasing' && <TrendingUp className="w-3 h-3" />}
                              {insight?.trend === 'decreasing' && <TrendingDown className="w-3 h-3" />}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[380px] p-0" side="left" align="start">
                            <div className="p-3 border-b border-border bg-gradient-to-r from-violet-50 to-purple-50">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-violet-600" />
                                  <span className="font-semibold text-sm text-violet-900">AI Reasoning</span>
                                </div>
                                <Badge variant={insight?.urgency === 'high' ? 'destructive' : insight?.urgency === 'medium' ? 'warning' : 'secondary'} className="text-xs">
                                  {insight?.urgency?.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">{insight?.reasoning}</p>
                            </div>
                            <div className="p-3 space-y-2">
                              <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                <div>
                                  <span className="text-xs font-semibold text-foreground">Recommendation</span>
                                  <p className="text-xs text-muted-foreground">{insight?.recommendation}</p>
                                </div>
                              </div>

                              {insight?.predictedStockout && (
                                <div className="flex items-center gap-2 text-xs p-2 rounded bg-destructive/10">
                                  <Clock className="w-3 h-3 text-destructive shrink-0" />
                                  <span className="text-destructive font-medium">Stockout in {insight.predictedStockout}</span>
                                </div>
                              )}

                              {insight?.suggestedOrderQty && (
                                <div className="flex items-center gap-2 text-xs p-2 rounded bg-primary/10">
                                  <ShoppingCart className="w-3 h-3 text-primary shrink-0" />
                                  <span>Order: <strong>{insight.suggestedOrderQty} {item.unit}</strong></span>
                                </div>
                              )}

                              {insight?.costSavingTip && (
                                <div className="flex items-start gap-2 text-xs p-2 rounded bg-emerald-50">
                                  <Lightbulb className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                                  <span className="text-emerald-700">{insight.costSavingTip}</span>
                                </div>
                              )}

                              <div className="flex gap-2 pt-2 border-t border-border">
                                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => openAIChat(item)}>
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Ask AI
                                </Button>
                                {insight?.urgency !== 'low' && (
                                  <Button size="sm" className="flex-1 h-7 text-xs bg-gradient-to-r from-violet-500 to-purple-600" onClick={() => createPurchaseOrder(item)}>
                                    <FileText className="w-3 h-3 mr-1" />
                                    Create PO
                                  </Button>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.lastRestocked}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity < item.threshold ? (
                          <Button size="sm" variant="warning" onClick={() => createPurchaseOrder(item)}>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reorder
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost">
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
