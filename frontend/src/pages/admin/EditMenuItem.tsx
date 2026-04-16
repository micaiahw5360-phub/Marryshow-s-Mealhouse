import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { adminService, itemsService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

// ✅ Added 'Lunch' to categories
const categories = ['Breakfast', 'Lunch', 'A La Carte', 'Combo', 'Beverage', 'Dessert'];

export function EditMenuItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    if (id) {
      itemsService.getItem(parseInt(id))
        .then(item => {
          if (item) {
            setFormData({
              name: item.name,
              category: item.category,
              price: typeof item.price === 'string' ? item.price : item.price.toString(),
              image: item.image || '',
              description: item.description || '',
            });
          } else {
            toast.error('Menu item not found');
            navigate('/admin/menu');
          }
        })
        .catch(err => {
          console.error('Load item error:', err);
          toast.error('Failed to load item');
          navigate('/admin/menu');
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.updateItem(parseInt(id!), {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        image: formData.image || undefined,
        description: formData.description,
      });
      toast.success('Menu item updated successfully!');
      navigate('/admin/menu');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update menu item');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="text-center py-20">Loading item...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button variant="ghost" onClick={() => navigate('/admin/menu')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
        <h2 className="text-2xl font-bold">Edit Menu Item</h2>
        <p className="text-gray-600 mt-1">Update the details of this menu item</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Item Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Breakfast Sandwich"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price ($) <span className="text-red-500">*</span></Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-4">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your menu item..."
                rows={4}
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="bg-[#074af2] hover:bg-[#0639c0]" disabled={loading}>
                {loading ? 'Updating...' : 'Update Menu Item'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/menu')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}