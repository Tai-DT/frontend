"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToastAction } from "@/components/ui/toast";
import { toast } from "@/components/ui/use-toast";
import { useContactModal } from "@/hooks/useContactModal";
import { Phone, Calendar, MessageCircle, Loader2 } from "lucide-react";
import useSWR from "swr";
import { contactService } from "@/lib/contactService";
import axiosInstance from "@/lib/axiosInstance";

// Types
type ContactType = "phone" | "message" | "schedule";
type ContactData = {
  id: string;
  name: string;
  id_sdt: string;
};

// SWR fetcher
const fetcher = async () => {
  const data = await contactService.getContacts();
  return data;
};

const ContactModal = () => {
  const { isOpen, closeModal } = useContactModal();
  
  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [contactType, setContactType] = useState<ContactType>("message");
  const [loading, setLoading] = useState(false);
  
  // Get phone numbers from API
  const { data } = useSWR<{ data: ContactData[] }>(
    'contacts',
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      shouldRetryOnError: false
    }
  );
  
  const phoneContact = data?.data?.find(c => c.name.toLowerCase() === 'phone')?.id_sdt;
  
  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset the form after a short delay to ensure animations complete
      const timeout = setTimeout(() => {
        setName("");
        setPhone("");
        setMessage("");
        setContactType("message");
        setLoading(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);
  
  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!name.trim() || !phone.trim()) {
      toast({
        title: "Thông tin không đầy đủ",
        description: "Vui lòng nhập tên và số điện thoại của bạn",
        variant: "destructive",
      });
      return;
    }
    
    // If direct call is selected, dial the number
    if (contactType === "phone" && phoneContact) {
      window.location.href = `tel:${phoneContact}`;
      closeModal();
      return;
    }
    
    setLoading(true);
    
    try {
      // Submit the contact request to the API
      await axiosInstance.post("/api/contacts/submit", {
        name,
        phone,
        message,
        type: contactType,
      });
      
      // Show success toast
      toast({
        title: "Gửi thành công!",
        description: "Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất",
        action: contactType === "schedule" ? (
          <ToastAction altText="Lịch">Đã nhận lịch hẹn</ToastAction>
        ) : undefined,
      });
      
      // Close the modal
      closeModal();
    } catch (error) {
      console.error("Error submitting contact form:", error);
      
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể gửi thông tin. Vui lòng thử lại sau hoặc gọi trực tiếp cho chúng tôi",
        variant: "destructive",
        action: phoneContact ? (
          <ToastAction altText="Call" onClick={() => window.location.href = `tel:${phoneContact}`}>
            Gọi ngay
          </ToastAction>
        ) : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [name, phone, message, contactType, phoneContact, closeModal]);
  
  // Format phone number for display
  const formatPhoneNumber = useCallback((phone: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-red-600 text-2xl font-bold">Liên hệ với Audio Tài Lộc</DialogTitle>
          <DialogDescription className="text-center">
            Chúng tôi sẽ liên hệ lại với bạn trong thời gian sớm nhất
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup 
            defaultValue={contactType} 
            onValueChange={(value) => setContactType(value as ContactType)}
            className="grid grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem 
                value="phone" 
                id="phone-call" 
                className="peer sr-only" 
              />
              <Label 
                htmlFor="phone-call"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-yellow-50 p-4 
                         hover:bg-yellow-100 hover:border-yellow-200 peer-data-[state=checked]:border-yellow-500
                         peer-data-[state=checked]:bg-yellow-100 [&:has([data-state=checked])]:border-yellow-500"
              >
                <Phone className="h-6 w-6 mb-2 text-yellow-600" />
                <span className="text-sm font-medium">Gọi ngay</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="message" 
                id="message" 
                className="peer sr-only" 
                defaultChecked 
              />
              <Label 
                htmlFor="message"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-red-50 p-4 
                         hover:bg-red-100 hover:border-red-200 peer-data-[state=checked]:border-red-500
                         peer-data-[state=checked]:bg-red-100 [&:has([data-state=checked])]:border-red-500"
              >
                <MessageCircle className="h-6 w-6 mb-2 text-red-600" />
                <span className="text-sm font-medium">Nhắn tin</span>
              </Label>
            </div>
            
            <div>
              <RadioGroupItem 
                value="schedule" 
                id="schedule" 
                className="peer sr-only" 
              />
              <Label 
                htmlFor="schedule"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-blue-50 p-4 
                         hover:bg-blue-100 hover:border-blue-200 peer-data-[state=checked]:border-blue-500
                         peer-data-[state=checked]:bg-blue-100 [&:has([data-state=checked])]:border-blue-500"
              >
                <Calendar className="h-6 w-6 mb-2 text-blue-600" />
                <span className="text-sm font-medium">Đặt lịch</span>
              </Label>
            </div>
          </RadioGroup>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            {contactType !== "phone" && (
              <div className="grid gap-2">
                <Label htmlFor="message">
                  {contactType === "schedule" ? "Thời gian bạn muốn đặt lịch" : "Nội dung"}
                </Label>
                <Textarea
                  id="message"
                  placeholder={contactType === "schedule" 
                    ? "Thời gian bạn muốn được tư vấn..." 
                    : "Nội dung bạn muốn tư vấn..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
            )}
          </div>
          
          {contactType === "phone" && phoneContact && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600">
                Bạn sẽ được kết nối trực tiếp với số điện thoại:
              </p>
              <p className="text-lg font-bold text-yellow-700 mt-1">
                {formatPhoneNumber(phoneContact)}
              </p>
            </div>
          )}
          
          <DialogFooter className="sm:justify-center">
            {contactType === "phone" && phoneContact ? (
              <Button
                type="submit" 
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  <>
                    <Phone className="mr-2 h-4 w-4" />
                    Gọi Ngay
                  </>
                )}
              </Button>
            ) : contactType === "schedule" ? (
              <Button
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    Đặt Lịch
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Gửi Yêu Cầu
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;