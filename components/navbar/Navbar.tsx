"use client";
import { NavbarData } from "@/types/global";
import SubNavbar from "./SubNavbar";
import { ListItem } from "./ListItem";
import * as React from "react";
import Link from "next/link";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { useNavbarHeight } from "@/hooks/useNavbarHeight";
import MobileNavItem, {NavItem} from "./MobileNavItem";
import { motion } from "framer-motion";

export default function Navbar({ data }: { data: NavbarData }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navbarRef = useNavbarHeight();
    const { totalItems } = useCart();

    // Track scroll position for navbar effects
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const mobileNavItems = useMemo<NavItem[]>(() =>
            [...data.left_navbar_items, ...data.right_navbar_items].map(item => ({
                ...item,
                name: item.name
            })),
        [data.left_navbar_items, data.right_navbar_items]
    );

    const customTriggerStyle = useMemo(() => cn(
        navigationMenuTriggerStyle(),
        "bg-transparent font-medium relative overflow-hidden",
        "text-red-700 hover:text-white",
        "group",
        "transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-600 before:to-yellow-500",
        "before:origin-left before:scale-x-0 hover:before:scale-x-100",
        "before:transition-transform before:duration-300 before:-z-10",
        "data-[state=open]:before:scale-x-100 data-[state=open]:text-white"
    ), []);

    const buttonStyle = useMemo(() => cn(
        "relative text-red-700 hover:text-white overflow-hidden",
        "transition-all duration-300",
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-red-600 before:to-yellow-500",
        "before:origin-bottom before:scale-y-0 hover:before:scale-y-100",
        "before:transition-transform before:duration-300 before:-z-10"
    ), []);

    const CartButton = () => {
        // Define a loading state if needed
        const [isLoaded, setIsLoaded] = useState(false);

        // Ensure proper loading
        useEffect(() => {
            setIsLoaded(true);
        }, []);

        return (
            <Link href="/cart" className="relative z-20" aria-label="View shopping cart">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: isLoaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="scale-[1.5] origin-center"
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            buttonStyle, 
                            "relative p-5 group hover:bg-transparent",
                            "transition-all duration-300 ease-in-out"
                        )}
                    >
                        <div className="relative">
                            <ShoppingCart className="h-16 w-16 group-hover:text-red-600 transition-colors" />
                            {totalItems > 0 && isLoaded && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-4 -right-4 flex items-center justify-center min-w-[20px] min-h-[20px] px-1 text-xs bg-red-600/80 animate-pulse rounded-full border border-white/50"
                                >
                                    {totalItems}
                                </Badge>
                            )}
                        </div>
                    </Button>
                </motion.div>
            </Link>
        );
    };

    return (
        <header
            ref={navbarRef}
            className={cn(
                "fixed top-0 left-0 w-full backdrop-blur-md z-50 transition-all duration-300",
                scrolled ? "bg-white/80 shadow-lg" : "bg-white/30"
            )}
        >
            <div className="container mx-auto px-4 lg:px-8 xl:px-16">
                <div className="flex items-center justify-between py-3 md:py-4 lg:py-5">
                    {/* Mobile Layout */}
                    <div className="md:hidden flex items-center justify-between w-full">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className={buttonStyle}
                                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                                    >
                                        {isMenuOpen ? (
                                            <X className="h-6 w-6" />
                                        ) : (
                                            <Menu className="h-6 w-6" />
                                        )}
                                    </Button>
                                </motion.div>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="w-[300px] bg-gradient-to-b from-white to-red-50 backdrop-blur-md border-r-red-200"
                            >
                                <DialogTitle>
                                    <VisuallyHidden>Mobile Navigation Menu</VisuallyHidden>
                                </DialogTitle>
                                <div className="mt-8 mb-4">
                                    <Link href="/" onClick={() => setIsMenuOpen(false)}>
                                        <Image 
                                            src="/audio-logo.svg"
                                            alt="Logo" 
                                            width={80} 
                                            height={80} 
                                            priority
                                            className="mx-auto h-16 w-auto object-contain animate-pulse"
                                        />
                                    </Link>
                                </div>
                                <div className="flex flex-col space-y-4 pt-4">
                                    {mobileNavItems.map((item) => (
                                        <MobileNavItem
                                            key={item.id}
                                            item={item}
                                            onClose={() => setIsMenuOpen(false)}
                                        />
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link href="/" aria-label="Go to home page">
                                <Image 
                                    src="/audio-logo.svg"
                                    alt="Logo" 
                                    width={50} 
                                    height={50} 
                                    priority
                                    className="h-12 w-auto object-contain"
                                />
                            </Link>
                        </motion.div>
                        <div className="relative z-20">
                            <CartButton />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center justify-between w-full">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Link href="/" className="text-2xl font-bold text-gray-900 transition-colors" aria-label="Go to home page">
                                <Image 
                                    src="/audio-logo.svg"
                                    alt="Logo" 
                                    width={50} 
                                    height={50} 
                                    priority
                                    className="h-12 w-auto object-contain hover:animate-pulse"
                                />
                            </Link>
                        </motion.div>

                        <NavigationMenu className="mx-auto">
                            <NavigationMenuList className="flex space-x-4 lg:space-x-6">
                                {data.left_navbar_items.map((item) => (
                                    <NavigationMenuItem key={item.id}>
                                        {item.child_items?.length ? (
                                            <>
                                                <NavigationMenuTrigger className={customTriggerStyle}>
                                                    {item.name}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent className="animate-fade-in">
                                                    <ul className="grid w-[300px] gap-3 p-4 bg-white shadow-lg rounded-xl border border-red-100">
                                                        {item.child_items.map((child) => (
                                                            <ListItem 
                                                                key={child.id}
                                                                href={child.URL}
                                                                title={child.name}
                                                                className="hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-colors text-red-700 hover:text-red-600"
                                                            />
                                                        ))}
                                                    </ul>
                                                </NavigationMenuContent>
                                            </>
                                        ) : (
                                            <Link href={item.URL}>
                                                <motion.span 
                                                    whileHover={{ scale: 1.05 }}
                                                    className={customTriggerStyle}
                                                >
                                                    {item.name}
                                                </motion.span>
                                            </Link>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>

                            <NavigationMenuList className="flex items-center space-x-4">
                                {data.right_navbar_items.map((item) => (
                                    <NavigationMenuItem key={item.id}>
                                        {item.child_items?.length ? (
                                            <>
                                                <NavigationMenuTrigger className={customTriggerStyle}>
                                                    {item.name}
                                                </NavigationMenuTrigger>
                                                <NavigationMenuContent className="animate-fade-in">
                                                    <ul className="grid w-[300px] gap-3 p-4 bg-white shadow-lg rounded-xl border border-red-100">
                                                        {item.child_items.map((child) => (
                                                            <ListItem
                                                                key={child.id}
                                                                href={child.URL}
                                                                title={child.name}
                                                                className="hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 rounded-lg transition-colors"
                                                            />
                                                        ))}
                                                    </ul>
                                                </NavigationMenuContent>
                                            </>
                                        ) : (
                                            <Link href={item.URL}>
                                                <motion.span 
                                                    whileHover={{ scale: 1.05 }}
                                                    className={customTriggerStyle}
                                                >
                                                    {item.name}
                                                </motion.span>
                                            </Link>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                                <NavigationMenuItem className="relative z-20">
                                    <CartButton />
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                </div>
            </div>
            <div className="h-[3px] w-full bg-gradient-to-r from-red-700 via-red-500 to-yellow-500 shadow-md"></div>
            <SubNavbar data={data} />
        </header>
    );
}