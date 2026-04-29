import { LayoutDashboard, ShoppingCart, Package, Warehouse, BarChart3 } from 'lucide-react';

export default function VendorDashboardPage() {
  const stats = [
    { label: 'Total Orders', value: '0', icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Total Products', value: '0', icon: Package, color: 'text-green-600' },
    { label: 'Inventory Items', value: '0', icon: Warehouse, color: 'text-purple-600' },
    { label: 'Revenue', value: '$0', icon: BarChart3, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Vendor Dashboard</h1>
        <p className="text-muted mt-1">Welcome to your vendor portal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-default p-6 shadow-theme-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-default p-8 text-center shadow-theme-sm">
        <LayoutDashboard className="w-16 h-16 text-muted mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-primary mb-2">Getting Started</h2>
        <p className="text-muted max-w-md mx-auto">
          Your vendor dashboard is ready. Start by adding products, managing orders, and tracking your inventory.
        </p>
      </div>
    </div>
  );
}
