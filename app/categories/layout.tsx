"use client";
import React from 'react';
import { MobileCategoryNav } from "@/components/MobileCategoryNav";
import { categoryService } from '@/lib/apiCategory';
import { Category } from '@/types/products';

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = React.useState<Category[]>([]);

  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };
    loadCategories();
  }, []);

  return (
    <section>
      <MobileCategoryNav categories={categories} />
      {children}
    </section>
  );
}