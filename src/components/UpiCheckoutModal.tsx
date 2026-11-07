import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ArrowRight,
  Copy,
  Check,
  Smartphone,
  QrCode,
  Sparkles,
  ChevronLeft,
  MessageCircle,
  Package,
} from 'lucide-react';
import { DomesticOrderItem, CustomerShippingDetails, DomesticOrder } from '../types/domestic';
import { UPI_CONFIG, domesticService } from '../services/domesticService';
import { sendCancellationEmail } from '../services/emailNotificationService';

interface UpiCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: DomesticOrderItem[];
  onOrderSuccess?: (order: DomesticOrder) => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Chandigarh'
];

export default function UpiCheckoutModal({
  isOpen,
  onClose,
  orderItems,
  onOrderSuccess,
}: UpiCheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'payment' | 'success' | 'cancelled'>('details');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<DomesticOrder | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Form state
  const [shipping, setShipping] = useState<CustomerShippingDetails>({
    fullName: '',
    phone: '',
    email: '',
    addressLine: '',
    city: '',
    state: 'Kerala',
    pincode: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CustomerShippingDetails, string>>>({});

  // Calculate totals
  const subtotal = orderItems.reduce((acc, item) => acc + item.totalPriceInr, 0);
  const shippingFee = subtotal >= UPI_CONFIG.freeShippingAboveInr ? 0 : UPI_CONFIG.standardShippingFeeInr;
  const finalTotal = subtotal + shippingFee;

  useEffect(() => {
    if (isOpen && orderItems.length > 0) {
      setStep('details');
      setUtrInput('');
      setFormErrors({});
      // Generate initial order reference
      const initialOrderNumber = domesticService.generateOrderNumber();
      setCurrentOrder({
        orderNumber: initialOrderNumber,
        items: orderItems,
        customer: shipping,
        totalAmountInr: subtotal,
        shippingFeeInr: shippingFee,
        finalAmountInr: finalTotal,
        paymentMethod: 'UPI',
        paymentStatus: 'pending_verification',
        orderStatus: 'received',
      });
    }
  }, [isOpen, orderItems]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CustomerShippingDetails, string>> = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!shipping.phone.trim() || !/^\d{10}$/.test(shipping.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone/WhatsApp number';
    }
    if (!shipping.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email.trim())) {
      errors.email = 'Please enter a valid email address for order confirmation';
    }
    if (!shipping.addressLine.trim() || shipping.addressLine.length < 5) {
      errors.addressLine = 'Please enter complete house/flat, street address';
    }
    if (!shipping.city.trim()) errors.city = 'Please enter your city';
    if (!shipping.pincode.trim() || !/^\d{6}$/.test(shipping.pincode.trim())) {
      errors.pincode = 'Please enter a valid 6-digit Pincode';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const orderNumber = currentOrder?.orderNumber || domesticService.generateOrderNumber();
    const orderData: DomesticOrder = {
      orderNumber,
      items: orderItems,
      customer: shipping,
      totalAmountInr: subtotal,
      shippingFeeInr: shippingFee,
      finalAmountInr: finalTotal,
      paymentMethod: 'UPI',
      paymentStatus: 'pending_verification',
      orderStatus: 'received',
    };

    setCurrentOrder(orderData);
    setStep('payment');
  };

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(UPI_CONFIG.vpa);
    setCopiedVpa(true);
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(finalTotal.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const upiDeepLink = currentOrder
    ? domesticService.buildUpiPaymentUri(currentOrder.orderNumber, finalTotal)
    : `upi://pay?pa=${UPI_CONFIG.vpa}&pn=${encodeURIComponent(UPI_CONFIG.payeeName)}&am=${finalTotal}&cu=INR`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(
    upiDeepLink
  )}`;

  const [utrError, setUtrError] = useState('');

  const validateUtr = (input: string): { valid: boolean; clean: string; error?: string } => {
    const clean = input.trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!clean) {
      return {
        valid: false,
        clean: '',
        error: 'UPI Reference / UTR number is mandatory to place your order.',
      };
    }
    if (clean.length < 12 || clean.length > 22) {
      return {
        valid: false,
        clean,
        error: `UPI Reference / UTR number must be between 12 and 22 digits (currently ${clean.length} characters).`,
      };
    }
    return { valid: true, clean };
  };

  const processOrderWithUtr = async (cleanUtr: string): Promise<DomesticOrder | null> => {
    if (!currentOrder) return null;

    const completedOrder: DomesticOrder = {
      ...currentOrder,
      upiReferenceUtr: cleanUtr,
      paymentStatus: 'paid',
      orderStatus: 'received',
    };

    // Save order into Supabase with UTR and send admin notification email
    try {
      await domesticService.createOrder(completedOrder);
    } catch (err) {
      console.error('Order save error (handled):', err);
    }

    setCurrentOrder(completedOrder);
    return completedOrder;
  };

  const handleConfirmUtr = async () => {
    const { valid, clean, error } = validateUtr(utrInput);
    if (!valid) {
      setUtrError(error || 'Invalid UTR');
      return;
    }

    setUtrError('');
    setIsSubmitting(true);

    try {
      const completedOrder = await processOrderWithUtr(clean);
      setIsSubmitting(false);
      setStep('success');
      if (completedOrder && onOrderSuccess) onOrderSuccess(completedOrder);
    } catch (e: any) {
      setIsSubmitting(false);
      setUtrError(e?.message || 'Failed to submit order. Please try again.');
    }
  };

  const handleWhatsAppConfirm = () => {
    if (!currentOrder) return;
    openWhatsAppChat(currentOrder, currentOrder.upiReferenceUtr || utrInput);
  };

  const openWhatsAppChat = (order: DomesticOrder, utr?: string) => {
    const itemList = order.items
      .map((i) => `• ${i.productName} (${i.weight}) x ${i.quantity} = ₹${i.totalPriceInr}`)
      .join('\n');

    const cleanUtr = utr || order.upiReferenceUtr || '';
    const msg = `*NEW CARDANOVA DOMESTIC ORDER*\n\n` +
      `*Order ID:* ${order.orderNumber}\n` +
      `*Total Amount:* ₹${order.finalAmountInr}\n` +
      (cleanUtr ? `*UPI Ref / UTR:* ${cleanUtr}\n` : '') +
      `\n*Items:*\n${itemList}\n\n` +
      `*Deliver To:*\n` +
      `Name: ${order.customer.fullName}\n` +
      `Phone: ${order.customer.phone}\n` +
      `Address: ${order.customer.addressLine}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}\n\n` +
      `I have completed the UPI payment. Please verify UTR and confirm dispatch!`;

    const url = `https://wa.me/${UPI_CONFIG.supportWhatsApp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleCancelOrder = async () => {
    if (!currentOrder) return;
    setIsCancelling(true);
    try {
      await domesticService.cancelOrder(currentOrder.orderNumber);
    } catch { /* best-effort */ }

    // Send cancellation email to admin
    const itemsSummary = currentOrder.items
      .map((i) => `${i.productName} (${i.weight}) x${i.quantity} = ₹${i.totalPriceInr}`)
      .join('\n');
    try {
      await sendCancellationEmail({
        orderNumber: currentOrder.orderNumber,
        customerName: currentOrder.customer.fullName,
        customerPhone: currentOrder.customer.phone,
        customerEmail: currentOrder.customer.email,
        shippingAddress: `${currentOrder.customer.addressLine}, ${currentOrder.customer.city}, ${currentOrder.customer.state} - ${currentOrder.customer.pincode}`,
        itemsSummary,
        totalAmountInr: currentOrder.finalAmountInr,
        upiReferenceUtr: currentOrder.upiReferenceUtr,
      });
    } catch { /* best-effort */ }

    setIsCancelling(false);
    setCancelConfirm(false);
    setStep('cancelled');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[750] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#C5A046]/30 overflow-hidden my-auto"
          >
        {/* Header Ribbon */}
        <div className="bg-[#112D15] text-[#FAF8F5] px-6 py-4 flex items-center justify-between border-b border-[#C5A046]/20">
          <div className="flex items-center gap-3">
            {step === 'payment' && (
              <button
                type="button"
                onClick={() => setStep('details')}
                className="p-1.5 -ml-2 text-[#C5A046] hover:text-[#E2BF63] hover:bg-white/10 rounded-full transition-colors"
                title="Back to Details"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <span className="label-caps text-[#C5A046] text-[0.62rem] tracking-[0.2em] block">
                Direct Domestic Delivery • India
              </span>
              <h3 className="font-display text-xl sm:text-2xl text-[#FAF8F5] font-normal leading-tight">
                {step === 'details' && 'Shipping & Customer Details'}
                {step === 'payment' && 'Direct UPI Instant Checkout'}
                {step === 'success' && 'Order Confirmed'}
                {step === 'cancelled' && 'Order Cancelled'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#C5A046] hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* STEP 1: SHIPPING DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Order Summary Strip */}
              <div className="bg-[#F3EFEA] rounded-xl p-4 border border-[#C5A046]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#112D15] uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#C5A046]" />
                    Order Summary ({orderItems.length} {orderItems.length === 1 ? 'item' : 'items'})
                  </span>
                  <span className="font-display font-semibold text-base text-[#112D15]">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="divide-y divide-black/5 text-xs text-stone-700">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-9 h-9 object-cover rounded-md border border-black/10"
                        />
                        <div>
                          <p className="font-medium text-[#112D15]">{item.productName}</p>
                          <p className="text-[11px] text-stone-500">
                            {item.weight} pouch × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium text-[#112D15]">₹{item.totalPriceInr}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-stone-600">
                  <span>Shipping across India</span>
                  <span className="text-emerald-700 font-medium">
                    {shippingFee === 0 ? 'FREE (Orders above ₹1,000)' : `₹${shippingFee}`}
                  </span>
                </div>
              </div>

              {/* Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#112D15] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aditi Sharma"
                    value={shipping.fullName}
                    onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border ${
                      formErrors.fullName ? 'border-red-400' : 'border-[#C5A046]/30'
                    } focus:border-[#112D15] focus:outline-none transition-colors`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#112D15] mb-1">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={shipping.phone}
                    onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                    className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border ${
                      formErrors.phone ? 'border-red-400' : 'border-[#C5A046]/30'
                    } focus:border-[#112D15] focus:outline-none transition-colors`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#112D15] mb-1">
                  Email Address <span className="text-red-500">*</span> (for order receipt & dispatch updates)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. aditi.sharma@gmail.com"
                  value={shipping.email}
                  onChange={(e) => setShipping({ ...shipping, email: e.target.value })}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg bg-white border ${
                    formErrors.email ? 'border-red-400' : 'border-[#C5A046]/30'
                  } focus:border-[#112D15] focus:outline-none transition-colors`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#112D15] mb-1">
                  Delivery Address (House/Flat, Street, Landmark) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Flat 402, Green Meadows Apt, 12th Main Road, Indiranagar"
                  value={shipping.addressLine}
                  onChange={(e) => setShipping({ ...shipping, addressLine: e.target.value })}
                  className={`w-full px-3.5 py-2 text-sm rounded-lg bg-white border ${
                    formErrors.addressLine ? 'border-red-400' : 'border-[#C5A046]/30'
                  } focus:border-[#112D15] focus:outline-none transition-colors resize-none`}
                />
                {formErrors.addressLine && (
                  <p className="text-[11px] text-red-500 mt-0.5">{formErrors.addressLine}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#112D15] mb-1">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={shipping.city}
                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-white border border-[#C5A046]/30 focus:border-[#112D15] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#112D15] mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={shipping.state}
                    onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-[#C5A046]/30 focus:border-[#112D15] focus:outline-none"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#112D15] mb-1">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 560038"
                    value={shipping.pincode}
                    onChange={(e) => setShipping({ ...shipping, pincode: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-white border border-[#C5A046]/30 focus:border-[#112D15] focus:outline-none"
                  />
                </div>
              </div>

              {/* Guarantees Strip */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-stone-600">
                <div className="flex items-center gap-1.5 justify-center py-2 bg-emerald-50/70 border border-emerald-200/50 rounded-lg text-emerald-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>100% Pure Idukki</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-2 bg-amber-50/70 border border-amber-200/50 rounded-lg text-amber-900">
                  <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Pan-India Speed Post</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-800">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A046] shrink-0" />
                  <span>Aroma-Lock Pouch</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] font-medium text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-black/10 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    'Preparing UPI Payment...'
                  ) : (
                    <>
                      <span>Proceed to UPI Payment (₹{finalTotal.toLocaleString('en-IN')})</span>
                      <ArrowRight className="w-4 h-4 text-[#C5A046]" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: DIRECT UPI PAYMENT */}
          {step === 'payment' && currentOrder && (
            <div className="space-y-6">
              {/* Order Amount Bar */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#112D15] to-[#1A3E1F] text-[#FAF8F5] rounded-xl shadow-md border border-[#C5A046]/30">
                <div>
                  <p className="text-[11px] text-[#C5A046] tracking-wider uppercase">Amount to Pay</p>
                  <p className="text-2xl sm:text-3xl font-display font-semibold text-[#FAF8F5]">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-stone-300">Order Reference</p>
                  <p className="font-mono text-xs text-[#E2BF63]">{currentOrder.orderNumber}</p>
                </div>
              </div>

              {/* Mobile 1-Tap UPI Launcher (visible on mobile / small devices) */}
              <div className="block sm:hidden space-y-3">
                <p className="text-xs font-semibold text-[#112D15] flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-[#C5A046]" />
                  Tap to Pay Directly with Installed App
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={upiDeepLink}
                    className="py-3 px-3 bg-white border border-stone-200 hover:border-[#112D15] rounded-xl flex items-center justify-center gap-2 font-medium text-xs text-stone-800 shadow-sm"
                  >
                    <span>Google Pay / PhonePe</span>
                  </a>
                  <a
                    href={upiDeepLink}
                    className="py-3 px-3 bg-white border border-stone-200 hover:border-[#112D15] rounded-xl flex items-center justify-center gap-2 font-medium text-xs text-stone-800 shadow-sm"
                  >
                    <span>Paytm / BHIM / Cred</span>
                  </a>
                </div>
              </div>

              {/* QR Code & Desktop Scan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center bg-white p-5 rounded-xl border border-[#C5A046]/30">
                <div className="flex flex-col items-center text-center">
                  <div className="p-2.5 bg-white border-2 border-[#112D15] rounded-xl shadow-md">
                    <img
                      src={qrCodeUrl}
                      alt="UPI QR Code"
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-[#C5A046]" />
                    Scan with any UPI app (GPay, PhonePe, Paytm, BHIM)
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                      UPI ID / VPA
                    </label>
                    <div className="flex items-center gap-2 bg-[#F3EFEA] p-2.5 rounded-lg border border-stone-300">
                      <span className="font-mono text-xs font-semibold text-[#112D15] flex-1 truncate">
                        {UPI_CONFIG.vpa}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVpa}
                        className="px-2.5 py-1 text-xs bg-white text-[#112D15] border border-stone-300 rounded hover:bg-stone-50 transition-colors flex items-center gap-1"
                      >
                        {copiedVpa ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedVpa ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                      Exact Amount
                    </label>
                    <div className="flex items-center gap-2 bg-[#F3EFEA] p-2.5 rounded-lg border border-stone-300">
                      <span className="font-mono text-xs font-semibold text-[#112D15] flex-1">
                        ₹{finalTotal}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAmount}
                        className="px-2.5 py-1 text-xs bg-white text-[#112D15] border border-stone-300 rounded hover:bg-stone-50 transition-colors flex items-center gap-1"
                      >
                        {copiedAmount ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        {copiedAmount ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 italic">
                    Payee Name: <strong className="text-stone-700">{UPI_CONFIG.payeeName}</strong>
                  </p>
                </div>
              </div>

              {/* Step to Confirm / Enter UTR */}
              <div className="bg-[#F3EFEA] p-4 sm:p-5 rounded-xl border border-[#C5A046]/30 space-y-3 shadow-inner">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#112D15] flex items-center gap-1.5">
                      <span>Enter UPI Reference No. / UTR</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase tracking-wider">
                        Mandatory
                      </span>
                    </label>
                    <span className={`text-[11px] font-mono ${utrInput.length >= 12 ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
                      {utrInput.length >= 12 ? `✓ ${utrInput.length} chars entered` : `${utrInput.length}/12 digits (min)`}
                    </span>
                  </div>

                  <input
                    type="text"
                    maxLength={22}
                    placeholder="e.g. 423589123456 (12–22 characters)"
                    value={utrInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                      setUtrInput(val);
                      if (utrError) setUtrError('');
                    }}
                    className={`w-full px-3.5 py-2.5 text-sm font-mono tracking-wider rounded-lg bg-white border ${
                      utrError
                        ? 'border-red-500 bg-red-50/50 ring-1 ring-red-500'
                        : utrInput.length >= 12
                        ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                        : 'border-[#C5A046]/40 focus:border-[#112D15]'
                    } focus:outline-none transition-all`}
                  />

                  {utrError ? (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      ⚠️ {utrError}
                    </p>
                  ) : (
                    <div className="mt-1.5 space-y-0.5">
                      <p className="text-[11px] text-stone-600 font-medium">
                        Found in your GPay / PhonePe / Paytm / BHIM payment receipt (12–22 digits).
                      </p>
                      <p className="text-[10px] text-stone-500">
                        * Without entering UTR, this order cannot proceed or be verified.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmUtr}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-5 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Verifying & Saving Order...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#C5A046]" />
                        <span>I Have Completed Payment</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && currentOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="label-caps text-emerald-800 text-[0.65rem] tracking-[0.2em] font-semibold">
                  Payment Submitted Successfully
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[#112D15] font-semibold mt-1">
                  Thank You, {currentOrder.customer.fullName}!
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  Your Cardanova spice order is being prepared for dispatch from Idukki, Kerala.
                </p>
              </div>

              <div className="bg-[#F3EFEA] p-4 rounded-xl border border-[#C5A046]/20 text-left text-xs text-stone-700 space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-2 border-b border-black/5">
                  <span className="text-stone-500">Order Reference:</span>
                  <span className="font-mono font-semibold text-[#112D15]">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipping To:</span>
                  <span className="text-right text-[#112D15] font-medium">
                    {currentOrder.customer.city}, {currentOrder.customer.state} ({currentOrder.customer.pincode})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Amount:</span>
                  <span className="font-semibold text-[#112D15]">₹{currentOrder.finalAmountInr}</span>
                </div>
                {currentOrder.upiReferenceUtr && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">UPI Ref:</span>
                    <span className="font-mono text-[#112D15]">{currentOrder.upiReferenceUtr}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleWhatsAppConfirm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Order to Cardanova WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#112D15] text-[#FAF8F5] text-xs font-medium hover:bg-[#1A3E1F] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>

              {/* Cancel Order Section */}
              {!cancelConfirm ? (
                <div className="pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCancelConfirm(true)}
                    className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Cancel this order
                  </button>
                </div>
              ) : (
                <div className="pt-3 border-t border-red-200 bg-red-50 rounded-xl p-4 text-center space-y-3">
                  <p className="text-sm font-semibold text-red-700">Are you sure you want to cancel?</p>
                  <p className="text-xs text-red-600">This cannot be undone. A cancellation notification will be sent to Cardanova.</p>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                      className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {isCancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCancelConfirm(false)}
                      className="px-5 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Keep Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: CANCELLATION CONFIRMED */}
          {step === 'cancelled' && currentOrder && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <X className="w-9 h-9" />
              </div>

              <div>
                <span className="label-caps text-red-700 text-[0.65rem] tracking-[0.2em] font-semibold">
                  Order Cancelled
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-[#112D15] font-semibold mt-1">
                  Your order has been cancelled
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm mt-1">
                  We've notified the Cardanova team. If you already made a UPI payment, please contact us for a refund.
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-left text-xs text-stone-700 space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-2 border-b border-red-100">
                  <span className="text-stone-500">Cancelled Order:</span>
                  <span className="font-mono font-semibold text-red-700">{currentOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Amount:</span>
                  <span className="font-semibold text-stone-700">₹{currentOrder.finalAmountInr}</span>
                </div>
                {currentOrder.upiReferenceUtr && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">UPI Ref (for refund):</span>
                    <span className="font-mono text-stone-700">{currentOrder.upiReferenceUtr}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {/* WhatsApp refund request */}
                <button
                  type="button"
                  onClick={() => {
                    const msg = `Hi Cardanova, I cancelled my order *${currentOrder.orderNumber}* (₹${currentOrder.finalAmountInr}).` +
                      (currentOrder.upiReferenceUtr ? ` UPI Ref: ${currentOrder.upiReferenceUtr}.` : '') +
                      ` Please process my refund. Thank you.`;
                    window.open(`https://wa.me/${UPI_CONFIG.supportWhatsApp}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Request Refund via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#112D15] text-[#FAF8F5] text-xs font-medium hover:bg-[#1A3E1F] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
