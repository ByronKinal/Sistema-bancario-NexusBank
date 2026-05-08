import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { useClientStore } from '../store/useClientStore.js';
import { clientDepositService } from '../../../shared/api/clientDeposit.service.js';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

export const Deposits = () => {
  const { accounts, transactions, loading, error, fetchAllAccounts, fetchRecentTransactions, clearError } = useClientStore();
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);

  useEffect(() => {
    fetchAllAccounts();
    fetchRecentTransactions(10);
  }, [fetchAllAccounts, fetchRecentTransactions]);

  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, clearError]);

  const recentDeposits = useMemo(() => {
    const history = Array.isArray(transactions)
      ? transactions
          .filter((tx) => tx.type === 'DEPOSITO')
          .map((tx) => {
            const transactionId = tx.transactionId || tx.id || tx._id || tx.reference || `${tx.date || tx.createdAt || tx.updatedAt}-${Math.random()}`;
            return {
              id: transactionId,
              amount: Number(tx.amount || 0),
              date: tx.createdAt || tx.updatedAt || tx.date,
              status: tx.status === 'PENDIENTE' ? 'PENDIENTE' : 'APROBADO',
              reference: tx.reference || transactionId,
              account: tx.accountInfo?.accountNumber || tx.accountNumber || 'Cuenta',
              description: tx.description || 'Depósito procesado',
              raw: tx
            };
          })
      : [];

    return [...pendingRequests, ...history].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [pendingRequests, transactions]);

  const selectedDeposit = useMemo(() => {
    if (selectedRequestId) {
      return recentDeposits.find((item) => String(item.id) === String(selectedRequestId));
    }
    return recentDeposits[0] || null;
  }, [recentDeposits, selectedRequestId]);

  useEffect(() => {
    if (!selectedRequestId && recentDeposits.length > 0) {
      setSelectedRequestId(recentDeposits[0].id);
    }
  }, [recentDeposits, selectedRequestId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedAccountNumber) {
      return showError('Selecciona una cuenta destino.');
    }

    if (!amount || Number(amount) <= 0) {
      return showError('Ingresa un monto válido.');
    }

    setRequestLoading(true);

    try {
      const payload = {
        destinationAccountNumber: selectedAccountNumber,
        amount,
        description: description || 'Solicitud de depósito cliente'
      };

      const response = await clientDepositService.createDepositRequest(payload);
      const depositData = response.data;

      const newRequestId = depositData.id || depositData.transactionId || depositData._id || depositData.reference || `${new Date().toISOString()}-${Math.random()}`;

      setPendingRequests((prev) => [
        {
          id: newRequestId,
          amount: Number(depositData.amount),
          date: depositData.createdAt || new Date().toISOString(),
          status: depositData.status || 'PENDIENTE',
          reference: depositData.reference || newRequestId,
          account: selectedAccountNumber,
          description: depositData.description || payload.description,
          raw: depositData
        },
        ...prev
      ]);
      setSelectedRequestId(newRequestId);
      showSuccess('Solicitud de depósito enviada correctamente. Queda pendiente de aprobación.');
      setAmount('');
      setDescription('');
    } catch (submitError) {
      const message = submitError.response?.data?.message || 'Error al enviar la solicitud de depósito';
      showError(message);
    } finally {
      setRequestLoading(false);
    }
  };

  const buildReceiptHtml = (deposit, autoPrint = false) => {
    const amountFormatted = deposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 });
    const dateFormatted = new Date(deposit.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
    const statusLabel = deposit.status === 'PENDIENTE' ? 'PENDIENTE' : 'APROBADO';

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Constancia de depósito</title>
  <style>
    body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background: #F3F6FB; color: #1F2937; }
    .wrapper { width: 100%; padding: 32px; box-sizing: border-box; }
    .card { max-width: 760px; margin: 0 auto; background: white; border-radius: 28px; overflow: hidden; box-shadow: 0 28px 80px rgba(15, 23, 42, 0.08); }
    .header { background: #183664; color: white; padding: 32px 32px 22px; }
    .header .title { margin: 0; font-size: 18px; letter-spacing: 0.3em; text-transform: uppercase; color: #C8D9FF; }
    .header .amount { margin: 16px 0 0; font-size: 40px; line-height: 1.1; font-weight: 700; }
    .header .ref { margin: 12px 0 0; font-size: 13px; color: #CBD5E1; }
    .section { padding: 28px 32px; }
    .section-title { margin: 0 0 12px; font-size: 16px; font-weight: 700; color: #1A2E52; }
    .row { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
    .row span:first-child { color: #64748B; font-size: 13px; }
    .row span:last-child { color: #0F172A; font-weight: 600; }
    .badge { display: inline-flex; padding: 10px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; letter-spacing: 0.02em; }
    .approved { background: #D1FAE5; color: #065F46; }
    .pending { background: #FEF3C7; color: #92400E; }
    .note { margin: 24px 0 0; padding: 18px 20px; border-radius: 20px; background: #ECFDF5; color: #065F46; font-size: 14px; line-height: 1.6; }
    @media print {
      body { background: white; }
      .wrapper { padding: 0; }
      .card { box-shadow: none; border: none; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <p class="title">Constancia de Depósito</p>
        <p class="amount">Q${amountFormatted}</p>
        <p class="ref">REF: ${deposit.reference}</p>
      </div>
      <div class="section">
        <div class="row"><span>Estado</span><span><span class="badge ${deposit.status === 'PENDIENTE' ? 'pending' : 'approved'}">${statusLabel}</span></span></div>
        <div class="row"><span>Fecha</span><span>${dateFormatted}</span></div>
        <div class="row"><span>Cuenta destino</span><span>${deposit.account}</span></div>
        <div class="row"><span>Tipo</span><span>Depósito</span></div>
        <div class="row"><span>Monto</span><span>Q${amountFormatted}</span></div>
        <div class="row"><span>Descripción</span><span>${deposit.description || 'Sin descripción'}</span></div>
        <div class="note">${deposit.status === 'PENDIENTE' ? 'Depósito pendiente de aprobación. Cuando se apruebe, podrás descargar o imprimir la constancia.' : 'Depósito aprobado y procesado. Imprime o guarda este documento como PDF para tu registro.'}</div>
      </div>
    </div>
  </div>
  ${autoPrint ? '<script>window.onload = function() { window.print(); };</script>' : ''}
</body>
</html>`;
  };

  const openReceiptWindow = (deposit, autoPrint = false) => {
    const receiptHtml = buildReceiptHtml(deposit, autoPrint);
    const printWindow = window.open('', '_blank', 'width=900,height=800');

    if (!printWindow) {
      showError('No se pudo abrir la ventana de impresión. Verifica que el navegador permita ventanas emergentes.');
      return;
    }

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    printWindow.focus();
  };

  const generateReceiptPdf = (deposit) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let cursorY = 60;

    doc.setFillColor('#183664');
    doc.rect(0, 0, 595, 110, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFontSize(14);
    doc.text('CONSTANCIA DE DEPÓSITO', margin, cursorY);

    cursorY += 30;
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text(`Q${deposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, margin, cursorY);

    cursorY += 28;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`REF: ${deposit.reference}`, margin, cursorY);

    cursorY += 40;
    doc.setDrawColor('#E2E8F0');
    doc.setLineWidth(1);
    doc.line(margin, cursorY, 555, cursorY);

    cursorY += 30;
    doc.setTextColor('#334155');
    doc.setFontSize(12);
    doc.text('Estado:', margin, cursorY);
    doc.text(deposit.status === 'PENDIENTE' ? 'PENDIENTE' : 'APROBADO', 520, cursorY, { align: 'right' });

    cursorY += 26;
    doc.text('Fecha:', margin, cursorY);
    doc.text(new Date(deposit.date).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' }), 520, cursorY, { align: 'right' });

    cursorY += 26;
    doc.text('Cuenta destino:', margin, cursorY);
    doc.text(deposit.account, 520, cursorY, { align: 'right' });

    cursorY += 26;
    doc.text('Tipo:', margin, cursorY);
    doc.text('Depósito', 520, cursorY, { align: 'right' });

    cursorY += 26;
    doc.text('Monto:', margin, cursorY);
    doc.text(`Q${deposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}`, 520, cursorY, { align: 'right' });

    cursorY += 26;
    doc.text('Descripción:', margin, cursorY);
    doc.text(deposit.description || 'Sin descripción', 520, cursorY, { align: 'right' });

    cursorY += 40;
    doc.setFontSize(10);
    doc.setTextColor('#065F46');
    doc.setFillColor('#ECFDF5');
    doc.rect(margin, cursorY - 16, 515, 48, 'F');
    doc.text(
      deposit.status === 'PENDIENTE'
        ? 'Depósito pendiente de aprobación. Cuando se apruebe, podrás descargar o imprimir la constancia.'
        : 'Depósito aprobado y procesado. Guarda este PDF como comprobante de tu depósito.',
      margin + 8,
      cursorY,
      { maxWidth: 500 }
    );

    return doc;
  };

  const handleDownload = () => {
    if (!selectedDeposit || selectedDeposit.status === 'PENDIENTE') return;
    const doc = generateReceiptPdf(selectedDeposit);
    doc.save(`constancia-deposito-${selectedDeposit.reference || selectedDeposit.id}.pdf`);
  };

  const handlePrint = () => {
    if (!selectedDeposit || selectedDeposit.status === 'PENDIENTE') return;
    openReceiptWindow(selectedDeposit, false);
  };

  const handleSelectDeposit = (depositId) => {
    setSelectedRequestId(depositId);
  };

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1A2E52]">Depósitos</h1>
        <p className="text-gray-500 mt-2">Registra un depósito, consulta su estado y revisa la constancia.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="glass-panel rounded-3xl p-6 shadow-lg border border-white/60">
          <h2 className="text-xl font-bold text-[#1A2E52] mb-4">Formulario de Depósito</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cuenta destino</label>
              <select
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#2D5899] focus:outline-none"
                value={selectedAccountNumber}
                onChange={(e) => setSelectedAccountNumber(e.target.value)}
              >
                <option value="">Selecciona una cuenta</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.accountNumber}>
                    {account.accountNumber} — {account.accountType || 'Cuenta'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Monto a depositar (Q)</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#2D5899] focus:outline-none"
                placeholder="9999.99"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción (opcional)</label>
              <textarea
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-[#2D5899] focus:outline-none min-h-[120px]"
                placeholder="Agrega una descripción del depósito opcional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={requestLoading}
              className="w-full rounded-2xl bg-gradient-to-r from-[#2D5899] to-[#1A2E52] text-white font-semibold py-3 hover:shadow-lg transition disabled:opacity-60"
            >
              {requestLoading ? 'Enviando...' : 'Enviar Depósito'}
            </button>
          </form>
        </section>

        <section className="glass-panel rounded-3xl p-6 shadow-lg border border-white/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-[#1A2E52]">Estado de Depósitos</h2>
              <p className="text-gray-500 text-sm">Consulta tus depósitos recientes y solicitudes pendientes.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-[#E8F2FF] px-3 py-1 text-sm font-semibold text-[#1B4A8F]">
              {recentDeposits.length} registros
            </span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-2">
            {recentDeposits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No hay depósitos recientes.
              </div>
            ) : (
              recentDeposits.map((item) => {
                const isActive = selectedDeposit?.id === item.id;
                return (
                  <article
                    key={`${item.id}-${item.status}`}
                    role="button"
                    tabIndex={0}
                    className={`w-full rounded-3xl p-4 border transition ${isActive ? 'border-[#2D5899] bg-[#EFF4FF] cursor-pointer' : 'border-gray-200 bg-white hover:border-[#2D5899]/50 cursor-pointer'}`}
                    onClick={() => handleSelectDeposit(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectDeposit(item.id);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-2xl font-bold text-[#1A2E52]">Q{item.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(item.date).toLocaleDateString('es-ES')} • {item.account}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${item.status === 'PENDIENTE' ? 'bg-yellow-100 text-[#B45309]' : 'bg-emerald-100 text-[#047857]'}`}>
                        {item.status === 'PENDIENTE' ? 'PENDIENTE' : 'APROBADO'}
                      </span>
                    </div>

                    <div className="mt-4 border-t pt-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Referencia</p>
                        <p className="text-sm font-semibold text-[#1A2E52]">{item.reference}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cuenta</p>
                        <p className="text-sm font-semibold text-[#1A2E52]">{item.account}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDeposit(item.id);
                        }}
                        className={`rounded-full px-4 py-2 text-xs font-semibold transition ${isActive ? 'bg-[#2D5899] text-white' : 'bg-white border border-[#2D5899] text-[#2D5899] hover:bg-[#2D5899] hover:text-white'}`}
                      >
                        Ver
                      </button>
                      {isActive && <span className="text-xs text-[#2D5899] font-semibold">Seleccionado</span>}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <section className="glass-panel rounded-3xl p-6 shadow-lg border border-white/60">
          {selectedDeposit ? (
            <div className="rounded-3xl overflow-hidden border border-[#E5E7EB]">
              <div className="bg-[#183664] px-5 py-4 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-[#C8D9FF]">{selectedDeposit.status === 'PENDIENTE' ? 'Pendiente' : 'Aprobado'}</p>
                    <p className="text-lg font-semibold">Q{selectedDeposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#C8D9FF]">REF</p>
                    <p className="font-semibold">{selectedDeposit.reference}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5">
                <div className="space-y-3 text-sm text-[#1F2937]">
                  <div className="flex justify-between items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="font-semibold">Fecha</span>
                    <span>{new Date(selectedDeposit.date).toLocaleString('es-ES')}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="font-semibold">Cuenta</span>
                    <span>{selectedDeposit.account}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="font-semibold">Tipo</span>
                    <span>Depósito</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="font-semibold">Monto</span>
                    <span>Q{selectedDeposit.amount.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center gap-2 border-b border-gray-100 pb-3">
                    <span className="font-semibold">Descripción</span>
                    <span>{selectedDeposit.description || 'Sin descripción'}</span>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl bg-[#ECFDF5] p-4 border border-[#D1FAE5] text-sm text-[#065F46]">
                  {selectedDeposit.status === 'PENDIENTE'
                    ? 'Depósito pendiente de aprobación. Cuando se apruebe, podrás descargar o imprimir la constancia.'
                    : 'Depósito aprobado y procesado.'}
                </div>
                <div className="mt-6 grid gap-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={selectedDeposit.status === 'PENDIENTE'}
                    className="rounded-2xl bg-[#1D4ED8] text-white py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    PDF
                  </button>
                  <button
                    type="button"
                    onClick={handlePrint}
                    disabled={selectedDeposit.status === 'PENDIENTE'}
                    className="rounded-2xl border border-[#1D4ED8] text-[#1D4ED8] py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Imprimir
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              Selecciona un depósito para ver la constancia.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
