'use client';
import React from 'react';
import Link from 'next/link';
import { Service } from '@/types/services';
import {ServiceCard} from './ServiceCard';

interface ServiceListProps {
  title: string;
  services: Service[];
}

export function ServiceList({ title, services }: ServiceListProps) {
  if (!services || services.length === 0) return null;

  return (
    <section>
      <h2 className="section-title text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/services" className="btn-secondary inline-block px-6 py-2 rounded-md">
          Xem tất cả dịch vụ
        </Link>
      </div>
    </section>
  );
}