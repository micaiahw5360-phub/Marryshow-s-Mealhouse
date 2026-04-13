// ManageMenu.tsx – with persistent filters & stable layout
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Plus, Edit, Trash2, Settings, Search, ArrowUpDown, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { adminService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

const categories = ['All', 'Breakfast', 'A La Carte', 'Combo', 'Beverage', 'Dessert'];

export function ManageMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get filter/sort from URL or use defaults
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') || 'All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(() => 
    (searchParams.get('sort') as 'asc' | 'desc') || 'asc'
  );

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (categoryFilter !== 'All') params.set('category', categoryFilter);
    if (sortOrder !== 'asc') params.set('sort', sortOrder);
    setSearchParams(params, { replace: true });
  }, [searchTerm, categoryFilter, sortOrder, setSearchParams]);

  const loadItems = async () => {
    try {
      const data = await adminService.getAllItems();
      const itemsArray = Array.isArray(data) ? data : data?.items || [];
      const normalized = itemsArray.map(item => ({
        ...item,
        price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
      }));
      setItems(normalized);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await adminService.deleteItem(id);
        toast.success('Menu item deleted successfully');
        loadItems();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setSortOrder('asc');
  };

  // Filtering logic
  const filteredItems = items.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sorting logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.name.localeCompare(b.name);
    } else {
      return b.name.localeCompare(a.name);
    }
  });

  if (loading) return <div className="text-center py-20">Loading menu items...</div>;

  const hasActiveFilters = searchTerm !== '' || categoryFilter !== 'All' || sortOrder !== 'asc';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Menu</h2>
          <p className="text-gray-600 mt-1">Add, Edit or Remove Menu Items</p>
        </div>
        <Link to="/admin/menu/create">
          <Button className="bg-[#074af2] hover:bg-[#0639c0]">
            <Plus className="w-4 h-4 mr-2" />
            Add New Item
          </Button>
        </Link>
      </div>

      {/* Filters & Sorting Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Sort Menu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="gap-2"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort {sortOrder === 'asc' ? 'A → Z' : 'Z → A'}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="gap-2">
                <X className="w-4 h-4" />
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table - with stable layout */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Menu Items 
            {hasActiveFilters && ` (${sortedItems.length} of ${items.length})`}
            {!hasActiveFilters && ` (${items.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedItems.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No menu items match your filters. Try changing the search or category.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[130px]">Category</TableHead>
                    <TableHead className="w-[100px]">Price</TableHead>
                    <TableHead className="w-[100px]">Options</TableHead>
                    <TableHead className="w-[130px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow key={item.id} className="h-[72px]">
                      <TableCell className="font-medium align-middle">#{item.id}</TableCell>
                      <TableCell className="align-middle">
                        <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                          <img
                            src={item.image || '/placeholder.jpg'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = '/placeholder.jpg';
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="align-middle">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium align-middle whitespace-nowrap">
                        ${(item.price ?? 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="align-middle">
                        {item.options && item.options.length > 0 ? (
                          <span className="text-sm text-gray-600">
                            {item.options.length} option(s)
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </TableCell>
                      <TableCell className="align-middle">
                        <div className="flex items-center justify-end space-x-1">
                          <Link to={`/admin/menu/options/${item.id}`}>
                            <Button size="sm" variant="ghost" title="Manage Options">
                              <Settings className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link to={`/admin/menu/edit/${item.id}`}>
                            <Button size="sm" variant="ghost" title="Edit">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}