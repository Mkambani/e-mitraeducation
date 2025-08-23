import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Booking } from '../../types';

const STATUS_TEXT_COLORS: { [key: string]: string } = {
  'Pending': 'text-yellow-400', 'In Review': 'text-blue-400', 'Completed': 'text-purple-400',
  'Approved': 'text-green-400', 'Rejected': 'text-red-400',
};
const STATUS_BG_COLORS: { [key: string]: string } = {
  'Pending': 'bg-yellow-400/10', 'In Review': 'bg-blue-400/10', 'Completed': 'bg-purple-400/10',
  'Approved': 'bg-green-400/10', 'Rejected': 'bg-red-400/10',
};

const PAYMENT_METHODS = ['razorpay', 'cod', 'N/A (Free)'];

const AdminTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionsPerPage] = useState(15);
    const [totalTransactions, setTotalTransactions] = useState(0);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const from = (currentPage - 1) * transactionsPerPage;
            const to = from + transactionsPerPage - 1;

            let query = supabase
                .from('bookings')
                .select('*, services(name), profiles(full_name, email)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (paymentFilter) {
                query = query.eq('payment_method', paymentFilter);
            }
            if (searchTerm) {
                query = query.or(`profiles.full_name.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%,id::text.ilike.%${searchTerm}%,payment_id.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query;

            if (error) throw error;
            
            setTransactions((data as unknown as Booking[]) || []);
            setTotalTransactions(count || 0);

        } catch (err: any) {
            setError(`Failed to load transactions: ${err.message}`);
        } finally {
            setLoading(false);
        }
    }, [currentPage, transactionsPerPage, paymentFilter, searchTerm]);

    useEffect(() => {
        const timer = setTimeout(() => { fetchTransactions(); }, 300);
        return () => clearTimeout(timer);
    }, [fetchTransactions]);

    const handleResetFilters = () => {
        setSearchTerm('');
        setPaymentFilter('');
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalTransactions / transactionsPerPage);

    return (
        <div className="bg-admin-card-bg p-6 rounded-xl shadow-sm border border-admin-card-border">
            {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg mb-4">{error}</p>}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by ID, name, email, payment ID..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition"
                />
                <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }} className="w-full p-2 bg-admin-main-bg text-admin-heading border border-admin-card-border rounded-lg focus:ring-1 focus:ring-admin-accent focus:border-admin-accent transition">
                    <option value="">All Payment Methods</option>
                    {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={handleResetFilters} className="px-4 py-2 bg-admin-light/20 text-admin-heading font-semibold rounded-lg hover:bg-admin-light/30 transition text-sm">Reset</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="text-admin-light">
                        <tr>
                            <th className="p-4 font-semibold">Booking ID</th>
                            <th className="p-4 font-semibold">Customer</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold">Method</th>
                            <th className="p-4 font-semibold">Payment ID</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-admin-card-border">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={7} className="p-4"><div className="h-6 bg-admin-main-bg rounded"></div></td>
                                </tr>
                            ))
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={7} className="p-10 text-center text-admin-light/70">No transactions found.</td></tr>
                        ) : (
                            transactions.map(t => (
                                <tr key={t.id} className="hover:bg-admin-main-bg">
                                    <td className="p-4 font-mono text-admin-light">{String(t.id).padStart(6, '0')}</td>
                                    <td className="p-4">
                                        <div className="font-semibold text-admin-heading">{t.profiles?.full_name || 'N/A'}</div>
                                        <div className="text-admin-light text-xs">{t.profiles?.email}</div>
                                    </td>
                                    <td className="p-4 font-bold text-admin-heading">₹{t.final_price?.toFixed(2) || '0.00'}</td>
                                    <td className="p-4 text-admin-light capitalize">{t.payment_method}</td>
                                    <td className="p-4 font-mono text-admin-light truncate max-w-xs">{t.payment_id || 'N/A'}</td>
                                    <td className="p-4 text-admin-light">{new Date(t.created_at).toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${STATUS_BG_COLORS[t.status] || ''} ${STATUS_TEXT_COLORS[t.status] || ''}`}>{t.status}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-admin-card-border">
                <span className="text-sm text-admin-light">
                    Showing <span className="font-semibold text-admin-heading">{Math.min((currentPage - 1) * transactionsPerPage + 1, totalTransactions)}</span> to <span className="font-semibold text-admin-heading">{Math.min(currentPage * transactionsPerPage, totalTransactions)}</span> of <span className="font-semibold text-admin-heading">{totalTransactions}</span> results
                </span>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-admin-main-bg hover:bg-admin-card-border disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-admin-main-bg hover:bg-admin-card-border disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminTransactionsPage;
