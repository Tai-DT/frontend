import { cn } from "@/lib/utils"
import React from "react"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
}

export function Section({ children, className, ...props }: SectionProps) {
  return (
    <section
      className={cn("py-6", className)}
      {...props}
    >
      {children}
    </section>
  )
}
