import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Youtube } from "lucide-react";
import Link from "next/link";

interface SocialLinksProps {
  facebookUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
}

export default function SocialLinks({
  facebookUrl = "https://facebook.com",
  youtubeUrl = "https://www.youtube.com/audiotailoc",
  tiktokUrl,
}: SocialLinksProps) {
  return (
    <Card className="shadow-lg border-yellow-200">
      <CardHeader className="bg-yellow-50">
        <CardTitle className="text-2xl text-yellow-800">Kết nối với chúng tôi</CardTitle>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={facebookUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
              <Facebook className="mr-2 h-5 w-5" />
              Facebook
            </Button>
          </Link>
          
          {tiktokUrl && (
            <Link href={tiktokUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                TikTok
              </Button>
            </Link>
          )}
          
          <Link href={youtubeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
              <Youtube className="mr-2 h-5 w-5" />
              YouTube
            </Button>
          </Link>
        </div>
        
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Theo dõi chúng tôi trên mạng xã hội để cập nhật những thông tin mới nhất về sản phẩm, khuyến mãi và sự kiện.</p>
        </div>
      </CardContent>
    </Card>
  );
}
