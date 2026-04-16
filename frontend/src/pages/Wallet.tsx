import React, { useState, useEffect, useRef } from 'react';
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

  // Card animation refs
  const cardRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);
  const scanRef = useRef<HTMLDivElement>(null);
  const [cardStatus, setCardStatus] = useState('Ready to pay');

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

  // NFC Card Tap Animation (kept for compatibility, but card now uses different design)
  const handleCardTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const card = cardRef.current;
    const ripple = rippleRef.current;
    const scan = scanRef.current;
    if (!card || !ripple || !scan) return;

    // Add multiple simultaneous animations
    card.classList.add('tap-feedback', 'nfc-tap', 'card-glow');
    ripple.style.display = 'block';
    ripple.classList.add('nfc-ripple');
    scan.style.display = 'block';
    
    setCardStatus('📱 Tap detected! Processing...');
    
    // Remove after delay
    setTimeout(() => {
      card.classList.remove('tap-feedback', 'nfc-tap');
      card.classList.add('card-flip');
    }, 400);
    
    setTimeout(() => {
      card.classList.remove('card-flip', 'card-glow');
      ripple.style.display = 'none';
      ripple.classList.remove('nfc-ripple');
      scan.style.display = 'none';
      setCardStatus('Ready to pay');
    }, 1200);
    
    toast.info('💳 NFC Payment Ready - Hold card near terminal', { duration: 2000 });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* No header with bell/settings */}

        {/* Main Card - New Dark/Gold VISA Design */}
        <div
          ref={cardRef}
          className="card-main rounded-3xl p-6 relative overflow-hidden text-white mb-6 cursor-pointer transition-all duration-500 group"
          style={{
            aspectRatio: "1.7/1",
            perspective: "1000px",
            background: `
              radial-gradient(circle at 15% 20%, rgba(255,215,120,0.15), transparent 25%),
              radial-gradient(circle at 85% 80%, rgba(255,215,120,0.12), transparent 30%),
              linear-gradient(135deg, #050505 0%, #111111 40%, #000000 100%)
            `,
            boxShadow: "0 25px 60px rgba(0,0,0,0.65), 0 0 25px rgba(212,175,55,0.12)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onClick={handleCardTap}
        >
          {/* Gold flowing background */}
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="absolute -top-8 -left-10 w-[140%] h-20 rotate-[-8deg]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(212,175,55,0.95), rgba(255,224,130,0.7), transparent)",
                filter: "blur(10px)",
              }}
            />
            <div
              className="absolute bottom-8 -right-10 w-[150%] h-16 rotate-[6deg]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(212,175,55,0.75), rgba(255,215,100,0.45), transparent)",
                filter: "blur(12px)",
              }}
            />
          </div>

          {/* Decorative chains */}
          <div className="absolute top-5 right-0 text-yellow-500/60 text-xl tracking-widest rotate-6">
            ⛓ ⛓ ⛓
          </div>
          <div className="absolute bottom-5 left-0 text-yellow-500/50 text-lg -rotate-12">
            ⛓ ⛓ ⛓
          </div>

          {/* Card Content */}
          <div className="relative z-10 h-full flex flex-col justify-between">
            {/* Top Row */}
            <div className="flex justify-between items-start">
              <h2 className="text-3xl font-extrabold tracking-wide text-white">
                VISA
              </h2>
              <div className="text-3xl text-white/90">)))</div>
            </div>

            {/* Middle Section */}
            <div>
              {/* Chip */}
              <div
                className="w-14 h-10 rounded-lg mb-5"
                style={{
                  background:
                    "linear-gradient(135deg, #f9e27d 0%, #c89b2d 55%, #f5d76e 100%)",
                  boxShadow: "inset 0 0 6px rgba(0,0,0,0.25)",
                }}
              />

              {/* Numbers */}
              <p
                className="text-2xl md:text-3xl tracking-[0.25em] font-mono mb-3"
                style={{ color: "#d4af37" }}
              >
                {user?.card_number ? user.card_number.slice(-4).padStart(16, '*') : '**** **** **** 0000'}
              </p>

              {/* Name + Date */}
              <div className="flex justify-between items-end text-sm uppercase">
                <div>
                  <p className="text-white/50 text-[10px]">Card Holder</p>
                  <p className="tracking-[0.2em] text-yellow-400 font-semibold">
                    {user?.username?.toUpperCase() || 'MARRYSHOW CARD'}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-white/50 text-[10px]">Exp</p>
                  <p className="text-yellow-400 tracking-widest">12/28</p>
                </div>
              </div>
            </div>

            {/* Balance Display (optional – can be placed elsewhere) */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <p className="text-white/50 text-xs">Available Balance</p>
              <p className="text-2xl font-bold text-yellow-400">
                ${safeWalletBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Bottom Logo */}
            <div className="absolute bottom-4 right-5 text-right">
              <p className="text-5xl font-black text-white leading-none">VISA</p>
              <p className="text-xs text-white/60">Premium Black</p>
            </div>
          </div>

          {/* Shine Hover Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 pointer-events-none">
            <div
              className="absolute -left-1/2 top-0 h-full w-1/2 rotate-12"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)",
              }}
            />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <button onClick={() => setActiveModal('pay')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-gray-700 shadow-sm hover:bg-white/20 transition">
            <div className="w-11 h-11 rounded-xl bg-pink-900/30 flex items-center justify-center"><Utensils className="w-5 h-5 text-pink-400" /></div>
            <span className="text-gray-300 text-[11px] font-semibold">Pay</span>
          </button>
          <button onClick={() => setActiveModal('topup')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-gray-700 shadow-sm hover:bg-white/20 transition">
            <div className="w-11 h-11 rounded-xl bg-green-900/30 flex items-center justify-center"><PlusCircle className="w-5 h-5 text-green-400" /></div>
            <span className="text-gray-300 text-[11px] font-semibold">Top Up</span>
          </button>
          <button onClick={() => { setIsRequestMode(false); setActiveModal('sendreceive'); }} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-gray-700 shadow-sm hover:bg-white/20 transition">
            <div className="w-11 h-11 rounded-xl bg-blue-900/30 flex items-center justify-center"><ArrowRightLeft className="w-5 h-5 text-blue-400" /></div>
            <span className="text-gray-300 text-[11px] font-semibold">Send/Req</span>
          </button>
          <button onClick={() => setActiveModal('history')} className="quick-action flex flex-col items-center gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-gray-700 shadow-sm hover:bg-white/20 transition">
            <div className="w-11 h-11 rounded-xl bg-amber-900/30 flex items-center justify-center"><Receipt className="w-5 h-5 text-amber-400" /></div>
            <span className="text-gray-300 text-[11px] font-semibold">History</span>
          </button>
        </div>

        {/* Wallet / Requests Tabs */}
        <div className="flex gap-6 border-b border-gray-700 mb-4">
          <button onClick={() => setActiveView('wallet')} className={`pb-2 font-semibold text-sm ${activeView === 'wallet' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>Wallet</button>
          <button onClick={() => { setActiveView('requests'); loadPendingRequests(); }} className={`pb-2 font-semibold text-sm ${activeView === 'requests' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>
            Requests {pendingRequests.length > 0 && `(${pendingRequests.length})`}
          </button>
        </div>

        {activeView === 'wallet' ? (
          <>
            {/* Transactions Section */}
            <div className="mb-6">
              <div className="flex gap-6 border-b border-gray-700 mb-4">
                <button onClick={() => setCurrentTab('all')} className={`pb-2 text-sm font-semibold ${currentTab === 'all' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>All</button>
                <button onClick={() => setCurrentTab('dining')} className={`pb-2 text-sm font-semibold ${currentTab === 'dining' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>🍽️ Dining</button>
                <button onClick={() => setCurrentTab('transfers')} className={`pb-2 text-sm font-semibold ${currentTab === 'transfers' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-gray-400'}`}>📤 Transfers</button>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">Recent Activity</h3>
                <button onClick={() => setActiveModal('history')} className="text-xs font-semibold text-yellow-400 hover:text-yellow-300">See All →</button>
              </div>
              <div className="flex flex-col gap-2.5">
                {loading ? (
                  <div className="text-center py-8 text-gray-400">Loading transactions...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No transactions yet</div>
                ) : (
                  filteredTransactions.slice(0, 5).map((tx, i) => (
                    <div key={tx.id} className="tx-item bg-white/5 rounded-2xl p-3.5 border border-gray-800 flex items-center gap-3" style={{ animationDelay: `${i * 0.06}s` }}>
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg bg-gray-800">{tx.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{tx.description}</p>
                        <p className="text-gray-400 text-[11px] mt-0.5">{tx.timeStr}</p>
                      </div>
                      <span className={`text-sm font-bold font-mono ${tx.type === 'credit' ? 'text-green-400' : 'text-gray-300'}`}>
                        {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Contacts */}
            <div className="mb-8">
              <h3 className="text-white font-bold text-sm mb-4">Quick Send To</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickContacts.length === 0 ? (
                  <p className="col-span-2 text-gray-400 text-xs text-center py-4">Send or request money to add contacts here</p>
                ) : (
                  quickContacts.map((contact, idx) => (
                    <button key={idx} onClick={() => quickSendTo(contact)} className="rounded-2xl bg-white/5 border border-gray-800 p-3.5 hover:bg-white/10 transition text-left quick-action">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center text-lg mb-2">👤</div>
                      <p className="text-white font-semibold text-sm truncate">{contact.name}</p>
                      <p className="text-gray-400 text-xs mt-1">Quick send</p>
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
                <p className="text-center text-gray-400 py-8">No pending requests</p>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="bg-white/5 rounded-2xl p-4 border border-gray-800">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-white">{req.requester_name} requested</p>
                        <p className="text-2xl font-bold text-yellow-400">${parseFloat(req.amount).toFixed(2)}</p>
                        {req.note && <p className="text-sm text-gray-400 mt-1">Note: {req.note}</p>}
                        <p className="text-xs text-gray-500 mt-1">{new Date(req.created_at).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptRequest(req.id)} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition">Accept</button>
                        <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition">Reject</button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-3xl w-full max-w-md p-6 mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Quick Pay</h3>
            <p className="text-gray-400 text-sm mb-5">Tap to pay at participating restaurants</p>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Amount</label>
                <div className="flex items-center gap-2 p-4 rounded-xl bg-gray-800 border border-gray-700 mt-1">
                  <span className="text-gray-400 text-xl">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent text-white text-2xl font-bold outline-none w-full font-mono" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} min="0" step="0.01" />
                </div>
              </div>
              <button onClick={handleQuickPay} disabled={payLoading} className="w-full py-4 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 transition">
                {payLoading ? 'Processing...' : 'Pay Now'}
              </button>
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-gray-400 text-sm font-semibold hover:text-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Up Modal */}
      {activeModal === 'topup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-3xl w-full max-w-md p-6 mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Top Up Balance</h3>
            <p className="text-gray-400 text-sm mb-5">Add funds to your Marryshow Card</p>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[25, 50, 100, 250].map(amt => (
                  <button key={amt} onClick={() => handleTopUp(amt)} className="p-4 rounded-xl text-center border border-gray-700 bg-gray-800 hover:bg-gray-700 transition">
                    <span className="text-white font-bold text-lg">${amt}</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-gray-300 text-xs uppercase tracking-wider font-semibold">Custom Amount</label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1 flex items-center gap-2 p-3 rounded-xl bg-gray-800 border border-gray-700">
                    <span className="text-gray-400">$</span>
                    <input type="number" placeholder="0.00" className="bg-transparent text-white font-bold outline-none w-full font-mono" value={customTopUp} onChange={(e) => setCustomTopUp(e.target.value)} min="0" step="0.01" />
                  </div>
                  <button onClick={() => handleTopUp(parseFloat(customTopUp))} className="px-5 rounded-xl text-white font-semibold text-sm bg-green-600 hover:bg-green-500 transition">Add</button>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-gray-400 text-sm font-semibold hover:text-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Send/Request Modal */}
      {activeModal === 'sendreceive' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-3xl w-full max-w-md p-6 mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">Send or Request</h3>
            <p className="text-gray-400 text-sm mb-5">Send money or request from students</p>
            <div className="flex gap-2 mb-5">
              <button onClick={() => setIsRequestMode(false)} className={`flex-1 py-3 rounded-xl font-semibold text-sm ${!isRequestMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Send Money</button>
              <button onClick={() => setIsRequestMode(true)} className={`flex-1 py-3 rounded-xl font-semibold text-sm ${isRequestMode ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-300'}`}>Request Money</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-xs uppercase tracking-wider font-semibold block mb-1">Recipient</label>
                <input type="text" placeholder="Student name or ID" className="w-full bg-gray-800 text-white p-3.5 rounded-xl outline-none border border-gray-700 focus:border-yellow-500 transition" value={sendReceiveTo} onChange={(e) => setSendReceiveTo(e.target.value)} />
              </div>
              <div>
                <label className="text-gray-300 text-xs uppercase tracking-wider font-semibold block mb-1">Amount</label>
                <div className="flex items-center gap-2 p-3.5 rounded-xl bg-gray-800 border border-gray-700">
                  <span className="text-gray-400">$</span>
                  <input type="number" placeholder="0.00" className="bg-transparent text-white font-bold outline-none w-full font-mono" value={sendReceiveAmount} onChange={(e) => setSendReceiveAmount(e.target.value)} min="0" step="0.01" />
                </div>
              </div>
              <button onClick={isRequestMode ? handleRequest : handleSend} disabled={transferLoading} className="w-full py-4 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition">
                {transferLoading ? 'Processing...' : (isRequestMode ? 'Request Now' : 'Send Now')}
              </button>
              <button onClick={() => setActiveModal(null)} className="w-full py-3 rounded-xl text-gray-400 text-sm font-semibold hover:text-white transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal (Full Transaction List) */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setActiveModal(null)}>
          <div className="bg-gray-900 rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-5"></div>
            <h3 className="text-white font-bold text-lg mb-1">All Transactions</h3>
            <p className="text-gray-400 text-sm mb-5">Your complete activity history</p>
            <div className="space-y-3">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-800 last:border-0">
                  <span className="text-lg">{tx.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-semibold">{tx.description}</p>
                    <p className="text-gray-500 text-[11px]">{tx.timeStr}</p>
                  </div>
                  <span className={`text-sm font-bold font-mono ${tx.type === 'credit' ? 'text-green-400' : 'text-gray-300'}`}>
                    {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && <p className="text-center text-gray-400 py-8">No transactions found</p>}
            </div>
            <button onClick={() => setActiveModal(null)} className="w-full py-3 mt-4 rounded-xl text-gray-400 text-sm font-semibold hover:text-white transition">Close</button>
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
        .tx-item {
          animation: slideUp 0.3s ease forwards;
          opacity: 0;
        }
        @keyframes slideUp {
          to { opacity: 1; transform: translateY(0); }
          from { opacity: 0; transform: translateY(12px); }
        }
        /* NFC Card Animations (kept for compatibility) */
        .nfc-pulse-indicator {
          animation: nfcPulse 1.5s ease-in-out infinite;
        }
        @keyframes nfcPulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        .nfc-tap {
          animation: nfcTap 1.2s ease-out;
        }
        @keyframes nfcTap {
          0% { transform: scale(1) rotateZ(0deg); }
          25% { transform: scale(1.05) rotateZ(-1deg); }
          50% { transform: scale(0.98) rotateZ(1deg); }
          75% { transform: scale(1.02) rotateZ(-0.5deg); }
          100% { transform: scale(1) rotateZ(0deg); }
        }
        .card-flip {
          animation: cardFlip 0.7s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        @keyframes cardFlip {
          0% { transform: rotateY(0deg) rotateZ(-2deg) rotateX(0deg); }
          40% { transform: rotateY(45deg) rotateZ(1deg) rotateX(2deg); }
          60% { transform: rotateY(90deg) rotateZ(0deg) rotateX(-2deg); }
          80% { transform: rotateY(45deg) rotateZ(-1deg) rotateX(1deg); }
          100% { transform: rotateY(0deg) rotateZ(2deg) rotateX(0deg); }
        }
        .tap-feedback {
          animation: tapFeedback 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes tapFeedback {
          0% { transform: scale(1) translateY(0); }
          25% { transform: scale(0.97) translateY(-4px); }
          50% { transform: scale(0.95) translateY(-2px); }
          100% { transform: scale(1) translateY(0); }
        }
        .card-glow {
          box-shadow: 0 0 30px rgba(212,175,55,0.3), 0 20px 50px rgba(0,0,0,0.5) !important;
        }
        .nfc-ripple-effect {
          background-color: rgba(255, 215, 0, 0.15);
          border-radius: inherit;
          pointer-events: none;
        }
        .nfc-ripple-effect.nfc-ripple {
          animation: nfcRipple 0.8s ease-out forwards;
        }
        @keyframes nfcRipple {
          0% { transform: scale(1); opacity: 1; background-color: rgba(255,215,0,0.15); }
          100% { transform: scale(1.3); opacity: 0; background-color: rgba(255,215,0,0); }
        }
        .nfc-scan-effect {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }
        .nfc-scan-effect::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border: 3px solid rgba(212,175,55,0.6);
          border-radius: 50%;
          animation: nfcScan 1.8s ease-out forwards;
        }
        @keyframes nfcScan {
          0% { width: 60px; height: 60px; opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { width: 280px; height: 280px; opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}