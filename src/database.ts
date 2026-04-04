import { createClient } from '@supabase/supabase-js';
import type { Database } from './dbTypes';

const supabaseUrl = 'https://hxxvlibjifzjaxueocms.supabase.co';
const supabaseKey = 'sb_publishable_3qkX4ySUDscqh_USY2zlPA_KhiMzpYE';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
