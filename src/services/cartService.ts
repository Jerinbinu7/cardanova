import { DomesticOrderItem, WeightOption } from '../types/domestic';

const CART_STORAGE_KEY = 'cardanova_shop_cart';

export function getCartItems(): DomesticOrderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: DomesticOrderItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('cardanova_cart_updated', { detail: items }));
  } catch (e) {
    console.warn('Failed to save cart:', e);
  }
}

export function addToCart(item: DomesticOrderItem): DomesticOrderItem[] {
  const current = getCartItems();
  const existingIdx = current.findIndex(
    (i) => i.productId === item.productId && i.weight === item.weight
  );
  let updated: DomesticOrderItem[];
  if (existingIdx > -1) {
    updated = [...current];
    const newQty = updated[existingIdx].quantity + item.quantity;
    updated[existingIdx] = {
      ...updated[existingIdx],
      quantity: newQty,
      totalPriceInr: updated[existingIdx].unitPriceInr * newQty,
    };
  } else {
    updated = [...current, item];
  }
  saveCartItems(updated);
  return updated;
}

export function updateCartQuantity(
  productId: string,
  weight: WeightOption,
  delta: number
): DomesticOrderItem[] {
  const current = getCartItems();
  const updated = current
    .map((item) => {
      if (item.productId === productId && item.weight === weight) {
        const nextQty = item.quantity + delta;
        if (nextQty <= 0) return null;
        return {
          ...item,
          quantity: nextQty,
          totalPriceInr: item.unitPriceInr * nextQty,
        };
      }
      return item;
    })
    .filter(Boolean) as DomesticOrderItem[];
  saveCartItems(updated);
  return updated;
}

export function removeFromCart(productId: string, weight: WeightOption): DomesticOrderItem[] {
  const current = getCartItems();
  const updated = current.filter(
    (item) => !(item.productId === productId && item.weight === weight)
  );
  saveCartItems(updated);
  return updated;
}

export function clearCart() {
  saveCartItems([]);
}
