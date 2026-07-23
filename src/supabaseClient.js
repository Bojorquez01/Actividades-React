import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dkpehxcqlpxfrmosrgft.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_i33X72ApG6O3a5mcrIf2-Q_1YDh5GRz'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);