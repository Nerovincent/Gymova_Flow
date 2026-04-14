import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

// Read .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = envFile.split('\n').reduce((acc, line) => {
  const [key, ...values] = line.split('=');
  if (key && values.length) {
    acc[key.trim()] = values.join('=').trim().replace(/"/g, '');
  }
  return acc;
}, {} as Record<string, string>);

const supabaseAdmin = createClient(env['NEXT_PUBLIC_SUPABASE_URL'], env['SUPABASE_SERVICE_ROLE_KEY']);

(async () => {
  const res = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: 'test_1234_' + Date.now() + '@example.com',
    password: 'password123',
  });
  console.log(JSON.stringify(res, null, 2));
})();
