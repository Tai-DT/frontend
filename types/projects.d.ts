export type ImageFormat = {
    small: { url: string };
    thumbnail: { url: string };
  };
  
  export type ImageData = {
    id: number;
    name: string;
    alternativeText: string | null;
    url: string;
    formats?: ImageFormat;
  };
  
  export type Detail = {
    id: number;
    name: string;
    description: string;
    image?: {
      url: string;
      formats?: ImageFormat;
    };
  };
  
  export type Perk = {
    text: string;
    description: string;
  };
  
  export type SeoData = {
    metaTitle?: string;
    metaDescription?: string;
    shareTitle?: string;
    shareDescription?: string;
    keywords?: string;
    canonical?: string;
    metaRobots?: string;
    structuredData?: Record<string, unknown>;
    shareImage?: {
      url: string;
      alternativeText?: string;
      width?: number;
      height?: number;
    };
  };
  
  export type ProjectData = {
    id: number;
    name: string;
    slug: string;
    description: string;
    id_youtube_video?: string;
    price?: number;
    image?: ImageData[];
    perks?: Perk;
    details?: Detail[];
    seo?: SeoData | null;
    publishedAt?: string;
    updatedAt?: string;
  };
