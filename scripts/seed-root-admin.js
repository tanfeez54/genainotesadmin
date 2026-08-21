const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://ssngocvqdgieseajigno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmdvY3ZxZGdpZXNlYWppZ25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzEyNjAyNiwiZXhwIjoyMTAyNzAyMDI2fQ.gS6tUdqGxIcQmVOSUWFWZHhLMlXdACyhlFFacqRHkJ4';

if (!supabaseKey) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedRootAdmin() {
  const email = 'admin@kavionquestion.com';
  const password = 'AdminPassword123!';
  const fullName = 'Kavion Root Admin';

  console.log(`🌱 Seeding initial Root Admin (${email})...`);

  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('platform_admins')
    .upsert(
      {
        email: email.toLowerCase(),
        password_hash: passwordHash,
        full_name: fullName,
        role: 'root_admin',
        is_active: true,
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }

  console.log('✅ Super Admin created successfully!');
  console.log('----------------------------------------------------');
  console.log(`🔐 URL:      http://localhost:3002/login`);
  console.log(`📧 Email:    ${email}`);
  console.log(`🔑 Password: ${password}`);
  console.log('----------------------------------------------------');
}

seedRootAdmin();
