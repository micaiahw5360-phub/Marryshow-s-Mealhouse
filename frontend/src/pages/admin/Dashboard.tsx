import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { RefreshCw, ShoppingBag, Users, UtensilsCrossed, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalUsers: 0,
    activeMenuItems: 0,
  });
  const [weeklySales, setWeeklySales] = useState<any[]>([]);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsData, salesData, popularData, ordersData] = await Promise.all([
        adminService.getStats(),
        adminService.getWeeklySales(),
        adminService.getPopularItems(),
        adminService.getRecentOrders(),
      ]);
      
      // Stats
      setStats({
        totalOrders: Number(statsData?.totalOrders) || 0,
        pendingOrders: Number(statsData?.pendingOrders) || 0,
        totalUsers: Number(statsData?.totalUsers) || 0,
        activeMenuItems: Number(statsData?.activeMenuItems) || 0,
      });
      
      // Weekly Sales – ensure numeric sales and default day format
      const processedSales = (salesData || []).map((item: any) => ({
        day: item.day || item.date || 'N/A',
        sales: typeof item.sales === 'number' ? item.sales : parseFloat(item.sales) || 0,
      }));
      setWeeklySales(processedSales);
      
      // Popular Items – ensure numeric orders
      const processedPopular = (popularData || []).map((item: any) => ({
        name: item.name || 'Unknown',
        orders: typeof item.orders === 'number' ? item.orders : parseInt(item.orders) || 0,
      }));
      setPopularItems(processedPopular);
      
      // Recent Orders
      const processedOrders = (ordersData || []).map((order: any) => ({
        ...order,
        total: typeof order.total === 'number' ? order.total : parseFloat(order.total) || 0,
        id: Number(order.id),
        date: order.order_date || order.created_at || order.date,
        customer: order.customer || order.customer_name || 'Guest',
      }));
      setRecentOrders(processedOrders);
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-20">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-sm text-green-600 mt-1">+12% from last week</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-[#074af2]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-500 mt-1">Requires Attention</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-[#f97316]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                <p className="text-sm text-green-600 mt-1">+5 new this week</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-[#10b981]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Menu Items</p>
                <p className="text-3xl font-bold mt-2">{stats.activeMenuItems}</p>
                <p className="text-sm text-gray-500 mt-1">Active Items</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Sales Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Sales</CardTitle>
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {weeklySales.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No sales data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value: any) => [`$${value}`, 'Sales']} />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#074af2" strokeWidth={2} dot={{ fill: '#074af2', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Popular Items Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Popular Items</CardTitle>
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {popularItems.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No popular items data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={popularItems} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} orders`, 'Orders']} />
                  <Legend />
                  <Bar dataKey="orders" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/admin/orders">
              <Button size="sm" variant="outline">View All Orders</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer || 'Guest'}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      ${order.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link to={`/admin/orders/${order.id}`}>
                        <Button size="sm" variant="ghost">View</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">No Recent Orders</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/admin/menu/create">
              <Button variant="outline" className="w-full justify-start">
                <UtensilsCrossed className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
            </Link>
            <Link to="/admin/orders">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingBag className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="w-4 h-4 mr-2" />
                View Site
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}