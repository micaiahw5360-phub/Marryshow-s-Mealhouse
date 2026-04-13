import React, { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { adminService } from '../../services/api';
import { toast } from '../../utils/toastWithSound';

const categories = ['Breakfast', 'A La Carte', 'Combo', 'Beverage', 'Dessert'];

export function AddMenuItem() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    image: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await adminService.createItem({
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        image: formData.image || undefined,
        description: formData.description,
      });
      toast.success('Menu item added successfully!');
      navigate('/admin/menu');
    } catch (error) {
      toast.error('Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button variant="ghost" onClick={() => navigate('/admin/menu')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Menu
        </Button>
        <h2 className="text-2xl font-bold">Add New Menu Item</h2>
        <p className="text-gray-600 mt-1">Create a New Item For Your Menu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Breakfast Sandwich"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
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
              <Label htmlFor="price">
                Price ($) <span className="text-red-500">*</span>
              </Label>
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
              <p className="text-xs text-gray-500 mt-1">
                Enter a URL for the item image (optional)
              </p>
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
                {loading ? 'Adding...' : 'Add Menu Item'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/admin/menu')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}