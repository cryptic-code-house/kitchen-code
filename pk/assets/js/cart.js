/**
 * DIPJIT'S PHARMA KITCHEN - CART & ORDER ENGINE
 * Manages Cart State, LocalStorage, Calculations, Coupons, WhatsApp Orders, and Checkout
 */

const MENU_ITEMS = [
  // Pizzas
  {
    id: "pizza-kulhad",
    name: "Signature Kulhad Pizza",
    category: "pizza",
    price: 399,
    image: "assets/images/hero_kulhad_pizza.jpg",
    desc: "Our iconic clay-pot baked pizza loaded with molten mozzarella, farm veggies, paneer cubes & our secret pharma spice cure.",
    tag: "Bestseller",
    isVeg: true,
    rating: 4.9,
    reviews: 142
  },
  {
    id: "pizza-margherita",
    name: "Classic Margherita Pizza",
    category: "pizza",
    price: 249,
    image: "assets/images/pizza_margherita.jpg",
    desc: "Single dose of pure Italian mozzarella, rich herb-infused tomato sauce, and fresh basil leaves.",
    tag: "Classic",
    isVeg: true,
    rating: 4.7,
    reviews: 89
  },
  {
    id: "pizza-volcano",
    name: "Volcano Paneer Lava Pizza",
    category: "pizza",
    price: 429,
    image: "assets/images/pizza_volcano.jpg",
    desc: "Center crater filled with liquid cheese lava, spicy tandoori paneer, crunchy capsicum & smoked paprika.",
    tag: "Chef's Special",
    isVeg: true,
    rating: 5.0,
    reviews: 64
  },
  {
    id: "pizza-paneer-tandoori",
    name: "Paneer Tandoori Pizza",
    category: "pizza",
    price: 359,
    image: "assets/images/pizza_paneer.jpg",
    desc: "Char-roasted spiced paneer tikka, red onions, crisp capsicum, and a generous layer of mozzarella.",
    tag: "Popular",
    isVeg: true,
    rating: 4.8,
    reviews: 97
  },
  {
    id: "pizza-proposal",
    name: "Proposal Ring Pizza with Chips",
    category: "pizza",
    price: 399,
    image: "assets/images/pizza_volcano.jpg",
    desc: "Special ring crust packed with cheese burst, center served with crispy potato chips & tangy dip.",
    tag: "Special",
    isVeg: true,
    rating: 4.8,
    reviews: 41
  },
  {
    id: "pizza-capsicum-onion",
    name: "Capsicum Onion Pizza",
    category: "pizza",
    price: 269,
    image: "assets/images/pizza_margherita.jpg",
    desc: "Fresh diced green bell peppers, crunchy red onions, melted cheese on our signature thin-crust base.",
    tag: "Everyday",
    isVeg: true,
    rating: 4.6,
    reviews: 58
  },

  // Momos
  {
    id: "momo-veg-kurkure",
    name: "Veg Kurkure Momos (6 Pcs)",
    category: "momos",
    price: 130,
    image: "assets/images/momos_special.jpg",
    desc: "Coated in ultra-crispy golden kurkure crust, deep fried to perfection. Served with spicy garlic chutney & dip.",
    tag: "Trending",
    isVeg: true,
    rating: 4.9,
    reviews: 120
  },
  {
    id: "momo-veg-steamed",
    name: "Veg Steamed Momos (6 Pcs)",
    category: "momos",
    price: 90,
    image: "assets/images/momos_steamed.jpg",
    desc: "Thin transculent dumpling wrappers filled with delicately seasoned shredded cabbage, carrots, onion & ginger.",
    tag: "Healthy",
    isVeg: true,
    rating: 4.8,
    reviews: 110
  },
  {
    id: "momo-paneer-fried",
    name: "Paneer Fried Momos (6 Pcs)",
    category: "momos",
    price: 130,
    image: "assets/images/momos_kurkure.jpg",
    desc: "Golden fried dumplings stuffed with creamy spiced cottage cheese and herbs. Absolute crowd favorite.",
    tag: "Rich",
    isVeg: true,
    rating: 4.8,
    reviews: 78
  },
  {
    id: "momo-cheese-corn-kurkure",
    name: "Cheese Corn Kurkure Momos",
    category: "momos",
    price: 160,
    image: "assets/images/momos_special.jpg",
    desc: "Ooey gooey mozzarella and sweet corn kernels wrapped and fried with an explosive crunchy outer layer.",
    tag: "Must Try",
    isVeg: true,
    rating: 4.9,
    reviews: 95
  },

  // Beverages
  {
    id: "bev-blue-lagoon",
    name: "Blue Lagoon Mojito",
    category: "beverages",
    price: 79,
    image: "assets/images/blue_lagoon_mojito.jpg",
    desc: "Electric curaçao syrup, crushed mint, freshly squeezed lime, and effervescent soda over cracked ice.",
    tag: "Signature Sip",
    isVeg: true,
    rating: 4.9,
    reviews: 165
  },
  {
    id: "bev-virgin-mojito",
    name: "Classic Virgin Mojito",
    category: "beverages",
    price: 69,
    image: "assets/images/blue_lagoon_mojito.jpg",
    desc: "Zesty garden lime muddled with fresh mint sprigs, pure cane sweetness, and chilled sparkling soda.",
    tag: "Refreshing",
    isVeg: true,
    rating: 4.7,
    reviews: 73
  },
  {
    id: "bev-lemonade",
    name: "Pharma Lemonade Mojito",
    category: "beverages",
    price: 60,
    image: "assets/images/blue_lagoon_mojito.jpg",
    desc: "Our budget thirst quencher with a punch of vitamin C, black salt, and bubbling crisp soda.",
    tag: "Best Value",
    isVeg: true,
    rating: 4.6,
    reviews: 82
  },

  // Snacks & Emergency
  {
    id: "snack-peri-fries",
    name: "Peri Peri Masala Fries",
    category: "snacks",
    price: 119,
    image: "assets/images/fries_periperi.jpg",
    desc: "Crispy skin-on potato fries tossed in our fiery house-blended peri peri spice elixir. Served with mayo dip.",
    tag: "Crispy",
    isVeg: true,
    rating: 4.8,
    reviews: 92
  },
  {
    id: "snack-sweet-corn",
    name: "Classic Butter Sweetcorn Cup",
    category: "snacks",
    price: 79,
    image: "assets/images/sweet_corn.jpg",
    desc: "Steamed sweet corn kernels bathed in Amul butter, cracked black pepper and Himalayan pink salt.",
    tag: "Comfort",
    isVeg: true,
    rating: 4.7,
    reviews: 64
  },
  {
    id: "snack-zingy-parcel",
    name: "Paneer Loaded Zingy Parcel",
    category: "snacks",
    price: 149,
    image: "assets/images/sandwich_cheese.jpg",
    desc: "Folded golden pastry pouch stuffed with marinated paneer, harissa garlic sauce and cheddar cheese.",
    tag: "Hot & Cheesy",
    isVeg: true,
    rating: 4.8,
    reviews: 53
  },
  {
    id: "pasta-pink-potion",
    name: "Pink Potion Pasta",
    category: "snacks",
    price: 199,
    image: "assets/images/pasta_pink.jpg",
    desc: "Penne pasta tossed in our delicate harmony of tangy arrabbiata and velvety alfredo cream sauce.",
    tag: "Chef's Rx",
    isVeg: true,
    rating: 4.8,
    reviews: 49
  },
  {
    id: "sandwich-cheesy-rx",
    name: "Cheesy Rx Melt Sandwich",
    category: "snacks",
    price: 149,
    image: "assets/images/sandwich_cheese.jpg",
    desc: "Triple layered butter toasted artisan bread stuffed with mozzarella, cheddar, herb veggies and secret seasoning.",
    tag: "Filling",
    isVeg: true,
    rating: 4.8,
    reviews: 61
  },
  {
    id: "dessert-nutella-doracake",
    name: "Nutella Doracake (2 Pcs)",
    category: "snacks",
    price: 129,
    image: "assets/images/doracake_nutella.jpg",
    desc: "Fluffy Japanese honey pancakes sandwiched with thick melted Nutella hazelnut spread.",
    tag: "Sweet Cure",
    isVeg: true,
    rating: 4.9,
    reviews: 88
  }
];

