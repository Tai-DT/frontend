'use client';

import { NavbarData } from '@/types/global';
import Image from 'next/image';
import { useMemo } from 'react';
import Link from 'next/link';
import { useSubNavbarHeight } from '@/hooks/useSubNavbarHeight';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SubNavbarProps {
    data: NavbarData;
}

export default function SubNavbar({ data }: SubNavbarProps) {
    const subNavbarRef = useSubNavbarHeight();
    // Only use the first 4 items from the sub navbar
    const subNavbarItems = useMemo(() => data.sub_navbar.slice(0, 4), [data.sub_navbar]);

    return (
        <div 
            ref={subNavbarRef} 
            className="w-full backdrop-blur-md py-2 bg-gradient-to-r from-red-50 via-white to-yellow-50 border-b border-red-100"
        >
            <div className="container mx-auto px-4">
                {/* Desktop View */}
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="hidden md:flex md:justify-center"
                >
                    <div className="grid grid-cols-4 gap-x-16 gap-y-8 max-w-6xl mx-auto">
                        {subNavbarItems.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center justify-center w-full px-4"
                            >
                                <Link
                                    href={item.URL}
                                    className="flex flex-col items-center space-y-2 w-full max-w-[150px] group"
                                >
                                    <div className="relative w-20 h-20 rounded-full overflow-hidden transition-all duration-500 
                                                    group-hover:shadow-[0_0_15px_rgba(234,88,12,0.5)] group-hover:scale-105">
                                        {/* Hover glow effect */}
                                        <div className="absolute inset-0">
                                            <div 
                                                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-500 
                                                           bg-gradient-to-r from-red-500 to-yellow-500"
                                            />
                                        </div>
                                        {/* Image */}
                                        <div 
                                            className="relative w-full h-full rounded-full overflow-hidden border-2 border-red-200 
                                                      group-hover:border-yellow-400 transition-all duration-500 
                                                      bg-gradient-to-r from-red-100 via-white to-yellow-100"
                                        >
                                            <Image
                                                src={item.image?.url || '/default-image.png'}
                                                alt={item.name || "default category"}
                                                width={80}
                                                height={80}
                                                className="rounded-full object-contain w-full h-full p-1"
                                                priority
                                            />
                                        </div>
                                    </div>
                                    <span 
                                        className={cn(
                                            "text-sm text-center font-medium transition-all duration-300",
                                            "bg-gradient-to-r from-red-700 to-yellow-700 bg-clip-text text-transparent group-hover:scale-105"
                                        )}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Mobile View */}
                <div className="md:hidden">
                    <div className="flex justify-center space-x-4 pb-2 overflow-x-auto">
                        {subNavbarItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0 flex items-center justify-center"
                            >
                                <Link
                                    href={item.URL}
                                    className="flex flex-col items-center space-y-1 group"
                                >
                                    <div className="relative w-14 h-14 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-105
                                                    group-hover:shadow-[0_0_10px_rgba(234,88,12,0.4)]">
                                        {/* Image */}
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-red-200 group-hover:border-yellow-400 
                                                       transition-all duration-300 bg-gradient-to-r from-red-100 via-white to-yellow-100">
                                            <Image
                                                src={item.image?.url || '/default-image.png'}
                                                alt={item.name || "default category"}
                                                width={48}
                                                height={48}
                                                className="rounded-full object-contain w-full h-full p-1"
                                            />
                                        </div>
                                    </div>
                                    <span 
                                        className="text-xs text-center font-medium bg-gradient-to-r from-red-700 to-yellow-700 bg-clip-text text-transparent"
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}