import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Wallet as WalletIcon, Plus, ArrowLeft, CreditCard, Send, Download, Utensils, PlusCircle, Receipt, Bell, ScanLine } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { walletService } from '../services/api';
import { toast } from '../utils/toastWithSound';

interface Transaction {
  id: string;
  date: string;
  type: 'credit' | 'debit' | 'wallet';
  amount: number;
  description: string;
  category?: string;
  emoji?: string;
}

// Helper to map transaction description to emoji
const getEmojiForTransaction = (description: string, type: string): string => {
  const lower = description.toLowerCase();
  if (lower.includes('top up')) return '💳';
  if (lower.includes('order') || lower.includes('meal')) return '🍽️';
  if (lower.includes('sent')) return '📤';
  if (lower.includes('received')) return '📥';
  if (type === 'credit') return '💰';
  return '🛒';
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString();
    }
    return dateString;
  } catch {
    return dateString;
  }
};

const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '';
  } catch {
    return '';
  }
};

const detectTypeFromDescription = (description: string, apiType: string): 'credit' | 'debit' | 'wallet' => {
  const desc = description.toLowerCase();
  if (desc.includes('top up') || desc.includes('add funds') || desc.includes('deposit') || desc.includes('received')) return 'credit';
  if (desc.includes('order') || desc.includes('purchase') || desc.includes('payment') || desc.includes('sent')) return 'debit';
  if (apiType === 'wallet') return 'wallet';
  if (apiType === 'credit') return 'credit';
  return 'debit';
};

