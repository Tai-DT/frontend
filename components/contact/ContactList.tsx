"use client";

import { Mail, Phone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

type Contact = {
  id: number;
  name: string;
  description: string;
  type?: "email" | "phone" | "address";
  url?: string;
};

type ContactListProps = {
  contacts: Contact[];
  className?: string;
};

export const ContactList = ({ contacts, className = "" }: ContactListProps) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Thông tin liên lạc
      </h2>
      
      <motion.ul 
        className="mt-6 space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {contacts.map((contact) => (
          <motion.li key={contact.id} variants={item}>
            <Card className="overflow-hidden transition-all hover:shadow-md group">
              <CardContent className="p-0">
                {contact.url ? (
                  <a 
                    href={contact.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <ContactItem contact={contact} />
                    <div className="mt-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <span>Mở liên kết</span>
                        <ExternalLink className="h-3 w-3" />
                      </Badge>
                    </div>
                  </a>
                ) : (
                  <div className="p-4">
                    <ContactItem contact={contact} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
};

const ContactItem = ({ contact }: { contact: Contact }) => {
  const getIcon = (type?: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-5 w-5 text-blue-500" />;
      case "phone":
        return <Phone className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        {getIcon(contact.type)}
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900">{contact.name}</h3>
        <p className="text-gray-600 mt-1">{contact.description}</p>
      </div>
    </div>
  );
};
