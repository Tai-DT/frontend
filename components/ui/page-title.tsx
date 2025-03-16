import React from "react";
import { cn } from "@/lib/utils";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}) => {
  return (
    <div className={cn("mb-6", className)}>
      <h1 className={cn("text-2xl md:text-3xl font-bold text-gray-900", titleClassName)}>
        {title}
      </h1>
      {subtitle && (
        <p className={cn("mt-2 text-gray-600", subtitleClassName)}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PageTitle;
