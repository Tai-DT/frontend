// components/navbar/ListItem.tsx
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ListItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  href: string;
  className?: string;
  children?: React.ReactNode;
}

export const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  ListItemProps
>(({ className, title, children, description, icon, isActive, href, ...props }, ref) => {
  return (
    <div>
      <Link
        ref={ref}
        href={href}
        className={cn(
          "group flex items-center gap-3 rounded-lg p-3 text-sm outline-none transition-colors w-full",
          "hover:bg-gray-50 hover:text-blue-600",
          "focus-visible:bg-gray-50 focus-visible:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-500",
          isActive && "bg-blue-50 text-blue-600",
          className
        )}
        {...props}
      >
        {icon && (
          <span className="flex-shrink-0 text-gray-400 group-hover:text-blue-500 transition-colors">
            {icon}
          </span>
        )}
        <div className="flex-1 space-y-1">
          <div className="font-medium leading-none">{title}</div>
          {description && (
            <p className="line-clamp-2 text-sm text-gray-500 group-hover:text-gray-600">
              {description}
            </p>
          )}
          {children && (
            <div className="mt-1 text-sm text-gray-500 group-hover:text-gray-600">
              {children}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
});

ListItem.displayName = "ListItem";