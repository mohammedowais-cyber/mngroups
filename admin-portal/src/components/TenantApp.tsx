import React, { useState } from 'react';
import { Complaint, Tenant, Category } from '../types';
import { StatusBadge } from './StatusBadge';

interface TenantAppProps {
  tenants: Tenant[];
  currentTenantId: string;
  onSwitchTenant: (id: string) => void;
  complaints: Complaint[];
  categories: Category[];
  onSubmitComplaint: (catId: string, desc: string, photos: string[]) => Promise<void>;
  onVerifyComplaint: (complaintId: string, rating: number, feedback: string) => Promise<void>;
  onToast: (msg: string) => void;
}

export const TenantApp: React.FC<TenantAppProps> = ({
  tenants,
  currentTenantId,
  onSwitchTenant,
  complaints,
  categories,
  onSubmitComplaint,
  onVerifyComplaint,
  onToast,
}) => {
  const [view, setView] = useState<'home' | 'raise' | 'track' | 'detail' | 'profile'>('home');
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);

  // Raise form draft state
  const [draftCategory, setDraftCategory] = useState<string | null>(null);
  const [draftDesc, setDraftDesc] = useState('');
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [raiseError, setRaiseError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Detail review draft state
  const [tempRating, setTempRating] = useState<number>(0);
  const [tempFeedback, setTempFeedback] = useState<string>('');
  const [verifying, setVerifying] = useState(false);

  const currentTenant = tenants.find(t => t.id === currentTenantId) || tenants[0];
  const myComplaints = complaints.filter(c => c.tenant_id === currentTenant?.id);
  const openCount = myComplaints.filter(c => c.status !== 'Closed').length;
  const closedCount = myComplaints.filter(c => c.status === 'Closed').length;
  const recent = myComplaints.slice(0, 3);
  const activeComplaint = complaints.find(c => c.id === activeComplaintId);

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  const formatDateTime = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  };

  const handleAddPhoto = () => {
    // Add realistic sample photo
    const samplePhotos = ['/uploads/tap-leak-before.svg', '/uploads/socket-spark-before.svg', '/uploads/cabinet-hinge-before.svg', '/uploads/ac-unit-before.svg'];
    const chosen = samplePhotos[draftPhotos.length % samplePhotos.length];
    setDraftPhotos(prev => [...prev, chosen]);
    onToast('Photo attached');
  };

  const handleSubmitRaise = async () => {
    setRaiseError(null);
    if (!draftCategory) {
      setRaiseError('Choose a category to continue.');
      return;
    }
    if (!draftDesc.trim() || draftDesc.trim().length < 4) {
      setRaiseError('Add a short description of the issue (min 4 chars).');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmitComplaint(draftCategory, draftDesc.trim(), draftPhotos);
      setDraftCategory(null);
      setDraftDesc('');
      setDraftPhotos([]);
      setView('track');
      onToast('Complaint submitted · Vendor auto-assigned in PostgreSQL');
    } catch (err: any) {
      setRaiseError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifySubmit = async () => {
    if (!activeComplaint) return;
    if (tempRating === 0) {
      onToast('Pick a star rating first');
      return;
    }

    setVerifying(true);
    try {
      await onVerifyComplaint(activeComplaint.id, tempRating, tempFeedback);
      setTempRating(0);
      setTempFeedback('');
      onToast('Thanks! Request verified & closed, manager notified');
    } catch (err: any) {
      onToast(err.message || 'Failed to verify');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="app-stage">
      <div className="phone">
        {/* Phone Head */}
        <div className="phone-head">
          <div className="phone-head-top">
            <div>
              <div className="phone-eyebrow">
                {currentTenant?.property_name} · {currentTenant?.unit}
              </div>
              <div className="phone-title">Hi, {currentTenant?.name.split(' ')[0]}</div>
            </div>
            <select
              className="persona-select"
              value={currentTenant?.id}
              onChange={e => {
                onSwitchTenant(e.target.value);
                setActiveComplaintId(null);
                setView('home');
              }}
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  Logged in as {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phone Body */}
        <div className="phone-body">
          {/* HOME VIEW */}
          {view === 'home' && (
            <>
              <div className="stat-row">
                <div className="stat-box">
                  <div className="stat-num">{openCount}</div>
                  <div className="stat-label">Open requests</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{closedCount}</div>
                  <div className="stat-label">Completed</div>
                </div>
              </div>

              <div className="quick-actions">
                <button className="qa-btn" onClick={() => setView('raise')}>
                  <span style={{ fontSize: '20px' }}>➕</span>
                  <span>Raise a complaint</span>
                </button>
                <button
                  className="qa-btn"
                  onClick={() => onToast(`Calling ${currentTenant?.manager_name || 'Property Manager'}...`)}
                >
                  <span style={{ fontSize: '20px' }}>📞</span>
                  <span>Call property manager</span>
                </button>
              </div>

              <div>
                <div className="section-title" style={{ marginBottom: '10px' }}>
                  Recent requests
                </div>
                {recent.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recent.map(c => (
                      <div
                        key={c.id}
                        className="complaint-card"
                        onClick={() => {
                          setActiveComplaintId(c.id);
                          setView('detail');
                        }}
                      >
                        <div className="cc-top">
                          <span className="cc-id">{c.id}</span>
                          <StatusBadge status={c.status} />
                        </div>
                        <div className="cc-desc">
                          {c.category_emoji} {c.category_name} — {c.description}
                        </div>
                        <div className="cc-meta">
                          <span>{formatDate(c.created_at)}</span>
                          {c.vendor_name && <span>· {c.vendor_name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty">
                    <span>📥</span>
                    <div style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '13.5px' }}>
                      No requests yet
                    </div>
                    <div style={{ fontSize: '12px' }}>
                      Raise your first maintenance request to get started.
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* RAISE COMPLAINT VIEW */}
          {view === 'raise' && (
            <>
              <div>
                <div className="section-title" style={{ marginBottom: '10px' }}>
                  Select a category
                </div>
                <div className="cat-grid">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      className={`cat-btn ${draftCategory === c.id ? 'sel' : ''}`}
                      onClick={() => setDraftCategory(c.id)}
                    >
                      <span className="emo">{c.emoji}</span>
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Describe the issue</label>
                <textarea
                  placeholder="e.g. Bathroom tap is leaking continuously near base valve."
                  value={draftDesc}
                  onChange={e => setDraftDesc(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Photos</label>
                <div className="photo-row">
                  {draftPhotos.map((p, idx) => (
                    <img key={idx} src={p} alt="attached" className="photo-thumb" />
                  ))}
                  <button type="button" className="photo-add" onClick={handleAddPhoto}>
                    📷
                  </button>
                </div>
              </div>

              {raiseError && <div className="field-error">{raiseError}</div>}

              <button
                className="btn btn-primary btn-block"
                onClick={handleSubmitRaise}
                disabled={submitting}
              >
                {submitting ? 'Submitting to PostgreSQL...' : '✓ Submit complaint'}
              </button>
            </>
          )}

          {/* TRACK ALL VIEW */}
          {view === 'track' && (
            <>
              <div className="section-title" style={{ marginBottom: '4px' }}>
                All requests ({myComplaints.length})
              </div>
              {myComplaints.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {myComplaints.map(c => (
                    <div
                      key={c.id}
                      className="complaint-card"
                      onClick={() => {
                        setActiveComplaintId(c.id);
                        setView('detail');
                      }}
                    >
                      <div className="cc-top">
                        <span className="cc-id">{c.id}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div className="cc-desc">
                        {c.category_emoji} {c.category_name} — {c.description}
                      </div>
                      <div className="cc-meta">
                        <span>{formatDate(c.created_at)}</span>
                        {c.vendor_name && <span>· {c.vendor_name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty">
                  <span>📥</span>
                  <div style={{ fontWeight: 600, color: 'var(--ink-900)', fontSize: '13.5px' }}>
                    No requests yet
                  </div>
                  <div style={{ fontSize: '12px' }}>
                    Raise your first maintenance request to get started.
                  </div>
                </div>
              )}
            </>
          )}

          {/* DETAIL VIEW */}
          {view === 'detail' && activeComplaint && (
            <>
              <div className="back-row">
                <button className="back-btn" onClick={() => setView('track')}>
                  ←
                </button>
                <div className="detail-title">Track complaint</div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <div className="cc-id">{activeComplaint.id}</div>
                    <div style={{ fontWeight: 600, fontSize: '15px', marginTop: '2px' }}>
                      {activeComplaint.category_emoji} {activeComplaint.category_name}
                    </div>
                  </div>
                  <StatusBadge status={activeComplaint.status} />
                </div>
                <div style={{ fontSize: '13.5px', color: 'var(--ink-600)' }}>
                  {activeComplaint.description}
                </div>
                {activeComplaint.vendor_name && (
                  <div className="help-text">
                    Assigned to {activeComplaint.vendor_name} · {activeComplaint.vendor_phone}
                  </div>
                )}
              </div>

              {activeComplaint.before_photos && activeComplaint.before_photos.length > 0 && (
                <div>
                  <div className="section-title" style={{ marginBottom: '8px' }}>
                    Photos you added
                  </div>
                  <div className="photo-row">
                    {activeComplaint.before_photos.map((p, i) => (
                      <img key={i} src={p} alt="Before" className="photo-thumb" />
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="card">
                <div className="section-title" style={{ marginBottom: '12px' }}>
                  Status timeline
                </div>
                <div className="timeline">
                  {[
                    { label: 'Complaint submitted', time: activeComplaint.created_at },
                    { label: `Vendor assigned: ${activeComplaint.vendor_name || 'Assigned'}`, time: activeComplaint.assigned_at },
                    { label: 'Vendor started the job', time: activeComplaint.started_at },
                    { label: 'Repair completed by vendor', time: activeComplaint.completed_at },
                    { label: 'Verified & closed', time: activeComplaint.verified_at || activeComplaint.closed_at }
                  ].map((step, idx, arr) => {
                    const order = ['Submitted', 'Assigned', 'In Progress', 'Completed', 'Closed'];
                    const curIdx = order.indexOf(activeComplaint.status);
                    const done = idx <= curIdx && Boolean(step.time);
                    return (
                      <div key={idx} className="tl-item">
                        <div className="tl-dot-wrap">
                          <div className={`tl-dot ${done ? 'done' : ''}`} />
                          {idx < arr.length - 1 && <div className="tl-line" />}
                        </div>
                        <div className="tl-body">
                          <div className="tl-label" style={{ color: done ? 'var(--ink-900)' : 'var(--ink-400)' }}>
                            {step.label}
                          </div>
                          {step.time && <div className="tl-time">{formatDateTime(step.time)}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Completion Report */}
              {(activeComplaint.completion_notes || (activeComplaint.after_photos && activeComplaint.after_photos.length > 0)) && (
                <div>
                  <div className="section-title" style={{ marginBottom: '8px' }}>
                    Completion report
                  </div>
                  {activeComplaint.after_photos && activeComplaint.after_photos.length > 0 && (
                    <div className="photo-row">
                      {activeComplaint.after_photos.map((p, i) => (
                        <img key={i} src={p} alt="After" className="photo-thumb" />
                      ))}
                    </div>
                  )}
                  {activeComplaint.completion_notes && (
                    <div className="help-text" style={{ marginTop: '8px', color: 'var(--ink-900)', fontSize: '13px' }}>
                      {activeComplaint.completion_notes}
                    </div>
                  )}
                  {activeComplaint.materials_used && (
                    <div className="help-text" style={{ marginTop: '4px' }}>
                      Materials: {activeComplaint.materials_used}
                    </div>
                  )}
                </div>
              )}

              {/* Verify form if Completed */}
              {activeComplaint.status === 'Completed' && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', border: '1.5px solid var(--brass-500)' }}>
                  <div className="section-title">Rate the service</div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setTempRating(star)}>
                        <span style={{ fontSize: '28px', color: star <= tempRating ? 'var(--brass-500)' : 'var(--line)' }}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="field">
                    <textarea
                      placeholder={`Optional feedback for ${activeComplaint.vendor_name || 'the vendor'}`}
                      value={tempFeedback}
                      onChange={e => setTempFeedback(e.target.value)}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={handleVerifySubmit}
                    disabled={verifying}
                  >
                    {verifying ? 'Closing request...' : '✓ Verify & close request'}
                  </button>
                </div>
              )}

              {/* Closed Rating View */}
              {activeComplaint.status === 'Closed' && activeComplaint.rating && (
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="section-title">Your rating</div>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} style={{ fontSize: '20px', color: star <= (activeComplaint.rating || 0) ? 'var(--brass-500)' : 'var(--line)' }}>
                        ★
                      </span>
                    ))}
                  </div>
                  {activeComplaint.feedback && (
                    <div className="help-text" style={{ fontStyle: 'italic' }}>
                      “{activeComplaint.feedback}”
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* PROFILE VIEW */}
          {view === 'profile' && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{currentTenant?.name}</div>
              <div className="help-text">{currentTenant?.phone}</div>
              <div style={{ height: '1px', background: 'var(--line)' }} />
              <div className="section-title">Property</div>
              <div style={{ fontSize: '13.5px' }}>
                {currentTenant?.property_name} · {currentTenant?.unit}
              </div>
              <div className="help-text">{currentTenant?.property_address}</div>
              <div className="section-title" style={{ marginTop: '6px' }}>
                Property manager
              </div>
              <div style={{ fontSize: '13.5px' }}>{currentTenant?.manager_name}</div>
              <button
                className="btn btn-outline btn-block"
                style={{ marginTop: '8px' }}
                onClick={() => onToast(`Calling ${currentTenant?.manager_name || 'Manager'}...`)}
              >
                📞 Call manager
              </button>
            </div>
          )}
        </div>

        {/* Phone Nav */}
        <div className="phone-nav">
          <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>
            <span>🏠</span>
            <span>Home</span>
          </button>
          <button className={view === 'raise' ? 'active' : ''} onClick={() => setView('raise')}>
            <span>➕</span>
            <span>Raise</span>
          </button>
          <button
            className={view === 'track' || view === 'detail' ? 'active' : ''}
            onClick={() => setView('track')}
          >
            <span>📋</span>
            <span>Track</span>
          </button>
          <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>
            <span>👤</span>
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
