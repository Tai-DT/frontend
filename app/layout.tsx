import type { Metadata, Viewport } from "next";
import { Roboto, Open_Sans } from "next/font/google";
import "./globals.css";
import { fetchGlobalData } from "@/lib/api";
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { Toaster } from "@/components/ui/toaster";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import ChatWidget from "@/components/ChatWidget";

// Font configurations
const roboto = Roboto({
    variable: "--font-roboto",
    subsets: ["latin", "vietnamese"],
    weight: ["400", "700"],
    display: "swap",
});

const openSans = Open_Sans({
    variable: "--font-open-sans",
    subsets: ["latin", "vietnamese"],
    weight: ["400", "600"],
    display: "swap",
});

// Viewport configuration
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 2,
};

// Generate metadata
export async function generateMetadata(): Promise<Metadata> {
    const globalData = await fetchGlobalData();
    const { defaultSeo } = globalData;

    return {
        metadataBase: new URL('https://audiotailoc.com'),
        title: {
            default: defaultSeo.metaTitle || 'Audio Tài Lộc - Thiết bị âm thanh chất lượng cao',
            template: `%s | ${defaultSeo.metaTitle || 'Audio Tài Lộc'}`,
        },
        description: defaultSeo.metaDescription || 'Cung cấp thiết bị âm thanh chất lượng cao với giá cả hợp lý',
        keywords: defaultSeo.keywords,
        openGraph: {
            type: 'website',
            siteName: defaultSeo.metaTitle || 'Audio Tài Lộc',
            title: defaultSeo.metaTitle || 'Audio Tài Lộc - Thiết bị âm thanh chất lượng cao',
            description: defaultSeo.metaDescription || 'Cung cấp thiết bị âm thanh chất lượng cao với giá cả hợp lý',
            images: [
                {
                    url: defaultSeo.metaImage?.url || '',
                    width: defaultSeo.metaImage?.width,
                    height: defaultSeo.metaImage?.height,
                    alt: defaultSeo.metaImage?.alternativeText ?? undefined,
                },
            ],
            locale: 'vi_VN',
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
                'max-video-preview': -1,
            },
        },
        alternates: {
            canonical: defaultSeo.canonicalURL,
        },
    };
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const globalData = await fetchGlobalData();

    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${roboto.variable} ${openSans.variable} antialiased flex flex-col min-h-screen bg-gradient bg-audio-waves`}>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Store",
                            "name": globalData.defaultSeo.metaTitle,
                            "description": globalData.defaultSeo.metaDescription,
                            "url": globalData.defaultSeo.canonicalURL,
                            "image": globalData.defaultSeo.metaImage,
                        }),
                    }}
                />
                <Navbar data={globalData.navbar} />
                <main className="flex-1 flex-grow pt-[calc(var(--navbar-height))]">
                    {children}
                    <Analytics />
                    <Toaster />
                </main>
                <Suspense fallback={<div>Loading...</div>}>
                    <ChatWidget />
                </Suspense>
                <Footer data={globalData.footer} />
                <SpeedInsights />
            </body>
        </html>
    );
}