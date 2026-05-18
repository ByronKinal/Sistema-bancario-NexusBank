import React, { useState, useEffect, useCallback } from 'react';
import { getClientPromotions } from '../../../shared/api/clientPromotion.service.js';
import { showError } from '../../../shared/utils/toast.js';

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPromotions = useCallback(async (search = '') => {
    try {
      setLoading(true);
      const data = await getClientPromotions(search);
      if (data.success) {
        setPromotions(data.data);
      }
    } catch (error) {
      showError('Error al cargar las promociones.');
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions(searchTerm);

    const intervalId = setInterval(() => {
      fetchPromotions(searchTerm);
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchPromotions, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Indefinida';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getPromotionInstructions = (type) => {
    const instructions = {
      'PRIMER_DEPOSITO_BONUS': 'Realiza tu primer depósito y recibe un porcentaje de vuelta (cashback) automáticamente en tu cuenta principal.',
      'TRANSFERENCIA_RECIBIDA_BONUS': 'Recibe una transferencia de otra persona y recibe un porcentaje extra o un bono directamente acreditado a tu balance.',
      'APERTURA_CUENTA_BONUS': 'Abre una cuenta adicional y recibe automáticamente un bono de bienvenida.'
    };
    return instructions[type] || 'Aprovecha esta promoción desde tu panel interactivo para obtener sus beneficios.';
  };

  const handleUsePromotion = (promo) => {
    const instruction = getPromotionInstructions(promo.promotionType);
    const promoCode = promo._id;

    navigator.clipboard.writeText(promoCode).catch(err => console.error("Error al copiar código", err));
    
    alert(`¿Cómo usar "${promo.name}"?\n\n${instruction}\n\nTu código de promoción es:\n${promoCode}\n\n(El código ha sido copiado a tu portapapeles)`);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A2E52] mb-2">Promociones Activas</h1>
          <p className="text-gray-600">Descubre los beneficios exclusivos que tenemos para ti.</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar promociones por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C8A84B] focus:border-transparent transition-all"
        />
      </div>

      {loading && promotions.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A2E52]"></div>
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-lg">No hay promociones activas en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col">
              <div className="h-3 bg-gradient-to-r from-[#1A2E52] to-[#C8A84B]"></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-semibold bg-[#E8F0FE] text-[#1A2E52] rounded-full mb-3">
                    {promo.promotionType.replace(/_/g, ' ')}
                  </span>
                  <h3 className="text-xl font-bold text-[#1A2E52] mb-2 line-clamp-2">{promo.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3 flex-1">{promo.description || 'Sin descripción disponible.'}</p>
                  
                  {/* Detalles específicos del beneficio */}
                  <div className="bg-[#f0f4f8] p-3 rounded-lg text-sm mb-2 text-[#1A2E52] font-medium border border-[#CAD7EB]">
                    {promo.cashbackPercentage ? `Cashback: ${promo.cashbackPercentage}%` : ''}
                    {promo.cashbackAmount ? `Cashback fijo: Q${promo.cashbackAmount}` : ''}
                    {promo.discountPercentage ? `Descuento: ${promo.discountPercentage}%` : ''}
                    {(!promo.cashbackPercentage && !promo.cashbackAmount && !promo.discountPercentage) && 'Recompensa especial'}
                    
                    {(promo.minDepositAmount || promo.minTransferAmount) && (
                      <div className="text-xs text-gray-500 font-normal mt-1">
                        Monto mínimo requerido: Q{promo.minDepositAmount || promo.minTransferAmount}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 w-20">Inicio:</span>
                      <span>{formatDate(promo.startDate)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 w-20">Fin:</span>
                      <span>{formatDate(promo.endDate)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUsePromotion(promo)}
                    className="w-full py-2 bg-[#1A2E52] hover:bg-[#2D5899] text-white font-semibold rounded-lg transition-colors duration-300"
                  >
                    Usar promoción
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Promotions;
