import { Card } from '@material-tailwind/react';
import { FaWallet, FaArrowRight } from 'react-icons/fa';

const getAccountTypeLabel = (account) => {
  const rawType = String(account?.accountType || account?.type || account?.name || '').trim().toLowerCase();

  if (!rawType) return 'Cuenta';
  if (rawType.includes('corrient') || rawType.includes('monetar')) return 'Cuenta corriente';
  if (rawType.includes('ahor')) return 'Cuenta de ahorro';
  if (rawType.startsWith('cuenta')) return rawType.charAt(0).toUpperCase() + rawType.slice(1);

  return `Cuenta ${rawType}`;
};

export const AccountsGrid = ({ accounts }) => {
  if (!accounts || accounts.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No hay cuentas disponibles</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((account) => (
        <Card
          key={account.id}
          className="hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
        >
          <div className="bg-gradient-to-br from-[#E8D8A0] to-[#C8A84B] px-4 py-6 text-white">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-xs opacity-75 mb-1">Número de cuenta</p>
                <p className="text-lg font-mono">
                  {account.accountNumber?.slice(-4) || '••••'}
                </p>
              </div>
              <FaWallet size={24} opacity={0.8} />
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-75">Saldo disponible</p>
                <p className="text-2xl font-bold">
                  {(account.balance || 0).toLocaleString('es-GT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <span className="text-xs font-semibold opacity-75">
                {account.currency || 'Q'}
              </span>
            </div>
          </div>

          <div className="px-4 py-3">
            <p className="text-xs text-gray-600 mb-2">
              {getAccountTypeLabel(account)}
            </p>
            <button className="w-full flex items-center justify-center gap-2 text-[#2D5899] hover:text-[#C8A84B] font-medium text-sm transition-colors">
              Ver detalles
              <FaArrowRight size={12} />
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
};
