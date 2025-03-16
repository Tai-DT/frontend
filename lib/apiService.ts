// lib/apiService.ts
import axiosInstance from '@/lib/axiosInstance';

interface ImageFormat {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    size: number;
    width: number;
    height: number;
}

interface image {
  id: number;
  name: string;
  url: string;
  formats?: {
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  };
}


interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  id_youtube_video: string;
  price: string;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  description: string;
  id_youtube_video: string;
  image: image[];
  details: ServiceDetail[];
}


export async function getServices(): Promise<Service[]> {
    try {
        const response = await axiosInstance.get<{ data: Service[] }>('/api/services?populate=*', {
            
            });
        return response.data.data
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}