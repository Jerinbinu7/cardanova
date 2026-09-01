export type WeightOption = '50g' | '100g' | '250g' | '500g' | '1kg';

export interface WeightVariant {
  weight: WeightOption;
  label: string;
  priceInr: number;
  originalPriceInr: number;
  inStock: boolean;
}

export interface RetailPacketProduct {
  id: string;
  name: string;
  gradeBadge: string;
  podDiameter: string;
  tagline: string;
  description: string;
  image: string;
  colorTheme: 'emerald' | 'obsidian' | 'ivory' | 'sage';
  accentColor: string;
  variants: WeightVariant[];
  specs: {
    origin: string;
    speciality: string;
    grade: string;
    moisture: string;
    essentialOil: string;
    packaging: string;
    shelfLife: string;
  };
  inStock: boolean;
  featured?: boolean;
}

export interface CustomerShippingDetails {
  fullName: string;
  phone: string;
  email?: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
}

export interface DomesticOrderItem {
  productId: string;
  productName: string;
  gradeBadge: string;
  weight: WeightOption;
  quantity: number;
  unitPriceInr: number;
  totalPriceInr: number;
  image: string;
}

export interface DomesticOrder {
  id?: string;
  orderNumber: string;
  items: DomesticOrderItem[];
  customer: CustomerShippingDetails;
  totalAmountInr: number;
  shippingFeeInr: number;
  finalAmountInr: number;
  paymentMethod: 'UPI';
  paymentStatus: 'pending_verification' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'received' | 'confirmed' | 'dispatched' | 'delivered' | 'cancelled';
  upiReferenceUtr?: string;
  courierTrackingNumber?: string;
  createdAt?: string;
}
