import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [utrInput, setUtrInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<DomesticOrder | null>(null);

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
    if (isOpen) {
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
  }, [isOpen, orderItems, subtotal, shippingFee, finalTotal]);

  if (!isOpen || orderItems.length === 0) return null;

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CustomerShippingDetails, string>> = {};
    if (!shipping.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!shipping.phone.trim() || !/^\d{10}$/.test(shipping.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone/WhatsApp number';
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

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
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

    await domesticService.createOrder(orderData);
    setCurrentOrder(orderData);
    setIsSubmitting(false);
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

  const handleConfirmUtr = async () => {
    if (!currentOrder) return;
    const cleanUtr = utrInput.trim();

    // Mandatory UTR check: Must be between 12 and 22 characters
    if (!cleanUtr) {
      setUtrError('Please enter your UPI Reference / UTR number to complete the order.');
      return;
    }

    if (cleanUtr.length < 12 || cleanUtr.length > 22) {
      setUtrError('UPI Reference / UTR number must be between 12 and 22 characters.');
      return;
    }

    setUtrError('');
    setIsSubmitting(true);
    await domesticService.updateOrderUtr(currentOrder.orderNumber, cleanUtr);
    
    const completedOrder: DomesticOrder = {
      ...currentOrder,
      upiReferenceUtr: cleanUtr,
      paymentStatus: 'paid',
    };
    setCurrentOrder(completedOrder);
    setIsSubmitting(false);
    setStep('success');
    if (onOrderSuccess) onOrderSuccess(completedOrder);
  };

  const handleWhatsAppConfirm = () => {
    if (!currentOrder) return;
    const itemList = currentOrder.items
      .map((i) => `• ${i.productName} (${i.weight}) x ${i.quantity} = ₹${i.totalPriceInr}`)
      .join('\n');

    const msg = `*NEW CARDANOVA DOMESTIC ORDER*\n\n` +
      `*Order ID:* ${currentOrder.orderNumber}\n` +
      `*Total Amount:* ₹${currentOrder.finalAmountInr}\n` +
      (utrInput ? `*UPI Ref / UTR:* ${utrInput}\n` : '') +
      `\n*Items:*\n${itemList}\n\n` +
      `*Deliver To:*\n` +
      `Name: ${currentOrder.customer.fullName}\n` +
      `Phone: ${currentOrder.customer.phone}\n` +
      `Address: ${currentOrder.customer.addressLine}, ${currentOrder.customer.city}, ${currentOrder.customer.state} - ${currentOrder.customer.pincode}\n\n` +
      `I have completed the UPI payment. Please verify and confirm dispatch!`;

    const url = `https://wa.me/${UPI_CONFIG.supportWhatsApp}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      style={{ backgroundColor: 'rgba(7, 19, 9, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.25 }}
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
              <div className="bg-[#F3EFEA] p-4 rounded-xl border border-[#C5A046]/20 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#112D15] mb-1">
                    Enter UPI Reference No. / UTR <span className="text-red-600">*</span> (12–22 digits)
                  </label>
                  <input
                    type="text"
                    maxLength={22}
                    placeholder="e.g. 423589123456"
                    value={utrInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      setUtrInput(val);
                      if (utrError) setUtrError('');
                    }}
                    className={`w-full px-3.5 py-2 text-sm font-mono rounded-lg bg-white border ${
                      utrError ? 'border-red-500 bg-red-50/50' : 'border-[#C5A046]/30 focus:border-[#112D15]'
                    } focus:outline-none`}
                  />
                  {utrError ? (
                    <p className="text-[11px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                      ⚠️ {utrError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-500 mt-1">
                      Found in your UPI app payment receipt after completing the transfer (12 to 22 characters required).
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmUtr}
                    disabled={isSubmitting}
                    className="py-3 px-4 rounded-xl bg-[#112D15] hover:bg-[#1A3E1F] text-[#FAF8F5] font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#C5A046]" />
                    <span>I Have Completed Payment</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppConfirm}
                    className="py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Confirm via WhatsApp</span>
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
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
