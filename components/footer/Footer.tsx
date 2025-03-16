import React from "react";
import LogoDisplay from "@/components/LogoDisplay";
import { FooterData } from "@/types/global";
import Link from "next/link";

export default function Footer({ data }: { data: FooterData }) {
  // Convert built_with string to array for better rendering
  const builtWithItems = data.built_with.split('\n').filter(item => item.trim());

  return (
    <footer className="bg-gray-900 text-gray-200 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-8 mb-12">
          {/* Company Info */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <div className="mb-6">
              <h2 className="font-bold text-2xl mb-2 text-white">Audio Tài Lộc</h2>
              <div className="w-12 h-1 bg-indigo-500 mb-4"></div>
            </div>
            <p className="text-gray-300 mb-8 leading-relaxed">
              {data.description}
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-5 mt-6">
              {data.social_media_links.map((link) => (
                <a
                  key={link.id}
                  href={link.URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-all duration-300 transform hover:scale-110"
                  aria-label={`Visit our ${link.logo?.company || 'social media'}`}
                >
                  {link.logo && (
                    <LogoDisplay
                      companyName={link.logo.company}
                      className="h-7 w-7"
                    />
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Policy Links Sections - Responsive grid */}
          {data.policy_links.map((section) => (
            <div key={section.id} className="col-span-1 sm:col-span-1 lg:col-span-2">
              <h3 className="font-bold text-lg mb-5 text-white">{section.name}</h3>
              <ul className="space-y-3">
                {section.link.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.URL}
                      className="text-gray-300 hover:text-white transition-colors duration-300 text-sm block py-1 hover:translate-x-1 transform transition-transform flex items-center"
                    >
                      <span className="mr-2">›</span> {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="text-sm text-gray-400 order-2 md:order-1 text-center md:text-left">
              {data.copyright}
            </div>
            <div className="text-xs text-gray-500 order-1 md:order-2 text-center md:text-right">
              <div className="mb-2 space-y-1">
                {builtWithItems.map((item, index) => (
                  <div key={index} className="hover:text-gray-300 transition-colors">{item}</div>
                ))}
              </div>
              <div className="mt-3 text-gray-400">
                Designed and developed by <span className="hover:text-white transition-colors">{data.designed_developed_by}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}