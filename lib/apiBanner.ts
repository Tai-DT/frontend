import axiosInstance from '@/lib/axiosInstance';

export async function getBanners() {
  try {
    const response = await axiosInstance.get('/api/banners', {
      params: {
        populate: '*'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
}