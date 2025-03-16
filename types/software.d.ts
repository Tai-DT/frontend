export interface ImageFormat {
  ext: string;
  url: string;
  hash: string;
  mime: string;
  name: string;
  path: string | null;
  size: number;
  width: number;
  height: number;
}

export interface ImageData {
  id: number;
  name: string;
  alternativeText?: string;
  url: string;
  formats?: {
    small?: ImageFormat;
    thumbnail?: ImageFormat;
    medium?: ImageFormat;
    large?: ImageFormat;
  };
}

export interface SoftwareDetail {
  id: number;
  name: string;
  description: string;
  id_youtube_video?: string;
  price?: string;
  image?: ImageData[];
}

export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaRobots?: string;
  structuredData?: Record<string, unknown>;
  shareImage?: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
}

export interface Software {
  id: number;
  name: string;
  slug: string;
  description: string;
  id_youtube_video?: string;
  image: ImageData[];
  details: SoftwareDetail[];
  seo?: SeoData;
  version?: string;
  requirementsMinimum?: string;
  requirementsRecommended?: string;
  downloadUrl?: string;
  demoUrl?: string;
}

export interface ServiceDetail {
  id: number
  name: string
  description: string
  price?: string
  image?: ImageData[]
  id_youtube_video?: string
}

export interface Service {
  id: number
  name: string
  slug: string
  description: string
  id_youtube_video?: string
  image: ImageData[]
  details: ServiceDetail[]
  seo?: {
    metaTitle?: string
    metaDescription?: string
    keywords?: string
    canonicalURL?: string
    metaRobots?: string
    metaViewport?: string
    structuredData?: Record<string, unknown>
  }
}
