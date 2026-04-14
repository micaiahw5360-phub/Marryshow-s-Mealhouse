import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Wallet as WalletIcon, Plus, ArrowLeft, CreditCard, Send, Download, Utensils, PlusCircle, Receipt, Bell, ScanLine, TrendingUp, TrendingDown, Settings, ArrowRightLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
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
  timeStr?: string;
}

// Helper to map transaction description to emoji
const getEmojiForTransaction = (description: string, type: string): string => {
  const lower = description.toLowerCase();
  if (lower.includes('top up')) return '💳';
  if (lower.includes('restaurant') || lower.includes('pay')) return '🍽️';
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

// Interface for quick contacts
interface QuickContact {
  name: string;
  email?: string;
}

export function Wallet() {
  const { user, updateWalletBalance } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'dining' | 'transfers'>('all');
  const [quickContacts, setQuickContacts] = useState<QuickContact[]>([]);
  
  // New state for requests
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'wallet' | 'requests'>('wallet');

  // Modal states
  const [activeModal, setActiveModal] = useState<'pay' | 'topup' | 'sendreceive' | 'history' | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [customTopUp, setCustomTopUp] = useState('');
  const [sendReceiveTo, setSendReceiveTo] = useState('');
  const [sendReceiveAmount, setSendReceiveAmount] = useState('');
  const [isRequestMode, setIsRequestMode] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);

  // Load wallet data
  const loadData = async () => {
    try {
      const balanceData = await walletService.getBalance();
      setBalance(balanceData.balance);
      
      const txData = await walletService.getTransactions();
      const normalized = txData.map((t: any) => {
        const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount);
        const description = t.description || '';
        const apiType = t.type || 'debit';
        const type = detectTypeFromDescription(description, apiType);
        const date = t.date;
        const timeStr = formatDate(date) + (formatTime(date) ? `, ${formatTime(date)}` : '');
        return {
          id: t.id,
          date,
          type,
          amount: isNaN(amount) ? 0 : amount,
          description,
          category: t.category || 'other',
          emoji: getEmojiForTransaction(description, type),
          timeStr,
        };
      });
      setTransactions(normalized);
    } catch (error) {
      console.error(error);
      toast.error('Could not load wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Load pending requests from backend
  const loadPendingRequests = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/requests/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` }
      });
      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error('Failed to load requests', error);
    }
  };

  // Load quick contacts from localStorage
  const loadQuickContacts = () => {
    const stored = localStorage.getItem('marryshow_quick_contacts');
    if (stored) {
      try {
        setQuickContacts(JSON.parse(stored));
      } catch (e) {}
    }
  };

  const saveQuickContacts = (contacts: QuickContact[]) => {
    localStorage.setItem('marryshow_quick_contacts', JSON.stringify(contacts));
    setQuickContacts(contacts);
  };

  useEffect(() => {
    loadData();
    loadQuickContacts();
    loadPendingRequests();
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  // Helper to add a transaction locally after an action (to refresh UI)
  const addLocalTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev]);
  };

  // Top-up
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
      setCustomTopUp('');
    } catch (error: any) {
      toast.error(error.message || 'Top-up failed');
    }
  };

  // Send money (P2P transfer)
  const handleSend = async () => {
    const amount = parseFloat(sendReceiveAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Amount must be at least $1');
      return;
    }
    if (!sendReceiveTo.trim()) {
      toast.error('Please enter recipient name or email');
      return;
    }
    if (sendReceiveTo === user?.email || sendReceiveTo === user?.username) {
      toast.error('You cannot send money to yourself');
      return;
    }
    setTransferLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` },
        body: JSON.stringify({ recipient_email: sendReceiveTo, amount, note: '' }),
      });
      const data = await response.json();
      if (response.ok) {
        updateWalletBalance(-amount);
        await loadData();
        toast.success(`Sent $${amount.toFixed(2)} to ${sendReceiveTo}`);
        // Add to quick contacts
        const newContact = { name: sendReceiveTo, email: sendReceiveTo };
        if (!quickContacts.find(c => c.name.toLowerCase() === sendReceiveTo.toLowerCase())) {
          saveQuickContacts([...quickContacts, newContact]);
        }
        setActiveModal(null);
        setSendReceiveTo('');
        setSendReceiveAmount('');
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setTransferLoading(false);
    }
  };

  // Request money – real backend call
  const handleRequest = async () => {
    const amount = parseFloat(sendReceiveAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Amount must be at least $1');
      return;
    }
    if (!sendReceiveTo.trim()) {
      toast.error('Please enter recipient email');
      return;
    }
    setTransferLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` },
        body: JSON.stringify({ recipient_email: sendReceiveTo, amount, note: '' }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(`Request sent to ${sendReceiveTo}`);
        // Add to quick contacts
        if (!quickContacts.find(c => c.name.toLowerCase() === sendReceiveTo.toLowerCase())) {
          saveQuickContacts([...quickContacts, { name: sendReceiveTo, email: sendReceiveTo }]);
        }
        setActiveModal(null);
        setSendReceiveTo('');
        setSendReceiveAmount('');
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setTransferLoading(false);
    }
  };

  // Accept a pending request (transfers money)
  const handleAcceptRequest = async (requestId: number) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/requests/accept/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` }
      });
      if (response.ok) {
        toast.success('Request accepted, money transferred');
        await loadData();
        await loadPendingRequests();
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to accept');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  // Reject a pending request
  const handleRejectRequest = async (requestId: number) => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/requests/reject/${requestId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` }
      });
      if (response.ok) {
        toast.success('Request rejected');
        await loadPendingRequests();
      } else {
        toast.error('Failed to reject');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  // Quick Pay (restaurant payment)
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
    setPayLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` },
        body: JSON.stringify({ amount }),
      });
      const data = await response.json();
      if (response.ok) {
        updateWalletBalance(-amount);
        await loadData();
        toast.success(`Paid $${amount.toFixed(2)} successfully!`);
        setActiveModal(null);
        setPayAmount('');
      } else {
        toast.error(data.error || 'Payment failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setPayLoading(false);
    }
  };

  // Quick send to a contact
  const quickSendTo = (contact: QuickContact) => {
    setSendReceiveTo(contact.name);
    setIsRequestMode(false);
    setActiveModal('sendreceive');
  };

  // Filtered transactions for current tab
  const filteredTransactions = transactions.filter(tx => {
    if (currentTab === 'all') return true;
    if (currentTab === 'dining') return tx.category === 'dining' || tx.description.toLowerCase().includes('restaurant') || tx.description.toLowerCase().includes('payment');
    if (currentTab === 'transfers') return tx.category === 'transfer' || tx.description.toLowerCase().includes('sent') || tx.description.toLowerCase().includes('request');
    return true;
  });

  const safeWalletBalance = typeof balance === 'number' ? balance : parseFloat(balance || '0');

  if (!user) return <div className="min-h-[60vh] flex items-center justify-center">Please login to access your wallet.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 -mx-4 px-5 py-4 mb-6 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">M</span>
              </div>
              <div>
                <h1 className="text-gray-900 font-bold text-lg">Marryshow Card</h1>
                <p className="text-gray-500 text-xs">Welcome back, {user.username}!</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/notifications" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
              </Link>
              <Link to="/profile" className="cursor-pointer">
                <Settings className="w-5 h-5 text-gray-600" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="mb-6">
          <div className="card-main rounded-3xl p-6 relative overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%)', boxShadow: '0 20px 50px rgba(255, 107, 157, 0.3)' }}>
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 240">
              <circle cx="320" cy="60" r="120" fill="white" />
              <circle cx="360" cy="100" r="80" fill="white" />
            </svg>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/60 text-[10px] tracking-widest uppercase font-semibold">Available Balance</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-white/70 text-lg font-semibold">$</span>
                    <span className="text-white text-4xl font-bold font-mono">{safeWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="nfc-wave w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.7">
                    <path d="M6 18.5a6 6 0 0 1 0-13" />
                    <path d="M10 16a3.5 3.5 0 0 1 0-8" />
                    <circle cx="14" cy="12" r="1" />
                  </svg>
                  <span className="text-white text-sm font-bold tracking-wider font-mono">VISA</span>
                </div>
              </div>
              <div className="flex items-end justify-between mt-6">
                <div>
                  <div className="chip w-[42px] h-[32px] bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md relative overflow-hidden mb-3 shadow-md">
                    <div className="absolute inset-[3px] border border-black/10 rounded-sm"></div>
                    <div className="absolute left-1/2 top-[3px] bottom-[3px] w-[1.5px] bg-black/10"></div>
                  </div>
                  <p className="text-white/80 text-xs tracking-[0.25em] font-mono">•••• •••• •••• {user.id.toString().slice(-4)}</p>
                  <p className="text-white/70 text-[11px] mt-1.5 uppercase tracking-wider font-semibold">{user.username}</p>
                </div>
                <p className="text-white/60 text-[11px] font-mono">12/28</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button onClick={() => setActiveModal('pay')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center"><Utensils className="w-5 h-5 text-pink-600" /></div>
            <span className="text-gray-700 text-[11px] font-semibold">Pay</span>
          </button>
          <button onClick={() => setActiveModal('topup')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"><PlusCircle className="w-5 h-5 text-green-600" /></div>
            <span className="text-gray-700 text-[11px] font-semibold">Top Up</span>
          </button>
          <button onClick={() => { setIsRequestMode(false); setActiveModal('sendreceive'); }} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center"><ArrowRightLeft className="w-5 h-5 text-blue-600" /></div>
            <span className="text-gray-700 text-[11px] font-semibold">Send/Req</span>
          </button>
          <button onClick={() => setActiveModal('history')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center"><Receipt className="w-5 h-5 text-amber-600" /></div>
            <span className="text-gray-700 text-[11px] font-semibold">History</span>
          </button>
        </div>

        {/* Wallet / Requests Tabs */}
        <div className="flex gap-6 border-b-2 border-gray-200 mb-4">
          <button onClick={() => setActiveView('wallet')} className={`pb-2 font-semibold text-sm ${activeView === 'wallet' ? 'tab-active text-pink-600 border-b-3 border-pink-600' : 'text-gray-500'}`}>Wallet</button>
          <button onClick={() => { setActiveView('requests'); loadPendingRequests(); }} className={`pb-2 font-semibold text-sm ${activeView === 'requests' ? 'tab-active text-pink-600 border-b-3 border-pink-600' : 'text-gray-500'}`}>
            Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </button>
        </div>

        {activeView === 'wallet' ? (
          <>
            {/* Transactions Section */}
            <div className="mb-6">
              <div className="flex gap-6 border-b-2 border-gray-200 mb-4">
                <button onClick={() => setCurrentTab('all')} className={`pb-2 text-gray-700 font-semibold text-sm ${currentTab === 'all' ? 'tab-active text-pink-600 border-b-3 border-pink-600' : 'text-gray-500'}`}>All</button>
                <button onClick={() => setCurrentTab('dining')} className={`pb-2 text-gray-700 font-semibold text-sm ${currentTab === 'dining' ? 'tab-active text-pink-600 border-b-3 border-pink-600' : 'text-gray-500'}`}>🍽️ Dining</button>
                <button onClick={() => setCurrentTab('transfers')} className={`pb-2 text-gray-700 font-semibold text-sm ${currentTab === 'transfers' ? 'tab-active text-pink-600 border-b-3 border-pink-600' : 'text-gray-500'}`}>📤 Transfers</button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-900 font-bold text-sm">Recent Activity</h3>
                <button onClick={() => setActiveModal('history')} className="text-xs font-semibold text-pink-600 hover:text-pink-700">See All →</button>
              </div>
              <div className="flex flex-col gap-2.5">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No transactions yet</div>
                ) : (
                  filteredTransactions.slice(0, 5).map((tx, i) => (
                    <div key={tx.id} className="tx-item bg-white rounded-2xl p-3.5 border border-gray-200 flex items-center gap-3" style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-gray-100">{tx.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-semibold truncate">{tx.description}</p>
                        <p className="text-gray-500 text-[11px] mt-0.5">{tx.timeStr}</p>
                      </div>
                      <span className={`text-sm font-bold font-mono ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-700'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Your Cards Section (Placeholder) */}
            <div className="mb-6">
              <h3 className="text-gray-900 font-bold text-sm mb-4">Your Cards</h3>
              <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="card-main rounded-2xl p-4 flex-shrink-0" style={{ width: '200px', aspectRatio: '1.5/1', background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%)' }}>
                  <div className="text-white text-xs font-semibold opacity-70">Primary Card</div>
                  <div className="text-white font-bold mt-2 font-mono">•••• {user.id.toString().slice(-4)}</div>
                </div>
                <button className="flex-shrink-0 w-48 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-600 font-semibold hover:bg-gray-50">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="mb-8">
              <h3 className="text-gray-900 font-bold text-sm mb-4">Quick Send To</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickContacts.length === 0 ? (
                  <p className="col-span-2 text-gray-500 text-xs text-center py-4">Send or request money to add contacts here</p>
                ) : (
                  quickContacts.map((contact, idx) => (
                    <button key={idx} onClick={() => quickSendTo(contact)} className="rounded-2xl bg-white border border-gray-200 p-3.5 hover:shadow-md transition text-left quick-action">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-lg mb-2">👤</div>
                      <p className="text-gray-900 font-semibold text-sm truncate">{contact.name}</p>
                      <p className="text-gray-500 text-xs mt-1">Quick send</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          /* Pending Requests View */
          <div className="mb-8">
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pending requests</p>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="bg-white rounded-2xl p-4 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{req.requester_name} requested</p>
                        <p className="text-2xl font-bold text-gray-900">${parseFloat(req.amount).toFixed(2)}</p>
                        {req.note && <p className="text-sm text-gray-500 mt-1">Note: {req.note}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold">Accept</button>
                        <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold">Reject</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}

      {/* Pay Modal */}
      {activeModal === 'pay' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5"></div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">Quick Pay</h3>
            <p className="text-gray-600 text-sm mb-5">Tap to pay at participating restaurants</p>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">Amount</label>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-100 border border-gray-200 mt-1">
                  <span className="text-gray-400 text-xl">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent text-gray-900 text-2xl font-bold outline-none w-full font-mono" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} min="0" step="0.01" />
                </div>
              </div>
              <button onClick={handleQuickPay} disabled={payLoading} className="w-full py-4 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #ff6b9d, #c44569)' }}>
                {payLoading ? 'Processing...' : 'Pay Now'}
              </button>
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-gray-600 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5"></div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">Top Up Balance</h3>
            <p className="text-gray-600 text-sm mb-5">Add funds to your Marryshow Card</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[25, 50, 100, 250].map(amt => (
                  <button key={amt} onClick={() => handleTopUp(amt)} className="p-4 rounded-xl text-center border border-gray-200 bg-white hover:bg-gray-50">
                    <span className="text-gray-900 font-bold text-lg">${amt}</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-gray-700 text-xs uppercase tracking-wider font-semibold">Custom Amount</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-gray-100 border border-gray-200">
                    <span className="text-gray-400">$</span>
                    <input type="number" placeholder="0.00" className="bg-transparent text-gray-900 font-bold outline-none w-full font-mono" value={customTopUp} onChange={(e) => setCustomTopUp(e.target.value)} min="0" step="0.01" />
                  </div>
                  <button onClick={() => handleTopUp(parseFloat(customTopUp))} className="px-5 rounded-xl text-white font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>Add</button>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-gray-600 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Send/Request Modal */}
      {activeModal === 'sendreceive' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5"></div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">Send or Request</h3>
            <p className="text-gray-600 text-sm mb-5">Send money or request from students</p>
            <div className="flex gap-2 mb-5">
              <button onClick={() => setIsRequestMode(false)} className={`flex-1 py-3 rounded-xl font-semibold text-sm ${!isRequestMode ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Send Money</button>
              <button onClick={() => setIsRequestMode(true)} className={`flex-1 py-3 rounded-xl font-semibold text-sm ${isRequestMode ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Request Money</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-700 text-xs uppercase tracking-wider font-semibold block mb-1">Recipient</label>
                <input type="text" placeholder="Student name or ID" className="w-full bg-gray-100 text-gray-900 p-3.5 rounded-xl outline-none border border-gray-200" value={sendReceiveTo} onChange={(e) => setSendReceiveTo(e.target.value)} />
              </div>
              <div>
                <label className="text-gray-700 text-xs uppercase tracking-wider font-semibold block mb-1">Amount</label>
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-gray-100 border border-gray-200">
                  <span className="text-gray-400">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent text-gray-900 font-bold outline-none w-full font-mono" value={sendReceiveAmount} onChange={(e) => setSendReceiveAmount(e.target.value)} min="0" step="0.01" />
                </div>
              </div>
              <button onClick={isRequestMode ? handleRequest : handleSend} disabled={transferLoading} className="w-full py-4 rounded-xl text-white font-semibold text-sm" style={{ background: isRequestMode ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                {transferLoading ? 'Processing...' : (isRequestMode ? 'Request Now' : 'Send Now')}
              </button>
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-gray-600 text-sm font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal (Full Transaction List) */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setActiveModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mb-5"></div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">All Transactions</h3>
            <p className="text-gray-600 text-sm mb-5">Your complete activity history</p>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-200 last:border-0">
                  <span className="text-lg">{tx.emoji}</span>
                  <div className="flex-1">
                    <p className="text-gray-900 text-sm font-semibold">{tx.description}</p>
                    <p className="text-gray-500 text-[11px]">{tx.timeStr}</p>
                  </div>
                  <span className={`text-sm font-bold font-mono ${tx.type === 'credit' ? 'text-green-600' : 'text-gray-700'}`}>
                    {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-gray-500 py-8">No transactions found</p>}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 mt-4 rounded-xl text-gray-600 text-sm font-semibold">Close</button>
          </div>
        </div>
      )}

      <style>{`
        .quick-action {
          transition: all 0.2s ease;
        }
        .quick-action:active {
          transform: scale(0.95);
        }
        .quick-action:hover {
          transform: translateY(-4px);
        }
        .tab-active {
          color: #ff6b9d;
          border-bottom: 3px solid #ff6b9d;
        }
        .tx-item {
          animation: slideUp 0.3s ease forwards;
          opacity: 0;
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(12px); }
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