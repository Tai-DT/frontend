import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Package2 } from 'lucide-react';
import { Service, ServiceDetail } from '@/types/services';
import { getStrapiImageUrl } from '@/lib/imageUrl';

interface ServiceCardProps {
    service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
    return (
        <Card className="group overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5">
            <CardHeader className="relative p-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/80 to-blue-700/80 opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"></div>
                {service.image?.[0] && (
                    <div className="relative aspect-video w-full overflow-hidden">
                        <Image
                            src={getStrapiImageUrl(service.image[0].url) || "/placeholder-service-card.png"}
                            alt={service.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                        <Package2 className="h-5 w-5 text-white/90" />
                        {service.name}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-5">
                <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                    {service.description}
                </CardDescription>
                {service.details.length > 0 && (
                    <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Bao gồm:</p>
                        <ul className="text-sm mt-2 space-y-1">
                            {service.details.slice(0, 3).map((detail: ServiceDetail) => (
                                <li key={detail.id} className="flex items-start">
                                    <span className="mr-2 h-5 w-5 text-primary flex-shrink-0">•</span>
                                    <span className="text-muted-foreground">{detail.name}</span>
                                </li>
                            ))}
                            {service.details.length > 3 && (
                                <li className="text-sm text-muted-foreground ml-7">
                                    +{service.details.length - 3} dịch vụ khác
                                </li>
                            )}
                        </ul>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center text-sm font-medium text-primary transition-all duration-300 hover:text-primary/80 group-hover:translate-x-1"
                >
                    Xem chi tiết
                    <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                </Link>
            </CardFooter>
        </Card>
    );
}