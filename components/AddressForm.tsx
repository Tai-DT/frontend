"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

const GOONG_API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

const formSchema = z.object({
  fullName: z.string().min(2, "Vui lòng nhập họ tên").nonempty("Họ tên là bắt buộc"),
  phone: z
    .string()
    .regex(/^(0[3|5|7|8|9])+([0-9]{8})\b$/, "Số điện thoại không hợp lệ")
    .nonempty("Số điện thoại là bắt buộc"),
  email: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),
  address: z.string().min(5, "Vui lòng nhập địa chỉ").nonempty("Địa chỉ là bắt buộc"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddressFormProps {
  setFormData: (data: Partial<FormValues>) => void;
  initialData?: Partial<FormValues>;
  className?: string;
  renderAsForm?: boolean; // New prop to determine if we should render a form tag
}

interface SearchResult {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export default function AddressForm({ setFormData, initialData, className = "", renderAsForm = true }: AddressFormProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchTerm = useDebounce(searchQuery, 500);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      address: initialData?.address || "",
      location: initialData?.location,
    },
  });

  useEffect(() => {
    if (debouncedSearchTerm) {
      searchAddress(debouncedSearchTerm);
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedSearchTerm]);

  const searchAddress = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSearchResults(data.predictions || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = async (placeId: string) => {
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GOONG_API_KEY}`
      );
      const data = await response.json();

      if (data?.result) {
        const { formatted_address, geometry } = data.result;

        if (geometry?.location) {
          form.setValue("location", {
            lat: geometry.location.lat,
            lng: geometry.location.lng,
          });
        }

        form.setValue("address", formatted_address || "");

        setFormData({
          fullName: form.getValues("fullName"),
          phone: form.getValues("phone"),
          email: form.getValues("email"),
          address: form.getValues("address"),
          location: form.getValues("location"),
        });

        setSearchResults([]);
        setShowResults(false);
      } else {
        console.error("Address details not found in API response.");
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
    }
  };

  const handleSubmit = (values: FormValues) => {
    setFormData(values);
  };

  const formFields = (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Họ tên</FormLabel>
              <FormControl>
                <Input placeholder="Nhập họ tên" className="h-10" {...field} />
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
              <FormLabel className="font-medium">Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder="Nhập số điện thoại" className="h-10" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Email</FormLabel>
            <FormControl>
              <Input placeholder="Nhập email (không bắt buộc)" className="h-10" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="relative">
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-medium">Địa chỉ</FormLabel>
              <div className="relative">
                <FormControl>
                  <div className="flex items-center relative">
                    <Input
                      placeholder="Nhập địa chỉ"
                      className="h-10 pr-10"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setSearchQuery(e.target.value);
                      }}
                      onFocus={() => setShowResults(true)}
                    />
                    <Search className="absolute right-3 h-4 w-4 text-gray-400" />
                  </div>
                </FormControl>
                
                {showResults && (searchResults.length > 0 || isLoading) && (
                  <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-auto shadow-lg border">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                      </div>
                    ) : (
                      <ul className="py-1">
                        {searchResults.map((result) => (
                          <li
                            key={result.place_id}
                            className="flex items-start px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => {
                              handleAddressSelect(result.place_id);
                            }}
                          >
                            <MapPin className="h-4 w-4 mt-1 mr-2 flex-shrink-0 text-gray-500" />
                            <div>
                              <p className="font-medium text-sm">
                                {result.structured_formatting?.main_text || result.description.split(',')[0]}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.structured_formatting?.secondary_text || 
                                 result.description.substring(result.description.split(',')[0].length + 1)}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {renderAsForm && (
        <Button 
          type="submit" 
          className="mt-6 w-full md:w-auto"
        >
          Lưu thông tin
        </Button>
      )}
    </div>
  );

  // Change the JSX based on whether we should render a form or just the fields
  return (
    <Form {...form}>
      {renderAsForm ? (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {formFields}
        </form>
      ) : (
        formFields
      )}
    </Form>
  );
}
