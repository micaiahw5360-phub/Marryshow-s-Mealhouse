import { useQuery } from '@tanstack/react-query';
import { itemsService } from '../services/api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => itemsService.getCategories(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useItems = (category?: string) => {
  return useQuery({
    queryKey: ['items', category],
    queryFn: () => itemsService.getItems(category),
    staleTime: 5 * 60 * 1000,
  });
};

export const useItem = (id: number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => itemsService.getItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};