export function Wallet() {
  const { user, updateWalletBalance } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlyLimit, setMonthlyLimit] = useState(2000);
  
  // Modal states
  const [activeModal, setActiveModal] = useState<'pay' | 'topup' | 'send' | 'history' | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [topUpAmount, setTopUpAmount] = useState('');
  const [customTopUp, setCustomTopUp] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sendNote, setSendNote] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const loadData = async () => {
    try {
      // Get balance
      const balanceData = await walletService.getBalance();
      setBalance(balanceData.balance);
      
      // Get transactions
      const txData = await walletService.getTransactions();
      const normalized = txData.map((t: any) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount);
        const description = t.description || '';
        const apiType = t.type || 'debit';
        const type = detectTypeFromDescription(description, apiType);
        return {
          id: t.id,
          date: t.date,
          type,
          amount: isNaN(amount) ? 0 : amount,
          description,
          category: t.category || 'other',
          emoji: getEmojiForTransaction(description, type),
        };
      });
      setTransactions(normalized);
      
      // Calculate monthly spending (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentDebits = normalized.filter(t => {
        if (t.type !== 'debit') return false;
        const txDate = new Date(t.date);
        return txDate >= thirtyDaysAgo;
      });
      const totalSpent = recentDebits.reduce((sum, t) => sum + t.amount, 0);
      setMonthlySpent(totalSpent);
    } catch (error) {
      console.error(error);
      toast.error('Could not load wallet data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const handleTopUp = async (amount: number) => {
    if (isNaN(amount) || amount < 5 || amount > 500) {
      toast.error('Amount must be between $5 and $500');
      return;
    }
    try {
      await walletService.topUp(amount);
      updateWalletBalance(amount);
      await loadData();
      if (Notification.permission === 'granted') {
        new Notification('Wallet Top-Up Successful', { body: `$${amount.toFixed(2)} added.`, icon: '/favicon.ico' });
      }
      toast.success(`Added $${amount.toFixed(2)} to your wallet!`);
      setActiveModal(null);
      setTopUpAmount('');
      setCustomTopUp('');
    } catch (error: any) {
      toast.error(error.message || 'Top-up failed');
    }
  };

  const handleSend = async () => {
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Amount must be at least $1');
      return;
    }
    if (!sendTo.trim()) {
      toast.error('Please enter recipient email');
      return;
    }
    if (sendTo === user?.email) {
      toast.error('You cannot send money to yourself');
      return;
    }
    setTransferLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` },
        body: JSON.stringify({ recipient_email: sendTo, amount, note: sendNote }),
      });
      const data = await response.json();
      if (response.ok) {
        updateWalletBalance(-amount);
        await loadData();
        toast.success(`Sent $${amount.toFixed(2)} to ${sendTo}`);
        setActiveModal(null);
        setSendTo('');
        setSendAmount('');
        setSendNote('');
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleQuickPay = async () => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }
    // For demo, just deduct and add a transaction
    try {
      // Simulate a payment – you can later integrate with an actual endpoint
      updateWalletBalance(-amount);
      await loadData();
      toast.success(`Paid $${amount.toFixed(2)} successfully!`);
      setActiveModal(null);
      setPayAmount('');
    } catch (error) {
      toast.error('Payment failed');
    }
  };

  const spendingPercent = Math.min((monthlySpent / monthlyLimit) * 100, 100);
  const remaining = Math.max(monthlyLimit - monthlySpent, 0);

  const safeWalletBalance = typeof balance === 'number' ? balance : parseFloat(balance || '0');
  const recentTransactions = transactions.slice(0, 5);

  if (!user) return <div className="min-h-[60vh] flex items-center justify-center text-white">Please login to access your wallet.</div>;

  return (
    <div className="min-h-screen w-full overflow-auto" style={{ background: '#0a0a1a' }}>
      <div className="max-w-md mx-auto px-5 pb-8">
        {/* Status Bar */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #e94560, #c23152)' }}>
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <span className="text-white/80 text-sm font-mono">Marryshow</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-white/60" />
            <ScanLine className="w-5 h-5 text-white/60" />
          </div>
        </div>

        {/* Card Section */}
        <div className="pt-4 pb-6">
          <div className="card-main rounded-2xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', boxShadow: '0 25px 60px rgba(15, 52, 96, 0.5), 0 0 0 1px rgba(255,255,255,0.08)', aspectRatio: '1.7/1', maxWidth: '400px', margin: '0 auto' }}>
            <svg className="absolute inset-0 w-full h-full opacity-[0.06]" viewBox="0 0 400 240">
              <circle cx="320" cy="60" r="120" fill="white" />
              <circle cx="360" cy="100" r="80" fill="white" />
            </svg>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-[10px] tracking-widest uppercase">Available Balance</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-white/60 text-lg">$</span>
                    <span className="text-white text-3xl font-bold font-mono">{safeWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="contactless nfc-wave" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.6">
                    <path d="M6 18.5a6 6 0 0 1 0-13" />
                    <path d="M10 16a3.5 3.5 0 0 1 0-8" />
                    <circle cx="14" cy="12" r="1" />
                  </svg>
                  <span className="text-white text-sm font-bold tracking-wider font-mono">VISA</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="chip w-[42px] h-[32px] bg-gradient-to-br from-[#e6c86e] to-[#c9a84c] rounded-md relative overflow-hidden mb-3">
                    <div className="absolute inset-[3px] border border-black/15 rounded-sm"></div>
                    <div className="absolute left-1/2 top-[3px] bottom-[3px] w-[1.5px] bg-black/12"></div>
                  </div>
                  <p className="text-white/70 text-xs tracking-[0.25em] font-mono">•••• •••• •••• {user.id.toString().slice(-4)}</p>
                  <p className="text-white/50 text-[11px] mt-1.5 uppercase tracking-wider">{user.username || 'Card Holder'}</p>
                </div>
                <p className="text-white/40 text-[10px] font-mono">12/28</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="pb-5">
          <div className="grid grid-cols-4 gap-3" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <button onClick={() => setActiveModal('pay')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(233, 69, 96, 0.15)' }}>
                <Utensils className="w-5 h-5" style={{ color: '#e94560' }} />
              </div>
              <span className="text-white/70 text-[11px] font-medium">Pay</span>
            </button>
            <button onClick={() => setActiveModal('topup')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(83, 197, 139, 0.15)' }}>
                <PlusCircle className="w-5 h-5" style={{ color: '#53c58b' }} />
              </div>
              <span className="text-white/70 text-[11px] font-medium">Top Up</span>
            </button>
            <button onClick={() => setActiveModal('send')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96, 165, 250, 0.15)' }}>
                <Send className="w-5 h-5" style={{ color: '#60a5fa' }} />
              </div>
              <span className="text-white/70 text-[11px] font-medium">Send</span>
            </button>
            <button onClick={() => setActiveModal('history')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                <Receipt className="w-5 h-5" style={{ color: '#fbbf24' }} />
              </div>
              <span className="text-white/70 text-[11px] font-medium">History</span>
            </button>
          </div>
        </div>

        {/* Spending Overview */}
        <div className="pb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/50 text-xs uppercase tracking-wider">Monthly Spending</span>
              <span className="text-white/70 text-xs font-mono">${monthlySpent.toFixed(0)} / ${monthlyLimit}</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="spending-bar h-full rounded-full" style={{ width: `${spendingPercent}%`, background: 'linear-gradient(90deg, #e94560, #fbbf24)' }}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-white/30 text-[10px]">{Math.round(spendingPercent)}% used</span>
              <span className="text-white/30 text-[10px]">${remaining.toFixed(0)} remaining</span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="pb-8" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm">Recent Orders</h3>
            <button onClick={() => setActiveModal('history')} className="text-xs font-medium" style={{ color: '#e94560' }}>See All</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {loading ? (
              <div className="text-white/50 text-center py-4">Loading...</div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-white/50 text-center py-4">No transactions yet</div>
            ) : (
              recentTransactions.map((tx, i) => {
                const isCredit = tx.type === 'credit';
                const timeStr = formatDate(tx.date) + (formatTime(tx.date) ? `, ${formatTime(tx.date)}` : '');
                return (
                  <div key={tx.id} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', animation: 'slideUp 0.3s ease forwards', opacity: 0, animationDelay: `${i * 0.06}s` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      {tx.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{tx.description}</p>
                      <p className="text-white/35 text-[11px] mt-0.5">{timeStr}</p>
                    </div>
                    <span className={`text-sm font-semibold font-mono ${isCredit ? 'text-[#53c58b]' : 'text-white/80'}`}>
                      {isCredit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pay Modal */}
      {activeModal === 'pay' && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveModal(null)}></div>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6" style={{ background: '#141428', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Quick Pay</h3>
            <p className="text-white/40 text-sm mb-5">Tap to pay at participating restaurants</p>
            <div className="flex flex-col gap-3 mb-5">
              <label className="text-white/50 text-xs uppercase tracking-wider">Amount</label>
              <div className="flex items-center gap-2 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-white/40 text-xl">$</span>
                <input type="number" placeholder="0.00" className="bg-transparent text-white text-2xl font-bold outline-none w-full font-mono" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} min="0" step="0.01" />
              </div>
            </div>
            <button onClick={handleQuickPay} className="w-full py-4 rounded-xl text-white font-semibold text-sm tracking-wide" style={{ background: 'linear-gradient(135deg, #e94560, #c23152)' }}>
              Pay Now
            </button>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 mt-3 rounded-xl text-white/40 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveModal(null)}></div>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6" style={{ background: '#141428', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Top Up Balance</h3>
            <p className="text-white/40 text-sm mb-5">Add funds to your Marryshow Card</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[25, 50, 100, 250].map(amt => (
                <button key={amt} onClick={() => handleTopUp(amt)} className="p-4 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <span className="text-white font-bold text-lg font-mono">${amt}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-white/50 text-xs uppercase tracking-wider">Custom Amount</label>
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-white/40">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent text-white font-bold outline-none w-full font-mono" value={customTopUp} onChange={(e) => setCustomTopUp(e.target.value)} min="0" step="0.01" />
                </div>
                <button onClick={() => handleTopUp(parseFloat(customTopUp))} className="px-5 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #53c58b, #3da874)' }}>
                  Add
                </button>
              </div>
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 mt-3 rounded-xl text-white/40 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Send Modal (P2P Transfer) */}
      {activeModal === 'send' && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveModal(null)}></div>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6" style={{ background: '#141428', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Send Money</h3>
            <p className="text-white/40 text-sm mb-5">Split bills or send to friends</p>
            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Recipient Email</label>
                <input type="text" placeholder="student@tamcc.edu.gd" className="w-full bg-transparent text-white p-3.5 rounded-xl outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Amount</label>
                <div className="flex items-center gap-2 p-3.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-white/40">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent text-white font-bold outline-none w-full font-mono" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} min="0" step="0.01" />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs uppercase tracking-wider block mb-2">Note (optional)</label>
                <input type="text" placeholder="For lunch" className="w-full bg-transparent text-white p-3.5 rounded-xl outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} value={sendNote} onChange={(e) => setSendNote(e.target.value)} />
              </div>
            </div>
            <button onClick={handleSend} disabled={transferLoading} className="w-full py-4 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
              {transferLoading ? 'Sending...' : 'Send Now'}
            </button>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 mt-3 rounded-xl text-white/40 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* History Modal (Full Transaction List) */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveModal(null)}></div>
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-6" style={{ background: '#141428', borderTop: '1px solid rgba(255,255,255,0.08)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Transaction History</h3>
            <p className="text-white/40 text-sm mb-5">All your recent activity</p>
            <div className="flex flex-col gap-3">
              {transactions.map(tx => {
                const isCredit = tx.type === 'credit';
                const timeStr = formatDate(tx.date) + (formatTime(tx.date) ? `, ${formatTime(tx.date)}` : '');
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-lg">{tx.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm">{tx.description}</p>
                      <p className="text-white/35 text-[11px]">{timeStr}</p>
                    </div>
                    <span className={`text-sm font-semibold font-mono ${isCredit ? 'text-[#53c58b]' : 'text-white/70'}`}>
                      {isCredit ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 mt-3 rounded-xl text-white/40 text-sm">
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(12px); }
        }
        .quick-action {
          transition: all 0.2s ease;
        }
        .quick-action:active {
          transform: scale(0.95);
        }
        .spending-bar {
          transition: width 0.8s ease;
        }
        .nfc-wave {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}