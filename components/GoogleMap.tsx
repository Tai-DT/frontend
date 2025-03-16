"use client";

import { useState, useEffect } from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface GoogleMapProps {
  mapLink: string;
}

export default function GoogleMap({ mapLink }: GoogleMapProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Extract the map source URL from the provided link
  const getMapSrc = () => {
    // If mapLink contains an embed code, extract just the src part
    if (mapLink.includes('!1m')) {
      return `https://www.google.com/maps/embed?pb=${mapLink}`;
    }
    // If it's already a full URL, use it directly
    if (mapLink.startsWith('https://')) {
      return mapLink;
    }
    // Default fallback map
    return "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.0748577328923!2d106.60536757652521!3d10.805578658652301!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752ba02bdfa1c9%3A0xf830421b41c1648b!2zQXVkaW8gVMOgaSBM4buZYw!5e0!3m2!1svi!2s!4v1737362430145!5m2!1svi!2s";
  };

  return (
    <>
      {!isLoaded ? (
        <Skeleton className="w-full h-[400px] bg-yellow-100" />
      ) : (
        <div className="relative w-full h-[400px]">
          <iframe
            src={getMapSrc()}
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            aria-label="Location map"
          />
        </div>
      )}
    </>
  );
}
