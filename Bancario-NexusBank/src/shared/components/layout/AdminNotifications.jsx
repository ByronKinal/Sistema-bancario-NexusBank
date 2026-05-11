import React, { useEffect, useState, useRef } from 'react';
import { adminDashboardService } from '../../api/adminDashboard.service.js';
import { showError, showSuccess } from '../../utils/toast.js';
import { useNavigate } from 'react-router-dom';

const AdminNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await adminDashboardService.getPendingAccountRequests();
      const requests = response.data || [];
      setPending(requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
      showError('Error cargando solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('¿Aprobar esta solicitud?')) return;
    try {
      await adminDashboardService.approveAccountRequest(id);
      showSuccess('Solicitud aprobada - Cuenta creada');
      fetchPending();
    } catch (e) {
      showError(e.response?.data?.message || 'Error al aprobar');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('¿Rechazar esta solicitud?')) return;
    try {
      await adminDashboardService.rejectAccountRequest(id);
      showSuccess('Solicitud rechazada');
      fetchPending();
    } catch (e) {
      showError(e.response?.data?.message || 'Error al rechazar');
    }
  };

  const badgeCount = pending.length;

  return (
    <div ref={wrapperRef} style={{ position: 'relative', marginRight: 12 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          position: 'relative',
          padding: 8,
          borderRadius: 8
        }}
        title="Solicitudes"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 10-12 0c0 7-3 8-3 8h18s-3-1-3-8"></path>
          <path d="M13.73 21a2 2 0 01-3.46 0"></path>
        </svg>
        {badgeCount > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, background: '#e11d48', color: '#fff', borderRadius: 9999, padding: '2px 6px', fontSize: 11, fontWeight: 700 }}>
            {badgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 360, background: '#0b2b52', color: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(2,8,18,0.3)', zIndex: 60, padding: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontWeight: 700 }}>Solicitudes de apertura</div>
            <button onClick={() => { setIsOpen(false); navigate('/AdminDashboard/pending-requests'); }} style={{ background: 'transparent', border: 'none', color: '#9fb3d6', cursor: 'pointer' }}>Ver todas</button>
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 16 }}>Cargando...</div>
            ) : pending.length === 0 ? (
              <div style={{ padding: 16 }}>No hay solicitudes pendientes.</div>
            ) : (
              pending.slice(0, 5).map(req => (
                <div key={req.id} style={{ display: 'flex', gap: 12, padding: '10px 12px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{req.accountType}</div>
                    <div style={{ fontSize: 12, color: '#9fb3d6' }}>Solicitado: {new Date(req.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleApprove(req.id)} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Aprobar</button>
                    <button onClick={() => handleReject(req.id)} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Rechazar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
