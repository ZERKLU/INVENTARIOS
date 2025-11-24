
import React, { useState, useEffect } from 'react';
import { InventoryItem, Category, StockMovement } from './types';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import HistoryLog from './components/HistoryLog';
import ItemForm from './components/ItemForm';
import LowStockModal from './components/LowStockModal';
import StockMovementModal from './components/StockMovementModal';
import StockManager from './components/StockManager';
import MonthlyReport from './components/MonthlyReport';
import { api } from './services/api';
import { LayoutDashboard, List, Box, History, ArrowDownRight, ArrowUpRight, BarChart3, Loader2 } from 'lucide-react';

interface MovementState {
  isOpen: boolean;
  type: 'entry' | 'exit';
  item: InventoryItem | null;
}

type ViewState = 'dashboard' | 'inventory' | 'history' | 'stock-entry' | 'stock-exit' | 'reports';

const App: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [view, setView] = useState<ViewState>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for stock movements (entry/exit)
  const [movementState, setMovementState] = useState<MovementState>({
    isOpen: false,
    type: 'entry',
    item: null
  });

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [fetchedItems, fetchedMovements] = await Promise.all([
          api.fetchItems(),
          api.fetchMovements()
        ]);
        setItems(fetchedItems);
        setMovements(fetchedMovements);
      } catch (error) {
        console.error("Failed to load data from Supabase", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSaveItem = async (itemData: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingItem) {
      // Update existing
      const updatedItem: InventoryItem = {
         ...editingItem,
         ...itemData,
         updatedAt: Date.now()
      };
      
      // Optimistic update
      setItems(prev => prev.map(item => item.id === editingItem.id ? updatedItem : item));
      
      // API Call
      await api.updateItem(updatedItem);
    } else {
      // Create new
      const newItem: InventoryItem = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...itemData
      };
      
      // Optimistic update
      setItems(prev => [newItem, ...prev]);
      
      // API Call
      await api.createItem(newItem);
    }
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      // Optimistic update
      setItems(prev => prev.filter(i => i.id !== id));
      
      // API Call
      await api.deleteItem(id);
    }
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleLowStockClick = () => {
    setIsLowStockModalOpen(true);
  };

  // Stock Movement Handlers
  const openEntry = (item: InventoryItem) => {
    setMovementState({ isOpen: true, type: 'entry', item });
  };

  const openExit = (item: InventoryItem) => {
    setMovementState({ isOpen: true, type: 'exit', item });
  };

  const handleMovementConfirm = (quantity: number, batchNumber?: string, entryDate?: string, salePrice?: number, purchasePrice?: number) => {
    const { item, type } = movementState;
    if (!item) return;
    
    performMovement(item, type, quantity, batchNumber, entryDate, salePrice, purchasePrice);
    setMovementState({ isOpen: false, type: 'entry', item: null });
  };

  // Centralized movement logic used by both Modal and StockManager page
  const performMovement = async (
    item: InventoryItem, 
    type: 'entry' | 'exit', 
    quantity: number, 
    batchNumber?: string,
    entryDate?: string,
    salePrice?: number,
    purchasePrice?: number
  ) => {
    let targetItem = item;
    let isNewClone = false;
    
    // Logic: If entry has a NEW batch number that doesn't match the current item,
    // we create a new row (clone)
    if (type === 'entry' && batchNumber && batchNumber !== item.batchNumber) {
        const existingBatchItem = items.find(i => i.name === item.name && i.batchNumber === batchNumber);
        
        if (existingBatchItem) {
            targetItem = existingBatchItem;
        } else {
            // Create Clone for new Batch
            const newItem: InventoryItem = {
                ...item,
                id: crypto.randomUUID(),
                quantity: 0, // Will be added below
                batchNumber: batchNumber,
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // Optimistic update (create temp)
            setItems(prev => [newItem, ...prev]);
            await api.createItem(newItem);
            
            targetItem = newItem;
            isNewClone = true;
        }
    }

    // 1. Calculate new quantity
    const newQuantity = type === 'entry' 
      ? targetItem.quantity + quantity 
      : Math.max(0, targetItem.quantity - quantity);

    const updatedItem = {
        ...targetItem,
        quantity: newQuantity,
        updatedAt: Date.now()
    };

    // 2. Update State (Optimistic)
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
    
    // 3. API Update Item
    await api.updateItem(updatedItem);

    // 4. Create Movement Record
    const movementTimestamp = entryDate 
      ? new Date(entryDate + 'T12:00:00').getTime() 
      : Date.now();

    const newMovement: StockMovement = {
      id: crypto.randomUUID(),
      itemId: targetItem.id,
      itemName: targetItem.name,
      type: type,
      quantity: quantity,
      timestamp: movementTimestamp,
      batchNumber: batchNumber || targetItem.batchNumber,
      salePrice: salePrice, 
      purchasePrice: purchasePrice 
    };

    setMovements(prev => [newMovement, ...prev]);
    await api.createMovement(newMovement);
  };

  const switchView = (newView: ViewState) => {
    setView(newView);
  };

  const getPageTitle = () => {
    switch (view) {
      case 'dashboard': return 'Resumen Ejecutivo';
      case 'inventory': return 'Lista de Productos';
      case 'stock-entry': return 'Gestión de Entradas';
      case 'stock-exit': return 'Gestión de Salidas';
      case 'history': return 'Historial de Movimientos';
      case 'reports': return 'Reporte de Ganancias';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <p className="text-slate-500 font-medium">Conectando con Supabase...</p>
        <p className="text-xs text-slate-400">Recuerda configurar tus credenciales en services/supabaseClient.ts</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* Sidebar - Mobile Responsive */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col items-center lg:items-stretch z-20 shadow-sm">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
           <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
             <Box className="w-8 h-8" />
             <span className="hidden lg:block">Inventario</span>
           </div>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-2 lg:px-4">
          <button 
            onClick={() => switchView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <LayoutDashboard size={22} />
            <span className="hidden lg:block">Panel General</span>
          </button>
          
          <button 
             onClick={() => switchView('inventory')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'inventory' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <List size={22} />
            <span className="hidden lg:block">Inventario</span>
          </button>

          <button 
             onClick={() => switchView('stock-entry')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'stock-entry' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <ArrowDownRight size={22} />
            <span className="hidden lg:block">Entradas</span>
          </button>

          <button 
             onClick={() => switchView('stock-exit')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'stock-exit' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <ArrowUpRight size={22} />
            <span className="hidden lg:block">Salidas</span>
          </button>

          <button 
             onClick={() => switchView('history')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'history' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <History size={22} />
            <span className="hidden lg:block">Historial</span>
          </button>

          <button 
             onClick={() => switchView('reports')}
             className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'reports' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
          >
            <BarChart3 size={22} />
            <span className="hidden lg:block">Reportes</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 z-10">
           <h1 className="text-xl font-bold text-slate-800">
             {getPageTitle()}
           </h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
           {view === 'dashboard' && (
             <Dashboard 
               items={items} 
               movements={movements} 
               onLowStockClick={handleLowStockClick} 
             />
           )}
           {view === 'inventory' && (
             <InventoryList 
               items={items} 
               onEdit={openEdit} 
               onDelete={handleDeleteItem}
               onEntry={openEntry}
               onExit={openExit}
             />
           )}
           {view === 'stock-entry' && (
             <StockManager 
               items={items}
               mode="entry"
               onConfirmMovement={performMovement}
               onCreateNew={openCreate}
             />
           )}
           {view === 'stock-exit' && (
             <StockManager 
               items={items}
               mode="exit"
               onConfirmMovement={performMovement}
             />
           )}
           {view === 'history' && (
             <HistoryLog movements={movements} />
           )}
           {view === 'reports' && (
             <MonthlyReport items={items} movements={movements} />
           )}
        </div>
      </main>

      {/* Item Form Modal */}
      {isFormOpen && (
        <ItemForm 
          initialData={editingItem} 
          onSave={handleSaveItem} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}

      {/* Low Stock Modal */}
      {isLowStockModalOpen && (
        <LowStockModal
          items={items}
          onClose={() => setIsLowStockModalOpen(false)}
        />
      )}

      {/* Stock Movement Modal (kept for inline actions from Inventory List) */}
      {movementState.isOpen && movementState.item && (
        <StockMovementModal
          item={movementState.item}
          type={movementState.type}
          onConfirm={handleMovementConfirm}
          onCancel={() => setMovementState({ ...movementState, isOpen: false })}
        />
      )}
    </div>
  );
};

export default App;
