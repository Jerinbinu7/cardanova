import { RetailPacketProduct, DomesticOrder, PackagingOption } from '../types/domestic';
import { supabase } from '../lib/supabase';
import { sendOrderNotificationEmail } from './emailNotificationService';

export const UPI_CONFIG = {
  vpa: 'cardanovaspices@icici', // Primary UPI VPA / ID
  payeeName: 'Cardanova Spices LLP',
  currency: 'INR',
  freeShippingAboveInr: 1000,
  standardShippingFeeInr: 80,
  supportPhone: '+91 96568 66090',
  supportWhatsApp: '919656866090',
};

export const NATURES_FINEST_PACKAGING_OPTIONS: PackagingOption[] = [
  {
    id: 'pack-50g-bottle',
    weight: '50g',
    weightKg: 0.05,
    packagingType: 'Bottle',
    title: '50 g – Bottle',
    subtitle: 'Airtight Glass Spice Jar',
    description: 'Artisanal glass jar with airtight brushed brass gold cap. Keeps delicate volatile oils fresh on your dining table.',
    badge: 'Artisanal Jar',
    idealFor: 'Dining table elegance, connoisseur tasting & personal gifting',
    priceInr: 299,
    originalPriceInr: 450,
    inStock: true,
    image: '/images/package-50g-bottle.jpg',
    specs: {
      format: 'Cylindrical Glass Bottle with Brushed Gold Cap',
      sealing: 'Hermetic Inner Freshness Seal',
      shelfLife: '18 Months',
    },
  },
  {
    id: 'pack-100g-box',
    weight: '100g',
    weightKg: 0.1,
    packagingType: 'Square Box',
    title: '100 g – Square Box',
    subtitle: 'Luxury Rigid Square Gift Box',
    description: 'Bespoke rigid square gift box in deep emerald with hot-stamped gold foil. Moisture-barrier foil inner tray.',
    badge: 'Luxury Gift Box',
    idealFor: 'Festive gifting, wedding favors, corporate presents & pantry reserve',
    priceInr: 549,
    originalPriceInr: 799,
    inStock: true,
    image: '/images/package-100g-box.jpg',
    specs: {
      format: 'Rigid Square Box with Gold Foil Stamping',
      sealing: 'Gold Foil Moisture-Barrier Inner Seal',
      shelfLife: '18 Months',
    },
  },
  {
    id: 'pack-250g-pouch',
    weight: '250g',
    weightKg: 0.25,
    packagingType: 'Premium Packaging Pouch',
    title: '250 g – Premium Packaging Pouch',
    subtitle: '3-Layer Aroma-Lock Zipper Pouch',
    description: 'Multi-layer food-grade aluminum barrier pouch with airtight resealable zip. The essential choice for passionate home cooks.',
    badge: 'Most Popular',
    idealFor: 'Daily household cooking, authentic masala chai & gourmet recipes',
    priceInr: 1299,
    originalPriceInr: 1799,
    inStock: true,
    image: '/images/pouch-8.5mm-royal.jpg',
    specs: {
      format: '3-Layer Aluminum Foil Zipper Pouch',
      sealing: 'Resealable Zip Lock with Nitrogen Flush',
      shelfLife: '24 Months',
    },
  },
  {
    id: 'pack-500g-pouch',
    weight: '500g',
    weightKg: 0.5,
    packagingType: 'Premium Packaging Pouch',
    title: '500 g – Premium Packaging Pouch',
    subtitle: 'Chef Reserve Zipper Pouch',
    description: 'Generous culinary pouch offering optimal value for dessert makers, artisan bakeries, and large gourmet households.',
    badge: 'Chef Value Pack',
    idealFor: 'Large families, boutique bakeries, sweet shops & tea blenders',
    priceInr: 2449,
    originalPriceInr: 3299,
    inStock: true,
    image: '/images/pouch-8.0mm-imperial.jpg',
    specs: {
      format: 'Heavy-Duty Multi-Barrier Zipper Pouch',
      sealing: 'Resealable Zip Lock with Degassing Aroma Barrier',
      shelfLife: '24 Months',
    },
  },
  {
    id: 'pack-1kg-pouch',
    weight: '1kg',
    weightKg: 1.0,
    packagingType: 'Premium Packaging Pouch',
    title: '1 kg – Premium Packaging Pouch',
    subtitle: 'Master Estate Pouch',
    description: 'Direct-from-estate master pouch with nitrogen flush. Exceptional value for high-volume connoisseurs and catering.',
    badge: 'Best Value / Master Pack',
    idealFor: 'Catering, institutional culinary kitchens, confectionery & bulk pantry',
    priceInr: 4799,
    originalPriceInr: 6200,
    inStock: true,
    image: '/images/pouch-7.5mm-heritage.jpg',
    specs: {
      format: 'Commercial Grade Multi-Ply Master Barrier Foil Pouch',
      sealing: 'Industrial Nitrogen-Flushed Resealable Pouch',
      shelfLife: '24 Months',
    },
  },
];

export const NATURES_FINEST_PRODUCT: RetailPacketProduct = {
  id: 'natures-finest-cardamom',
  name: "Nature’s Finest – Premium Green Cardamom",
  gradeBadge: "Nature’s Finest",
  podDiameter: '8.0mm+ Estate Bold',
  tagline: 'Single-origin green cardamom handpicked from Idukki highlands, flue-cured at source to preserve rich essential oils.',
  description: 'Estate-selected 100% single-origin green cardamom from the cardamom hills of Idukki, Kerala. Precision cured and sealed in tailored preservation packaging for discerning households, chefs, and connoisseurs.',
  image: '/images/package-50g-bottle.jpg',
  colorTheme: 'emerald',
  accentColor: '#112D15',
  featured: true,
  inStock: true,
  variants: [
    { weight: '50g', packagingType: 'Bottle', label: '50 g – Bottle', priceInr: 299, originalPriceInr: 450, inStock: true },
    { weight: '100g', packagingType: 'Square Box', label: '100 g – Square Box', priceInr: 549, originalPriceInr: 799, inStock: true },
    { weight: '250g', packagingType: 'Premium Packaging Pouch', label: '250 g – Premium Packaging Pouch', priceInr: 1299, originalPriceInr: 1799, inStock: true },
    { weight: '500g', packagingType: 'Premium Packaging Pouch', label: '500 g – Premium Packaging Pouch', priceInr: 2449, originalPriceInr: 3299, inStock: true },
    { weight: '1kg', packagingType: 'Premium Packaging Pouch', label: '1 kg – Premium Packaging Pouch', priceInr: 4799, originalPriceInr: 6200, inStock: true },
  ],
  specs: {
    origin: 'Vandanmedu & Santhanpara, Idukki, Kerala, India',
    speciality: 'GI-Tagged Alleppey Green Cardamom, Flue-Cured at Source',
    grade: 'Single-Origin Extra Bold Estate Reserve',
    moisture: 'Target moisture specification: ≤9.5%, subject to lot.',
    essentialOil: 'Naturally rich in 1,8-cineole and alpha-terpinyl acetate.',
    packaging: 'Airtight Glass Bottle, Luxury Rigid Box & 3-Layer Foil Pouches',
    shelfLife: '18 to 24 Months in cool, dry conditions away from direct sunlight.',
  },
};

