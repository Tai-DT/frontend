"use client"; // Make sure this is at the very top

import React from 'react';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Category } from '@/types/products';
import Image from 'next/image'; // Import next/image directly
import { Package2, Menu } from 'lucide-react';
import { CategorySidebar } from './CategorySidebar';
import { usePathname } from 'next/navigation';
import { getStrapiImageUrl } from '@/lib/imageUrl'; // Import your utility function

interface MobileCategoryNavProps {
    categories: Category[];
}

export function MobileCategoryNav({
    categories,
}: MobileCategoryNavProps) {

  const pathname = usePathname();
  return (
      <div className="flex items-center gap-2 overflow-x-auto py-2 px-4 -mx-4 mb-4">
          <Sheet>
              <SheetTrigger asChild>
                  <button
                      title="Open categories"
                      className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent"
                  >
                      <Menu className="w-5 h-5" />
                  </button>
              </SheetTrigger>
              <SheetContent side="left">
                  <SheetHeader>
                      <SheetTitle>Danh Mục Sản Phẩm</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                      <CategorySidebar
                          categories={categories}
                           className="border-none shadow-none"
                      />
                  </div>
              </SheetContent>
          </Sheet>

            <Link
                href="/products"
                className={`flex items-center justify-center min-w-10 h-10 rounded-lg ${
                pathname === '/products' ? 'bg-primary text-primary-foreground' : 'bg-accent'
                }`}
            >
                <Package2 className="w-5 h-5" />
            </Link>

          {categories.map((category) => (
              <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={`flex items-center justify-center min-w-10 h-10 rounded-lg ${
                    pathname === `/categories/${category.slug}` ? 'bg-primary text-primary-foreground' : 'bg-accent'
                  }`}
              >
                  {category.icon && (
                      <div className="relative w-5 h-5">
                          <Image // Use next/image directly now
                              src={getStrapiImageUrl(category.icon.url) || "/placeholder-image.png"} // Use getStrapiImageUrl and a placeholder if needed
                              alt={category.name}
                              fill
                              className="object-contain"
                              sizes="100%" // Important for fill=true to work responsively in a flex container
                          />
                      </div>
                  )}
              </Link>
          ))}
      </div>
  );
}