// services/apiCategory.ts
import axiosInstance from '@/lib/axiosInstance';
import { Category, ApiResponse } from '@/types/products';

export const categoryService = {
  async getAll(params?: Record<string, unknown>): Promise<Category[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Category>>('/api/categories', {
        params: {
          'populate[0]': 'icon',
          'populate[1]': 'products',
          'populate[2]': 'products.image',
          sort: 'name:asc',
          ...params,
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },
};