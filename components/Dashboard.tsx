import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { InventoryItem, DashboardStats, StockMovement } from '../types';
import { DollarSign, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  items: InventoryItem[];
  movements: StockMovement[]; // Added movements prop to calculate sales
  onLowStockClick: () => void;
}

const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ items, movements, onLowStockClick }) => {
  
  const stats = React.useMemo(() => {
    // 1. Current Inventory Stats (KPI Cards)
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalValue = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const lowStockCount = items.filter(i => i.quantity < 5).length;
    
    // 2. Sales Performance Stats (Charts) based on History
    const categoryRevenueMap = new Map<string, number>();

    // Process only EXIT movements (Sales)
    const exits = movements.filter(m => m.type === 'exit');
    
    exits.forEach(move => {
      // Find the item to get its category (even if item was deleted, we try to match)
      const item = items.find(i => i.id === move.itemId);
      // If item is deleted/not found, categorize as 'Otros' or use a preserved category if we had it
      const category = item ? (item.category as string) : 'Otros';
      
      // Calculate revenue: Quantity * Sale Price (fallback to current price -> fallback to 0)
      const price = move.salePrice ?? item?.price ?? 0;
      const revenue = move.quantity * price;

      const currentTotal = categoryRevenueMap.get(category) || 0;
      categoryRevenueMap.set(category, currentTotal + revenue);
    });

    // If no sales yet, fallback to showing inventory value distribution so charts aren't empty
    const hasSales = exits.length > 0;

    let chartData;
    
    if (hasSales) {
      chartData = Array.from(categoryRevenueMap.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value); // Sort highest revenue first
    } else {
      // Fallback: Distribution of Current Inventory Value
      const currentValDist = new Map<string, number>();
      items.forEach(item => {
        const val = item.quantity * item.price;
        const current = currentValDist.get(item.category as string) || 0;
        currentValDist.set(item.category as string, current + val);
      });
      chartData = Array.from(currentValDist.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    }

    return { 
      totalItems, 
      totalValue, 
      lowStockCount, 
      chartData,
      hasSales,
      totalCategories: new Set(items.map(i => i.category)).size
    };
  }, [items, movements]);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      <h2 className="text-2xl font-bold text-slate-800">Panel General</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mr-4">
            <Package size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Unidades</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalItems}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-green-50 rounded-lg text-green-600 mr-4">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Valor Inventario</p>
            <p className="text-2xl font-bold text-slate-800">${stats.totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div 
          onClick={onLowStockClick}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center cursor-pointer hover:shadow-md hover:border-orange-200 transition-all group"
        >
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600 mr-4 group-hover:bg-orange-100 transition-colors">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium group-hover:text-orange-600 transition-colors">Stock Bajo</p>
            <p className="text-2xl font-bold text-slate-800">{stats.lowStockCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-purple-50 rounded-lg text-purple-600 mr-4">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Categorías</p>
            <p className="text-2xl font-bold text-slate-800">{stats.totalCategories}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {stats.hasSales ? 'Ganancias por Categoría (Ventas)' : 'Valor por Categoría (Inventario)'}
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            {stats.hasSales 
              ? 'Distribución basada en el total de dinero vendido.' 
              : 'Basado en el valor actual del stock (sin ventas registradas).'}
          </p>
          
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   formatter={(value: number) => `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {stats.chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Top Categorías por Ingresos</h3>
          <p className="text-xs text-slate-500 mb-4">Comparativa de dinero generado.</p>
          
          <div className="h-64 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.chartData.slice(0, 5)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis 
                  tick={{fontSize: 12}} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}} 
                  formatter={(value: number) => [`$${value.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 'Ingresos']}
                />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;