
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajxctwbzpgdpypiwpvpu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeGN0d2J6cGdkcHlwaXdwdnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjk4MzksImV4cCI6MjA4MTY0NTgzOX0.tje355ZA2TDZkNeBtsbi0AxGyhtyqqaXvRZyo_XI9u8';

export const supabase = createClient(supabaseUrl, supabaseKey);
