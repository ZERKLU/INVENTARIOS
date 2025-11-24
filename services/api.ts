
import { supabase } from './supabaseClient';
import { InventoryItem, StockMovement } from '../types';

// Helper for LocalStorage
const LS_KEYS = {
  ITEMS: 'inventory_items',
  MOVEMENTS: 'inventory_movements'
};

const getLocal = (key: string) => JSON.parse(localStorage.getItem(key) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

// ITEMS API
export const api = {
  // Fetch all items
  fetchItems: async (): Promise<InventoryItem[]> => {
    if (supabase) {
      const { data, error } = await supabase.from('items').select('*');
      if (error) {
        console.error('Error fetching items:', error);
        return [];
      }
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: Number(item.quantity),
        price: Number(item.price),
        description: item.description,
        imageUrl: item.image_url,
        createdAt: Number(item.created_at),
        updatedAt: Number(item.updated_at),
        batchNumber: item.batch_number
      }));
    } else {
      // LocalStorage Fallback
      return getLocal(LS_KEYS.ITEMS);
    }
  },

  // Create Item
  createItem: async (item: InventoryItem): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('items').insert({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        description: item.description,
        image_url: item.imageUrl || '',
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        batch_number: item.batchNumber
      });
      if (error) console.error('Error creating item:', error);
    } else {
      // LocalStorage Fallback
      const items = getLocal(LS_KEYS.ITEMS);
      items.unshift(item);
      setLocal(LS_KEYS.ITEMS, items);
    }
  },

  // Update Item
  updateItem: async (item: InventoryItem): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('items').update({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        description: item.description,
        image_url: item.imageUrl || '',
        updated_at: item.updatedAt,
        batch_number: item.batchNumber
      }).eq('id', item.id);
      if (error) console.error('Error updating item:', error);
    } else {
      // LocalStorage Fallback
      const items = getLocal(LS_KEYS.ITEMS);
      const index = items.findIndex((i: InventoryItem) => i.id === item.id);
      if (index !== -1) {
        items[index] = item;
        setLocal(LS_KEYS.ITEMS, items);
      }
    }
  },

  // Delete Item
  deleteItem: async (id: string): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('items').delete().eq('id', id);
      if (error) console.error('Error deleting item:', error);
    } else {
      // LocalStorage Fallback
      const items = getLocal(LS_KEYS.ITEMS);
      const filtered = items.filter((i: InventoryItem) => i.id !== id);
      setLocal(LS_KEYS.ITEMS, filtered);
    }
  },

  // MOVEMENTS API
  
  // Fetch Movements
  fetchMovements: async (): Promise<StockMovement[]> => {
    if (supabase) {
      const { data, error } = await supabase
        .from('movements')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching movements:', error);
        return [];
      }

      return data.map((m: any) => ({
        id: m.id,
        itemId: m.item_id,
        itemName: m.item_name,
        type: m.type as 'entry' | 'exit',
        quantity: Number(m.quantity),
        timestamp: Number(m.timestamp),
        batchNumber: m.batch_number,
        salePrice: m.sale_price ? Number(m.sale_price) : undefined,
        purchasePrice: m.purchase_price ? Number(m.purchase_price) : undefined
      }));
    } else {
      // LocalStorage Fallback
      return getLocal(LS_KEYS.MOVEMENTS);
    }
  },

  // Create Movement
  createMovement: async (movement: StockMovement): Promise<void> => {
    if (supabase) {
      const { error } = await supabase.from('movements').insert({
        id: movement.id,
        item_id: movement.itemId,
        item_name: movement.itemName,
        type: movement.type,
        quantity: movement.quantity,
        timestamp: movement.timestamp,
        batch_number: movement.batchNumber,
        sale_price: movement.salePrice,
        purchase_price: movement.purchasePrice
      });
      if (error) console.error('Error creating movement:', error);
    } else {
      // LocalStorage Fallback
      const movements = getLocal(LS_KEYS.MOVEMENTS);
      movements.unshift(movement);
      setLocal(LS_KEYS.MOVEMENTS, movements);
    }
  }
};
