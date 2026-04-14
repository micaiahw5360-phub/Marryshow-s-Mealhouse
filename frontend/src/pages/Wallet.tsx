import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Wallet as WalletIcon, Plus, ArrowLeft, CreditCard, Send, PieChart as PieChartIcon, Download } from 'lucide-react';
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
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Transaction {
  id: string;
  date: string;
  type: 'credit' | 'debit' | 'wallet';
  amount: number;
  description: string;
  category?: string;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'No date';
  try {
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date.toLocaleDateString();
    const timestamp = Number(dateString);
    if (!isNaN(timestamp)) {
      date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date.toLocaleDateString();
    }
    return dateString;
  } catch {
    return dateString;
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

const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case 'credit': return 'bg-green-100 text-green-800';
    case 'debit': return 'bg-red-100 text-red-800';
    case 'wallet': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getAmountDisplay = (type: string, amount: number) => {
  switch (type) {
    case 'credit': return { sign: '+', color: 'text-green-600' };
    case 'debit': return { sign: '-', color: 'text-red-600' };
    case 'wallet': return { sign: '⟳', color: 'text-purple-600' };
    default: return { sign: '', color: 'text-gray-600' };
  }
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Wallet() {
  const { user, updateWalletBalance } = useAuth();
  const navigate = useNavigate();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingData, setSpendingData] = useState<{ name: string; value: number }[]>([]);
  const [summary, setSummary] = useState({ total_credits: 0, total_debits: 0 });
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit' | 'wallet'>('all');
  const [transferOpen, setTransferOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);

  const loadTransactions = async () => {
    try {
      const data = await walletService.getTransactions();
      const normalized = data.map((t: any) => {
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
        };
      });
      setTransactions(normalized);
      
      const categories: { [key: string]: number } = {};
      normalized.filter(t => t.type === 'debit').forEach(t => {
        const cat = t.category || 'other';
        categories[cat] = (categories[cat] || 0) + t.amount;
      });
      setSpendingData(Object.entries(categories).map(([name, value]) => ({ name, value })));
      
      const totalCredits = normalized.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
      const totalDebits = normalized.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
      setSummary({ total_credits: totalCredits, total_debits: totalDebits });
    } catch (error) {
      console.error(error);
      toast.error('Could not load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount < 5 || amount > 500) {
      toast.error('Amount must be between $5 and $500');
      return;
    }
    try {
      await walletService.topUp(amount);
      updateWalletBalance(amount);
      await loadTransactions();
      if (Notification.permission === 'granted') {
        new Notification('Wallet Top-Up Successful', { body: `$${amount.toFixed(2)} added.`, icon: '/favicon.ico' });
      }
      toast.success(`Added $${amount.toFixed(2)} to your wallet!`);
      setTopUpAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Top-up failed');
    }
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error('Amount must be at least $1');
      return;
    }
    if (!recipientEmail.trim()) {
      toast.error('Please enter recipient email');
      return;
    }
    if (recipientEmail === user?.email) {
      toast.error('You cannot send money to yourself');
      return;
    }
    setTransferLoading(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiBase}/wallet/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token')}` },
        body: JSON.stringify({ recipient_email: recipientEmail, amount, note: transferNote }),
      });
      const data = await response.json();
      if (response.ok) {
        updateWalletBalance(-amount);
        await loadTransactions();
        toast.success(`Sent $${amount.toFixed(2)} to ${recipientEmail}`);
        setTransferOpen(false);
        setRecipientEmail('');
        setTransferAmount('');
        setTransferNote('');
      } else {
        toast.error(data.error || 'Transfer failed');
      }
    } catch (error) {
      toast.error('Network error');
    } finally {
      setTransferLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t => filterType === 'all' ? true : t.type === filterType);
  const exportCSV = () => {
    const headers = ['Date', 'Description', 'Type', 'Amount'];
    const rows = filteredTransactions.map(t => [formatDate(t.date), t.description, t.type, t.type === 'credit' ? `+${t.amount}` : `-${t.amount}`]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeWalletBalance = typeof user?.walletBalance === 'number' ? user.walletBalance : parseFloat(user?.walletBalance || '0');
  if (!user) return <div className="min-h-[60vh] flex items-center justify-center">Please login to access your wallet.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
            <p className="text-gray-600">Manage your Marryshow's Mealhouse Wallet Balance and Transactions</p>
          </div>
          <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Send className="w-4 h-4 mr-2" /> Send Money
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Send Money to Another TAMCC User</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Recipient Email</Label><Input placeholder="student@tamcc.edu.gd" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
                <div><Label>Amount ($)</Label><Input type="number" step="1" min="1" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} /></div>
                <div><Label>Note (optional)</Label><Input placeholder="For lunch" value={transferNote} onChange={(e) => setTransferNote(e.target.value)} /></div>
                <Button onClick={handleTransfer} disabled={transferLoading} className="w-full">{transferLoading ? 'Sending...' : 'Send Money'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="relative overflow-hidden bg-gradient-to-br from-[#0f338f] to-[#1e3c72] text-white mb-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mt-16 -mr-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -mb-12 -ml-12"></div>
          <CardContent className="pt-8 pb-6 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div><p className="text-xs opacity-80">TAMCC Campus Card</p><p className="text-xl font-mono tracking-wider">•••• {user.id.toString().slice(-4)}</p></div>
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-4xl font-bold mb-2">${safeWalletBalance.toFixed(2)}</p>
            <p className="text-xs opacity-80">Valid Thru 12/28</p>
            <div className="mt-4 flex gap-2"><Badge className="bg-white/20">Student ID: {user.id}</Badge><Badge className="bg-white/20">Marryshow Card</Badge></div>
          </CardContent>
        </Card>

        {spendingData.length > 0 && (
          <Card className="mb-8">
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChartIcon className="w-5 h-5" /> Spending Breakdown</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={spendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{spendingData.map((_, i) => <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip formatter={(value) => `$${value}`} /></PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg"><p className="text-sm text-gray-600">Total Added</p><p className="text-xl font-bold text-green-600">${summary.total_credits.toFixed(2)}</p></div>
                <div className="p-3 bg-red-50 rounded-lg"><p className="text-sm text-gray-600">Total Spent</p><p className="text-xl font-bold text-red-600">${summary.total_debits.toFixed(2)}</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="topup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="topup">Top Up</TabsTrigger><TabsTrigger value="history">Transaction History</TabsTrigger></TabsList>

          <TabsContent value="topup">
            <Card>
              <CardHeader><CardTitle>Add Funds to Wallet</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Enter Amount</Label>
                  <div className="relative"><span className="absolute left-3 top-3 text-gray-500">$</span><Input id="amount" type="number" placeholder="0.00" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="pl-8" min="5" max="500" step="0.01" /></div>
                  <p className="text-sm text-gray-500">Minimum: $5 | Maximum: $500</p>
                </div>
                <div className="space-y-2"><Label>Quick amounts</Label><div className="grid grid-cols-4 gap-3">{ [10,25,50,100].map(amt => <Button key={amt} variant="outline" onClick={() => setTopUpAmount(amt.toString())} className="h-12">${amt}</Button>)}</div></div>
                <div className="border-t pt-6"><h4 className="font-medium mb-4">Payment Method</h4><div className="border rounded-lg p-4 flex items-center justify-between"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center"><CreditCard className="h-5 w-5 text-white" /></div><div><p className="font-medium">Credit/Debit Card</p><p className="text-sm text-gray-500">Visa, Mastercard, Amex</p></div></div><Badge>Default</Badge></div></div>
                <Button onClick={handleTopUp} className="w-full h-12" size="lg"><Plus className="w-4 h-4 mr-2" /> Add ${topUpAmount || '0.00'} to Wallet</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Transaction History</CardTitle><Button variant="outline" size="sm" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> Export CSV</Button></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('all')}>All</Button>
                  <Button variant={filterType === 'credit' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('credit')}>Credits</Button>
                  <Button variant={filterType === 'debit' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('debit')}>Debits</Button>
                  <Button variant={filterType === 'wallet' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('wallet')}>Transfers</Button>
                </div>
                {loading ? <div className="text-center py-12">Loading transactions...</div> : filteredTransactions.length === 0 ? <div className="text-center py-12"><WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" /><p className="text-gray-500">No Transactions Yet</p></div> :
                <Table>
                  <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Description</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>{filteredTransactions.map(t => { const { sign, color } = getAmountDisplay(t.type, t.amount); return <TableRow key={t.id}><TableCell>{formatDate(t.date)}</TableCell><TableCell>{t.description}</TableCell><TableCell><Badge className={getTypeBadgeStyles(t.type)}>{t.type === 'credit' ? 'Credit' : t.type === 'debit' ? 'Debit' : 'Wallet'}</Badge></TableCell><TableCell className={`text-right font-medium ${color}`}>{sign}${t.amount.toFixed(2)}</TableCell></TableRow>; })}</TableBody>
                </Table>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}