// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cấu hình images
  images: {
   remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/dib7tbv7w/**',
      },
    ],
    // Cấu hình kích thước hình ảnh (tùy chọn)
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Biến môi trường
  env: {
    NEXT_PUBLIC_CLOUDINARY_URL: process.env.NEXT_PUBLIC_CLOUDINARY_URL,
    NEXT_PUBLIC_STRAPI_API_URL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  },

  // Webpack và các cấu hình bổ sung
  webpack: (config) => {
    // Thêm cấu hình để xử lý font files
    config.module.rules.push({
      test: /\.(ttf|woff|woff2|eot)$/, // Bạn có thể thêm các định dạng font khác
      use: {
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/fonts/',
          outputPath: 'static/fonts/',
          name: '[name].[ext]',
        },
      },
    });

    return config;
  },
};

export default nextConfig;