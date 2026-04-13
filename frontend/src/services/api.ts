const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost/MarryShow-Mealhouse/backend/api';

// Optional: warn if running in production without a proper API_BASE
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn('⚠️ VITE_API_URL is not set. Using fallback: ' + API_BASE);
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('tamcc_token') || sessionStorage.getItem('tamcc_token');
  const headers: HeadersInit = {};
  
  // Only set Content-Type to JSON if body is NOT FormData
  if (!(options?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { headers, ...options });
  if (!response.ok) {
    let errorMsg = 'Request failed';
    try {
      const error = await response.json();
      errorMsg = error.error || errorMsg;
    } catch (e) {
      errorMsg = `${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

export const authService = {
  login: (email: string, password: string, remember: boolean = false) =>
    fetchAPI<{ user: any; token: string }>('/login', { method: 'POST', body: JSON.stringify({ email, password, remember }) }),
  register: (username: string, email: string, password: string) =>
    fetchAPI<{ user: any; token: string }>('/register', { method: 'POST', body: JSON.stringify({ username, email, password }) }),
  forgotPassword: (email: string) => fetchAPI<{ message: string }>('/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, email: string, password: string) =>
    fetchAPI<{ message: string }>('/reset-password', { method: 'POST', body: JSON.stringify({ token, email, password }) }),
};

export const itemsService = {
  getItems: (category?: string) => fetchAPI<any[]>(category ? `/items?category=${encodeURIComponent(category)}` : '/items'),
  getItem: (id: number) => fetchAPI<any>(`/items/${id}`),
  getCategories: () => fetchAPI<string[]>('/categories'),
};

export const ordersService = {
  createOrder: (data: { 
    items: any[]; 
    total: number; 
    paymentMethod: string; 
    pickupTime?: string;
    userId?: number;
  }) =>
    fetchAPI<{ orderId: number }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getOrders: () => fetchAPI<any[]>('/orders'),
  getOrder: (id: number) => fetchAPI<any>(`/orders/${id}`),
};

export const walletService = {
  getBalance: () => fetchAPI<{ balance: number }>('/wallet'),
  getTransactions: () => fetchAPI<any[]>('/wallet/transactions'),
  topUp: (amount: number) => fetchAPI<{ newBalance: number }>('/wallet/topup', { method: 'POST', body: JSON.stringify({ amount }) }),
};

export const favoritesService = {
  getFavorites: () => fetchAPI<{ menu_item_id: number }[]>('/favorites'),
  addFavorite: (menuItemId: number) => fetchAPI('/favorites', { method: 'POST', body: JSON.stringify({ menu_item_id: menuItemId }) }),
  removeFavorite: (menuItemId: number) => fetchAPI(`/favorites/${menuItemId}`, { method: 'DELETE' }),
};

export const notificationsService = {
  getNotifications: () => fetchAPI<any[]>('/notifications'),
  markAsRead: (id: number) => fetchAPI(`/notifications/${id}/read`, { method: 'POST' }),
  deleteNotification: (id: number) => fetchAPI(`/notifications/${id}`, { method: 'DELETE' }),
};

export const userService = {
  updateProfile: (data: { username?: string; email?: string; phone?: string; address?: string; student_id?: string }) =>
    fetchAPI('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (oldPassword: string, newPassword: string) =>
    fetchAPI('/profile/password', { method: 'PUT', body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) }),
  uploadAvatar: (formData: FormData) =>
    fetchAPI('/profile/avatar', { method: 'POST', body: formData }),
};

export const adminService = {
  getStats: () => fetchAPI<{ totalOrders: number; pendingOrders: number; totalUsers: number; activeMenuItems: number }>('/admin/stats'),
  getWeeklySales: () => fetchAPI<{ day: string; sales: number }[]>('/admin/sales-weekly'),
  getPopularItems: () => fetchAPI<{ name: string; orders: number }[]>('/admin/popular-items'),
  getRecentOrders: () => fetchAPI<any[]>('/admin/recent-orders'),
  getAllOrders: () => fetchAPI<any[]>('/admin/orders'),
  getOrderById: (orderId: number) => fetchAPI<any>(`/admin/orders/${orderId}`),
  updateOrderStatus: (orderId: string, status: string) => fetchAPI<{ message: string }>(`/admin/orders/${orderId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAllUsers: () => fetchAPI<any[]>('/admin/users'),
  toggleUserActive: (userId: string) => fetchAPI<{ message: string }>(`/admin/users/${userId}/toggle-active`, { method: 'PUT' }),
  updateUser: (userId: string, data: any) => fetchAPI<{ message: string }>(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAllItems: () => fetchAPI<any[]>('/admin/items'),
  createItem: (data: { name: string; category: string; price: number; image?: string; description?: string }) =>
    fetchAPI<{ id: number }>('/admin/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: number, data: { name?: string; category?: string; price?: number; image?: string; description?: string; is_available?: boolean }) =>
    fetchAPI<{ message: string }>(`/admin/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteItem: (id: number) => fetchAPI<{ message: string }>(`/admin/items/${id}`, { method: 'DELETE' }),
  getOptions: (itemId: number) => fetchAPI<any[]>(`/admin/items/${itemId}/options`),
  addOption: (itemId: number, data: { name: string; values: { name: string; priceModifier: number }[] }) =>
    fetchAPI<{ id: number }>(`/admin/items/${itemId}/options`, { method: 'POST', body: JSON.stringify(data) }),
  updateOption: (optionId: number, data: { name?: string; values?: { name: string; priceModifier: number }[] }) =>
    fetchAPI<{ message: string }>(`/admin/options/${optionId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteOption: (optionId: number) => fetchAPI<{ message: string }>(`/admin/options/${optionId}`, { method: 'DELETE' }),
};

export const staffService = {
  getOrders: () => fetchAPI<any[]>('/staff/orders'),
  getMetrics: () => fetchAPI<any>('/staff/metrics'),
  updateOrderStatus: (orderId: number, status: string) =>
    fetchAPI<{ message: string }>(`/staff/orders/${orderId}/status`, 
      { method: 'PUT', body: JSON.stringify({ status }) }),
};

export const kioskService = {
  getUserByEmail: (email: string) =>
    fetchAPI<{ id: number; email: string; username: string; name: string; wallet_balance: number }>(
      `/kiosk/user-by-email.php?email=${encodeURIComponent(email)}`
    ),
  getBalance: (email: string) =>
    fetchAPI<{ success: boolean; balance: number }>(`/kiosk/balance.php?email=${encodeURIComponent(email)}`),
};

const api = {
  auth: authService,
  items: itemsService,
  orders: ordersService,
  wallet: walletService,
  favorites: favoritesService,
  notifications: notificationsService,
  user: userService,
  admin: adminService,
  staff: staffService,
  kiosk: kioskService,
  post: (endpoint: string, data: any) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
};

export default api;