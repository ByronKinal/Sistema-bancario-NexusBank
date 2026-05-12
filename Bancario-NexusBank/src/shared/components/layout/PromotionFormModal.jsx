import React, { useState, useEffect } from 'react';
import { axiosAdmin } from '../../api/api.js';
import { showError, showSuccess } from '../../utils/toast.js';

const PROMOTION_TYPES = [
  'DEPOSITO_CASHBACK',
  'TRANSFERENCIA_DESCUENTO',
  'TRANSFERENCIA_PROPIA_BONUS',
  'TRANSACCIONES_FRECUENTES',
  'SALDO_MINIMO_REWARD',
  'APERTURA_CUENTA_BONUS'
];

const NUMERIC_FIELDS = new Set([
  'minDepositAmount',
  'maxDepositAmount',
  'minTransferAmount',
  'maxTransferAmount',
  'minConsecutiveTransactions',
  'minAccountBalance',
  'discountPercentage',
  'cashbackPercentage',
  'cashbackAmount',
  'bonusPoints',
  'maxUsesPerClient',
  'maxUsesTotalPromotion'
]);

const EDITABLE_FIELDS = new Set([
  'name',
  'description',
  'minDepositAmount',
  'maxDepositAmount',
  'minTransferAmount',
  'maxTransferAmount',
  'minConsecutiveTransactions',
  'minAccountBalance',
  'discountPercentage',
  'cashbackPercentage',
  'cashbackAmount',
  'bonusPoints',
  'maxUsesPerClient',
  'maxUsesTotalPromotion',
  'startDate',
  'endDate',
  'isExclusive',
  'notes',
  'reason'
]);

