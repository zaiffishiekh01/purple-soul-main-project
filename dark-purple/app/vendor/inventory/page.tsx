'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package, Plus, Minus, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  title: string;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  reorder_quantity: number;
  price: number;
}

interface InventoryAlert {
  id: string;
  product_id: string;
  alert_type: string;
  current_quantity: number;
  threshold: number;
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustmentForm, setAdjustmentForm] = useState({
    quantity_change: 0,
    transaction_type: 'adjustment',
    reason: ''
  });

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await fetch('/api/vendor/inventory');
      const data = await response.json();
      setProducts(data.products || []);
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustment = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch('/api/vendor/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          ...adjustmentForm
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to adjust inventory');
      }

      toast.success('Inventory adjusted successfully');
      setAdjustmentDialogOpen(false);
      setAdjustmentForm({ quantity_change: 0, transaction_type: 'adjustment', reason: '' });
      fetchInventoryData();
    } catch (error) {
      console.error('Error adjusting inventory:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to adjust inventory');
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.stock_quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (product.stock_quantity <= product.low_stock_threshold) {
      return <Badge variant="secondary" className="bg-yellow-500">Low Stock</Badge>;
    }
    return <Badge variant="default" className="bg-green-500">In Stock</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const lowStockProducts = products.filter(
    p => p.stock_quantity > 0 && p.stock_quantity <= p.low_stock_threshold
  );
  const outOfStockProducts = products.filter(p => p.stock_quantity === 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage your product stock levels</p>
      </div>

      {alerts.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {alerts.length} inventory alert{alerts.length !== 1 ? 's' : ''} requiring attention
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{lowStockProducts.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold">{outOfStockProducts.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product Inventory</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Low Stock Alert</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell>{product.sku || 'N/A'}</TableCell>
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>{getStockStatus(product)}</TableCell>
                  <TableCell>{product.low_stock_threshold}</TableCell>
                  <TableCell>
                    <Dialog open={adjustmentDialogOpen && selectedProduct?.id === product.id} onOpenChange={(open) => {
                      setAdjustmentDialogOpen(open);
                      if (open) setSelectedProduct(product);
                      else setSelectedProduct(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Adjust
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adjust Inventory: {product.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label>Current Stock</Label>
                            <p className="text-2xl font-bold">{product.stock_quantity}</p>
                          </div>

                          <div>
                            <Label htmlFor="transaction_type">Transaction Type</Label>
                            <Select
                              value={adjustmentForm.transaction_type}
                              onValueChange={(value) => setAdjustmentForm(prev => ({ ...prev, transaction_type: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="restock">Restock</SelectItem>
                                <SelectItem value="adjustment">Adjustment</SelectItem>
                                <SelectItem value="damage">Damage</SelectItem>
                                <SelectItem value="theft">Theft</SelectItem>
                                <SelectItem value="return">Return</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="quantity_change">Quantity Change</Label>
                            <div className="flex gap-2 mt-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAdjustmentForm(prev => ({
                                  ...prev,
                                  quantity_change: prev.quantity_change - 1
                                }))}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                id="quantity_change"
                                type="number"
                                value={adjustmentForm.quantity_change}
                                onChange={(e) => setAdjustmentForm(prev => ({
                                  ...prev,
                                  quantity_change: parseInt(e.target.value) || 0
                                }))}
                                className="text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAdjustmentForm(prev => ({
                                  ...prev,
                                  quantity_change: prev.quantity_change + 1
                                }))}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              New stock: {product.stock_quantity + adjustmentForm.quantity_change}
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Input
                              id="reason"
                              value={adjustmentForm.reason}
                              onChange={(e) => setAdjustmentForm(prev => ({ ...prev, reason: e.target.value }))}
                              placeholder="Enter reason for adjustment"
                            />
                          </div>

                          <Button
                            onClick={handleAdjustment}
                            className="w-full"
                            disabled={adjustmentForm.quantity_change === 0}
                          >
                            Apply Adjustment
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
