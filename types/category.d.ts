// types/category.ts
export interface CategoryIcon {
    id: number;
    url: string;
    width: number;
    height: number;
  }
  
  export interface Product {
    id: number;
    name: string;
    price: string;
    slug: string;
    product_code: string;
    image?: {
      url: string;
    };
  }
  
  export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: CategoryIcon;
    products: Product[];
  }
  
  export interface ApiResponse<T> {
    data: T[];
    meta?: {
      pagination?: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }