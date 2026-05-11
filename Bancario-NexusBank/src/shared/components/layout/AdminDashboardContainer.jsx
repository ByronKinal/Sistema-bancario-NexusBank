import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout.jsx';
import { adminDashboardService } from '../../api/adminDashboard.service.js';
import '../../../styles/adminDashboard.css';

// Componente Card reutilizable
const StatCard = ({ title, value, subtitle, color = '' }) => (
  <div className={`stat-card glass-panel shadow-lg ${color}`}>
    <div className="stat-label text-gray-500 font-semibold">{title}</div>
    <div className="stat-value text-3xl font-bold text-[#1A2E52]">{value}</div>
    {subtitle && <div className={`stat-subtitle font-medium ${subtitle.includes('+') ? 'positive text-green-600' : 'negative text-red-600'}`}>{subtitle}</div>}
  </div>
);

export const AdminDashboardContainer = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const itemsPerPage = 5;
  
  const [stats, setStats] = useState({ totalUsers: 0, transactionsToday: 0, pendingAccounts: 0 });
  const [movementsData, setMovementsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, txRes, accRes] = await Promise.all([
          adminDashboardService.getUsers(1),
          adminDashboardService.getTransactions(50),
          adminDashboardService.getAccounts()
        ]);

        const transactions = Array.isArray(txRes.data) ? txRes.data : [];
        const orderedTransactions = [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const today = new Date();
        const txTodayCount = orderedTransactions.filter(tx => new Date(tx.createdAt).toDateString() === today.toDateString()).length;
        const accounts = accRes.data || [];

        setStats({
          totalUsers: usersRes.data?.meta?.total || 0,
          transactionsToday: txTodayCount,
          pendingAccounts: accounts.filter(acc => acc.status === false).length
        });

          const mappedTransactions = orderedTransactions.map(tx => {
          const isPositive = !['RETIRO', 'TRANSFERENCIA_ENVIADA', 'COMPRA'].includes(tx.type);
          return {
            id: tx.id,
            type: tx.type,
            description: tx.description || tx.type,
            userName: tx.accountInfo?.owner?.name || 'Cliente',
            date: new Date(tx.createdAt).toLocaleString(),
            amount: `${isPositive ? '+' : '-'}Q${Math.abs(tx.amount).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`,
            amountType: isPositive ? 'positive' : 'negative'
          };
        });
        setMovementsData(mappedTransactions);
      } catch (error) {
        console.error('Error fetching admin data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filtrar movimientos
  const filteredMovements = movementsData.filter(m => {
    const searchStr = `${m.description} ${m.userName} ${m.type}`.toLowerCase();
    const matchSearch = searchStr.includes(searchTerm.toLowerCase());
    
    let matchType = false;
    if (filterType === 'ALL') matchType = true;
    else if (filterType === 'TRANSFERENCIA') {
       matchType = m.type.includes('TRANSFERENCIA');
    } else {
       matchType = m.type === filterType;
    }
    
    return matchSearch && matchType;
  });

  const currentMovements = filteredMovements.slice(0, itemsPerPage);

  const getMovementTypeLabel = (type) => {
    if (!type) return 'Movimiento';
    if (type.includes('TRANSFERENCIA')) return 'Transferencia';
    if (type.includes('DEPOSITO')) return 'Depósito';
    if (type.includes('RETIRO')) return 'Retiro';
    if (type.includes('COMPRA')) return 'Compra';
    return type.replaceAll('_', ' ');
  };

  const getAmountColor = (type) => {
    if (type === 'positive') return '#10b981';
    if (type === 'negative') return '#ef4444';
    return '#fbbf24';
  };

  const getStatusBadge = (amountType) => {
    if (amountType === 'positive') return { bg: '#d1fae5', color: '#047857', text: 'Ingreso' };
    if (amountType === 'negative') return { bg: '#fee2e2', color: '#991b1b', text: 'Egreso' };
    return { bg: '#fef3c7', color: '#92400e', text: 'Pendiente' };
  };

  return (
    <AdminLayout>
      <section className="admin-section">
            {/* Stats Cards */}
            <div className="stats-grid">
              <StatCard title="Total usuarios" value={loading ? '...' : stats.totalUsers} subtitle="+12 este mes" color="blue" />
              <StatCard title="Transacciones hoy" value={loading ? '...' : stats.transactionsToday} subtitle="Hoy" color="light-blue" />
              <StatCard title="Cuentas revertidas" value={loading ? '...' : stats.pendingAccounts} subtitle="Requieren acción" color="light-red" />
            </div>

            {/* Movimientos Table Section */}
            <div className="movements-section glass-panel shadow-md rounded-2xl overflow-hidden border border-white/40">
              {/* Header with search and filter */}
              <div className="movements-header">
                <h3 className="movements-title">Movimientos recientes</h3>
                <div className="filters-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Buscar por usuario..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                  />
                  <select
                    className="filter-select"
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value);
                    }}
                  >
                    <option value="ALL">Todos los tipos</option>
                    <option value="DEPOSITO">Depósitos</option>
                    <option value="TRANSFERENCIA">Transferencias</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="table-wrapper">
                <table className="movements-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Usuario</th>
                      <th>Fecha y hora</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentMovements && currentMovements.length > 0 ? (
                      currentMovements.map((movement) => {
                        const badge = getStatusBadge(movement.amountType);
                        return (
                          <tr key={movement.id}>
                            <td className="font-medium text-xs">{getMovementTypeLabel(movement.type)}</td>
                            <td>{movement.userName}</td>
                            <td className="date-column">{movement.date}</td>
                            <td className={`amount-${movement.amountType} whitespace-nowrap`}>
                              {movement.amount}
                            </td>
                            <td>
                              <span className={`status-badge badge-${movement.amountType === 'positive' ? 'ingreso' : movement.amountType === 'negative' ? 'egreso' : 'pendiente'}`}>
                                {badge.text}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          No hay movimientos que coincidan con tu búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Quick Actions and Promotions */}
            <div className="actions-promotions-grid">
              {/* Accesos Rápidos - Left Column */}
              <div className="quick-actions-section glass-panel shadow-md rounded-2xl border border-white/40 p-5">
                {/* Yellow Button Requested by User */}
                <div 
                  className="mt-6 p-4 rounded-xl text-white font-bold text-center cursor-pointer shadow-lg transform transition hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #C8A84B, #b0933e)' }}
                  onClick={() => navigate('/AdminDashboard/employees')}
                >
                  <span className="text-xl mr-2">⏳</span>
                  Ir a Empleados
                </div>

                {/* Pending Accounts Button */}
                <div 
                  className="mt-3 p-4 rounded-xl text-white font-bold text-center cursor-pointer shadow-lg transform transition hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  onClick={() => navigate('/AdminDashboard/requests')}
                >
                  <span className="text-xl mr-2">📋</span>
                  Ir a Pendientes
                </div>
              </div>

              {/* Promotions - Right Column */}
              <div className="promotions-section glass-panel shadow-md rounded-2xl border border-white/40 p-5">
                <div className="promotions-header">
                  <h3 className="section-title">Promociones</h3>
                  <a href="#" className="new-promotion-link">+ Nueva promoción</a>
                </div>
                <ul className="promotions-list">
                  <li className="promotion-item">
                    <div className="promotion-content">
                      <div className="promotion-info">
                        <div className="promotion-name">Tasa preferencial ahorros</div>
                        <div className="promotion-description">5% anual · Aplica cuentas nuevas</div>
                      </div>
                      <span className="status-badge badge-ingreso">Activa</span>
                    </div>
                  </li>
                  <li className="promotion-item">
                    <div className="promotion-content">
                      <div className="promotion-info">
                        <div className="promotion-name">Sin comisión transferencias</div>
                        <div className="promotion-description">Todo mayo 2026</div>
                      </div>
                      <span className="status-badge badge-ingreso">Activa</span>
                    </div>
                  </li>
                  <li className="promotion-item">
                    <div className="promotion-content">
                      <div className="promotion-info">
                        <div className="promotion-name">Bono apertura cuenta corriente</div>
                        <div className="promotion-description">Inicia 01 jun 2026</div>
                      </div>
                      <span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Próxima</span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboardContainer;
