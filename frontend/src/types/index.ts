export interface User {
  id: number;
  name: string;
  email: string;
  role: 'staff' | 'student';
  wallet_balance: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url: string | null;
  is_available: boolean;
}

export interface Category {
  id: number;
  name: string;
  sort_order: number;
}

export interface CartItem {
  id: number;          // menu item id
  name: string;
  price: number;
  quantity: number;
  image_url: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  menu_item_id: number;
  quantity: number;
  price: number;
}