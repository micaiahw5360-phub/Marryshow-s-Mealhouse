import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Wallet as WalletIcon, Plus, ArrowLeft, CreditCard, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
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
}

// Format date safely
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

// Supercharged detection – add more keywords as needed
const detectTypeFromDescription = (description: string, apiType: string): 'credit' | 'debit' | 'wallet' => {
  const desc = description.toLowerCase();
  
  // CREDIT keywords (money added to wallet)
  const creditKeywords = [
    'top up', 'add funds', 'deposit', 'wallet top-up', 'credit', 'refund',
    'cashback', 'bonus', 'adjustment +', 'recharge', 'funding', 'added'
  ];
  for (const kw of creditKeywords) {
    if (desc.includes(kw)) {
      console.log(`✅ Detected CREDIT from keyword: "${kw}" in description: "${description}"`);
      return 'credit';
    }
  }
  
  // DEBIT keywords (money spent from wallet)
  const debitKeywords = [
    'order', 'purchase', 'payment', 'deduction', 'withdraw', 'spent',
    'buy', 'checkout', 'item', 'meal', 'delivery', 'transaction', 'debit',
    'adjustment -', 'charged', 'paid'
  ];
  for (const kw of debitKeywords) {
    if (desc.includes(kw)) {
      console.log(`🔴 Detected DEBIT from keyword: "${kw}" in description: "${description}"`);
      return 'debit';
    }
  }
  
  // If no keyword match, fallback to API type (but warn)
  console.warn(`⚠️ No keyword match for description: "${description}". Using API type: ${apiType}`);
  if (apiType === 'wallet') return 'wallet';
  if (apiType === 'credit') return 'credit';
  if (apiType === 'debit') return 'debit';
  return 'debit'; // safe default
};

// Badge styles for each type
const getTypeBadgeStyles = (type: string) => {
  switch (type) {
    case 'credit': return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'debit': return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'wallet': return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Amount sign and color
const getAmountDisplay = (type: string, amount: number) => {
  switch (type) {
    case 'credit': return { sign: '+', color: 'text-green-600' };
    case 'debit': return { sign: '-', color: 'text-red-600' };
    case 'wallet': return { sign: '⟳', color: 'text-purple-600' };
    default: return { sign: '', color: 'text-gray-600' };
  }
};

export function Wallet() {
  const { user, updateWalletBalance } = useAuth();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTransactions = async () => {
    try {
      const data = await walletService.getTransactions();
      console.log('Raw transactions from API:', data); // DEBUG: see what backend returns
      
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
        };
      });
      setTransactions(normalized);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error('Could not load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amount < 5) {
      toast.error('Minimum top-up amount is $5');
      return;
    }
    if (amount > 500) {
      toast.error('Maximum top-up amount is $500');
      return;
    }

    try {
      await walletService.topUp(amount);
      updateWalletBalance(amount);
      await loadTransactions(); // reload to see new transaction
      
      const currentBalance = typeof user?.walletBalance === 'number' 
        ? user.walletBalance 
        : parseFloat(user?.walletBalance || '0');
      
      addNotification({
        type: 'system',
        title: 'Wallet Topped Up',
        message: `$${amount.toFixed(2)} has been added to your wallet. Your new balance is $${(currentBalance + amount).toFixed(2)}.`,
      });
      
      toast.success(`Added $${amount.toFixed(2)} to your wallet!`);
      setTopUpAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Top-up failed. Please try again.');
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  const totalCredits = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalWalletTransfers = transactions.filter(t => t.type === 'wallet').reduce((s, t) => s + t.amount, 0);

  const safeWalletBalance = typeof user?.walletBalance === 'number'
    ? user.walletBalance
    : parseFloat(user?.walletBalance || '0');

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">Please login to access your wallet.</p>
            <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
          <p className="text-gray-600">Manage your Marryshow's Mealhouse Wallet Balance and Transactions</p>
        </div>

        <Card className="mb-8 bg-gradient-to-br from-[#074af2] to-[#0639c0] text-white">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <WalletIcon className="w-6 h-6" />
                <span className="text-sm font-medium opacity-90">TAMCC Wallet Balance</span>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/20">Active</Badge>
            </div>
            <p className="text-5xl font-bold mb-6">${safeWalletBalance.toFixed(2)}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs opacity-90">Added</span>
                </div>
                <p className="text-xl font-bold">${totalCredits.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-xs opacity-90">Spent</span>
                </div>
                <p className="text-xl font-bold">${totalDebits.toFixed(2)}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs opacity-90">Transfers</span>
                </div>
                <p className="text-xl font-bold">${totalWalletTransfers.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="topup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="topup">Top Up</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="topup">
            <Card>
              <CardHeader><CardTitle>Add Funds to Wallet</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Enter Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      className="pl-8"
                      min="5"
                      max="500"
                      step="0.01"
                    />
                  </div>
                  <p className="text-sm text-gray-500">Minimum: $5 | Maximum: $500</p>
                </div>

                <div className="space-y-2">
                  <Label>Quick amounts</Label>
                  <div className="grid grid-cols-4 gap-3">
                    {quickAmounts.map((amount) => (
                      <Button key={amount} variant="outline" onClick={() => setTopUpAmount(amount.toString())} className="h-12">
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h4 className="font-medium mb-4">Payment Method</h4>
                  <div className="grid gap-3">
                    <div className="border rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Credit/Debit Card</p>
                          <p className="text-sm text-gray-500">Visa, Mastercard, Amex</p>
                        </div>
                      </div>
                      <Badge>Default</Badge>
                    </div>
                  </div>
                </div>

                <Button onClick={handleTopUp} className="w-full h-12" size="lg">
                  <Plus className="w-4 h-4 mr-2" /> Add ${topUpAmount || '0.00'} to Wallet
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">Loading transactions...</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No Transactions Yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => {
                        const { sign, color } = getAmountDisplay(transaction.type, transaction.amount);
                        return (
                          <TableRow key={transaction.id}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <Badge className={getTypeBadgeStyles(transaction.type)}>
                                {transaction.type === 'credit' ? 'Credit' : transaction.type === 'debit' ? 'Debit' : 'Wallet'}
                              </Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${color}`}>
                              {sign}${transaction.amount.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}