export interface  ImageFormat {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    size: number;
    width: number;
    height: number;
}

export interface image {
  id: number;
  name: string;
  url: string;
  formats?: {
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  };
}


export interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  id_youtube_video: string;
  price: string;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  id_youtube_video: string;
  image: image[];
  details: ServiceDetail[];
}
