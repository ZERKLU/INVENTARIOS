import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { Search, Package, CheckCircle2, Plus, Calendar, Tag, DollarSign, Box } from 'lucide-react';

interface StockManagerProps {
  items: InventoryItem[];
  mode: 'entry' | 'exit';
  onConfirmMovement: (item: InventoryItem, type: 'entry' | 'exit', quantity: number, batchNumber?: string, entryDate?: string, salePrice?: number, purchasePrice?: number) => void;
  onCreateNew?: () => void;
}

const StockManager: React.FC<StockManagerProps> = ({ items, mode, onConfirmMovement, onCreateNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Form States
  const [quantity, setQuantity] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState('');
  const [entryDate, setEntryDate] = useState('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New States for Bag/Bulk Entry
  const [entryType, setEntryType] = useState<'unit' | 'bag'>('unit');
  const [piecesPerBag, setPiecesPerBag] = useState<string>('');
  const [bagCost, setBagCost] = useState<string>('');

  const isEntry = mode === 'entry';

  // Reset selection when mode changes
  useEffect(() => {
    resetForm();
    setSearchTerm('');
  }, [mode]);

  const resetForm = () => {
    setSelectedItem(null);
    setQuantity('');
    setBatchNumber('');
    setEntryDate(new Date().toISOString().split('T')[0]); // Default to today
    setSalePrice('');
    setPurchasePrice('');
    setSuccessMsg(null);
    
    // Reset bag logic
    setEntryType('unit');
    setPiecesPerBag('');
    setBagCost('');
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setQuantity('');
    // Keep batch/date if needed, or reset:
    setBatchNumber('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setSalePrice(item.price.toString()); // Default to current price for sales
    setPurchasePrice(''); // Default empty for purchase cost
    setSuccessMsg(null);
    
    // Reset bag logic on select
    setEntryType('unit');
    setPiecesPerBag('');
    setBagCost('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const rawQty = parseInt(quantity);
    if (isNaN(rawQty) || rawQty <= 0) return;

    let finalQuantity = rawQty;
    let finalPurchasePrice = isEntry && purchasePrice ? parseFloat(purchasePrice) : undefined;
    const finalSalePrice = !isEntry && salePrice ? parseFloat(salePrice) : undefined;

    // Logic for Bag Entry
    if (isEntry && entryType === 'bag') {
      const pieces = parseInt(piecesPerBag);
      const costPerBag = parseFloat(bagCost);
      
      if (!isNaN(pieces) && pieces > 0) {
        // Calculate total pieces to register
        finalQuantity = rawQty * pieces;
        
        // Calculate unit cost from bag cost
        if (!isNaN(costPerBag) && costPerBag > 0) {
          finalPurchasePrice = costPerBag / pieces;
        }
      } else {
        return; // Invalid bag config
      }
    }

    onConfirmMovement(selectedItem, mode, finalQuantity, isEntry ? batchNumber : undefined, isEntry ? entryDate : undefined, finalSalePrice, finalPurchasePrice);
    
    const msgType = isEntry ? (entryType === 'bag' ? 'bolsas' : 'unidades') : 'unidades';
    setSuccessMsg(`Se registró correctamente la ${mode === 'entry' ? 'entrada' : 'salida'} de ${rawQty} ${msgType} (${finalQuantity} piezas totales).`);
    
    // Reset fields but keep some context if user wants to add more
    setQuantity('');
    setBatchNumber('');
    setPurchasePrice('');
    setBagCost('');
    // Keep Date, PiecesPerBag, EntryType as is for easier sequential entry
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-8rem)] animate-fade-in pb-20 lg:pb-0">
      
      {/* Left Panel: Product Selection */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-72 lg:h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
               {isEntry ? '1. Seleccionar' : '1. Seleccionar'}
             </h2>
             {isEntry && onCreateNew && (
               <button 
                 onClick={onCreateNew}
                 className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
               >
                 <Plus size={12} /> Nuevo
               </button>
             )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {filteredItems.length > 0 ? filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-all flex items-center gap-3 border-l-4 ${
                selectedItem?.id === item.id 
                  ? isEntry ? 'bg-blue-50 border-blue-500' : 'bg-orange-50 border-orange-500'
                  : 'bg-white border-transparent'
              }`}
            >
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 font-bold">
                      {item.name.charAt(0).toUpperCase()}
                    </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${selectedItem?.id === item.id ? (isEntry ? 'text-blue-700' : 'text-orange-700') : 'text-slate-700'}`}>
                  {item.name}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Stock: {item.quantity}</p>
                  {!isEntry && <p className="text-xs font-semibold text-slate-600">${item.price}</p>}
                </div>
              </div>
            </button>
          )) : (
            <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center">
              <p className="mb-2">No se encontraron productos.</p>
              {isEntry && onCreateNew && (
                <button 
                  onClick={onCreateNew}
                  className="text-blue-600 font-medium hover:underline"
                >
                  ¿Crear "{searchTerm}"?
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Action Form */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 p-6 lg:p-8 flex flex-col items-center justify-start lg:justify-center relative overflow-hidden min-h-[400px]">
        
        {selectedItem ? (
          <div className="w-full max-w-md animate-in fade-in zoom-in duration-300">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 text-center">
              {isEntry ? '2. Confirmar Ingreso' : '2. Confirmar Salida'}
            </h2>
            
            <div className={`flex items-center gap-4 mb-6 p-4 rounded-xl border ${isEntry ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
              <div className="w-16 h-16 rounded-lg bg-white shadow-sm flex-shrink-0 overflow-hidden p-1">
                 {selectedItem.imageUrl ? (
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover rounded" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg text-slate-400 font-bold bg-slate-100 rounded">
                      {selectedItem.name.charAt(0).toUpperCase()}
                    </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800">{selectedItem.name}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Package size={16} />
                  <span>Stock Actual: <strong>{selectedItem.quantity}</strong></span>
                </div>
              </div>
              {!isEntry && (
                 <div className="text-right">
                   <p className="text-xs text-slate-500">Precio Lista</p>
                   <p className="font-bold text-slate-800">${selectedItem.price}</p>
                 </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Entry Type Toggle (Unit vs Bag) */}
              {isEntry && (
                <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setEntryType('unit')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      entryType === 'unit' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Package size={16} />
                    Por Pieza
                  </button>
                  <button
                    type="button"
                    onClick={() => setEntryType('bag')}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      entryType === 'bag' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Box size={16} />
                    Por Bolsa
                  </button>
                </div>
              )}

              {/* Extra fields for Entry */}
              {isEntry && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1">
                      <Tag size={12} /> No. Lote
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
                      <Calendar size={12} /> Fecha Ingreso
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
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                   <div className="space-y-2">
                     <label className="text-sm font-medium text-slate-700">Piezas por Bolsa</label>
                     <input
                        type="number"
                        min="1"
                        value={piecesPerBag}
                        onChange={(e) => setPiecesPerBag(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all"
                        placeholder="Ej. 50"
                     />
                   </div>
                </div>
              )}

              {/* Main Quantity Input */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 block text-center">
                    {isEntry && entryType === 'bag' ? 'Cantidad de Bolsas' : 'Cantidad'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max={!isEntry ? selectedItem.quantity : undefined}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className={`w-full px-4 py-4 text-2xl font-bold text-center rounded-xl border focus:ring-4 outline-none transition-all ${
                         isEntry 
                         ? 'border-slate-200 focus:border-blue-500 focus:ring-blue-50 text-blue-600' 
                         : 'border-slate-200 focus:border-orange-500 focus:ring-orange-50 text-orange-600'
                      }`}
                      placeholder="0"
                      autoFocus
                    />
                    {!isEntry && (
                      <div className="text-center mt-1 text-xs text-slate-400">
                        Max: {selectedItem.quantity}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Input for Exit (Sales) */}
                {!isEntry && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block text-center">
                       Precio Venta (Un.)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={salePrice}
                        onChange={(e) => setSalePrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-center rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 text-emerald-600 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                 {/* Cost Input for Entry (Purchases) */}
                 {isEntry && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 block text-center">
                       {entryType === 'bag' ? 'Costo por Bolsa' : 'Costo Compra (Un.)'}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={entryType === 'bag' ? bagCost : purchasePrice}
                        onChange={(e) => entryType === 'bag' ? setBagCost(e.target.value) : setPurchasePrice(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 text-2xl font-bold text-center rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-blue-600 outline-none transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary for Bag Entry */}
              {isEntry && entryType === 'bag' && quantity && piecesPerBag && (
                 <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 space-y-2">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Total Piezas a Registrar:</span>
                      <span className="font-bold text-blue-700">
                        {parseInt(quantity) * parseInt(piecesPerBag)} unidades
                      </span>
                   </div>
                   {bagCost && (
                     <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">Costo Unitario (Calc):</span>
                        <span className="font-medium text-slate-700">
                          ${(parseFloat(bagCost) / parseInt(piecesPerBag)).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                     </div>
                   )}
                 </div>
              )}

              {/* Summary for Exit */}
              {!isEntry && quantity && salePrice && (
                 <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                   <span className="text-slate-500 font-medium text-sm">Total de Venta:</span>
                   <span className="text-xl font-bold text-slate-800">
                     ${(parseInt(quantity) * parseFloat(salePrice)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                   </span>
                 </div>
              )}

               {/* Summary for Entry (Unit) */}
               {isEntry && entryType === 'unit' && quantity && purchasePrice && (
                 <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center border border-slate-100">
                   <span className="text-slate-500 font-medium text-sm">Total Inversión:</span>
                   <span className="text-xl font-bold text-slate-800">
                     ${(parseInt(quantity) * parseFloat(purchasePrice)).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                   </span>
                 </div>
              )}

              <button
                type="submit"
                disabled={
                  !quantity || 
                  parseInt(quantity) <= 0 || 
                  (!isEntry && parseInt(quantity) > selectedItem.quantity) ||
                  (isEntry && entryType === 'bag' && (!piecesPerBag || parseInt(piecesPerBag) <= 0))
                }
                className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isEntry 
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' 
                    : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'
                }`}
              >
                {isEntry ? 'Registrar Entrada' : 'Registrar Salida'}
              </button>
            </form>

            {/* Feedback Message */}
            {successMsg && (
              <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                <CheckCircle2 size={20} />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-slate-400">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="opacity-20" />
            </div>
            <p className="text-lg font-medium text-slate-600">
              {isEntry ? 'Selecciona o crea un producto' : 'Selecciona un producto'}
            </p>
            <p className="text-sm mt-1">
              {isEntry 
                ? 'Elige de la lista superior para agregar inventario.' 
                : 'Elige un ítem de la lista superior para registrar una venta.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockManager;