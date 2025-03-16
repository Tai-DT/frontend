'use client';

import { useState } from 'react';
import { Facebook, Twitter, Linkedin, Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
  className?: string;
}

export function ShareButtons({ url, title, className = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  
  // Ensure we have the absolute URL
  const fullUrl = url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}${url}`;
  
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  
  // Share URLs for different platforms
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  
  const handleShare = (platform: string, shareUrl: string) => {
    window.open(shareUrl, `share-${platform}`, 'width=600,height=400');
  };
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Đã sao chép liên kết!');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Không thể sao chép liên kết');
      console.error('Failed to copy:', error);
    }
  };
  
  // Use Web Share API if available
  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title,
          url: fullUrl
        });
        toast.success('Đã chia sẻ thành công!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Không thể chia sẻ');
          console.error('Error sharing:', error);
        }
      }
    }
  };
  
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-500 mr-1">Chia sẻ:</span>
      
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <Button 
          size="sm" 
          variant="outline" 
          className="rounded-full p-2 h-auto w-auto text-gray-800" 
          onClick={handleNativeShare}
          title="Chia sẻ"
          aria-label="Chia sẻ sản phẩm"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
      
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full p-2 h-auto w-auto" 
        onClick={() => handleShare('facebook', facebookShareUrl)}
        title="Chia sẻ trên Facebook"
        aria-label="Chia sẻ trên Facebook"
      >
        <Facebook className="h-4 w-4 text-blue-600" />
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full p-2 h-auto w-auto" 
        onClick={() => handleShare('twitter', twitterShareUrl)}
        title="Chia sẻ trên Twitter"
        aria-label="Chia sẻ trên Twitter"
      >
        <Twitter className="h-4 w-4 text-sky-500" />
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full p-2 h-auto w-auto" 
        onClick={() => handleShare('linkedin', linkedinShareUrl)}
        title="Chia sẻ trên LinkedIn"
        aria-label="Chia sẻ trên LinkedIn"
      >
        <Linkedin className="h-4 w-4 text-blue-800" />
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full p-2 h-auto w-auto text-gray-800" 
        onClick={copyToClipboard}
        title="Sao chép liên kết"
        aria-label="Sao chép liên kết"
      >
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
