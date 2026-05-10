import React, { useState, useEffect } from 'react';
import EmployeeLayout from './EmployeeLayout.jsx';
import { adminDashboardService } from '../../api/adminDashboard.service.js';
import { showError, showSuccess } from '../../utils/toast.js';
import '../../../styles/adminDashboard.css';

const EmployeDashnoardContainer = () => {
    const [deposits, setDeposits] = useState([]);
    const [selectedDepositId, setSelectedDepositId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('PENDIENTE');

    const getDisplayStatus = (status) => {
        if (status === 'PENDIENTE') return 'PENDIENTE';
        if (status === 'COMPLETADA') return 'APROBADO';
        return 'RECHAZADO';
    };

    const getBadgeClass = (status) => {
        if (status === 'PENDIENTE') return 'badge-pendiente';
        if (status === 'COMPLETADA') return 'badge-ingreso';
        return 'badge-egreso';
    };

    const fetchDeposits = async () => {
        try {
            setLoading(true);
            const response = await adminDashboardService.getDepositRequests();
            const depositRequests = response?.data?.depositRequests || response?.depositRequests || [];
            const normalized = Array.isArray(depositRequests)
                ? depositRequests.map((dep) => ({
                    id: dep.id,
                    reference: dep.id,
                    amount: Number(dep.amount || 0),
                    status: dep.status || 'PENDIENTE',
                    accountNumber: dep.Account?.accountNumber || 'N/D',
                    bank: dep.Account?.accountType || 'Banco Interno',
                    userId: dep.relatedAccountId || 'N/D',
                    description: dep.description || 'Pago por servicio',
                    date: dep.createdAt || dep.updatedAt || new Date().toISOString(),
                    method: dep.channel || 'Transferencia en línea',
                    ipAddress: dep.ipAddress || 'N/D',
                    device: dep.device || 'N/D',
                    location: dep.location || 'N/D',
                    raw: dep
                }))
                : [];

            setDeposits(normalized);
            if (!selectedDepositId && normalized.length > 0) {
                setSelectedDepositId(normalized[0].id);
            }
        } catch (error) {
            console.error(error);
            showError('Error al cargar los depósitos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeposits();
    }, []);

    const selectedDeposit = deposits.find((item) => item.id === selectedDepositId) || deposits[0] || null;

    const filteredDeposits = deposits.filter((deposit) => {
        const searchValue = `${deposit.id} ${deposit.accountNumber} ${deposit.bank} ${deposit.description}`.toLowerCase();
        const matchesSearch = searchValue.includes(searchTerm.toLowerCase());
        const statusMatch =
            filterStatus === 'PENDIENTE'
                ? deposit.status === 'PENDIENTE'
                : filterStatus === 'APROBADO'
                    ? deposit.status === 'COMPLETADA'
                    : ['FALLIDA', 'REVERTIDA'].includes(deposit.status);
        return matchesSearch && statusMatch;
    });

    const summary = {
        pending: deposits.filter((deposit) => deposit.status === 'PENDIENTE').length,
        approved: deposits.filter((deposit) => deposit.status === 'COMPLETADA').length,
        rejected: deposits.filter((deposit) => ['FALLIDA', 'REVERTIDA'].includes(deposit.status)).length,
        total: deposits.length
    };

    const handleApprove = async (deposit) => {
        if (deposit.status !== 'PENDIENTE') return;
        if (!window.confirm('¿Aprobar este depósito?')) return;

        try {
            await adminDashboardService.approveDeposit(deposit.id);
            showSuccess('Depósito aprobado correctamente.');
            fetchDeposits();
        } catch (error) {
            showError(error.response?.data?.message || 'Error al aprobar el depósito');
        }
    };

    const handleReject = async (deposit) => {
        if (deposit.status !== 'PENDIENTE') return;
        if (!window.confirm('¿Rechazar este depósito?')) return;

        try {
            await adminDashboardService.rejectDeposit(deposit.id);
            showSuccess('Depósito rechazado correctamente.');
            fetchDeposits();
        } catch (error) {
            showError(error.response?.data?.message || 'Error al rechazar el depósito');
        }
    };

    return (
        <EmployeeLayout>
            <section className="admin-section animate-fade-in-up">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-[#1A2E52]">Panel de Empleado — Depósitos</h2>
                                <p className="text-gray-500">Depósitos pendientes de aprobación y el detalle completo de cada solicitud.</p>
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card blue">
                            <div className="stat-label">Alertas & Notificaciones</div>
                            <div className="stat-value">{summary.total}</div>
                            <div className="stat-subtitle">Depósitos totales visibles</div>
                        </div>
                        <div className="stat-card light-blue">
                            <div className="stat-label">Pendientes</div>
                            <div className="stat-value">{summary.pending}</div>
                            <div className="stat-subtitle positive">Esperando aprobación</div>
                        </div>
                        <div className="stat-card light-blue">
                            <div className="stat-label">Aprobados</div>
                            <div className="stat-value">{summary.approved}</div>
                            <div className="stat-subtitle positive">Procesados</div>
                        </div>
                        <div className="stat-card light-red">
                            <div className="stat-label">Rechazados</div>
                            <div className="stat-value">{summary.rejected}</div>
                            <div className="stat-subtitle negative">Solicitudes fallidas o revertidas</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
                        <div className="movements-section">
                            <div className="movements-header">
                                <div>
                                    <h3 className="movements-title">Depósitos Pendientes de Aprobación</h3>
                                    <p className="text-sm text-gray-500 mt-1">Selecciona un depósito para ver el detalle completo.</p>
                                </div>
                                <div className="filters-container">
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Buscar referencia, cuenta o banco..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <select
                                        className="filter-select"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="PENDIENTE">Pendientes</option>
                                        <option value="APROBADO">Aprobados</option>
                                        <option value="RECHAZADO">Rechazados</option>
                                    </select>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table className="movements-table">
                                    <thead>
                                        <tr>
                                            <th>Usuario</th>
                                            <th>Fecha</th>
                                            <th>Banco Emisor</th>
                                            <th>Referencia</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-4">Cargando depósitos...</td>
                                            </tr>
                                        ) : filteredDeposits.length > 0 ? (
                                            filteredDeposits.map((deposit) => (
                                                <tr
                                                    key={deposit.id}
                                                    className={selectedDeposit?.id === deposit.id ? 'bg-[#eff6ff]' : ''}
                                                    onClick={() => setSelectedDepositId(deposit.id)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td className="font-semibold text-sm">{deposit.userId}</td>
                                                    <td className="date-column">{new Date(deposit.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                    <td>{deposit.bank}</td>
                                                    <td className="font-mono text-xs">{deposit.reference}</td>
                                                    <td className="font-bold">Q{deposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</td>
                                                    <td>
                                                        <span className={`status-badge ${getBadgeClass(deposit.status)}`}>
                                                            {getDisplayStatus(deposit.status)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(deposit);
                                                                }}
                                                                disabled={deposit.status !== 'PENDIENTE'}
                                                                className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition ${deposit.status === 'PENDIENTE' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-300 cursor-not-allowed'}`}
                                                            >
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleReject(deposit);
                                                                }}
                                                                disabled={deposit.status !== 'PENDIENTE'}
                                                                className={`px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition ${deposit.status === 'PENDIENTE' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'}`}
                                                            >
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="empty-message">No se encontraron depósitos.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="movements-section">
                            <div className="flex items-center justify-between gap-4 mb-5">
                                <div>
                                    <h3 className="movements-title">Detalle del Depósito</h3>
                                    <p className="text-sm text-gray-500 mt-1">Información detallada para el depósito seleccionado.</p>
                                </div>
                                {selectedDeposit && (
                                    <span className={`status-badge ${getBadgeClass(selectedDeposit.status)}`}>
                                        {getDisplayStatus(selectedDeposit.status)}
                                    </span>
                                )}
                            </div>

                            {selectedDeposit ? (
                                <div className="space-y-5">
                                    <div className="rounded-[28px] border border-[#e5e7eb] bg-[#f8fafc] p-5">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm uppercase tracking-[0.2em] text-[#64748b]">Monto</p>
                                                <p className="text-3xl font-bold text-[#1f2937]">Q{selectedDeposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-[#64748b]">REF</p>
                                                <p className="font-semibold text-[#1f2937]">{selectedDeposit.reference}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm">
                                        <div className="grid gap-4 text-sm text-[#334155]">
                                            <div className="flex justify-between"><span className="font-semibold">Usuario</span><span>{selectedDeposit.userId}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Número de Cuenta</span><span>{selectedDeposit.accountNumber}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Banco Emisor</span><span>{selectedDeposit.bank}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Número de Referencia</span><span>{selectedDeposit.reference}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Fecha / Hora</span><span>{new Date(selectedDeposit.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Método / Canal</span><span>{selectedDeposit.method}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Descripción</span><span>{selectedDeposit.description}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Dirección IP</span><span>{selectedDeposit.ipAddress}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Dispositivo</span><span>{selectedDeposit.device}</span></div>
                                            <div className="flex justify-between"><span className="font-semibold">Ubicación</span><span>{selectedDeposit.location}</span></div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleApprove(selectedDeposit)}
                                            disabled={selectedDeposit.status !== 'PENDIENTE'}
                                            className="rounded-2xl bg-green-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Aprobar Depósito
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleReject(selectedDeposit)}
                                            disabled={selectedDeposit.status !== 'PENDIENTE'}
                                            className="rounded-2xl bg-red-600 text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Rechazar Depósito
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                                    Selecciona un depósito para ver el detalle.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </EmployeeLayout>
    );
};

export default EmployeDashnoardContainer;
