import axiosInstance from '@/lib/axiosInstance'
import { Product, ApiResponse } from '@/types/products'

interface ProductFilters {
  [key: string]: string | number | boolean | undefined;
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const response = await axiosInstance.get<ApiResponse<Product>>('/api/products', {
      params: {
        ...filters,
        'populate[0]': 'image',
        'populate[1]': 'category',
        'populate[2]': 'perks',
        'populate[3]': 'details',
        'populate[4]': 'seo',
      },
    })
    return response.data.data
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export async function getNewProducts(): Promise<Product[]> {
  return getProducts({
    'filters[new][$eq]': true,
    'pagination[limit]': 8,
  })
}

export async function getBestSellerProducts(): Promise<Product[]> {
  return getProducts({
    'filters[best_seller][$eq]': true,
    'pagination[limit]': 8,
  })
}

export async function getForeverSpecialProducts(): Promise<Product[]> {
  return getProducts({
    'filters[forever_special][$eq]': true,
    'pagination[limit]': 8,
  })
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({
    'filters[featured][$eq]': true,
    'pagination[limit]': 8,
  })
}