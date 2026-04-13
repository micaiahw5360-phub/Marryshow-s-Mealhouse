import React, { useState, useEffect } from 'react';
import { Edit, UserX, UserCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { adminService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

export function ManageUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    role: 'customer',
    walletBalance: 0,
  });

  const loadUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      let usersArray = Array.isArray(data) ? data : data?.users || [];
      usersArray = usersArray.map((user: any) => ({
        ...user,
        walletBalance: typeof user.walletBalance === 'number' ? user.walletBalance : parseFloat(user.walletBalance) || 0,
        active: user.active === 1 || user.active === true,
      }));
      setUsers(usersArray);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await adminService.toggleUserActive(userId);
      toast.success(`User ${currentActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'customer',
      walletBalance: user.walletBalance,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await adminService.updateUser(editingUser.id, editForm);
      toast.success('User updated successfully');
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update user');
    }
  };

  // Updated stats to include staff and kiosk
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    kiosk: users.filter(u => u.role === 'kiosk').length,
    customers: users.filter(u => u.role === 'customer').length,
    active: users.filter(u => u.active).length,
  };

  if (loading) return <div className="text-center py-20">Loading Users...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <p className="text-gray-600 mt-1">View and Manage User Accounts</p>
      </div>

      {/* Stats – now includes 5 cards (total, admins, staff, kiosk, customers, active) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Total Users</p><p className="text-2xl font-bold mt-1">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Admins</p><p className="text-2xl font-bold mt-1 text-purple-600">{stats.admins}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Staff</p><p className="text-2xl font-bold mt-1 text-indigo-600">{stats.staff}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Kiosk</p><p className="text-2xl font-bold mt-1 text-cyan-600">{stats.kiosk}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Customers</p><p className="text-2xl font-bold mt-1 text-green-600">{stats.customers}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-gray-600">Active</p><p className="text-2xl font-bold mt-1 text-blue-600">{stats.active}</p></CardContent></Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader><CardTitle>All Users ({users.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">#{user.id}</TableCell>
                    <TableCell>{user.username || 'N/A'}</TableCell>
                    <TableCell className="text-sm text-gray-600">{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'staff' ? 'bg-indigo-100 text-indigo-800' :
                        user.role === 'kiosk' ? 'bg-cyan-100 text-cyan-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'customer'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">${user.walletBalance.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2">
                        <Button size="sm" variant="ghost" title="Edit" onClick={() => openEditDialog(user)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleActive(user.id, user.active)} title={user.active ? 'Deactivate' : 'Activate'}>
                          {user.active ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-gray-500">No Users Found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog – includes all four roles */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User: {editingUser?.username}</DialogTitle>
            <DialogDescription>
              Make changes to the user account here. Click save when done.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input value={editForm.username} onChange={(e) => setEditForm({...editForm, username: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
            </div>
            <div>
              <Label>Role</Label>
              <select className="w-full border rounded p-2" value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})}>
                <option value="customer">Customer</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
                <option value="kiosk">Kiosk</option>
              </select>
            </div>
            <div>
              <Label>Wallet Balance</Label>
              <Input type="number" step="0.01" value={editForm.walletBalance} onChange={(e) => setEditForm({...editForm, walletBalance: parseFloat(e.target.value) || 0})} />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}