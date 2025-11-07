/**
 * Utility to verify and fix report records
 * Run this from browser console on the Reports page
 */

export async function verifyAndFixReports() {
  console.log('🔍 Starting report verification...\n');

  // Import the Supabase service
  const { default: SupabaseService } = await import('../services/supabaseService.js');
  const supabaseService = new SupabaseService();

  try {
    // Get all reports
    const { data: reports, error } = await supabaseService.supabase
      .from('reports')
      .select('*');

    if (error) {
      console.error('❌ Error fetching reports:', error);
      return { success: false, error };
    }

    console.log(`📊 Total reports found: ${reports?.length || 0}\n`);

    if (!reports || reports.length === 0) {
      console.log('ℹ️ No reports to process');
      return { success: true, message: 'No reports found' };
    }

    // Analyze reports
    const reportsWithOrgId = reports.filter(r => r.org_id);
    const reportsWithoutOrgId = reports.filter(r => !r.org_id);

    console.log('📋 Report Analysis:');
    console.log(`  ✅ Reports with org_id: ${reportsWithOrgId.length}`);
    console.log(`  ❌ Reports without org_id: ${reportsWithoutOrgId.length}\n`);

    // Show all reports with details
    console.log('📝 All Reports:');
    reports.forEach((report, index) => {
      console.log(`\n${index + 1}. Report ID: ${report.id}`);
      console.log(`   - Patient ID: ${report.patient_id || 'N/A'}`);
      console.log(`   - File Name: ${report.file_name || 'N/A'}`);
      console.log(`   - org_id: ${report.org_id || 'MISSING ❌'}`);
      console.log(`   - clinic_id: ${report.clinic_id || 'N/A'}`);
      console.log(`   - Created: ${report.created_at || 'N/A'}`);
    });

    // Fix reports without org_id
    let fixedCount = 0;
    if (reportsWithoutOrgId.length > 0) {
      console.log('\n\n🔧 Fixing reports without org_id...\n');

      for (const report of reportsWithoutOrgId) {
        const clinicIdToUse = report.clinic_id;

        if (clinicIdToUse) {
          console.log(`  Updating report ${report.id} with org_id: ${clinicIdToUse}`);

          const { error: updateError } = await supabaseService.supabase
            .from('reports')
            .update({ org_id: clinicIdToUse })
            .eq('id', report.id);

          if (updateError) {
            console.error(`    ❌ Failed to update report ${report.id}:`, updateError);
          } else {
            console.log(`    ✅ Successfully updated report ${report.id}`);
            fixedCount++;
          }
        } else {
          console.warn(`    ⚠️ Report ${report.id} has no clinic_id to use!`);
        }
      }

      console.log(`\n✅ Fix process completed! Fixed ${fixedCount} reports.`);
    } else {
      console.log('\n✅ All reports already have org_id field!');
    }

    return {
      success: true,
      total: reports.length,
      withOrgId: reportsWithOrgId.length,
      withoutOrgId: reportsWithoutOrgId.length,
      fixed: fixedCount
    };

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return { success: false, error };
  }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.verifyAndFixReports = verifyAndFixReports;
}
