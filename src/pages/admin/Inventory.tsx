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
  Search,
  Plus,
  Package,
  Pill,
  AlertTriangle,
  Download,
  RefreshCw,
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

export const Inventory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const getStockStatus = (quantity: number, threshold: number) => {
    const ratio = quantity / threshold;
    if (ratio < 0.5) return { label: 'Critical', variant: 'error' as const };
    if (ratio < 1) return { label: 'Low Stock', variant: 'warning' as const };
    return { label: 'In Stock', variant: 'success' as const };
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

  return (
    <DashboardLayout
      title="Inventory & Pharmacy"
      subtitle="Manage medical supplies and medications"
    >
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
                  <TableHead>Expiry</TableHead>
                  <TableHead>Last Restocked</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const status = getStockStatus(item.quantity, item.threshold);
                  return (
                    <TableRow
                      key={item.id}
                      className={item.quantity < item.threshold * 0.5 ? 'bg-destructive/5' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            item.category === 'medicine' ? 'bg-secondary/10' :
                            item.category === 'supply' ? 'bg-primary/10' : 'bg-warning/10'
                          }`}>
                            {item.category === 'medicine' ? (
                              <Pill className="w-5 h-5 text-secondary" />
                            ) : (
                              <Package className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">{item.sku}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={item.quantity < item.threshold * 0.5 ? 'text-destructive font-bold' : ''}>
                          {item.quantity}
                        </span>
                        <span className="text-muted-foreground"> / {item.threshold} {item.unit}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.expiryDate || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.lastRestocked}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity < item.threshold ? (
                          <Button size="sm" variant="warning">
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
