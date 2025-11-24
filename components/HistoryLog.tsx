import React, { useState } from 'react';
import { StockMovement } from '../types';
import { Search, ArrowDownRight, ArrowUpRight, Calendar, Filter, Tag, DollarSign } from 'lucide-react';

interface HistoryLogProps {
  movements: StockMovement[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ movements }) => {
  const [filterType, setFilterType] = useState<'all' | 'entry' | 'exit'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sort by newest first
  const sortedMovements = [...movements].sort((a, b) => b.timestamp - a.timestamp);

  const filteredMovements = sortedMovements.filter(m => {
    const matchesType = filterType === 'all' || m.type === filterType;
    const matchesSearch = 
      m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full animate-fade-in">
      {/* Header / Controls */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white sticky top-0 z-10">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por producto o lote..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={18} className="text-slate-400 hidden sm:block" />
          <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('entry')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filterType === 'entry' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Entradas
            </button>
            <button
              onClick={() => setFilterType('exit')}
              className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-medium transition-all ${filterType === 'exit' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Salidas
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMovements.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredMovements.map(movement => (
              <div key={movement.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${movement.type === 'entry' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {movement.type === 'entry' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{movement.itemName}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{formatDate(movement.timestamp)}</span>
                        <span className="text-slate-300 ml-1">{formatTime(movement.timestamp)}</span>
                      </span>
                      
                      {movement.batchNumber && (
                        <>
                          <span className="hidden sm:inline text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                            <Tag size={10} />
                            <span>Lote: {movement.batchNumber}</span>
                          </span>
                        </>
                      )}

                      {/* Show sale amount if exit */}
                      {movement.type === 'exit' && movement.salePrice !== undefined && (
                        <>
                          <span className="hidden sm:inline text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <DollarSign size={10} />
                            <span>Total: ${(movement.salePrice * movement.quantity).toFixed(2)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0`}>
                   {/* Mobile only batch display if exists */}
                   {movement.batchNumber && (
                     <span className="sm:hidden flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                        <Tag size={10} />
                        <span>{movement.batchNumber}</span>
                     </span>
                   )}
                   <span className={`font-mono font-bold text-lg ml-auto ${movement.type === 'entry' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {movement.type === 'entry' ? '+' : '-'}{movement.quantity}
                   </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center h-full">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Calendar size={32} className="opacity-20" />
             </div>
             <p>No hay movimientos registrados</p>
             {searchTerm && <p className="text-xs mt-2">Prueba con otra búsqueda</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryLog;