import { RetailPacketProduct, DomesticOrder } from '../types/domestic';
import { supabase } from '../lib/supabase';
import { sendOrderNotificationEmail } from './emailNotificationService';

export const UPI_CONFIG = {
  vpa: 'cardanovaspices@icici', // Primary UPI VPA / ID
  payeeName: 'Cardanova Spices LLP',
  currency: 'INR',
  freeShippingAboveInr: 1000,
  standardShippingFeeInr: 80,
  supportPhone: '+91 94470 00000',
  supportWhatsApp: '919447000000',
};

export const DEFAULT_RETAIL_PRODUCTS: RetailPacketProduct[] = [
  {
    id: 'cnd-pouch-85mm',
    name: 'Royal Extra Bold Green Cardamom',
    gradeBadge: '8.5mm+ Royal Extra Bold',
    podDiameter: '8.5 mm & above',
    tagline: 'The absolute pinnacle of Idukki harvest. Huge, emerald-green, intensely aromatic pods.',
    description: 'Selected from the top 1% of the harvest in high-altitude estates of Idukki, Kerala. Each pod is flue-cured within hours of picking to lock in the volatile essential oils and unmistakable royal sweetness.',
    image: '/images/pouch-8.5mm-royal.jpg',
    colorTheme: 'emerald',
    accentColor: '#112D15',
    featured: true,
    inStock: true,
    variants: [
      { weight: '50g', label: '50 gm Trial Pack', priceInr: 299, originalPriceInr: 450, inStock: true },
      { weight: '100g', label: '100 gm Pouch', priceInr: 549, originalPriceInr: 799, inStock: true },
      { weight: '250g', label: '250 gm Zipper Pack', priceInr: 1299, originalPriceInr: 1799, inStock: true },
      { weight: '500g', label: '500 gm Chef Pack', priceInr: 2449, originalPriceInr: 3299, inStock: true },
      { weight: '1kg', label: '1 kg Master Pouch', priceInr: 4799, originalPriceInr: 6200, inStock: true },
    ],
    specs: {
      origin: 'Vandanmedu & Santhanpara, Idukki, Kerala',
      speciality: 'Hand-picked GI-Tagged Alleppey Green Extra Bold',
      grade: 'AGB (Alleppey Green Extra Bold) 8.5mm+',
      moisture: '< 9.8% (Aroma-locked)',
      essentialOil: '8.5% to 9.2% v/w (Maximum Potency)',
      packaging: '3-Layer Aluminum Foil Zipper Pouch with Nitrogen Flush',
      shelfLife: '18 Months from packing date',
    },
  },
  {
    id: 'cnd-pouch-80mm',
    name: 'Imperial Bold Green Cardamom',
    gradeBadge: '8.0mm Imperial Bold',
    podDiameter: '8.0 mm - 8.4 mm',
    tagline: 'Uniformly large, deep green pods packed with signature warm camphor notes.',
    description: 'Master-graded whole cardamom pods with vibrant green color and unmatched freshness. Perfect for premium culinary use, artisan baking, bespoke tea blends, and festive gifting.',
    image: '/images/pouch-8.0mm-imperial.jpg',
    colorTheme: 'obsidian',
    accentColor: '#1A1A1A',
    featured: false,
    inStock: true,
    variants: [
      { weight: '50g', label: '50 gm Trial Pack', priceInr: 259, originalPriceInr: 399, inStock: true },
      { weight: '100g', label: '100 gm Pouch', priceInr: 489, originalPriceInr: 699, inStock: true },
      { weight: '250g', label: '250 gm Zipper Pack', priceInr: 1149, originalPriceInr: 1599, inStock: true },
      { weight: '500g', label: '500 gm Chef Pack', priceInr: 2199, originalPriceInr: 2999, inStock: true },
      { weight: '1kg', label: '1 kg Master Pouch', priceInr: 4299, originalPriceInr: 5600, inStock: true },
    ],
    specs: {
      origin: 'Nedumkandam Estates, Idukki, Kerala',
      speciality: 'Natural Flue Cured Green Cardamom',
      grade: 'AGS-1 (Alleppey Green Superior 8.0mm)',
      moisture: '< 10.0%',
      essentialOil: '8.0% v/w',
      packaging: 'Airtight Food-Grade Zipper Pouch',
      shelfLife: '18 Months from packing date',
    },
  },
  {
    id: 'cnd-pouch-75mm',
    name: 'Heritage Select Green Cardamom',
    gradeBadge: '7.5mm Heritage Select',
    podDiameter: '7.5 mm - 7.9 mm',
    tagline: 'The daily gold standard for authentic Indian aromatic cooking and beverages.',
    description: 'Crisp, aromatic, medium-bold pods bursting with essential oils. Exceptional quality offering remarkable flavor depth for daily household delicacies and sweet preparations.',
    image: '/images/pouch-7.5mm-heritage.jpg',
    colorTheme: 'ivory',
    accentColor: '#C5A046',
    featured: false,
    inStock: true,
    variants: [
      { weight: '50g', label: '50 gm Trial Pack', priceInr: 219, originalPriceInr: 349, inStock: true },
      { weight: '100g', label: '100 gm Pouch', priceInr: 399, originalPriceInr: 599, inStock: true },
      { weight: '250g', label: '250 gm Zipper Pack', priceInr: 949, originalPriceInr: 1399, inStock: true },
      { weight: '500g', label: '500 gm Kitchen Pack', priceInr: 1799, originalPriceInr: 2499, inStock: true },
      { weight: '1kg', label: '1 kg Value Pack', priceInr: 3499, originalPriceInr: 4800, inStock: true },
    ],
    specs: {
      origin: 'Kattappana Highlands, Idukki, Kerala',
      speciality: 'Single-Estate Authentic Green Cardamom',
      grade: 'AGS-2 (Alleppey Green Select 7.5mm)',
      moisture: '< 10.5%',
      essentialOil: '7.5% v/w',
      packaging: 'Aroma-Lock Fresh Pouch',
      shelfLife: '18 Months from packing date',
    },
  },
  {
    id: 'cnd-pouch-70mm',
    name: 'Classic Commercial Green Cardamom',
    gradeBadge: '7.0mm Classic Everyday',
    podDiameter: '7.0 mm - 7.4 mm',
    tagline: 'Rich authentic cardamom flavor at everyday accessible pricing.',
    description: 'Pure, authentic Kerala green cardamom with intense aroma. Ideal for masala chai makers, sweet makers, catering, and daily spice grinding.',
    image: '/images/pouch-7.0mm-classic.jpg',
    colorTheme: 'sage',
    accentColor: '#346D3D',
    featured: false,
    inStock: true,
    variants: [
      { weight: '50g', label: '50 gm Trial Pack', priceInr: 179, originalPriceInr: 299, inStock: true },
      { weight: '100g', label: '100 gm Pouch', priceInr: 329, originalPriceInr: 499, inStock: true },
      { weight: '250g', label: '250 gm Zipper Pack', priceInr: 789, originalPriceInr: 1199, inStock: true },
      { weight: '500g', label: '500 gm Family Pack', priceInr: 1499, originalPriceInr: 2199, inStock: true },
      { weight: '1kg', label: '1 kg Bulk Pouch', priceInr: 2899, originalPriceInr: 3999, inStock: true },
    ],
    specs: {
      origin: 'Idukki Western Ghats, Kerala',
      speciality: '100% Pure Chemical-Free Green Cardamom',
      grade: 'AGE (Alleppey Green Commercial 7.0mm)',
      moisture: '< 11.0%',
      essentialOil: '7.0% v/w',
      packaging: 'Sealed Multi-barrier Pouch',
      shelfLife: '18 Months from packing date',
    },
  },
];

export const domesticService = {
  getProducts(): RetailPacketProduct[] {
    try {
      const stored = localStorage.getItem('cardanova_retail_products');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback to default
    }
    return DEFAULT_RETAIL_PRODUCTS;
  },

  saveProducts(products: RetailPacketProduct[]): void {
    try {
      localStorage.setItem('cardanova_retail_products', JSON.stringify(products));
      window.dispatchEvent(new Event('cardanova_retail_products_updated'));
    } catch (e) {
      console.error('Failed to save retail products:', e);
    }
  },

  getProductById(id: string): RetailPacketProduct | undefined {
    return this.getProducts().find((p) => p.id === id);
  },

  generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `CND-IN-${timestamp}-${random}`;
  },

  buildUpiPaymentUri(orderNumber: string, amount: number): string {
    const params = new URLSearchParams({
      pa: UPI_CONFIG.vpa,
      pn: UPI_CONFIG.payeeName,
      am: amount.toFixed(2),
      cu: UPI_CONFIG.currency,
      tn: `Cardanova Order ${orderNumber}`,
    });
    return `upi://pay?${params.toString()}`;
  },

  async createOrder(order: DomesticOrder): Promise<{ success: boolean; orderId: string; error?: string }> {
    try {
      // 1. Try to save into Supabase domestic_orders table
      const { data, error } = await supabase
        .from('domestic_orders')
        .insert({
          order_number: order.orderNumber,
          customer_name: order.customer.fullName,
          customer_phone: order.customer.phone,
          customer_email: order.customer.email || null,
          shipping_address: `${order.customer.addressLine}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
          city: order.customer.city,
          state: order.customer.state,
          pincode: order.customer.pincode,
          items: order.items,
          total_amount_inr: order.totalAmountInr,
          shipping_fee_inr: order.shippingFeeInr,
          final_amount_inr: order.finalAmountInr,
          payment_method: 'UPI',
          payment_status: order.paymentStatus || 'pending_verification',
          upi_reference_utr: order.upiReferenceUtr || null,
          order_status: 'received',
          notes: order.customer.notes || null,
        })
        .select('id')
        .single();

      if (error) {
        console.warn('[domesticService] Supabase insert note:', error.message);
      }

      // 2. Send email notification to admin with full order details
      const itemsSummary = order.items
        .map((i) => `• ${i.productName} (${i.weight}) x ${i.quantity} = ₹${i.totalPriceInr}`)
        .join('\n');

      sendOrderNotificationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customer.fullName,
        customerPhone: order.customer.phone,
        customerEmail: order.customer.email,
        shippingAddress: `${order.customer.addressLine}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}`,
        itemsSummary,
        totalAmountInr: order.finalAmountInr,
        upiReferenceUtr: order.upiReferenceUtr,
      }).catch((e) => console.warn('[domesticService] Email notification error:', e));

      // Also store in localStorage as reliable buyer receipt cache
      try {
        const stored = JSON.parse(localStorage.getItem('cardanova_my_orders') || '[]');
        stored.unshift({ ...order, id: data?.id || `local-${Date.now()}` });
        localStorage.setItem('cardanova_my_orders', JSON.stringify(stored.slice(0, 20)));
      } catch (e) {
        // ignore storage errors
      }

      return {
        success: true,
        orderId: data?.id || order.orderNumber,
      };
    } catch (err: any) {
      console.error('[domesticService] createOrder error:', err);
      return { success: true, orderId: order.orderNumber };
    }
  },

  async updateOrderUtr(orderNumber: string, utr: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('domestic_orders')
        .update({
          upi_reference_utr: utr,
          payment_status: 'paid',
        })
        .eq('order_number', orderNumber);

      return !error;
    } catch {
      return true;
    }
  },

  async fetchAllOrders(): Promise<DomesticOrder[]> {
    const { data, error } = await supabase
      .from('domestic_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[domesticService] fetchAllOrders error:', error);
      throw new Error(error.message || 'Failed to fetch orders from database');
    }
    if (!data) return [];

    return data.map((d: any) => ({
      id: d.id,
      orderNumber: d.order_number,
      items: d.items || [],
      customer: {
        fullName: d.customer_name,
        phone: d.customer_phone,
        email: d.customer_email,
        addressLine: d.shipping_address,
        city: d.city,
        state: d.state,
        pincode: d.pincode,
        notes: d.notes,
      },
      totalAmountInr: d.total_amount_inr,
      shippingFeeInr: d.shipping_fee_inr,
      finalAmountInr: d.final_amount_inr,
      paymentMethod: 'UPI',
      paymentStatus: d.payment_status,
      orderStatus: d.order_status,
      upiReferenceUtr: d.upi_reference_utr,
      courierTrackingNumber: d.courier_tracking_number,
      createdAt: d.created_at,
    }));
  },

  async updateOrderStatus(orderNumber: string, updates: { orderStatus?: string; paymentStatus?: string; courierTrackingNumber?: string; upiReferenceUtr?: string }): Promise<boolean> {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.orderStatus) dbUpdates.order_status = updates.orderStatus;
      if (updates.paymentStatus) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.courierTrackingNumber !== undefined) dbUpdates.courier_tracking_number = updates.courierTrackingNumber;
      if (updates.upiReferenceUtr !== undefined) dbUpdates.upi_reference_utr = updates.upiReferenceUtr;

      const { error } = await supabase
        .from('domestic_orders')
        .update(dbUpdates)
        .eq('order_number', orderNumber);

      return !error;
    } catch {
      return false;
    }
  }
};
