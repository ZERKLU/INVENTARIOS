import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { X, ArrowDownRight, ArrowUpRight, Package, Calendar, Tag, DollarSign, Box } from 'lucide-react';

interface StockMovementModalProps {
  item: InventoryItem;
  type: 'entry' | 'exit';
  onConfirm: (quantity: number, batchNumber?: string, entryDate?: string, salePrice?: number, purchasePrice?: number) => void;
  onCancel: () => void;
}

const StockMovementModal: React.FC<StockMovementModalProps> = ({ item, type, onConfirm, onCancel }) => {
  const [quantity, setQuantity] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [salePrice, setSalePrice] = useState<string>(item.price.toString());
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  
  // New States for Bag/Bulk Entry
  const [entryType, setEntryType] = useState<'unit' | 'bag'>('unit');
  const [piecesPerBag, setPiecesPerBag] = useState<string>('');
  const [bagCost, setBagCost] = useState<string>('');

  const isEntry = type === 'entry';
  const maxExit = item.quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawQty = parseInt(quantity);
    if (rawQty > 0) {
      let finalQuantity = rawQty;
      let finalPurchasePrice = isEntry && purchasePrice ? parseFloat(purchasePrice) : undefined;
      const finalSalePrice = !isEntry ? parseFloat(salePrice) : undefined;

      // Logic for Bag Entry
      if (isEntry && entryType === 'bag') {
        const pieces = parseInt(piecesPerBag);
        const costPerBag = parseFloat(bagCost);
        
        if (!isNaN(pieces) && pieces > 0) {
          finalQuantity = rawQty * pieces;
          if (!isNaN(costPerBag) && costPerBag > 0) {
            finalPurchasePrice = costPerBag / pieces;
          }
        } else {
          return;
        }
      }

      onConfirm(finalQuantity, isEntry ? batchNumber : undefined, isEntry ? entryDate : undefined, finalSalePrice, finalPurchasePrice);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className={`p-6 border-b border-slate-100 flex justify-between items-center ${isEntry ? 'bg-blue-50/50' : 'bg-orange-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isEntry ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              {isEntry ? <ArrowDownRight size={24} /> : <ArrowUpRight size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {isEntry ? 'Registrar Entrada' : 'Registrar Salida'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {item.name}
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors bg-white/50 hover:bg-white p-2 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Current Stock Display */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500">
              <Package size={18} />
              <span className="text-sm font-medium">Stock Actual</span>
            </div>
            <span className="text-lg font-bold text-slate-800">{item.quantity} un.</span>
          </div>

          {/* Entry Type Toggle (Unit vs Bag) */}
          {isEntry && (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setEntryType('unit')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  entryType === 'unit' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Package size={14} />
                Por Pieza
              </button>
              <button
                type="button"
                onClick={() => setEntryType('bag')}
                className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  entryType === 'bag' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Box size={14} />
                Por Bolsa
              </button>
            </div>
          )}

          {/* Extra fields for Entry */}
          {isEntry && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Tag size={12} /> Lote
                </label>
                <input 
                  type="text"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  placeholder="Opcional"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                  <Calendar size={12} /> Fecha
                </label>
                <input 
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* Bag Specific Fields */}
          {isEntry && entryType === 'bag' && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Piezas por Bolsa</label>
                  <input
                    type="number"
                    min="1"
                    value={piecesPerBag}
                    onChange={(e) => setPiecesPerBag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all text-sm"
                    placeholder="Ej. 50"
                  />
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
             <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {isEntry && entryType === 'bag' ? 'Cantidad de Bolsas' : `Cantidad a ${isEntry ? 'agregar' : 'retirar'}`}
                </label>
                <input
                  type="number"
                  min="1"
                  max={!isEntry ? maxExit : undefined}
                  required
                  autoFocus
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 text-lg rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                  placeholder="0"
                />
                {!isEntry && (
                  <p className="text-xs text-slate-400 text-right">
                    Máximo disponible: {maxExit}
                  </p>
                )}
             </div>

             {!isEntry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Precio de Venta (Unitario)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                    />
                  </div>
                </div>
             )}

             {isEntry && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {entryType === 'bag' ? 'Costo por Bolsa' : 'Costo Compra (Unitario)'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={entryType === 'bag' ? bagCost : purchasePrice}
                      onChange={(e) => entryType === 'bag' ? setBagCost(e.target.value) : setPurchasePrice(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>
             )}

             {/* Summary for Bag Entry */}
             {isEntry && entryType === 'bag' && quantity && piecesPerBag && (
                 <div className="text-xs text-blue-700 font-medium bg-blue-50 p-2 rounded text-center">
                   Total: {parseInt(quantity) * parseInt(piecesPerBag)} unidades
                 </div>
             )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                !quantity || 
                parseInt(quantity) <= 0 || 
                (!isEntry && parseInt(quantity) > maxExit) ||
                (isEntry && entryType === 'bag' && (!piecesPerBag || parseInt(piecesPerBag) <= 0))
              }
              className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all flex items-center justify-center gap-2
                ${isEntry 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovementModal;