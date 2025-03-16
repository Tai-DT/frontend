"use client"
import Image from 'next/image';
import { useState, useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance'; // Adjust the path as necessary

interface LogoData {
  id: number;
  documentId: string;
  company: string;
  image: {
    id: number;
    url: string;
    width: number;
    height: number;
    mime: string;
    formats: {
      small?: {
        url: string;
        width: number;
        height: number;
      };
      thumbnail?: {
        url: string;
        width: number;
        height: number;
      };
    } | null;
  };
}

interface StrapiResponse {
  data: LogoData[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface LogoDisplayProps {
  companyName: string;
  className?: string;
}

const LogoDisplay: React.FC<LogoDisplayProps> = ({ companyName, className }) => {
  const [logo, setLogo] = useState<LogoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get<StrapiResponse>(`/api/logos?filters[company][$eq]=${companyName}&populate=*`);
        const logoData = response.data.data.find(item => item.company === companyName) || null;
        setLogo(logoData);
      } catch (error) {
        console.error("Error fetching logo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyName]);

  if (loading) {
    return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />;
  }

  if (!logo?.image?.url) return null;

  // Use appropriate image format based on availability
  const imageToUse = logo.image.formats?.small || logo.image;
  const imageUrl = imageToUse.url;

  // For SVG images, use the original dimensions
  const isSvg = logo.image.mime === 'image/svg+xml';
  const width = isSvg ? logo.image.width : imageToUse.width;
  const height = isSvg ? logo.image.height : imageToUse.height;

  return (
    <Image
      src={imageUrl}
      alt={`${companyName} logo`}
      width={width}
      height={height}
      className={className}
      priority={true}
    />
  );
};

export default LogoDisplay;

