export type SeoTitle = string | {
  default: string;
  template?: string;
  absolute?: string;
};

export interface SeoMetadata {
  title: SeoTitle;
  description?: string;
  keywords?: string;
  openGraph?: {
    type?: string;
    title?: string;
    description?: string;
    locale?: string;
    images?: Array<{
      url: string;
    }>;
  };
  robots?: {
    index: boolean;
    follow: boolean;
  };
  alternates?: {
    canonical?: string;
  };
}

export interface SeoProps {
  metadata: SeoMetadata;
}