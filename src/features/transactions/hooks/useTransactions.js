import { useState, useEffect, useMemo } from 'react';
import { getTransactions, getMyTransactions, revertTransaction, updateTransaction, getTransactionReceipt } from '../../../shared/api/admin';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { normalizeRole } from '../../../shared/utils/authRole';
import { useAuthStore } from '../../auth/store/authStore';

export const useTransactions = () => {
  const [transactions, setTransactions]         = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [revertingId, setRevertingId]           = useState(null);
  const [editingId, setEditingId]               = useState(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState(null);

  const role    = normalizeRole(useAuthStore(state => state.user?.role));
  const isAdmin = role === 'ADMIN_ROLE';

  const normalizeType = (type) => String(type || '').toLowerCase();
  const getTxId       = (tx)   => tx?.id || tx?._id;

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res  = isAdmin
        ? await getTransactions({ limit: 50 })
        : await getMyTransactions(50);
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
      showSuccess('Transacciones cargadas');
    } catch (error) {
      showError('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = useMemo(() => {
    const totalVolume  = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0);
    const netFlow      = transactions.reduce((sum, tx) =>
      normalizeType(tx.type) === 'deposit' ? sum + tx.amount : sum - tx.amount, 0);
    const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
    return { totalVolume, netFlow, pendingCount, total: transactions.length };
  }, [transactions]);  

  const canEditTransaction = (tx) => {
    if (!isAdmin || tx?.reverted) return false;
    return ['deposit', 'transfer'].includes(normalizeType(tx?.type));
  };

  const canRevertTransaction = (tx) => {
    if (!isAdmin) return false;
    if (!['deposit', 'transfer'].includes(normalizeType(tx.type))) return false;
    if (tx.reverted) return false;
    const createdAt = tx.createdAt || tx.date;
    if (!createdAt) return false;
    return (Date.now() - new Date(createdAt).getTime()) <= 60_000;
  };

  const handleRevert = async (transactionId) => {
    if (!window.confirm('¿Confirmas que deseas revertir esta transacción?')) return;
    try {
      setRevertingId(transactionId);
      const res = await revertTransaction(transactionId);
      if (res?.data?.success) { showSuccess('Transacción revertida correctamente'); await loadTransactions(); }
      else showError(res?.data?.message || 'No se pudo revertir la transacción');
    } catch (error) {
      showError(error?.response?.data?.message || error.message || 'No se pudo revertir la transacción');
    } finally {
      setRevertingId(null);
    }
  };

  const handleEditTransaction = async (tx) => {
    const transactionId = getTxId(tx);
    if (!transactionId) { showError('ID de transacción inválido'); return; }
    const currentAmount  = Number(tx?.amount || 0);
    const nextAmountRaw  = window.prompt('Ingresa el nuevo monto para la transacción:', String(currentAmount));
    if (nextAmountRaw === null) return;
    const nextAmount = Number(nextAmountRaw);
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) { showError('Monto inválido'); return; }
    if (!window.confirm(`¿Confirmas actualizar el monto de Q ${currentAmount.toFixed(2)} a Q ${nextAmount.toFixed(2)}?`)) return;
    try {
      setEditingId(transactionId);
      const res = await updateTransaction(transactionId, { amount: nextAmount });
      if (res?.data?.success) { showSuccess('Transacción actualizada correctamente'); await loadTransactions(); }
      else showError(res?.data?.message || 'No se pudo actualizar la transacción');
    } catch (error) {
      showError(error?.response?.data?.message || error.message || 'No se pudo actualizar la transacción');
    } finally {
      setEditingId(null);
    }
  };

  const handleShareReceipt = async (tx) => {
    const transactionId = getTxId(tx);
    if (!transactionId) { showError('ID de transacción inválido'); return; }
    try {
      setReceiptLoadingId(transactionId);
      const res      = await getTransactionReceipt(transactionId);
      const blob     = new Blob([res.data], { type: 'application/pdf' });
      const fileName = `comprobante-${transactionId}.pdf`;
      const file     = new File([blob], fileName, { type: 'application/pdf' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Comprobante de transacción' });
      } else {
        const url  = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href  = url; link.download = fileName;
        document.body.appendChild(link); link.click();
        document.body.removeChild(link); URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (error?.name !== 'AbortError')
        showError(error?.response?.data?.message || error.message || 'No se pudo obtener el comprobante');
    } finally {
      setReceiptLoadingId(null);
    }
  };

  return {
    transactions, loading, revertingId, editingId, receiptLoadingId,
    isAdmin, stats, normalizeType, getTxId,
    loadTransactions, canEditTransaction, canRevertTransaction,
    handleRevert, handleEditTransaction, handleShareReceipt,
  };
};
