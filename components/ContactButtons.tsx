"use client";

import React, { useEffect, useState, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LogoDisplay from "@/components/LogoDisplay";
import useSWR from "swr";
import {contactService} from "@/lib/contactService";
import { motion, AnimatePresence } from "framer-motion";
import { useContactModal } from "@/hooks/useContactModal";

// Preload critical icons
const PhoneIcon = dynamic(() => import("lucide-react").then((mod) => mod.Phone), { 
  ssr: false,
  loading: () => <div className="h-4 w-4 bg-gray-200 rounded-sm animate-pulse" />
});

const MessageCircleIcon = dynamic(() => import("lucide-react").then((mod) => mod.MessageCircle), { 
  ssr: false,
  loading: () => <div className="h-4 w-4 bg-gray-200 rounded-sm animate-pulse" />
});

// Types
type ContactData = {
  id: string;
  name: string;
  id_sdt: string;
  logo?: {
    company: string;
  };
};

const COLOR_STYLES = {
  blue: {
    bg: "bg-gradient-to-br from-blue-400 to-blue-600",
    shadow: "shadow-blue-400/20",
    ping: "bg-blue-400"
  },
  green: {
    bg: "bg-gradient-to-br from-green-400 to-green-600",
    shadow: "shadow-green-400/20",
    ping: "bg-green-400"
  },
  red: {
    bg: "bg-gradient-to-br from-red-400 to-red-600",
    shadow: "shadow-red-400/20",
    ping: "bg-red-400"
  },
  yellow: {
    bg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    shadow: "shadow-yellow-400/20",
    ping: "bg-yellow-400"
  }
} as const;

// Custom SWR fetcher using axiosInstance
const fetcher = async () => {
  const data = await contactService.getContacts();
  return data;
};

const ContactButtons: React.FC = memo(() => {
  const { data, error, isLoading } = useSWR<{ data: ContactData[] }>(
    'contacts',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      shouldRetryOnError: false
    }
  );

  const { openModal } = useContactModal();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Memoized contacts
  const contacts = useMemo(() => {
    if (!data?.data) return [];
    return data.data;
  }, [data?.data]);

  const zaloContact = useMemo(() => 
    contacts.find(c => c.name.toLowerCase() === 'zalo'),
  [contacts]);
  
  const phoneContact = useMemo(() => 
    contacts.find(c => c.name.toLowerCase() === 'phone'),
  [contacts]);

  // Optimized phone formatting
  const formatPhoneNumber = useCallback((phone: string) => {
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }, []);

  // Pre-render skeleton
  const renderSkeleton = useMemo(() => (
    <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-50">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: i * 0.1
          }}
        >
          <div 
            className="h-16 w-16 rounded-full bg-gray-200 animate-pulse shadow-lg"
            aria-label="Loading contact..."
          />
        </motion.div>
      ))}
    </div>
  ), []);

  const renderContactButton = useCallback((
    contact: ContactData | undefined, 
    color: keyof typeof COLOR_STYLES,
    index: number,
    isModal: boolean = false
  ) => {
    if (!contact?.id_sdt || !isMounted) return null;

    const styles = COLOR_STYLES[color];
    
    let href = '#';
    
    if (isModal) {
      href = '#contact';
    } else if (contact.name.toLowerCase() === 'zalo') {
      href = `https://zalo.me/${contact.id_sdt}`;
    } else if (contact.name.toLowerCase() === 'phone') {
      href = `tel:${contact.id_sdt}`;
    }

    return (
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.2
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            {isModal ? (
              <button
                onClick={() => openModal()}
                className={cn(
                  "h-16 w-16 flex items-center justify-center",
                  "rounded-full shadow-xl transition-all",
                  "hover:scale-110 active:scale-95 hover:shadow-2xl",
                  styles.bg,
                  `shadow-lg ${styles.shadow}`,
                  "will-change-transform"
                )}
                aria-label="Open contact form"
              >
                <div className="relative p-3">
                  <MessageCircleIcon className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.ping} opacity-75`} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${styles.ping}`} />
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              <Link
                prefetch={false}
                href={href}
                target={contact.name.toLowerCase() === 'zalo' ? "_blank" : undefined}
                rel={contact.name.toLowerCase() === 'zalo' ? "noopener noreferrer" : undefined}
                className={cn(
                  "h-16 w-16 flex items-center justify-center",
                  "rounded-full shadow-xl transition-all",
                  "hover:scale-110 active:scale-95 hover:shadow-2xl",
                  styles.bg,
                  `shadow-lg ${styles.shadow}`,
                  "will-change-transform"
                )}
                aria-label={`Contact via ${contact.name}`}
              >
                <div className="relative p-3">
                  {contact.logo ? (
                    <LogoDisplay
                      companyName={contact.logo.company}
                      className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16"
                    />
                  ) : (
                    <PhoneIcon className="h-8 w-8 text-white" />
                  )}
                  <div className="absolute -top-1 -right-1">
                    <span className="flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${styles.ping} opacity-75`} />
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${styles.ping}`} />
                    </span>
                  </div>
                </div>
              </Link>
            )}
          </TooltipTrigger>
          <TooltipContent 
            side="left" 
            className="bg-white p-3 shadow-xl rounded-lg border border-yellow-100"
            sideOffset={5}
          >
            <div className="flex items-center gap-2">
              {isModal ? (
                <MessageCircleIcon className="h-4 w-4 text-red-600" />
              ) : (
                <PhoneIcon className="h-4 w-4 text-red-600" />
              )}
              <span className="font-medium text-gray-700">
                {isModal ? "Liên hệ ngay" : formatPhoneNumber(contact.id_sdt)}
              </span>
            </div>
          </TooltipContent>
        </Tooltip>
      </motion.div>
    );
  }, [formatPhoneNumber, isMounted, openModal]);

  if (error) {
    return (
      <Alert variant="destructive" className="fixed bottom-4 right-4 max-w-xs animate-in fade-in slide-in-from-bottom-5">
        <AlertDescription>Failed to load contacts</AlertDescription>
      </Alert>
    );
  } 

  return (
    <TooltipProvider delayDuration={200}>
      <AnimatePresence>
        {isLoading ? renderSkeleton : (
          <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-50">
            {/* Contact Form Button */}
            {renderContactButton(phoneContact, 'red', 0, true)}
            
            {/* Zalo Button */}
            {renderContactButton(zaloContact, 'blue', 1)}
            
            {/* Phone Button */}
            {renderContactButton(phoneContact, 'yellow', 2)}
          </div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
});

ContactButtons.displayName = "ContactButtons";

export default ContactButtons;