import React, { useState } from 'react';
import { Complaint, Vendor, Category } from '../types';
import { StatusBadge } from './StatusBadge';

interface VendorAppProps {
  vendors: Vendor[];
  currentVendorId: string;
  onSwitchVendor: (id: string) => void;
  complaints: Complaint[];
  categories: Category[];
  onStartJob: (complaintId: string) => Promise<void>;
  onCompleteJob: (complaintId: string, photos: string[], materials: string, notes: string) => Promise<void>;
  onToast: (msg: string) => void;
}

export const VendorApp: React.FC<VendorAppProps> = ({
  vendors,
  currentVendorId,
  onSwitchVendor,
  complaints,
  onStartJob,
  onCompleteJob,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'Assigned' | 'In Progress' | 'Done'>('Assigned');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Completion form draft state
  const [reportNotes, setReportNotes] = useState('');
  const [reportMaterials, setReportMaterials] = useState('');
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const currentVendor = vendors.find(v => v.id === currentVendorId) || vendors[0];
  const myJobs = complaints.filter(c => c.vendor_id === currentVendor?.id);

  const groups = {
    Assigned: myJobs.filter(j => j.status === 'Assigned'),
    'In Progress': myJobs.filter(j => j.status === 'In Progress'),
    Done: myJobs.filter(j => j.status === 'Completed' || j.status === 'Closed')
  };

  const list = groups[activeTab] || [];
  const activeJob = complaints.find(c => c.id === activeJobId);

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const handleAddAfterPhoto = () => {
    const samplePhotos = ['/uploads/tap-fixed-after.svg', '/uploads/cabinet-hinge-after.svg', '/uploads/ac-unit-after.svg'];
    const chosen = samplePhotos[afterPhotos.length % samplePhotos.length];
    setAfterPhotos(prev => [...prev, chosen]);
    onToast('Completion photo attached');
  };

  const handleStartJob = async () => {
    if (!activeJob) return;
    setProcessing(true);
    try {
      await onStartJob(activeJob.id);
      onToast('Job started · marked In Progress in PostgreSQL');
    } catch (err: any) {
      onToast(err.message || 'Failed to start job');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmitComplete = async () => {
    if (!activeJob) return;
    setCompleteError(null);

    if (afterPhotos.length === 0) {
      setCompleteError('Add at least one completion photo.');
      return;
    }
    if (!reportNotes.trim()) {
      setCompleteError('Add a short note on what was done.');
      return;
    }

    setProcessing(true);
    try {
      await onCompleteJob(activeJob.id, afterPhotos, reportMaterials.trim(), reportNotes.trim());
      setReportNotes('');
      setReportMaterials('');
      setAfterPhotos([]);
      setActiveJobId(null);
      setActiveTab('Done');
      onToast('Completion report submitted · Tenant notified for rating');
    } catch (err: any) {
      setCompleteError(err.message || 'Failed to complete job');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="app-stage">
      <div className="phone">
        {/* Phone Head */}
        <div className="phone-head">
          <div className="phone-head-top">
            <div>
              <div className="phone-eyebrow">Vendor Portal</div>
              <div className="phone-title">{currentVendor?.name}</div>
            </div>
            <select
              className="persona-select"
              value={currentVendor?.id}
              onChange={e => {
                onSwitchVendor(e.target.value);
                setActiveJobId(null);
              }}
            >
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  Logged in as {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone Body */}
        <div className="phone-body">
          {activeJobId && activeJob ? (
            // JOB DETAIL VIEW
            <>
              <div className="back-row">
                <button className="back-btn" onClick={() => setActiveJobId(null)}>
                  ←
                </button>
                <div className="detail-title">Job details</div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <span className="cc-id">{activeJob.id}</span>
                  <StatusBadge status={activeJob.status} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '15px' }}>
                  {activeJob.category_emoji} {activeJob.category_name}
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--ink-600)' }}>
                  {activeJob.description}
                </div>
                <div style={{ height: '1px', background: 'var(--line)', margin: '4px 0' }} />
                <div className="help-text">
                  Property: {activeJob.property_name}, {activeJob.unit}
                </div>
                <div className="help-text">
                  Tenant: {activeJob.tenant_name} · {activeJob.tenant_phone}
                </div>
              </div>

              {activeJob.before_photos && activeJob.before_photos.length > 0 && (
                <div>
                  <div className="section-title" style={{ marginBottom: '8px' }}>
                    Photos from tenant
                  </div>
                  <div className="photo-row">
                    {activeJob.before_photos.map((p, i) => (
                      <img key={i} src={p} alt="Tenant before" className="photo-thumb" />
                    ))}
                  </div>
                </div>
              )}

              {/* ACTION BLOCK BASED ON STATUS */}
              {activeJob.status === 'Assigned' && (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleStartJob}
                  disabled={processing}
                >
                  {processing ? 'Accepting...' : '🛠️ Accept & start job'}
                </button>
              )}

              {activeJob.status === 'In Progress' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="section-title">Submit completion report</div>

                  <div className="field">
                    <label>Completion photos (min 1 required)</label>
                    <div className="photo-row">
                      {afterPhotos.map((p, idx) => (
                        <img key={idx} src={p} alt="After" className="photo-thumb" />
                      ))}
                      <button type="button" className="photo-add" onClick={handleAddAfterPhoto}>
                        📷
                      </button>
                    </div>
                  </div>

                  <div className="field">
                    <label>Materials used</label>
                    <input
                      type="text"
                      placeholder="e.g. Tap washer, plumber's Teflon tape"
                      value={reportMaterials}
                      onChange={e => setReportMaterials(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label>Completion notes *</label>
                    <textarea
                      placeholder="What was done to fix the issue?"
                      value={reportNotes}
                      onChange={e => setReportNotes(e.target.value)}
                    />
                  </div>

                  {completeError && <div className="field-error">{completeError}</div>}

                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleSubmitComplete}
                    disabled={processing}
                  >
                    {processing ? 'Submitting report...' : '✓ Submit completion report'}
                  </button>
                </div>
              )}

              {(activeJob.status === 'Completed' || activeJob.status === 'Closed') && (
                <div className="card">
                  <div className="section-title">Submitted report</div>
                  <div style={{ fontSize: '13.5px', marginTop: '6px' }}>
                    {activeJob.completion_notes || '—'}
                  </div>
                  {activeJob.materials_used && (
                    <div className="help-text" style={{ marginTop: '6px' }}>
                      Materials: {activeJob.materials_used}
                    </div>
                  )}
                  {activeJob.after_photos && activeJob.after_photos.length > 0 && (
                    <div className="photo-row" style={{ marginTop: '10px' }}>
                      {activeJob.after_photos.map((p, i) => (
                        <img key={i} src={p} alt="Proof" className="photo-thumb" />
                      ))}
                    </div>
                  )}
                  {activeJob.rating ? (
                    <div style={{ marginTop: '12px' }}>
                      <div className="section-title">Tenant rating</div>
                      <div className="stars" style={{ marginTop: '4px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            style={{
                              fontSize: '18px',
                              color: star <= (activeJob.rating || 0) ? 'var(--brass-500)' : 'var(--line)'
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      {activeJob.feedback && (
                        <div className="help-text" style={{ fontStyle: 'italic', marginTop: '4px' }}>
                          “{activeJob.feedback}”
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="help-text" style={{ marginTop: '8px' }}>
                      Waiting for tenant to verify &amp; rate.
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            // JOBS LIST VIEW
            <>
              <div className="tabs">
                {(['Assigned', 'In Progress', 'Done'] as const).map(tab => (
                  <button
                    key={tab}
                    className={activeTab === tab ? 'active' : ''}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab} ({groups[tab].length})
                  </button>
                ))}
              </div>

              {list.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {list.map(c => (
                    <div
                      key={c.id}
                      className="complaint-card"
                      onClick={() => setActiveJobId(c.id)}
                    >
                      <div className="cc-top">
                        <span className="cc-id">{c.id}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="cc-desc">
                        {c.category_emoji} {c.category_name} — {c.property_name}, {c.unit}
                      </div>
                      <div className="cc-meta">
                        <span>{c.tenant_name}</span>
                        <span>· {formatDate(c.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <span>💼</span>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '13.5px' }}>
                    Nothing here
                  </div>
                  <div style={{ fontSize: '12px' }}>No jobs in this list right now.</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Phone Nav */}
        <div className="phone-nav">
          <button className="active" onClick={() => setActiveJobId(null)}>
            <span>💼</span>
            <span>My jobs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