class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.appliedCoupon = JSON.parse(localStorage.getItem("dpk_coupon")) || null;
    this.deliveryCity = localStorage.getItem("dpk_city") || "Udaipur";
  }

  loadCart() {
    try {
      const stored = localStorage.getItem("dpk_cart");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart() {
    localStorage.setItem("dpk_cart", JSON.stringify(this.cart));
    this.updateBadges();
  }

  addItem(itemId, qty = 1) {
    const item = MENU_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const existing = this.cart.find(i => i.id === itemId);
    if (existing) {
      existing.qty += qty;
    } else {
      this.cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        qty: qty
      });
    }

    this.saveCart();
    this.showToast(`Added ${item.name} to cart!`, "success");
    this.triggerCartUpdate();
  }

  updateQty(itemId, newQty) {
    if (newQty <= 0) {
      this.removeItem(itemId);
      return;
    }
    const item = this.cart.find(i => i.id === itemId);
    if (item) {
      item.qty = newQty;
      this.saveCart();
      this.triggerCartUpdate();
    }
  }

  removeItem(itemId) {
    const item = this.cart.find(i => i.id === itemId);
    const itemName = item ? item.name : "Item";
    this.cart = this.cart.filter(i => i.id !== itemId);
    this.saveCart();
    this.showToast(`Removed ${itemName} from cart`, "error");
    this.triggerCartUpdate();
  }

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    localStorage.removeItem("dpk_coupon");
    this.saveCart();
    this.triggerCartUpdate();
  }

  getItemQty(itemId) {
    const item = this.cart.find(i => i.id === itemId);
    return item ? item.qty : 0;
  }

  getSubtotal() {
    return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  getDeliveryFee(city = this.deliveryCity) {
    if (this.cart.length === 0) return 0;
    // FREE for takeaway!
    const typeRadio = document.querySelector('input[name="orderType"]:checked');
    if (typeRadio && typeRadio.value.toLowerCase() === 'takeaway') {
      return 0;
    }
    // FREE for Udaipur!
    if (!city || city.toLowerCase().trim().includes("udaipur")) {
      return 0;
    }
    return 89;
  }

  getPackagingFee() {
    return this.cart.length > 0 ? 20 : 0;
  }

  applyCoupon(code) {
    const clean = code.toUpperCase().trim();
    if (clean === "KULHAD3") {
      // Check if cart has 3 kulhad pizzas or general combo
      const kulhadItem = this.cart.find(i => i.id === "pizza-kulhad");
      if (kulhadItem && kulhadItem.qty >= 3) {
        this.appliedCoupon = { code: "KULHAD3", discount: (399 * 3) - 799, desc: "Special 3 Kulhad Pizzas for ₹799" };
      } else {
        return { success: false, msg: "Add at least 3 Kulhad Pizzas to use KULHAD3 combo!" };
      }
    } else if (clean === "PHARMA15" || clean === "FIRST15") {
      const discount = Math.round(this.getSubtotal() * 0.15);
      this.appliedCoupon = { code: clean, discount: Math.min(discount, 150), desc: "15% Welcome Discount (Max ₹150)" };
    } else if (clean === "FREEDEL") {
      this.appliedCoupon = { code: "FREEDEL", discount: 89, desc: "Free Delivery applied" };
    } else {
      return { success: false, msg: "Invalid coupon code. Try 'PHARMA15' or 'KULHAD3'" };
    }

    localStorage.setItem("dpk_coupon", JSON.stringify(this.appliedCoupon));
    this.triggerCartUpdate();
    return { success: true, msg: `Coupon ${clean} applied successfully!` };
  }

  removeCoupon() {
    this.appliedCoupon = null;
    localStorage.removeItem("dpk_coupon");
    this.triggerCartUpdate();
  }

  getDiscount() {
    if (!this.appliedCoupon) return 0;
    return this.appliedCoupon.discount || 0;
  }

  getTotal(city = this.deliveryCity) {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const delivery = this.getDeliveryFee(city);
    const packaging = this.getPackagingFee();
    const discount = this.getDiscount();
    return Math.max(0, subtotal + delivery + packaging - discount);
  }

  updateBadges() {
    const count = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = this.getSubtotal();

    document.querySelectorAll(".cart-badge").forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? "flex" : "none";
    });

    document.querySelectorAll(".mobile-cart-total").forEach(el => {
      el.textContent = `₹${subtotal}`;
    });

    document.querySelectorAll(".mobile-cart-bar").forEach(bar => {
      if (count > 0) {
        bar.style.display = "flex";
      } else {
        bar.style.display = "none";
      }
    });
  }

  triggerCartUpdate() {
    window.dispatchEvent(new CustomEvent("cartUpdated", { detail: { cart: this.cart } }));
  }

  showToast(message, type = "success") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-size: 1.2rem;">${type === "success" ? "✓" : "✕"}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  buildWhatsAppMessage(customerDetails) {
    const isTakeaway = (customerDetails.orderType || "").toLowerCase() === "takeaway";
    const deliveryFee = isTakeaway ? 0 : this.getDeliveryFee(customerDetails.city || this.deliveryCity);
    const packaging = this.getPackagingFee();
    const discount = this.getDiscount();
    const total = this.getTotal(customerDetails.city || this.deliveryCity);

    let msg = `*NEW ORDER - DIPJIT'S PHARMA KITCHEN*\n`;
    msg += `----------------------------------------\n`;
    msg += `*Customer:* ${customerDetails.name || "Guest"}\n`;
    msg += `*Phone:* ${customerDetails.phone || "Not specified"}\n`;
    msg += `*Type:* ${isTakeaway ? "Self Takeaway (Pickup at Kitchen)" : "Home Delivery"}\n`;
    if (isTakeaway) {
      msg += `*Pickup At:* Dipjit's Pharma Kitchen, Udaipur, Tripura\n`;
    } else {
      msg += `*Address:* ${customerDetails.address || "Udaipur"}, Landmark: ${customerDetails.landmark || "N/A"}\n`;
    }
    msg += `*Timing:* ${customerDetails.deliveryTime || "ASAP (25-35 mins)"}\n`;
    if (customerDetails.notes) {
      msg += `*Special Note:* ${customerDetails.notes}\n`;
    }
    msg += `----------------------------------------\n`;
    msg += `*ITEMS ORDERED:*\n`;
    this.cart.forEach((i, idx) => {
      msg += `${idx + 1}. ${i.name} x ${i.qty} = ₹${i.price * i.qty}\n`;
    });
    msg += `----------------------------------------\n`;
    msg += `Subtotal: ₹${subtotal}\n`;
    msg += `Delivery Fee: ${isTakeaway ? "FREE (Takeaway)" : (deliveryFee === 0 ? "FREE (Udaipur)" : "₹" + deliveryFee)}\n`;
    msg += `Hygienic Packaging: ₹${packaging}\n`;
    if (discount > 0) {
      msg += `Discount (${this.appliedCoupon?.code}): -₹${discount}\n`;
    }
    msg += `*GRAND TOTAL: ₹${total}*\n`;
    msg += `*Payment Mode:* Cash on Delivery (COD)\n`;
    msg += `----------------------------------------\n`;
    msg += `Please confirm my order & prescription! 🍕🩺`;

    return encodeURIComponent(msg);
  }
}

// Global instance
window.cartManager = new CartManager();

document.addEventListener("DOMContentLoaded", async () => {
  window.cartManager.updateBadges();

  // Try to load live menu from Firebase (managed by PKN admin dashboard)
  // Falls back to hardcoded MENU_ITEMS above if Firebase is unavailable
  if (window.firebaseOrder && window.firebaseOrder.isFirebaseReady()) {
    try {
      const liveMenu = await window.firebaseOrder.fetchMenuFromFirestore();
      if (liveMenu && liveMenu.length > 0) {
        // Replace hardcoded menu with live Firestore data
        MENU_ITEMS.length = 0;
        liveMenu.forEach(item => MENU_ITEMS.push(item));
        console.log("🔥 Live menu loaded from Firestore:", MENU_ITEMS.length, "items");
        window.dispatchEvent(new Event("menuLoaded"));
      }
    } catch (err) {
      console.warn("Menu fetch from Firestore failed, using hardcoded menu:", err);
    }
  }
});
