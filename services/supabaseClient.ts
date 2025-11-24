
import { createClient } from '@supabase/supabase-js';

// ⚠️ REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO DE SUPABASE
// Si dejas estos valores por defecto, la aplicación funcionará usando LocalStorage (guardado en tu navegador).
const SUPABASE_URL = 'TU_URL_DE_SUPABASE';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY_DE_SUPABASE';

const isValidUrl = (url: string) => {
  try {
    return new URL(url).protocol.startsWith('http');
  } catch (e) {
    return false;
  }
};

export const supabase = isValidUrl(SUPABASE_URL) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;
