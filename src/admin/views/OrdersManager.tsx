import { useEffect, useState } from 'react';
import { ShoppingBag, RefreshCw, CheckCircle2, Clock, Truck, Phone, MapPin, Hash, Search, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { domesticService } from '../../services/domesticService';
import type { DomesticOrder, DomesticOrderItem } from '../../types/domestic';
import { supabase } from '../../lib/supabase';
import { SkeletonRow } from '../components/Skeleton';

export default function OrdersManager() {
  const [orders, setOrders] = useState<DomesticOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<DomesticOrder | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [trackingInput, setTrackingInput] = useState<string>('');

  const loadOrders = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const fetched = await domesticService.fetchAllOrders();
      setOrders(fetched);
    } catch (err: any) {
      const msg = err.message || 'Failed to load orders';
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    // Subscribe to realtime order updates
    const channel = supabase
      .channel('admin-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'domestic_orders' }, () => {
        toast('New order status change!', { icon: '🔔' });
        loadOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateStatus = async (orderNumber: string, orderStatus: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      const ok = await domesticService.updateOrderStatus(orderNumber, {
        orderStatus,
        ...(paymentStatus ? { paymentStatus } : {}),
      });
      if (ok) {
        toast.success(`Order ${orderNumber} updated to ${orderStatus}`);
        setOrders((prev: DomesticOrder[]) =>
          prev.map((o: DomesticOrder) =>
            o.orderNumber === orderNumber
              ? { ...o, orderStatus: orderStatus as any, ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {}) }
              : o
          )
        );
        if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder({
            ...selectedOrder,
            orderStatus: orderStatus as any,
            ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {}),
          });
        }
      } else {
        toast.error('Failed to update status in database');
      }
    } catch (e: any) {
      toast.error(e.message || 'Error updating order');
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTracking = async (orderNumber: string) => {
    if (!trackingInput.trim()) return;
    setUpdating(true);
    try {
      const ok = await domesticService.updateOrderStatus(orderNumber, {
        courierTrackingNumber: trackingInput.trim(),
        orderStatus: 'dispatched',
      });
      if (ok) {
        toast.success(`Tracking number added & marked as Dispatched!`);
        loadOrders();
        if (selectedOrder) {
          setSelectedOrder({
            ...selectedOrder,
            courierTrackingNumber: trackingInput.trim(),
            orderStatus: 'dispatched',
          });
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o: DomesticOrder) => {
    const matchesFilter = filterStatus === 'all' || o.orderStatus === filterStatus || o.paymentStatus === filterStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.includes(q) ||
      (o.upiReferenceUtr && o.upiReferenceUtr.includes(q));
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (paymentStatus: string, orderStatus: string) => {
    if (paymentStatus === 'paid' && orderStatus === 'delivered') {
      return <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
    }
    if (paymentStatus === 'paid' && (orderStatus === 'dispatched' || orderStatus === 'shipped')) {
      return <span className="px-2.5 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-500/40 text-xs flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Dispatched</span>;
    }
    if (paymentStatus === 'paid' || orderStatus === 'confirmed') {
      return <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Paid & Confirmed</span>;
    }
    return <span className="px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending UTR Check</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-[#0D2012]/80 p-4 sm:p-6 rounded-2xl border border-[#C5A046]/30 shadow-xl">
        <div>
          <h2 className="text-xl font-light text-[#FAF8F5] flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#C5A046]" />
            Domestic Store Orders
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Verify UPI UTR transaction numbers, confirm payments, and update courier tracking
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#071309] border border-[#C5A046]/30 text-xs text-gray-300 hover:text-white hover:border-[#C5A046] transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#C5A046] ${loading ? 'animate-spin' : ''}`} />
          Refresh Orders
        </button>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-300">Failed to load orders</p>
            <p className="text-xs text-red-400/80 font-mono">{fetchError}</p>
            <p className="text-xs text-gray-400 mt-2">
              This is usually a <strong className="text-amber-300">Supabase RLS policy</strong> issue.
              Go to your Supabase Dashboard → Table Editor → <code className="bg-black/30 px-1 rounded">domestic_orders</code> → Policies,
              and add a SELECT policy allowing authenticated users (admins) to read all rows.
            </p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone, or UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D2012]/60 border border-[#C5A046]/20 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C5A046]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending_verification', label: 'Pending UTR' },
            { id: 'paid', label: 'Paid / Confirmed' },
            { id: 'shipped', label: 'Shipped' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#C5A046] text-[#071309] font-medium shadow-md'
                  : 'bg-[#0D2012]/60 border border-[#C5A046]/20 text-gray-300 hover:border-[#C5A046]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#0D2012]/80 border border-[#C5A046]/30 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#071309] text-[#C5A046] uppercase tracking-wider text-[10px] border-b border-[#C5A046]/20">
              <tr>
                <th className="px-4 py-3.5">Order ID & Date</th>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Items</th>
                <th className="px-4 py-3.5">Total Amount</th>
                <th className="px-4 py-3.5">UPI UTR Ref</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C5A046]/10 text-gray-300">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-3">
                      <SkeletonRow />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No orders found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order: DomesticOrder) => (
                  <tr key={order.orderNumber} className="hover:bg-[#071309]/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-medium text-white">{order.orderNumber}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'Just now'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-white">{order.customer.fullName}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#C5A046]" /> {order.customer.phone}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 max-w-[200px]">
                      {order.items?.map((it: DomesticOrderItem, idx: number) => (
                        <div key={idx} className="truncate text-gray-300">
                          {it.quantity}x {it.productName} ({it.weight})
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-emerald-400 font-semibold">
                      ₹{order.finalAmountInr.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5">
                      {order.upiReferenceUtr ? (
                        <span className="font-mono text-amber-300 bg-amber-950/60 px-2 py-1 rounded border border-amber-500/30">
                          {order.upiReferenceUtr}
                        </span>
                      ) : (
                        <span className="text-gray-500 italic">Not entered</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(order.paymentStatus, order.orderStatus)}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setTrackingInput(order.courierTrackingNumber || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#C5A046]/10 border border-[#C5A046]/30 text-xs text-[#C5A046] hover:bg-[#C5A046] hover:text-[#071309] transition-all cursor-pointer"
                      >
                        View & Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D2012] border border-[#C5A046]/40 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 text-white shadow-2xl">
            <div className="flex justify-between items-start border-b border-[#C5A046]/20 pb-4">
              <div>
                <h3 className="text-lg font-light text-[#FAF8F5]">Order #{selectedOrder.orderNumber}</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('en-IN') : 'Recently'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg bg-gray-800/50 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* UTR Verification Section */}
            <div className="bg-[#071309] border border-[#C5A046]/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#C5A046] uppercase tracking-wider font-medium flex items-center gap-1.5">
                  <Hash className="w-4 h-4" /> Customer Submitted UTR / Ref
                </span>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950 px-2.5 py-1 rounded border border-amber-500/40">
                  {selectedOrder.upiReferenceUtr || 'No UTR provided yet'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Verify this 12-digit UTR and ₹{selectedOrder.finalAmountInr} in your GPay / PhonePe / ICICI Bank app before confirming.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selectedOrder.paymentStatus !== 'paid' && (
                  <button
                    disabled={updating}
                    onClick={() => handleUpdateStatus(selectedOrder.orderNumber, 'confirmed', 'paid')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Payment & Order
                  </button>
                )}
                <a
                  href={`https://wa.me/91${selectedOrder.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hi ${selectedOrder.customer.fullName}, regarding your Cardanova Order #${selectedOrder.orderNumber}...`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Phone className="w-4 h-4" /> Contact Customer on WhatsApp
                </a>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-[#071309]/50 p-4 rounded-xl border border-[#C5A046]/15">
              <div>
                <span className="text-[#C5A046] font-medium block mb-1">Customer Info</span>
                <p className="font-semibold text-white">{selectedOrder.customer.fullName}</p>
                <p className="text-gray-300 mt-0.5">📞 {selectedOrder.customer.phone}</p>
                {selectedOrder.customer.email && <p className="text-gray-400 mt-0.5">✉️ {selectedOrder.customer.email}</p>}
              </div>
              <div>
                <span className="text-[#C5A046] font-medium block mb-1">Shipping Address</span>
                <p className="text-gray-300 leading-relaxed">
                  <MapPin className="w-3.5 h-3.5 text-[#C5A046] inline mr-1" />
                  {selectedOrder.customer.addressLine}, {selectedOrder.customer.city}, {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <span className="text-xs text-[#C5A046] uppercase tracking-wider font-medium block mb-2">Order Items</span>
              <div className="border border-[#C5A046]/20 rounded-xl overflow-hidden text-xs">
                {selectedOrder.items?.map((item: DomesticOrderItem, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-[#071309]/60 border-b border-[#C5A046]/10 last:border-0">
                    <div>
                      <p className="font-medium text-white">{item.productName}</p>
                      <p className="text-[11px] text-gray-400">Pack: {item.weight} x {item.quantity}</p>
                    </div>
                    <span className="font-mono text-emerald-400">₹{item.totalPriceInr}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Courier Tracking Section */}
            <div className="bg-[#071309] border border-[#C5A046]/30 p-4 rounded-xl space-y-3">
              <span className="text-xs text-[#C5A046] uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Truck className="w-4 h-4" /> Dispatch & Courier Tracking
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. DTDC / BlueDart AWB #12345678"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="flex-1 bg-[#0D2012] border border-[#C5A046]/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#C5A046]"
                />
                <button
                  disabled={updating || !trackingInput.trim()}
                  onClick={() => handleSaveTracking(selectedOrder.orderNumber)}
                  className="px-4 py-2 bg-[#C5A046] text-[#071309] rounded-xl text-xs font-semibold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Save & Mark Shipped
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
