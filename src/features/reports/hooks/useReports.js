import { useEffect, useMemo, useState } from 'react';
import { getTransactions } from '../../../shared/api/transactions';
import {
  BanknotesIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';

const formatMoney = (value) =>
  `Q ${Number(value || 0).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const useReports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res  = await getTransactions({ limit: 100 });
      const data = res.data?.transactions ?? res.data?.transaction ?? res.data ?? [];
      setTransactions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReports().catch(() => {}); }, []);

  const reportStats = useMemo(() => {
    const totalVolume  = transactions.reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
    const deposits     = transactions.filter(tx => tx.type === 'deposit').length;
    const withdrawals  = transactions.filter(tx => tx.type === 'withdrawal').length;
    const transfers    = transactions.filter(tx => tx.type === 'transfer').length;
    return [
      { label: 'Volumen procesado', value: formatMoney(totalVolume), icon: BanknotesIcon,                tone: 'from-blue-600 to-slate-900'    },
      { label: 'Depósitos',         value: deposits.toLocaleString('es-GT'),    icon: DocumentTextIcon, tone: 'from-emerald-500 to-teal-700'  },
      { label: 'Retiros',           value: withdrawals.toLocaleString('es-GT'), icon: DocumentMagnifyingGlassIcon, tone: 'from-amber-500 to-orange-700' },
      { label: 'Transferencias',    value: transfers.toLocaleString('es-GT'),   icon: ChartBarIcon,     tone: 'from-indigo-500 to-blue-800'   },
    ];
  }, [transactions]);

  return { transactions, loading, reportStats, loadReports };
};
