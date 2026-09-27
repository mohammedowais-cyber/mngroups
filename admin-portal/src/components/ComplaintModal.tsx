import React from 'react';
import { Complaint } from '../types';
import { StatusBadge } from './StatusBadge';

interface ComplaintModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

export const ComplaintModal: React.FC<ComplaintModalProps> = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const steps = [
    { label: 'Complaint submitted', time: complaint.created_at },
    { label: `Vendor assigned: ${complaint.vendor_name || 'Assigned'}`, time: complaint.assigned_at },
    { label: 'Vendor started the job', time: complaint.started_at },
    { label: 'Repair completed by vendor', time: complaint.completed_at },
    { label: 'Verified & closed', time: complaint.verified_at || complaint.closed_at }
  ];

  const order = ['Submitted', 'Assigned', 'In Progress', 'Completed', 'Closed'];
  const curIdx = order.indexOf(complaint.status);

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Maintenance Completion Report — ${complaint.id}</title>
        <style>
          body { font-family: 'Inter', system-ui, sans-serif; color: #161B26; padding: 40px; margin: 0; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0F1B33; padding-bottom: 16px; margin-bottom: 24px; }
          .brand-title { font-size: 22px; font-weight: 700; color: #0F1B33; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; background: #E7EBF1; font-weight: 600; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
          .card { background: #F8FAFC; border: 1px solid #DCE1E9; border-radius: 8px; padding: 16px; }
          .card-title { font-size: 12px; font-weight: 700; color: #828EA3; text-transform: uppercase; margin-bottom: 6px; }
          .photo-grid { display: flex; gap: 12px; margin-top: 8px; }
          .photo { width: 140px; height: 110px; border-radius: 6px; border: 1px solid #DCE1E9; object-fit: cover; }
          .timeline-item { margin-bottom: 8px; font-size: 13px; }
          .signoff { margin-top: 40px; border-top: 1px dashed #828EA3; padding-top: 20px; display: flex; justify-content: space-between; }
          @media print { .no-print { display: none; } body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px;">
          <button onclick="window.print()" style="background: #0F1B33; color: #fff; padding: 8px 18px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">🖨️ Print to PDF / Paper</button>
        </div>
        <div class="header">
          <div>
            <div class="brand-title">MN GROUPS — PROPERTY MAINTENANCE</div>
            <div style="font-size: 13px; color: #4B5468; margin-top: 2px;">Official Work Order &amp; Completion Audit Record</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 700; color: #0F1B33;">${complaint.id}</div>
            <div class="badge">${complaint.status.toUpperCase()}</div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <div class="card-title">Property &amp; Tenant</div>
            <div style="font-size: 15px; font-weight: 600;">${complaint.property_name} (${complaint.unit})</div>
            <div style="font-size: 13px; color: #4B5468; margin-top: 4px;">${complaint.property_address || ''}</div>
            <div style="margin-top: 8px; font-size: 13px;">Tenant: <strong>${complaint.tenant_name}</strong> · ${complaint.tenant_phone || ''}</div>
            <div style="font-size: 13px;">Manager: <strong>${complaint.manager_name || 'Deepa R.'}</strong></div>
          </div>

          <div class="card">
            <div class="card-title">Contractor &amp; Vendor</div>
            <div style="font-size: 15px; font-weight: 600;">${complaint.vendor_name || 'Unassigned'}</div>
            <div style="font-size: 13px; color: #4B5468; margin-top: 4px;">Contact: ${complaint.vendor_phone || '—'}</div>
            <div style="margin-top: 8px; font-size: 13px;">Category: <strong>${complaint.category_name}</strong></div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <div class="card-title">Issue Description</div>
          <div style="font-size: 14px; line-height: 1.5;">${complaint.description}</div>
          ${complaint.before_photos && complaint.before_photos.length > 0 ? `
            <div style="margin-top: 10px;">
              <div style="font-size: 12px; font-weight: 600; color: #828EA3;">Before Photos:</div>
              <div class="photo-grid">
                ${complaint.before_photos.map(p => `<img src="${p}" class="photo" />`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        ${complaint.completion_notes ? `
          <div class="card" style="margin-bottom: 20px;">
            <div class="card-title">Vendor Completion Report</div>
            <div style="font-size: 14px; margin-bottom: 6px;">${complaint.completion_notes}</div>
            ${complaint.materials_used ? `<div style="font-size: 13px; color: #4B5468;"><strong>Materials Used:</strong> ${complaint.materials_used}</div>` : ''}
            ${complaint.after_photos && complaint.after_photos.length > 0 ? `
              <div style="margin-top: 10px;">
                <div style="font-size: 12px; font-weight: 600; color: #828EA3;">Repair Proof Photos:</div>
                <div class="photo-grid">
                  ${complaint.after_photos.map(p => `<img src="${p}" class="photo" />`).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        ${complaint.rating ? `
          <div class="card" style="margin-bottom: 20px;">
            <div class="card-title">Tenant Verification &amp; Star Rating</div>
            <div style="font-size: 16px; color: #B8902E; font-weight: 700;">★ ${complaint.rating} / 5.0 Stars</div>
            ${complaint.feedback ? `<div style="font-size: 13.5px; font-style: italic; margin-top: 4px;">“${complaint.feedback}”</div>` : ''}
          </div>
        ` : ''}

        <div class="signoff">
          <div>
            <div style="font-size: 12px; color: #828EA3;">Contractor Signature</div>
            <div style="margin-top: 25px; font-weight: 600;">${complaint.vendor_name || 'Vendor Authorized'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; color: #828EA3;">Property Manager Approval</div>
            <div style="margin-top: 25px; font-weight: 600;">${complaint.manager_name || 'Deepa R.'} (MN Groups)</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '18px', color: 'var(--navy-900)' }}>
              {complaint.id}
            </span>
            <StatusBadge status={complaint.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrintReport}
              style={{
                background: 'var(--surface-sunken)',
                border: '1px solid var(--line)',
                color: 'var(--navy-900)',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            >
              📄 Print / Export Report
            </button>
            <button 
              onClick={onClose} 
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--ink-400)' }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
          {/* Left Column: Complaint & Lifecycle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '6px' }}>
                {complaint.category_emoji} {complaint.category_name}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--ink-600)', lineHeight: '1.5' }}>
                {complaint.description}
              </div>

              {complaint.before_photos && complaint.before_photos.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tenant's Issue Photos
                  </div>
                  <div className="photo-row">
                    {complaint.before_photos.map((p, i) => (
                      <img key={i} src={p} alt="Before" className="photo-thumb" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vendor Report */}
            {(complaint.completion_notes || (complaint.after_photos && complaint.after_photos.length > 0)) && (
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '8px' }}>
                  🛠️ Vendor Completion Report
                </div>
                {complaint.completion_notes && (
                  <div style={{ fontSize: '13.5px', color: 'var(--ink-900)', marginBottom: '8px' }}>
                    {complaint.completion_notes}
                  </div>
                )}
                {complaint.materials_used && (
                  <div className="help-text" style={{ marginBottom: '8px' }}>
                    <strong>Materials used:</strong> {complaint.materials_used}
                  </div>
                )}
                {complaint.after_photos && complaint.after_photos.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Completion Proof Photos
                    </div>
                    <div className="photo-row">
                      {complaint.after_photos.map((p, i) => (
                        <img key={i} src={p} alt="After" className="photo-thumb" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tenant Rating & Review */}
            {complaint.rating && (
              <div className="card">
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>
                  Tenant Review
                </div>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ fontSize: '18px', color: star <= (complaint.rating || 0) ? '#B8902E' : '#DCE1E9' }}>
                      ★
                    </span>
                  ))}
                </div>
                {complaint.feedback && (
                  <div className="help-text" style={{ marginTop: '6px', fontStyle: 'italic' }}>
                    “{complaint.feedback}”
                  </div>
                )}
              </div>
            )}

            {/* Status Timeline */}
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
                Status Timeline
              </div>
              <div className="timeline">
                {steps.map((step, idx) => {
                  const done = idx <= curIdx && Boolean(step.time);
                  return (
                    <div key={idx} className="tl-item">
                      <div className="tl-dot-wrap">
                        <div className={`tl-dot ${done ? 'done' : ''}`} />
                        {idx < steps.length - 1 && <div className="tl-line" />}
                      </div>
                      <div>
                        <div className="tl-label" style={{ color: done ? 'var(--ink-900)' : 'var(--ink-400)' }}>
                          {step.label}
                        </div>
                        {step.time && <div className="tl-time">{formatDate(step.time)}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Property & Tenant Context */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Property &amp; Unit
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{complaint.property_name}</div>
              <div style={{ fontSize: '13.5px', color: 'var(--navy-500)', marginTop: '2px' }}>{complaint.unit}</div>
              <div className="help-text" style={{ marginTop: '4px' }}>{complaint.property_address}</div>

              <div style={{ height: '1px', background: 'var(--line)', margin: '12px 0' }} />

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Tenant
              </div>
              <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{complaint.tenant_name}</div>
              <div className="help-text">{complaint.tenant_phone}</div>

              <div style={{ height: '1px', background: 'var(--line)', margin: '12px 0' }} />

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Assigned Vendor
              </div>
              {complaint.vendor_name ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: '14.5px' }}>{complaint.vendor_name}</div>
                  <div className="help-text">{complaint.vendor_phone}</div>
                </>
              ) : (
                <div className="help-text">Pending assignment</div>
              )}

              <div style={{ height: '1px', background: 'var(--line)', margin: '12px 0' }} />

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-400)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Property Manager
              </div>
              <div style={{ fontWeight: 500, fontSize: '13.5px' }}>{complaint.manager_name || 'Deepa R.'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
