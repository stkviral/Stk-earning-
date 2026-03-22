import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://zjhdzdbqqbigzpfvyrlt.supabase.co', process.env.VITE_SUPABASE_ANON_KEY || 'your_supabase_anon_key_here');

async function check() {
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}
check();
