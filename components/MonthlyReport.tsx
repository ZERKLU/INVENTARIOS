import React, { useMemo } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { InventoryItem, StockMovement } from '../types';
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, ShoppingCart } from 'lucide-react';

interface MonthlyReportProps {
  items: InventoryItem[];
  movements: StockMovement[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ items, movements }) => {
  
  // Procesamiento de datos por Mes (Gráfico)
  const monthlyData = useMemo(() => {
    const monthlyStats = new Map<string, { 
      label: string, 
      earnings: number, 
      unitsSold: number, 
      timestamp: number 
    }>();

    // Filtramos solo salidas para el gráfico de ganancias
    const exits = movements.filter(m => m.type === 'exit');

    exits.forEach(move => {
      const date = new Date(move.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const item = items.find(i => i.id === move.itemId);
      const unitPrice = move.salePrice ?? item?.price ?? 0;
      const value = move.quantity * unitPrice;

      if (!monthlyStats.has(key)) {
        monthlyStats.set(key, {
          label: date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          earnings: 0,
          unitsSold: 0,
          timestamp: date.getTime()
        });
      }

      const current = monthlyStats.get(key)!;
      current.earnings += value;
      current.unitsSold += move.quantity;
    });

    return Array.from(monthlyStats.values())
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [items, movements]);

  // Procesamiento de datos por Producto (Tabla)
  const productStats = useMemo(() => {
    const stats = new Map<string, {
      id: string;
      name: string;
      boughtQty: number;
      invested: number;
      soldQty: number;
      revenue: number;
      category: string;
    }>();

    // Inicializar con todos los items actuales para que aparezcan aunque no tengan movimientos
    items.forEach(item => {
      stats.set(item.id, {
        id: item.id,
        name: item.name,
        category: item.category as string,
        boughtQty: 0,
        invested: 0,
        soldQty: 0,
        revenue: 0
      });
    });

    movements.forEach(move => {
      // Si el producto fue borrado, tratamos de recuperar nombre del movimiento, o crear entrada temporal
      if (!stats.has(move.itemId)) {
        stats.set(move.itemId, {
          id: move.itemId,
          name: move.itemName,
          category: 'Eliminado',
          boughtQty: 0,
          invested: 0,
          soldQty: 0,
          revenue: 0
        });
      }

      const current = stats.get(move.itemId)!;

      if (move.type === 'entry') {
        current.boughtQty += move.quantity;
        // Si no hay precio de compra registrado, asumimos 0 (o podríamos estimar, pero mejor ser conservador)
        const cost = move.purchasePrice ?? 0;
        current.invested += move.quantity * cost;
      } else {
        current.soldQty += move.quantity;
        // Usamos precio de venta real, o fallback al precio actual del item si existe
        const item = items.find(i => i.id === move.itemId);
        const price = move.salePrice ?? item?.price ?? 0;
        current.revenue += move.quantity * price;
      }
    });

    return Array.from(stats.values()).sort((a, b) => b.revenue - a.revenue);
  }, [items, movements]);

  // Totales Generales
  const totalEarnings = monthlyData.reduce((acc, curr) => acc + curr.earnings, 0);
  const totalUnits = monthlyData.reduce((acc, curr) => acc + curr.unitsSold, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20 lg:pb-0">
      
      {/* Resumen de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 mr-4">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Ventas Totales (Histórico)</p>
            <p className="text-2xl font-bold text-slate-800">
              ${totalEarnings.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 mr-4">
            <ShoppingCart size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Inversión Total Registrada</p>
            <p className="text-2xl font-bold text-slate-800">
              ${productStats.reduce((acc, curr) => acc + curr.invested, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-orange-50 rounded-lg text-orange-600 mr-4">
            <ArrowUpRight size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Unidades Vendidas</p>
            <p className="text-2xl font-bold text-slate-800">{totalUnits}</p>
          </div>
        </div>
      </div>

      {/* Gráfico Mensual */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-slate-400" />
          Tendencia de Ingresos Mensuales
        </h3>
        
        <div className="h-64 w-full">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="label" 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ventas']}
                  labelStyle={{ color: '#64748b', marginBottom: '0.5rem' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="earnings" 
                  stroke="#0ea5e9" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorEarnings)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <TrendingUp size={48} className="opacity-20 mb-2" />
               <p>Registra salidas de productos para ver la gráfica</p>
             </div>
          )}
        </div>
      </div>

      {/* Tabla de Rendimiento por Producto */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-700">Rendimiento por Producto (Compra vs Venta)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-slate-500 font-medium text-xs uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Producto</th>
                <th className="p-4 text-center text-blue-600 bg-blue-50/30">Comprado (Entradas)</th>
                <th className="p-4 text-right text-blue-600 bg-blue-50/30">Inversión Total</th>
                <th className="p-4 text-center text-orange-600 bg-orange-50/30">Vendido (Salidas)</th>
                <th className="p-4 text-right text-orange-600 bg-orange-50/30">Ventas Totales</th>
                <th className="p-4 text-right font-bold text-slate-700">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {productStats.length > 0 ? productStats.map((row) => {
                const balance = row.revenue - row.invested;
                const hasActivity = row.boughtQty > 0 || row.soldQty > 0;
                
                if (!hasActivity) return null;

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-slate-800">{row.name}</p>
                      <span className="text-xs text-slate-400">{row.category}</span>
                    </td>
                    <td className="p-4 text-center bg-blue-50/10 text-slate-600">{row.boughtQty} un.</td>
                    <td className="p-4 text-right bg-blue-50/10 font-medium text-blue-600">
                      ${row.invested.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center bg-orange-50/10 text-slate-600">{row.soldQty} un.</td>
                    <td className="p-4 text-right bg-orange-50/10 font-medium text-orange-600">
                      ${row.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`p-4 text-right font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {balance > 0 ? '+' : ''}${balance.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No hay movimientos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-3 bg-slate-50 text-xs text-center text-slate-500 border-t border-slate-100">
          Nota: El balance es la diferencia entre Ventas Totales e Inversión Total registrada.
        </div>
      </div>
    </div>
  );
};

export default MonthlyReport;