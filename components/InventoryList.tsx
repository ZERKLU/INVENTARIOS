import React, { useState } from 'react';
import { InventoryItem, Category } from '../types';
import { Edit2, Trash2, Search, Filter, AlertCircle, PlusCircle, MinusCircle } from 'lucide-react';

interface InventoryListProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  onEntry: (item: InventoryItem) => void;
  onExit: (item: InventoryItem) => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ items, onEdit, onDelete, onEntry, onExit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesLowStock = onlyLowStock ? item.quantity < 5 : true;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in">
      
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row gap-4 justify-between items-center bg-white sticky top-0 z-10">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o descripción..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setOnlyLowStock(!onlyLowStock)}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${
              onlyLowStock 
                ? 'bg-orange-50 border-orange-200 text-orange-700 font-medium' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            <AlertCircle size={16} />
            <span className="whitespace-nowrap">Stock Bajo</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400 hidden sm:block" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 outline-none focus:border-blue-500 cursor-pointer bg-white"
            >
              <option value="all">Todas</option>
              {Object.values(Category).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider sticky top-0 z-10">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4 hidden md:table-cell">Categoría</th>
              <th className="p-4 text-right">Precio</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center w-48 hidden lg:table-cell">Movimientos</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredItems.length > 0 ? filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold bg-slate-100">
                           {item.name.charAt(0).toUpperCase()}
                         </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[150px] md:max-w-[200px]">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    {item.category}
                  </span>
                </td>
                <td className="p-4 text-right font-medium text-slate-700">
                  ${item.price.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <div className={`inline-flex items-center gap-1 font-medium ${item.quantity < 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {item.quantity < 5 && <AlertCircle size={14} />}
                    {item.quantity}
                  </div>
                </td>
                <td className="p-4 hidden lg:table-cell">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEntry(item)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm"
                      title="Registrar Entrada"
                    >
                      <PlusCircle size={14} />
                      <span className="text-xs font-medium">Entrada</span>
                    </button>
                    <button
                      onClick={() => onExit(item)}
                      disabled={item.quantity === 0}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Registrar Salida"
                    >
                      <MinusCircle size={14} />
                      <span className="text-xs font-medium">Salida</span>
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="p-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Search size={48} className="opacity-20" />
                    <p>No se encontraron productos {onlyLowStock && 'con stock bajo'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 text-center">
        Mostrando {filteredItems.length} de {items.length} productos
      </div>
    </div>
  );
};

export default InventoryList;