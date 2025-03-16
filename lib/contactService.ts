import axiosInstance from "./axiosInstance";

export type ContactData = {
  id: string;
  name: string;
  id_sdt: string;
  logo?: {
    company: string;
  };
};

export type ContactSubmission = {
  name: string;
  phone: string;
  message?: string;
  type?: "phone" | "message" | "schedule";
};

export type ContactFormData = {
  name: string;
  gmail: string;
  phone: string;
  topic: string;
  description: string;
};

class ContactService {
  async getContacts(): Promise<{ data: ContactData[] }> {
    const response = await axiosInstance.get("/api/contacts");
    return response.data;
  }

  async submitContactRequest(data: ContactSubmission): Promise<{ data: { success: boolean } }> {
    return await axiosInstance.post("/api/contacts", data);
  }

  async submitContactForm(data: ContactFormData): Promise<{ data: { success: boolean } }> {
    return await axiosInstance.post("/api/contacts", {
      data: {
        name: data.name,
        gmail: data.gmail,
        phone: data.phone,
        topic: data.topic,
        description: data.description,
      }
    });
  }
}

export const contactService = new ContactService();