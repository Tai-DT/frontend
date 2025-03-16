// components/navbar/MobileNavItem.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from "lucide-react";
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface NavItem {
    id: number;
    name: string;
    URL: string;
    child_items?: NavItem[];
}

interface MobileNavItemProps {
    item: NavItem;
    onClose: () => void;
}

const MobileNavItem: React.FC<MobileNavItemProps> = ({ item, onClose }) => {
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);

    const handleToggleSubmenu = () => {
        setIsSubmenuOpen(!isSubmenuOpen);
    };

    return (
        <motion.div 
            className="border-b border-red-200 pb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {item.child_items?.length ? (
                <div>
                    <motion.div
                        onClick={handleToggleSubmenu}
                        className={cn(
                            "flex justify-between items-center cursor-pointer py-3 px-2 rounded-md",
                            "text-lg font-medium bg-gradient-to-r from-red-700 to-red-800 bg-clip-text text-transparent",
                            "hover:from-red-600 hover:to-yellow-600 transition-all duration-300",
                            isSubmenuOpen && "bg-red-50"
                        )}
                        whileTap={{ scale: 0.98 }}
                    >
                        {item.name}
                        <motion.div
                            animate={{ rotate: isSubmenuOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <ChevronDown className="h-5 w-5 text-red-500" />
                        </motion.div>
                    </motion.div>
                    <AnimatePresence>
                        {isSubmenuOpen && (
                            <motion.div 
                                className="ml-4 mt-2 space-y-2"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                {item.child_items.map((child) => (
                                    <motion.div
                                        key={child.id}
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Link
                                            href={child.URL}
                                            className={cn(
                                                "block py-2 text-base transition-all duration-300 rounded-md px-3",
                                                "bg-gradient-to-r hover:from-red-600 hover:to-yellow-600 hover:bg-clip-text hover:text-transparent",
                                                "border-l-2 border-red-200 hover:border-yellow-400",
                                                "text-gray-700"
                                            )}
                                            onClick={onClose}
                                        >
                                            {child.name}
                                        </Link>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                <motion.div whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link
                        href={item.URL}
                        className={cn(
                            "block py-3 text-lg font-medium transition-all duration-300 rounded-md px-2",
                            "bg-gradient-to-r from-red-700 to-red-800 bg-clip-text text-transparent",
                            "hover:from-red-600 hover:to-yellow-600"
                        )}
                        onClick={onClose}
                    >
                        {item.name}
                    </Link>
                </motion.div>
            )}
        </motion.div>
    );
};

export default MobileNavItem;