export const DEFAULT_RETAIL_PRODUCTS: RetailPacketProduct[] = [
  {
    id: 'pack-50g-bottle',
    name: '50 Grams – Bottle',
    gradeBadge: '50g Net Weight',
    podDiameter: '50 Grams',
    tagline: 'Artisanal airtight glass spice jar with brushed brass gold cap.',
    description: 'Directly sourced from Idukki, Kerala. Artisanal glass jar with airtight brushed brass gold cap. Keeps delicate volatile oils fresh on your dining table, connoisseur tasting, and personal gifting.',
    image: '/images/package-50g-bottle.jpg',
    colorTheme: 'emerald',
    accentColor: '#112D15',
    featured: false,
    inStock: true,
    variants: [
      { weight: '50g', packagingType: 'Bottle', label: '50g Artisanal Glass Jar', priceInr: 299, originalPriceInr: 450, inStock: true },
    ],
    specs: {
      origin: 'Idukki, Kerala, India',
      speciality: '100% Single Origin Green Cardamom',
      grade: 'Flue-Cured Estate Reserve',
      moisture: 'Target moisture specification: ≤9.5%',
      essentialOil: 'Naturally rich in volatile aroma oils',
      packaging: 'Cylindrical Glass Bottle with Brushed Gold Cap',
      shelfLife: '18 Months',
    },
  },
  {
    id: 'pack-100g-box',
    name: '100 Grams – Square Box',
    gradeBadge: '100g Net Weight',
    podDiameter: '100 Grams',
    tagline: 'Luxury rigid square gift box in deep emerald with gold foil stamping.',
    description: 'Bespoke rigid square gift box in deep emerald with hot-stamped gold foil. Moisture-barrier foil inner tray. Ideal for festive gifting, wedding favors, corporate presents, and luxury reserve.',
    image: '/images/package-100g-box.jpg',
    colorTheme: 'emerald',
    accentColor: '#112D15',
    featured: false,
    inStock: true,
    variants: [
      { weight: '100g', packagingType: 'Square Box', label: '100g Luxury Rigid Box', priceInr: 549, originalPriceInr: 799, inStock: true },
    ],
    specs: {
      origin: 'Idukki, Kerala, India',
      speciality: '100% Single Origin Green Cardamom',
      grade: 'Flue-Cured Estate Reserve',
      moisture: 'Target moisture specification: ≤9.5%',
      essentialOil: 'Naturally rich in volatile aroma oils',
      packaging: 'Rigid Square Box with Gold Foil Stamping',
      shelfLife: '18 Months',
    },
  },
  {
    id: 'pack-250g-pouch',
    name: '250 Grams – Aroma-Lock Zipper Pouch',
    gradeBadge: '250g Net Weight',
    podDiameter: '250 Grams',
    tagline: '3-layer food-grade aluminum barrier pouch with airtight resealable zip.',
    description: 'Multi-layer food-grade aluminum barrier pouch with airtight resealable zip. The essential choice for passionate home cooks, daily authentic masala chai, and gourmet recipes.',
    image: '/images/pouch-8.5mm-royal.jpg',
    colorTheme: 'emerald',
    accentColor: '#112D15',
    featured: true,
    inStock: true,
    variants: [
      { weight: '250g', packagingType: 'Premium Packaging Pouch', label: '250g Zipper Pouch', priceInr: 1299, originalPriceInr: 1799, inStock: true },
    ],
    specs: {
      origin: 'Idukki, Kerala, India',
      speciality: '100% Single Origin Green Cardamom',
      grade: 'Flue-Cured Estate Reserve',
      moisture: 'Target moisture specification: ≤9.5%',
      essentialOil: 'Naturally rich in volatile aroma oils',
      packaging: '3-Layer Aluminum Foil Zipper Pouch with Nitrogen Flush',
      shelfLife: '24 Months',
    },
  },
  {
    id: 'pack-500g-pouch',
    name: '500 Grams – Chef Reserve Pouch',
    gradeBadge: '500g Net Weight',
    podDiameter: '500 Grams',
    tagline: 'Generous culinary pouch offering optimal value for dessert makers and cafés.',
    description: 'Generous culinary pouch offering optimal value for dessert makers, artisan bakeries, and large gourmet households. Heavy-duty barrier locks in signature aroma.',
    image: '/images/pouch-8.0mm-imperial.jpg',
    colorTheme: 'obsidian',
    accentColor: '#1A1A1A',
    featured: false,
    inStock: true,
    variants: [
      { weight: '500g', packagingType: 'Premium Packaging Pouch', label: '500g Chef Reserve Pouch', priceInr: 2449, originalPriceInr: 3299, inStock: true },
    ],
    specs: {
      origin: 'Idukki, Kerala, India',
      speciality: '100% Single Origin Green Cardamom',
      grade: 'Flue-Cured Estate Reserve',
      moisture: 'Target moisture specification: ≤9.5%',
      essentialOil: 'Naturally rich in volatile aroma oils',
      packaging: 'Heavy-Duty Multi-Barrier Zipper Pouch',
      shelfLife: '24 Months',
    },
  },
  {
    id: 'pack-1kg-pouch',
    name: '1 kg (1,000 Grams) – Master Estate Pouch',
    gradeBadge: '1 kg (1000g)',
    podDiameter: '1,000 Grams',
    tagline: 'Direct-from-estate master pouch with nitrogen flush. Exceptional value for high volume.',
    description: 'Commercial-grade multi-ply master barrier foil pouch with nitrogen flush. Exceptional value for catering, institutional culinary kitchens, confectionery, and bulk pantry reserve.',
    image: '/images/pouch-7.5mm-heritage.jpg',
    colorTheme: 'ivory',
    accentColor: '#C5A046',
    featured: false,
    inStock: true,
    variants: [
      { weight: '1kg', packagingType: 'Premium Packaging Pouch', label: '1 kg Master Foil Pouch', priceInr: 4799, originalPriceInr: 6200, inStock: true },
    ],
    specs: {
      origin: 'Idukki, Kerala, India',
      speciality: '100% Single Origin Green Cardamom',
      grade: 'Flue-Cured Estate Reserve',
      moisture: 'Target moisture specification: ≤9.5%',
      essentialOil: 'Naturally rich in volatile aroma oils',
      packaging: 'Commercial Multi-Ply Master Barrier Foil Pouch',
      shelfLife: '24 Months',
    },
  },
];

export const domesticService = {
  getPackagingOptions(): PackagingOption[] {
    return NATURES_FINEST_PACKAGING_OPTIONS;
  },

  getNaturesFinestProduct(): RetailPacketProduct {
    return NATURES_FINEST_PRODUCT;
  },

  getProducts(): RetailPacketProduct[] {
    try {
      const stored = localStorage.getItem('cardanova_retail_products');
      if (stored) {
        const parsed: RetailPacketProduct[] = JSON.parse(stored);
        // If old grade-based classification was cached, migrate to gram size
        if (parsed.some((p) => p.id?.includes('85mm') || p.podDiameter?.includes('mm'))) {
          localStorage.setItem('cardanova_retail_products', JSON.stringify(DEFAULT_RETAIL_PRODUCTS));
          return DEFAULT_RETAIL_PRODUCTS;
        }
        return parsed;
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
    try {
      const { data, error } = await supabase
        .from('domestic_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
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
    } catch {
      return [];
    }
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
  },

  async cancelOrder(orderNumber: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('domestic_orders')
        .update({ order_status: 'cancelled', payment_status: 'cancelled' })
        .eq('order_number', orderNumber);

      // Also remove from localStorage receipt cache
      try {
        const stored: any[] = JSON.parse(localStorage.getItem('cardanova_my_orders') || '[]');
        const updated = stored.map((o) =>
          o.orderNumber === orderNumber ? { ...o, orderStatus: 'cancelled', paymentStatus: 'cancelled' } : o
        );
        localStorage.setItem('cardanova_my_orders', JSON.stringify(updated));
      } catch { /* ignore */ }

      return !error;
    } catch {
      return false;
    }
  },
};

