export type InvoiceStatus = 'DRAFT' | 'SENT' | 'SCHEDULED' | 'PAID' | 'MARKED_AS_PAID' | 'CANCELLED' | 'REFUNDED' | 'PAYMENT_PENDING' | 'OVERDUE';

export interface MerchantInfo {
  name?: string;
  email?: string;
  phone?: string;
  businessName?: string;
  website?: string;
  taxId?: string;
  logoUrl?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    adminArea2?: string; // city
    adminArea1?: string; // state
    postalCode?: string;
    countryCode?: string;
  };
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  address?: {
    addressLine1?: string;
    addressLine2?: string;
    adminArea2?: string;
    adminArea1?: string;
    postalCode?: string;
    countryCode?: string;
  };
}

export interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number; // e.g. 5 for 5%
  itemDate?: string; // YYYY-MM-DD
}

export interface InvoiceDiscount {
  amount?: number;
  percent?: number;
}

export interface PaymentTerms {
  termType?: 'DUE_ON_RECEIPT' | 'NET_10' | 'NET_15' | 'NET_30' | 'NET_60' | 'SPECIFIED_DATE';
  dueDate: string; // YYYY-MM-DD
  notes?: string;
  termsAndConditions?: string;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber?: string;
  paypalInvoiceId?: string;
  status: InvoiceStatus;
  currency: string;
  invoiceDate: string;
  merchant: MerchantInfo;
  customer: CustomerInfo;
  items: InvoiceItem[];
  discount?: InvoiceDiscount;
  taxRate?: number;
  paymentTerms: PaymentTerms;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paypalPaymentUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    sourceType?: 'voice' | 'image' | 'vision' | 'text' | 'manual';
    rawTranscript?: string;
    confidenceScore?: number;
  };
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  totalInvoiced: number;
  totalPaid: number;
  lastInvoiceDate?: string;
  defaultPaymentTerms?: string;
}

export interface InvoiceExtractionSchema {
  merchant?: {
    name?: string;
    email?: string;
    phone?: string;
    businessName?: string;
  };
  customer: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    itemDate?: string;
  }>;
  discount?: {
    amount?: number;
    percent?: number;
  };
  paymentTerms?: {
    dueDate?: string;
    notes?: string;
    termsAndConditions?: string;
  };
  currency?: string;
}
