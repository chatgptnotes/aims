/**
 * Script to check and update clinic fields (phone, address, contact_person)
 * Run with: node update-clinic-fields.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndUpdateClinics() {
  try {
    console.log('🔍 Fetching all clinics...');

    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('*');

    if (error) {
      console.error('❌ Error fetching clinics:', error);
      return;
    }

    console.log(`📊 Found ${clinics.length} clinics`);

    for (const clinic of clinics) {
      console.log('\n---');
      console.log('🏥 Clinic:', clinic.name);
      console.log('📧 Email:', clinic.email);
      console.log('👤 Contact Person:', clinic.contact_person || '(empty)');
      console.log('📞 Phone:', clinic.phone || '(empty)');
      console.log('📍 Address:', clinic.address || '(empty)');

      // If any field is null/empty, you can update it here
      // Example:
      // if (!clinic.phone) {
      //   const { error: updateError } = await supabase
      //     .from('clinics')
      //     .update({ phone: 'default-phone-number' })
      //     .eq('id', clinic.id);
      //
      //   if (updateError) {
      //     console.error('❌ Error updating clinic:', updateError);
      //   } else {
      //     console.log('✅ Updated phone for', clinic.name);
      //   }
      // }
    }

    console.log('\n✅ Check complete!');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndUpdateClinics();
