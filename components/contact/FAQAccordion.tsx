"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type FAQItem = {
  id: number;
  heading: string;
  sub_heading: string;
};

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export default function FAQAccordion({ faqs }: FAQAccordionProps) {
  // If no FAQs are provided, use default ones
  const faqItems = faqs.length > 0 ? faqs : [
    {
      id: 1,
      heading: "Làm sao để chọn hệ thống âm thanh phù hợp với không gian của tôi?",
      sub_heading: "Để chọn hệ thống âm thanh phù hợp, bạn cần cân nhắc kích thước phòng, mục đích sử dụng (nghe nhạc, xem phim, karaoke...), ngân sách và phong cách thiết kế không gian. Chúng tôi cung cấp dịch vụ tư vấn miễn phí để giúp bạn lựa chọn giải pháp tối ưu nhất."
    },
    {
      id: 2,
      heading: "Audio Tài Lộc có dịch vụ lắp đặt tại nhà không?",
      sub_heading: "Có, chúng tôi cung cấp dịch vụ lắp đặt tại nhà trên toàn quốc. Đội ngũ kỹ thuật viên chuyên nghiệp của chúng tôi sẽ đảm bảo hệ thống âm thanh được lắp đặt đúng kỹ thuật và hoạt động hiệu quả nhất."
    }
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {faqItems.map((faq) => (
        <AccordionItem key={faq.id} value={`item-${faq.id}`} className="border-b border-yellow-100">
          <AccordionTrigger className="text-left font-medium text-red-600 hover:text-red-700 hover:no-underline">
            {faq.heading}
          </AccordionTrigger>
          <AccordionContent className="text-gray-700">
            {faq.sub_heading}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
