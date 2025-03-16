  // types/products.ts
  export interface Image {
    id: number;
    documentId?: string;
    name?: string;
    alternativeText?: string | null;
    caption?: string | null;
    width?: number;
    height?: number;
    formats?: {
      small?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path: string | null;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      medium?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path: string | null;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      thumbnail?: {
        ext: string;
        url: string;
        hash: string;
        mime: string;
        name: string;
        path: string | null;
        size: number;
        width: number;
        height: number;
        sizeInBytes: number;
      };
      large?: {
            ext: string;
              url: string;
              hash: string;
              mime: string;
              name: string;
              path: string | null;
              size: number;
              width: number;
              height: number;
              sizeInBytes: number;
          };
    };
    hash?: string;
    ext?: string;
    mime?: string;
    size?: number;
    url: string;
    previewUrl?: string | null;
    provider?: string;
    provider_metadata?: Record<string, unknown> | null;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
  }

  export interface ProductPerk {
      id: number;
      text: string;
      description: string;
  }

  export interface ProductDetail {
      id: number;
      name: string;
      description: string;
      image?: Image;
  }

 export interface ProductSEO {
  metaTitle?: string;
  metaDescription?: string;
  shareTitle?: string;
  shareDescription?: string;
  keywords?: string;
  canonical?: string;
}


  export interface Category {
    id: number;
    name: string;
    slug: string;
    icon?:Image;
    products: Product[]
  }

  export interface Product {
      category?: Category;
      id: number;
      product_code: string;
      name: string;
      price: string;
      description?: string | null;
      slug: string;
      createdAt?: string;
      updatedAt?: string;
      publishedAt?: string;
      featured?: boolean;
      new?: boolean;
      best_seller?: boolean;
      forever_special?: boolean;
      id_youtube_video?: string | null;
      image: Image[];
      perks?: ProductPerk[];
      details?: ProductDetail[];
      dynamic_zone?: Array<Record<string, unknown>>;
      seo?: ProductSEO | null;

  is_new?: boolean;
  is_bestseller?: boolean;
  }

  export interface ProductPagination {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
  }

  export interface ProductResponse {
      data: Product[];
      meta: {
          pagination: ProductPagination;
      };
  }

  export interface CategoryResponse {
      data: Category[];
      meta: {
          pagination: {
              page: number;
              pageSize: number;
              pageCount: number;
              total: number;
              products?: Product[];
          };
      };
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