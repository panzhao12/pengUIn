import { createClient } from '@supabase/supabase-js';
import type { Database } from './dbTypes';

const supabaseUrl = 'https://xwajagoyuqwubxjydant.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3YWphZ295dXF3dWJ4anlkYW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxNzQ1NDYsImV4cCI6MjA1MTc1MDU0Nn0.d7vcjZnoHqK-7m16QHUjSoruQv0TVqqJoLs6zcELfKU';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
