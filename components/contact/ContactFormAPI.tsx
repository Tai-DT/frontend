"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";

// Schema that matches the API structure
const formSchema = z.object({
  name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
  gmail: z.string().email({ message: "Email không hợp lệ" }),
  phone: z.string().regex(/^(0|\+84)?(\d{9,10})$/, { 
    message: "Số điện thoại không hợp lệ"
  }),
  topic: z.string().min(1, { message: "Vui lòng nhập chủ đề" }),
  description: z.string().min(10, { message: "Tin nhắn phải có ít nhất 10 ký tự" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactFormAPI() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      gmail: "",
      phone: "",
      topic: "",
      description: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Use axiosInstance configured with proper headers and base URL
      // Format the data according to Strapi's expected structure
      await axiosInstance.post("/api/contacts", {
        data: {
          name: data.name,
          gmail: data.gmail,
          phone: data.phone,
          topic: data.topic,
          description: data.description,
        }
      });
      
      toast({
        title: "Gửi thành công!",
        description: "Chúng tôi đã nhận được thông tin của bạn và sẽ liên hệ trong thời gian sớm nhất.",
        variant: "default",
      });
      
      form.reset();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: { message?: string } } } };
      console.error("Lỗi khi gửi form:", axiosError?.response?.data || error);
      
      // Provide more detailed error information to help debugging
      const errorMessage = axiosError?.response?.data?.error?.message || 
                          "Không thể gửi thông tin. Vui lòng thử lại sau.";
      
      toast({
        title: "Có lỗi xảy ra",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg border-yellow-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="text-2xl text-red-600">Gửi thông tin liên hệ</CardTitle>
        <CardDescription>Điền thông tin của bạn, chúng tôi sẽ liên hệ ngay khi có thể</CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0912345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chủ đề</FormLabel>
                  <FormControl>
                    <Input placeholder="Chủ đề liên hệ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung tin nhắn</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Nhập nội dung tin nhắn của bạn..." 
                      className="resize-none" 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="bg-yellow-50/50 border-t border-yellow-100 flex justify-end">
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi tin nhắn"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