const formatPromotionType = (type) => {
  const typeMap = {
    'DEPOSITO_CASHBACK': 'Depósito Cashback',
    'TRANSFERENCIA_DESCUENTO': 'Transferencia Descuento',
    'TRANSFERENCIA_PROPIA_BONUS': 'Transferencia Propia Bonus',
    'TRANSACCIONES_FRECUENTES': 'Transacciones Frecuentes',
    'SALDO_MINIMO_REWARD': 'Saldo Mínimo Reward',
    'APERTURA_CUENTA_BONUS': 'Apertura de Cuenta Bonus'
  };
  return typeMap[type] || type;
};

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const PromotionFormModal = ({ mode = 'create', promotion = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    promotionType: '',
    description: '',
    startDate: '',
    endDate: '',
    discountPercentage: '',
    cashbackPercentage: '',
    cashbackAmount: '',
    bonusPoints: '',
    minDepositAmount: '',
    maxDepositAmount: '',
    minTransferAmount: '',
    maxTransferAmount: '',
    minConsecutiveTransactions: '',
    minAccountBalance: '',
    maxUsesPerClient: '',
    maxUsesTotalPromotion: '',
    isExclusive: false,
    notes: '',
    reason: '' // Para auditoría en edición
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedAdvanced, setExpandedAdvanced] = useState(false);

  // Inicializar formulario en modo edición
  useEffect(() => {
    if (mode === 'edit' && promotion) {
      setFormData({
        name: promotion.name || '',
        promotionType: promotion.promotionType || '',
        description: promotion.description || '',
        startDate: formatDateForInput(promotion.startDate),
        endDate: formatDateForInput(promotion.endDate),
        discountPercentage: promotion.discountPercentage || '',
        cashbackPercentage: promotion.cashbackPercentage || '',
        cashbackAmount: promotion.cashbackAmount || '',
        bonusPoints: promotion.bonusPoints || '',
        minDepositAmount: promotion.minDepositAmount || '',
        maxDepositAmount: promotion.maxDepositAmount || '',
        minTransferAmount: promotion.minTransferAmount || '',
        maxTransferAmount: promotion.maxTransferAmount || '',
        minConsecutiveTransactions: promotion.minConsecutiveTransactions || '',
        minAccountBalance: promotion.minAccountBalance || '',
        maxUsesPerClient: promotion.maxUsesPerClient || '',
        maxUsesTotalPromotion: promotion.maxUsesTotalPromotion || '',
        isExclusive: promotion.isExclusive || false,
        notes: promotion.notes || '',
        reason: ''
      });
    }
  }, [mode, promotion]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo cuando se edita
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones requeridas
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.promotionType) newErrors.promotionType = 'Selecciona un tipo de promoción';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';

    // Validaciones de fecha
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    // Validar al menos un beneficio
    const hasBenefit = formData.discountPercentage || formData.cashbackPercentage || 
                       formData.cashbackAmount || formData.bonusPoints;
    if (!hasBenefit) {
      newErrors.benefits = 'Debes especificar al menos un beneficio (descuento, cashback o puntos)';
    }

    // Validaciones numéricas
    if (formData.discountPercentage && (isNaN(formData.discountPercentage) || formData.discountPercentage < 0 || formData.discountPercentage > 100)) {
      newErrors.discountPercentage = 'Debe ser un número entre 0 y 100';
    }
    if (formData.cashbackPercentage && (isNaN(formData.cashbackPercentage) || formData.cashbackPercentage < 0 || formData.cashbackPercentage > 100)) {
      newErrors.cashbackPercentage = 'Debe ser un número entre 0 y 100';
    }
    if (formData.cashbackAmount && (isNaN(formData.cashbackAmount) || formData.cashbackAmount < 0)) {
      newErrors.cashbackAmount = 'Debe ser un número no negativo';
    }
    if (formData.bonusPoints && (isNaN(formData.bonusPoints) || formData.bonusPoints < 0 || !Number.isInteger(parseFloat(formData.bonusPoints)))) {
      newErrors.bonusPoints = 'Debe ser un número entero no negativo';
    }

    // Validaciones de límites
    if (formData.minDepositAmount && isNaN(formData.minDepositAmount)) {
      newErrors.minDepositAmount = 'Debe ser un número válido';
    }
    if (formData.maxUsesPerClient && (isNaN(formData.maxUsesPerClient) || formData.maxUsesPerClient <= 0)) {
      newErrors.maxUsesPerClient = 'Debe ser un número mayor a 0';
    }
    if (formData.maxUsesTotalPromotion && (isNaN(formData.maxUsesTotalPromotion) || formData.maxUsesTotalPromotion <= 0)) {
      newErrors.maxUsesTotalPromotion = 'Debe ser un número mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showError('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    try {
      // Preparar datos para enviar (normaliza tipos y respeta campos permitidos por backend)
      const payload = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (mode === 'edit' && !EDITABLE_FIELDS.has(key)) {
          return;
        }

        if (key === 'reason') {
          if (value && String(value).trim()) payload[key] = String(value).trim();
          return;
        }

        if (key === 'isExclusive') {
          if (mode === 'create') {
            if (value === true) payload[key] = true;
          } else {
            payload[key] = Boolean(value);
          }
          return;
        }

        if (value === '' || value === null || value === undefined) {
          return;
        }

        if (NUMERIC_FIELDS.has(key)) {
          const normalized = Number(value);
          if (!Number.isNaN(normalized)) payload[key] = normalized;
          return;
        }

        if (mode === 'create') {
          payload[key] = value;
        } else {
          payload[key] = value;
        }
      });

      if (mode === 'create') {
        await axiosAdmin.post('/catalog/admin/create', payload);
      } else {
        await axiosAdmin.put(`/catalog/admin/${promotion._id}`, payload);
      }

      onSave();
    } catch (error) {
      console.error('Error submitting form:', error);
      const message = error.response?.data?.message || error.message || 'Error al guardar promoción';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(6,14,28,0.82)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        overflowY: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, #0a1c3a 0%, #0f2a54 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 24,
          padding: '32px 36px',
          width: '100%',
          maxWidth: 700,
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          animation: 'modalIn 0.25s cubic-bezier(.34,1.56,.64,1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity:0; transform: scale(0.92) translateY(16px); }
            to   { opacity:1; transform: scale(1)   translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 700, margin: 0 }}>
            {mode === 'create' ? '✚ Crear Promoción' : '✎ Editar Promoción'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 10, padding: '8px 12px', color: '#fff', cursor: 'pointer', fontSize: 18 }}
          >
            ✕
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Campos Principales */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#C8A84B', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>
              Información Principal
            </h3>

            {/* Nombre */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Nombre de Promoción *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                maxLength={100}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.name ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                placeholder="Ej: Cashback Depósitos Mayo"
              />
              {errors.name && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.name}</div>}
            </div>

            {/* Tipo de Promoción */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Tipo de Promoción *
              </label>
              <select
                name="promotionType"
                value={formData.promotionType}
                onChange={handleInputChange}
                className="custom-select-options"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.promotionType ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">Selecciona un tipo...</option>
                {PROMOTION_TYPES.map(type => (
                  <option key={type} value={type}>
                    {formatPromotionType(type)}
                  </option>
                ))}
              </select>
              {errors.promotionType && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.promotionType}</div>}
            </div>

            {/* Descripción */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box',
                  minHeight: 80,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Describe los detalles de la promoción..."
              />
            </div>
          </div>

          {/* Fechas */}
          <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.startDate ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
              {errors.startDate && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.startDate}</div>}
            </div>
            <div>
              <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${errors.endDate ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  fontSize: 14,
                  boxSizing: 'border-box'
                }}
              />
              {errors.endDate && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.endDate}</div>}
            </div>
          </div>

          {/* Beneficios */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ color: '#C8A84B', fontSize: 14, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase' }}>
              Beneficios (Mínimo 1 requerido) *
            </h3>
            {errors.benefits && <div style={{ color: '#f87171', fontSize: 12, marginBottom: 12 }}>⚠️ {errors.benefits}</div>}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Descuento (%)
                </label>
                <input
                  type="number"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.discountPercentage ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="0 - 100"
                />
                {errors.discountPercentage && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.discountPercentage}</div>}
              </div>

              <div>
                <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Cashback (%)
                </label>
                <input
                  type="number"
                  name="cashbackPercentage"
                  value={formData.cashbackPercentage}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.cashbackPercentage ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="0 - 100"
                />
                {errors.cashbackPercentage && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.cashbackPercentage}</div>}
              </div>

              <div>
                <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Cashback (Monto en Q)
                </label>
                <input
                  type="number"
                  name="cashbackAmount"
                  value={formData.cashbackAmount}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.cashbackAmount ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="0.00"
                />
                {errors.cashbackAmount && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.cashbackAmount}</div>}
              </div>

              <div>
                <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Puntos de Bonificación
                </label>
                <input
                  type="number"
                  name="bonusPoints"
                  value={formData.bonusPoints}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${errors.bonusPoints ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    fontSize: 14,
                    boxSizing: 'border-box'
                  }}
                  placeholder="0"
                />
                {errors.bonusPoints && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.bonusPoints}</div>}
              </div>
            </div>
          </div>

          {/* Campos Avanzados (Acordeón) */}
          <div style={{ marginBottom: 24 }}>
            <button
              type="button"
              onClick={() => setExpandedAdvanced(!expandedAdvanced)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(200,168,75,0.12)',
                border: '1px solid rgba(200,168,75,0.3)',
                borderRadius: 8,
                color: '#C8A84B',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
            >
              {expandedAdvanced ? '▼' : '▶'} Campos Avanzados
            </button>

            {expandedAdvanced && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {/* Montos de Depósito */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Monto Mínimo Depósito (Q)
                    </label>
                    <input
                      type="number"
                      name="minDepositAmount"
                      value={formData.minDepositAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Monto Máximo Depósito (Q)
                    </label>
                    <input
                      type="number"
                      name="maxDepositAmount"
                      value={formData.maxDepositAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Montos de Transferencia */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Monto Mínimo Transferencia (Q)
                    </label>
                    <input
                      type="number"
                      name="minTransferAmount"
                      value={formData.minTransferAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Monto Máximo Transferencia (Q)
                    </label>
                    <input
                      type="number"
                      name="maxTransferAmount"
                      value={formData.maxTransferAmount}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Otros límites */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Transacciones Consecutivas Mín.
                    </label>
                    <input
                      type="number"
                      name="minConsecutiveTransactions"
                      value={formData.minConsecutiveTransactions}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Saldo Mínimo en Cuenta (Q)
                    </label>
                    <input
                      type="number"
                      name="minAccountBalance"
                      value={formData.minAccountBalance}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Límites de uso */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Usos Máx. por Cliente
                    </label>
                    <input
                      type="number"
                      name="maxUsesPerClient"
                      value={formData.maxUsesPerClient}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${errors.maxUsesPerClient ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.maxUsesPerClient && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.maxUsesPerClient}</div>}
                  </div>
                  <div>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Usos Máx. Totales
                    </label>
                    <input
                      type="number"
                      name="maxUsesTotalPromotion"
                      value={formData.maxUsesTotalPromotion}
                      onChange={handleInputChange}
                      min="1"
                      step="1"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${errors.maxUsesTotalPromotion ? '#f87171' : 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.maxUsesTotalPromotion && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>⚠️ {errors.maxUsesTotalPromotion}</div>}
                  </div>
                </div>

                {/* Notas e Exclusividad */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="isExclusive"
                      checked={formData.isExclusive}
                      onChange={handleInputChange}
                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                    />
                    Promoción Exclusiva
                  </label>
                </div>

                <div>
                  <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                    Notas Internas
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: 14,
                      boxSizing: 'border-box',
                      minHeight: 60,
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Notas internas sobre esta promoción..."
                  />
                </div>

                {/* Razón de cambio (solo en edición) */}
                {mode === 'edit' && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ color: '#cfe0ff', fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                      Razón de Cambio (para auditoría)
                    </label>
                    <textarea
                      name="reason"
                      value={formData.reason}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontSize: 14,
                        boxSizing: 'border-box',
                        minHeight: 60,
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                      placeholder="¿Por qué se realiza este cambio?"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 8,
                color: '#cfe0ff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                background: loading ? 'rgba(45, 88, 153, 0.5)' : 'linear-gradient(90deg, #2D5899, #1A2E52)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {loading ? '⏳ Guardando...' : mode === 'create' ? '✓ Crear Promoción' : '✓ Actualizar Promoción'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionFormModal;
