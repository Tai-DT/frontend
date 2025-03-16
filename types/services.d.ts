// types/services.d.ts
export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  size: number;
  width: number;
  height: number;
}

export interface ImageFormats {
  large?: ImageFormat;
  small?: ImageFormat;
  medium?: ImageFormat;
  thumbnail?: ImageFormat;
}

export interface ImageData {
  id: number;
  name: string;
  url: string;
  width?: number;
  height?: number;
  alternativeText?: string;
  caption?: string;
  formats?: ImageFormats;
}

// For backward compatibility with any code using 'image' type
export type image = ImageData;

export interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  id_youtube_video?: string | null;
  price?: string;
  link?: string;
  image?: ImageData[];
}

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaRobots?: string;
  metaViewport?: string;
  structuredData?: Record<string, unknown>;
  shareImage?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  id_youtube_video?: string | null;
  image: ImageData[];
  details: ServiceDetail[];
  seo?: SeoData;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface ServiceApiResponse {
  data: Service[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}