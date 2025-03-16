// types/index.ts
export interface Image {
  id: number;
  name: string;
  url: string;
  width: number;
  height: number;
  mime: string;
  alternativeText?: string | null;
}

export interface LinkBase {
  id: number;
  URL: string;
  target: string | null | undefined;
  name: string;
  logo?: {
    id: number;
    company: string;
  };
}

export interface SocialMediaLink extends Omit<LinkBase, 'target'> {
  target: string | null;
}

export interface PolicyLink {
  id: number;
  name: string;
  link: LinkBase[];
}

export interface FooterData {
  id: number;
  description: string;
  copyright: string;
  designed_developed_by: string;
  built_with: string;
  social_media_links: SocialMediaLink[];
  policy_links: PolicyLink[];
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  metaRobots: string;
  metaViewport: string;
  structuredData: Record<string, unknown>;  
  canonicalURL: string;
  metaImage: Image;
}

export interface NavbarItem {
  id: number;
  URL: string;
  target?: string | null | undefined;
  name: string;
  child_items?: NavbarItem[];
}

export interface NavbarData {
  logo: {
    id: number;
    company: string;
    image: Image;
  };
  left_navbar_items: NavbarItem[];
  right_navbar_items: NavbarItem[];
  sub_navbar: {
    id: number;
    URL: string;
    name: string;
    image?: Image;
  }[];
}

export interface GlobalData {
  data: {
    id: number;
    footer: FooterData;
    defaultSeo: SeoData;
    navbar: NavbarData;
  };
}