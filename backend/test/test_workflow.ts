// End-to-End State Machine and Lifecycle Workflow Test
const API_BASE = process.env.API_BASE || 'http://localhost:4000';

async function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    throw new Error(msg);
  }
  console.log(`✅ PASSED: ${msg}`);
}

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('🚀 Starting MN GROUPS API Integration & State Machine Tests...');
  console.log('----------------------------------------------------');

  // 1. Health check
  const healthRes = await fetch(`${API_BASE}/health`);
  const health = await healthRes.json();
  await assert(healthRes.status === 200 && health.status === 'ok', 'Server health check returns ok');

  // 2. Dashboard summary
  const dashRes = await fetch(`${API_BASE}/dashboard/summary`);
  const dash = await dashRes.json();
  await assert(dashRes.status === 200, 'Dashboard summary returns 200');
  await assert(dash.kpis.totalProperties > 0, `Total properties: ${dash.kpis.totalProperties}`);
  await assert(dash.kpis.totalTenants > 0, `Total tenants: ${dash.kpis.totalTenants}`);
  await assert(Array.isArray(dash.trend) && dash.trend.length === 6, '6-week trend data populated');
  await assert(Array.isArray(dash.categoryDistribution) && dash.categoryDistribution.length > 0, 'Category doughnut distribution populated');

  // 3. Tenant raises a complaint (auto-assigned vendor)
  console.log('\n--- Step 1: Tenant raises a complaint ---');
  const createRes = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_id: 't1',
      category_id: 'plumbing',
      description: 'Water leaking heavily from the kitchen drain pipe.',
      before_photos: ['/uploads/mock-leak-1.jpg']
    })
  });
  const created = await createRes.json();
  await assert(createRes.status === 201, 'Complaint created successfully (201)');
  await assert(created.id.startsWith('MC-'), `Generated human-readable ID: ${created.id}`);
  await assert(created.status === 'Assigned', `Status auto-assigned: ${created.status}`);
  await assert(created.vendor_id === 'v1', `Auto-assigned default plumbing vendor: ${created.vendor_id}`);
  const complaintId = created.id;

  // 4. Negative Test: Cannot jump from Assigned directly to Completed
  console.log('\n--- Step 2: Negative Test — invalid state skip ---');
  const badCompleteRes = await fetch(`${API_BASE}/complaints/${complaintId}/complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      after_photos: ['/uploads/mock-fixed.jpg'],
      completion_notes: 'Bypassed in progress'
    })
  });
  await assert(badCompleteRes.status === 400, 'Direct Assigned -> Completed rejected by state machine (400)');

  // 5. Vendor accepts & starts job
  console.log('\n--- Step 3: Vendor accepts and starts job ---');
  const startRes = await fetch(`${API_BASE}/complaints/${complaintId}/start`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
  });
  const started = await startRes.json();
  await assert(startRes.status === 200, 'Vendor started job successfully (200)');
  await assert(started.status === 'In Progress', `Status transitioned to 'In Progress': ${started.status}`);
  await assert(Boolean(started.started_at), 'started_at timestamp recorded');

  // 6. Negative Test: Cannot complete without after-photos
  console.log('\n--- Step 4: Negative Test — complete without photos ---');
  const missingPhotoRes = await fetch(`${API_BASE}/complaints/${complaintId}/complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      after_photos: [],
      completion_notes: 'Missing photo'
    })
  });
  await assert(missingPhotoRes.status === 400, 'Completion rejected when after-photos is missing (400)');

  // 7. Vendor submits completion report
  console.log('\n--- Step 5: Vendor submits completion report ---');
  const completeRes = await fetch(`${API_BASE}/complaints/${complaintId}/complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      after_photos: ['/uploads/mock-repaired-pipe.jpg'],
      materials_used: 'PVC slip joint washer, thread sealant',
      completion_notes: 'Replaced broken P-trap washer and resealed line. Tested under high pressure with no leaks.'
    })
  });
  const completed = await completeRes.json();
  await assert(completeRes.status === 200, 'Vendor report submitted (200)');
  await assert(completed.status === 'Completed', `Status transitioned to 'Completed': ${completed.status}`);
  await assert(completed.after_photos.length === 1, 'After-photo attached');
  await assert(Boolean(completed.completed_at), 'completed_at timestamp recorded');

  // 8. Negative Test: Cannot verify without star rating
  console.log('\n--- Step 6: Negative Test — verify without rating ---');
  const noRatingRes = await fetch(`${API_BASE}/complaints/${complaintId}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: 0,
      feedback: 'Forgot star rating'
    })
  });
  await assert(noRatingRes.status === 400, 'Verification rejected without 1-5 star rating (400)');

  // 9. Tenant verifies and gives 5-star rating
  console.log('\n--- Step 7: Tenant verifies and gives 5-star rating ---');
  const verifyRes = await fetch(`${API_BASE}/complaints/${complaintId}/verify`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating: 5,
      feedback: 'Excellent plumbing work! Came right on time and fixed it cleanly.'
    })
  });
  const closed = await verifyRes.json();
  await assert(verifyRes.status === 200, 'Tenant verified and closed complaint (200)');
  await assert(closed.status === 'Closed', `Status transitioned to 'Closed': ${closed.status}`);
  await assert(closed.rating === 5, 'Rating recorded as 5');
  await assert(Boolean(closed.verified_at && closed.closed_at), 'verified_at & closed_at timestamps recorded');

  // 10. Audit check on single complaint
  console.log('\n--- Step 8: Verifying complete complaint audit trail ---');
  const getRes = await fetch(`${API_BASE}/complaints/${complaintId}`);
  const finalComplaint = await getRes.json();
  await assert(finalComplaint.id === complaintId, 'Retrieved final complaint details');
  await assert(finalComplaint.tenant_name === 'Rahul Kumar', `Tenant name joined: ${finalComplaint.tenant_name}`);
  await assert(finalComplaint.property_name === 'Galaxy PG', `Property name joined: ${finalComplaint.property_name}`);
  await assert(finalComplaint.vendor_name === 'XYZ Plumbing Services', `Vendor name joined: ${finalComplaint.vendor_name}`);

  console.log('\n====================================================');
  console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
