import React from 'react';
import { InventoryItem } from '../types';
import { X, AlertTriangle, Package } from 'lucide-react';

interface LowStockModalProps {
  items: InventoryItem[];
  onClose: () => void;
}

const LowStockModal: React.FC<LowStockModalProps> = ({ items, onClose }) => {
  const lowStockItems = items.filter(item => item.quantity < 5);
  const totalLowStockValue = lowStockItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalLowStockUnits = lowStockItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Alertas de Stock Bajo</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-slate-700">{lowStockItems.length}</span> productos
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <Package size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-700">{totalLowStockUnits}</span> unidades totales
                </span>
                <span className="hidden sm:inline text-slate-300">|</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                  Valor Total: ${totalLowStockValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-0">
          {lowStockItems.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider sticky top-0 shadow-sm z-10">
                <tr>
                  <th className="p-4 bg-slate-50">Producto</th>
                  <th className="p-4 bg-slate-50 text-center">Stock Actual</th>
                  <th className="p-4 bg-slate-50 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {lowStockItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                               {item.name.charAt(0).toUpperCase()}
                             </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <span className="text-xs text-slate-400">${item.price.toFixed(2)} / unidad</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                        {item.quantity} un.
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-700">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center h-64">
              <div className="bg-emerald-50 p-4 rounded-full mb-4 text-emerald-600 animate-bounce-slow">
                <AlertTriangle size={32} />
              </div>
              <p className="text-lg font-bold text-slate-800">¡Todo en orden!</p>
              <p className="text-sm text-slate-500 mt-1">Tu inventario está saludable, no hay productos con stock bajo.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockModal;
