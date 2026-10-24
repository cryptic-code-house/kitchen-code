/**
 * DIPJIT'S PHARMA KITCHEN - MAIN SCRIPT
 * UI Interactions, Menu Filtering, Drawer, Feedback Board, Order Checkout & Tracking
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initMobileDrawer();
  initMenuFilters();
  initOrderCheckout();
  initFeedbackSystem();
  initTracker();
  initNewsletter();
  initKitchenLiveWatcher();
});

/* ===================================================================
   1. NAVBAR & SCROLL
   =================================================================== */
function initNavbar() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

/* ===================================================================
   2. MOBILE DRAWER TOGGLE
   =================================================================== */
function initMobileDrawer() {
  const hamburger = document.querySelector(".hamburger");
  const drawer = document.querySelector(".mobile-drawer");
  const backdrop = document.querySelector(".drawer-backdrop");
  const closeBtn = document.querySelector(".drawer-close");

  if (!hamburger || !drawer) return;

  function openDrawer() {
    drawer.classList.add("active");
    if (backdrop) backdrop.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    drawer.classList.remove("active");
    if (backdrop) backdrop.classList.remove("active");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.querySelectorAll(".drawer-link").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });
}

/* ===================================================================
   3. MENU FILTERING & SEARCH
   =================================================================== */
function initMenuFilters() {
  const menuContainer = document.getElementById("menuItemsContainer");
  if (!menuContainer) return;

  const filterBtns = document.querySelectorAll(".filter-btn");
  const searchInput = document.getElementById("menuSearchInput");

  let currentCategory = "all";
  let searchQuery = "";

  function renderMenu() {
    let items = MENU_ITEMS;

    if (currentCategory !== "all") {
      items = items.filter(i => i.category === currentCategory);
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter(i => 
        i.name.toLowerCase().includes(q) || 
        i.desc.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }

    if (items.length === 0) {
      menuContainer.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🧪 🍕</div>
          <h3 style="font-family: var(--font-serif); font-size: 1.8rem; margin-bottom: 8px;">No prescription found</h3>
          <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto 20px;">We couldn't find any dishes matching "${searchQuery}". Try searching for 'kulhad', 'momos', or 'mojito'.</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('menuSearchInput').value=''; document.getElementById('menuSearchInput').dispatchEvent(new Event('input'));">Clear Search</button>
        </div>
      `;
      return;
    }

    menuContainer.innerHTML = items.map(item => {
      const cartQty = window.cartManager.getItemQty(item.id);
      return `
        <div class="dish-card" data-category="${item.category}">
          <div class="dish-img-wrap">
            <img src="${item.image}" alt="${item.name}" class="dish-img" loading="lazy" />
            ${item.tag ? `<span class="dish-tag ${item.tag === "Chef's Special" || item.tag === "Bestseller" ? "special" : ""}">${item.tag}</span>` : ""}
            <div class="veg-badge" title="100% Pure Vegetarian"></div>
          </div>
          <div class="dish-content">
            <div class="dish-title-wrap">
              <h3 class="dish-title">${item.name}</h3>
            </div>
            <p class="dish-desc">${item.desc}</p>
            <div class="dish-footer">
              <div class="dish-price">₹${item.price} <small>/ order</small></div>
              ${cartQty > 0 ? `
                <div class="qty-control">
                  <button class="qty-btn" onclick="updateItemQuantity('${item.id}', ${cartQty - 1})">-</button>
                  <span class="qty-val">${cartQty}</span>
                  <button class="qty-btn" onclick="updateItemQuantity('${item.id}', ${cartQty + 1})">+</button>
                </div>
              ` : `
                <button class="btn btn-primary btn-add-cart" onclick="addItemToCart('${item.id}')">
                  Add to Cart
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      renderMenu();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value;
      renderMenu();
    });
  }

  // Initial render
  renderMenu();

  // Listen to cart changes to re-render quantity buttons
  window.addEventListener("cartUpdated", () => {
    renderMenu();
  });

  // Re-render menu if live Firebase menu data is loaded after initial render
  window.addEventListener("menuLoaded", () => {
    renderMenu();
  });
}

window.addItemToCart = function(id) {
  window.cartManager.addItem(id, 1);
};

window.updateItemQuantity = function(id, qty) {
  window.cartManager.updateQty(id, qty);
};

/* ===================================================================
   4. ORDER & CHECKOUT PAGE
   =================================================================== */
function initOrderCheckout() {
  const checkoutContainer = document.getElementById("checkoutSummary");
  if (!checkoutContainer) return;

  function renderCheckout() {
    const cart = window.cartManager.cart;
    const itemsListEl = document.getElementById("checkoutItemsList");
    const subtotalEl = document.getElementById("summarySubtotal");
    const deliveryEl = document.getElementById("summaryDelivery");
    const packagingEl = document.getElementById("summaryPackaging");
    const discountRowEl = document.getElementById("summaryDiscountRow");
    const discountEl = document.getElementById("summaryDiscount");
    const totalEl = document.getElementById("summaryTotal");
    const emptyNotice = document.getElementById("checkoutEmptyNotice");
    const checkoutContent = document.getElementById("checkoutFormWrapper");

    if (cart.length === 0) {
      if (emptyNotice) emptyNotice.style.display = "block";
      if (checkoutContent) checkoutContent.style.display = "none";
      return;
    }

    if (emptyNotice) emptyNotice.style.display = "none";
    if (checkoutContent) checkoutContent.style.display = "block";

    // City input check
    const cityInput = document.getElementById("custCity");
    const city = cityInput ? cityInput.value : "Udaipur";

    const subtotal = window.cartManager.getSubtotal();
    const delivery = window.cartManager.getDeliveryFee(city);
    const packaging = window.cartManager.getPackagingFee();
    const discount = window.cartManager.getDiscount();
    const total = window.cartManager.getTotal(city);

    if (itemsListEl) {
      itemsListEl.innerHTML = cart.map(item => `
        <div class="cart-item-row">
          <div class="cart-item-info">
            <img src="${item.image}" alt="${item.name}" class="cart-item-thumb" />
            <div>
              <div class="cart-item-name">${item.name}</div>
              <div class="cart-item-price">₹${item.price} each</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <div class="qty-control">
              <button class="qty-btn" onclick="updateItemQuantity('${item.id}', ${item.qty - 1})">-</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" onclick="updateItemQuantity('${item.id}', ${item.qty + 1})">+</button>
            </div>
            <div style="font-family: var(--font-serif); font-weight: 700; width: 60px; text-align: right;">
              ₹${item.price * item.qty}
            </div>
          </div>
        </div>
      `).join("");
    }

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
    if (deliveryEl) {
      if (delivery === 0) {
        deliveryEl.innerHTML = `<span class="badge-free">FREE (Udaipur)</span>`;
      } else {
        deliveryEl.textContent = `₹${delivery}`;
      }
    }
    if (packagingEl) packagingEl.textContent = `₹${packaging}`;

    if (discountRowEl && discountEl) {
      if (discount > 0) {
        discountRowEl.style.display = "flex";
        discountEl.textContent = `-₹${discount}`;
      } else {
        discountRowEl.style.display = "none";
      }
    }

    if (totalEl) totalEl.textContent = `₹${total}`;
  }

  renderCheckout();
  window.addEventListener("cartUpdated", renderCheckout);

  // City change triggers delivery fee update
  const cityInput = document.getElementById("custCity");
  if (cityInput) {
    cityInput.addEventListener("input", (e) => {
      window.cartManager.deliveryCity = e.target.value;
      renderCheckout();
    });
  }

  // Coupon apply handler
  const couponBtn = document.getElementById("applyCouponBtn");
  const couponInput = document.getElementById("couponCodeInput");
  if (couponBtn && couponInput) {
    couponBtn.addEventListener("click", () => {
      const code = couponInput.value;
      if (!code) return;
      const res = window.cartManager.applyCoupon(code);
      window.cartManager.showToast(res.msg, res.success ? "success" : "error");
      renderCheckout();
    });
  }

  // WhatsApp Order Button
  const waBtn = document.getElementById("orderWhatsAppBtn");
  if (waBtn) {
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.cartManager.cart.length === 0) {
        window.cartManager.showToast("Your cart is empty!", "error");
        return;
      }

      const form = document.getElementById("checkoutForm");
      const details = getFormData(form);
      const encodedMsg = window.cartManager.buildWhatsAppMessage(details);
      const waUrl = `https://wa.me/919366727036?text=${encodedMsg}`;
      window.open(waUrl, "_blank");
    });
  }

  // Place Order Checkout Form
  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Check if kitchen is closed by admin
      if (window.kitchenSettings && window.kitchenSettings.isOpen === false) {
        window.cartManager.showToast("Kitchen is currently closed! Orders cannot be placed right now.", "error");
        return;
      }

      if (window.cartManager.cart.length === 0) {
        window.cartManager.showToast("Your cart is empty!", "error");
        return;
      }

      const details = getFormData(checkoutForm);
      if (!details.name || !details.phone) {
        window.cartManager.showToast("Please enter your name and phone number", "error");
        return;
      }

      if (details.orderType !== "Takeaway" && !details.address) {
        window.cartManager.showToast("Please enter your delivery street address", "error");
        return;
      }

      // Build order object
      const city = details.city || "Udaipur";
      const isTakeaway = details.orderType === "Takeaway";
      const newOrder = {
        date: new Date().toISOString(),
        items: [...window.cartManager.cart],
        subtotal: window.cartManager.getSubtotal(),
        delivery: isTakeaway ? 0 : window.cartManager.getDeliveryFee(city),
        packagingFee: window.cartManager.getPackagingFee(),
        discount: window.cartManager.getDiscount(),
        couponCode: window.cartManager.appliedCoupon?.code || "",
        total: isTakeaway ? (window.cartManager.getSubtotal() + window.cartManager.getPackagingFee() - window.cartManager.getDiscount()) : window.cartManager.getTotal(city),
        details: details,
        status: "Confirmed",
        estimatedMins: isTakeaway ? 20 : 30
      };

      // ——— Push to Firebase (syncs to PKN admin dashboard) ———
      if (window.firebaseOrder && window.firebaseOrder.isFirebaseReady()) {
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Placing Order...";
        }

        const result = await window.firebaseOrder.submitOrderToFirestore(newOrder);
        if (result.success) {
          newOrder.id = result.orderId;
          console.log("🔥 Order synced to PKN admin. Firestore ID:", result.orderId);
        } else {
          // If kitchen was closed in the meantime
          if (result.error && result.error.includes("closed")) {
            window.cartManager.showToast(result.error, "error");
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = "⛔ Kitchen Closed";
            }
            return;
          }
          // Fallback to local ID if network fails
          newOrder.id = "DPK-" + Math.floor(100000 + Math.random() * 900000);
          console.warn("Firebase submit failed, using local ID:", newOrder.id);
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Place Order";
        }
      } else {
        // Firebase not configured — generate local ID
        newOrder.id = "DPK-" + Math.floor(100000 + Math.random() * 900000);
      }

      // Save order to localStorage for offline reference
      const orders = JSON.parse(localStorage.getItem("dpk_order_history") || "[]");
      orders.unshift(newOrder);
      localStorage.setItem("dpk_order_history", JSON.stringify(orders));

      // Clear Cart
      window.cartManager.clearCart();

      // Show Order Success Modal
      showOrderSuccessModal(newOrder);
    });
  }
}

function getFormData(form) {
  if (!form) return {};
  const fd = new FormData(form);
  const data = {};
  for (let [key, val] of fd.entries()) {
    data[key] = val;
  }
  // Order type & payment
  const selectedType = document.querySelector('input[name="orderType"]:checked');
  data.orderType = selectedType ? selectedType.value : "Delivery";

  if (data.orderType === "Takeaway") {
    data.address = "Self Takeaway (Pickup at Kitchen)";
    data.landmark = "Kitchen Pickup";
    data.city = "Udaipur";
  }

  // Payment method: Cash on Delivery ONLY
  data.paymentMethod = "Cash on Delivery";

  return data;
}

function initKitchenLiveWatcher() {
  function applyKitchenSettings(settings) {
    const isOpen = settings ? settings.isOpen !== false : true;
    window.kitchenSettings = settings || { isOpen: true };

    // 1. Top Global Announcement Banner across pages
    let banner = document.getElementById("pkGlobalKitchenClosedBanner");
    if (!isOpen) {
      if (!banner) {
        banner = document.createElement("div");
        banner.id = "pkGlobalKitchenClosedBanner";
        banner.style.cssText = `
          background: #b91c1c; color: #ffffff; text-align: center;
          padding: 10px 16px; font-weight: 700; font-size: 0.92rem;
          position: sticky; top: 0; z-index: 10000;
          box-shadow: 0 4px 10px rgba(0,0,0,0.25);
          display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap;
        `;
        document.body.prepend(banner);
      }
      const msg = (settings && settings.closedMessage) ? settings.closedMessage : "We are taking a short prep break. Fresh orders resume soon!";
      const reopen = (settings && settings.reopenAt) ? ` (Reopening at ${settings.reopenAt})` : '';
      banner.innerHTML = `
        <span>🚫 <strong>Kitchen is Currently CLOSED:</strong> ${msg}${reopen}</span>
        <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 800;">Orders Paused</span>
      `;
    } else if (banner) {
      banner.remove();
    }

    // 2. Checkout page controls on order.html
    const checkoutWarning = document.getElementById("checkoutClosedWarning");
    const checkoutMsg = document.getElementById("checkoutClosedMessage");
    const submitBtn = document.getElementById("checkoutSubmitBtn");
    const waBtn = document.getElementById("orderWhatsAppBtn");

    if (checkoutWarning) {
      checkoutWarning.style.display = isOpen ? "none" : "block";
      if (checkoutMsg && settings && settings.closedMessage) {
        checkoutMsg.textContent = settings.closedMessage + (settings.reopenAt ? ` (Reopening at ${settings.reopenAt})` : '');
      }
    }

    if (submitBtn) {
      if (!isOpen) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.55";
        submitBtn.style.cursor = "not-allowed";
        submitBtn.textContent = "⛔ Kitchen Closed — Orders Not Accepted";
      } else {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
        submitBtn.textContent = "Confirm & Place Order 🍕";
      }
    }

    if (waBtn) {
      if (!isOpen) {
        waBtn.disabled = true;
        waBtn.style.opacity = "0.55";
        waBtn.style.cursor = "not-allowed";
      } else {
        waBtn.disabled = false;
        waBtn.style.opacity = "1";
        waBtn.style.cursor = "pointer";
      }
    }
  }

  if (window.firebaseOrder && window.firebaseOrder.listenKitchenStatus) {
    window.firebaseOrder.listenKitchenStatus(applyKitchenSettings);
  }
  window.addEventListener("kitchenStatusChanged", (e) => {
    applyKitchenSettings(e.detail);
  });
}

function showOrderSuccessModal(order) {
  let modal = document.getElementById("orderConfirmationModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "orderConfirmationModal";
    modal.style.cssText = `
      position: fixed; inset: 0; z-index: 10000;
      background: rgba(28, 21, 18, 0.7); backdrop-filter: blur(6px);
      display: flex; align-items: center; justify-content: center; padding: 20px;
    `;
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: #FFFFFF; border: 3px solid var(--border-dark); border-radius: 16px; box-shadow: 8px 8px 0px var(--border-dark); max-width: 540px; width: 100%; padding: 36px; text-align: center; animation: fadeInUp 0.4s ease; max-height: 90vh; overflow-y: auto;">
      <div style="width: 72px; height: 72px; background: var(--accent-green-subtle); border: 2px solid var(--accent-green); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; font-size: 2rem;">
        🩺
      </div>
      <span class="section-tag">Prescription Confirmed!</span>
      <h2 style="font-size: 2rem; margin-bottom: 8px;">Order Placed Successfully!</h2>
      <p style="color: var(--text-secondary); margin-bottom: 20px;">
        Thank you, <strong>${order.details.name}</strong>. Our kitchen lab in Udaipur is preparing your fresh meal right now with hospital-grade sanitization.
      </p>
      
      <div style="background: var(--bg-cream); border: 1.5px dashed var(--border-dark); border-radius: 8px; padding: 16px; text-align: left; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Order ID:</span>
          <strong style="font-family: var(--font-mono); color: var(--accent-red);">${order.id}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Estimated Prep & Delivery:</span>
          <strong>~${order.estimatedMins} Minutes</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
          <span>Payment:</span>
          <strong>${order.details.paymentMethod} (₹${order.total})</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>Delivery Address:</span>
          <strong style="max-width: 260px; text-align: right;">${order.details.address}, Udaipur</strong>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <a href="track.html?orderId=${order.id}" class="btn btn-primary" style="width: 100%;">
          Track Live Status 🛵
        </a>
        <a href="https://wa.me/919366727036?text=Hi%20Dipjit's%20Pharma%20Kitchen,%20I%20just%20placed%20order%20${order.id}!" target="_blank" class="btn btn-secondary" style="width: 100%;">
          Chat on WhatsApp with Kitchen
        </a>
        <button onclick="document.getElementById('orderConfirmationModal').remove(); window.location.href='index.html';" class="btn btn-white btn-sm" style="margin-top: 8px;">
          Back to Home
        </button>
      </div>
    </div>
  `;
}

/* ===================================================================
   5. FEEDBACK REVIEWS SYSTEM
   =================================================================== */
function initFeedbackSystem() {
  const form = document.getElementById("feedbackForm");
  const reviewsContainer = document.getElementById("feedbackReviewsGrid");

  const INITIAL_REVIEWS = [
    {
      name: "Rohan Sharma",
      dish: "Signature Kulhad Pizza",
      rating: 5,
      date: "2 days ago",
      comment: "Best Kulhad Pizza in Udaipur! The clay pot flavor infused into the cheese is unreal. Hygiene is 10/10 as promised.",
      badge: "Verified Foodie"
    },
    {
      name: "Priya Debbarma",
      dish: "Kurkure Veg Momos + Blue Lagoon Mojito",
      rating: 5,
      date: "5 days ago",
      comment: "Super crunchy kurkure momos with spicy red dip and that refreshing blue mojito cured my exam stress! Loved the packaging.",
      badge: "Local Guide"
    },
    {
      name: "Dr. Anirban Roy",
      dish: "Pink Potion Pasta & Cheesy Rx Melt",
      rating: 5,
      date: "1 week ago",
      comment: "As a medical professional, I respect Dipjit's obsession with lab hygiene and pure veg standards. Delicious taste too!",
      badge: "Verified Buyer"
    }
  ];

  function loadReviews() {
    try {
      const stored = localStorage.getItem("dpk_user_reviews");
      const list = stored ? JSON.parse(stored) : [];
      return [...list, ...INITIAL_REVIEWS];
    } catch(e) {
      return INITIAL_REVIEWS;
    }
  }

  function renderReviews() {
    if (!reviewsContainer) return;
    const all = loadReviews();
    reviewsContainer.innerHTML = all.map(r => `
      <div class="testimonial-card">
        <div>
          <div class="review-stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-red); margin-bottom: 8px;">
            Ordered: ${r.dish}
          </div>
          <p class="review-quote">"${r.comment}"</p>
        </div>
        <div class="review-author">
          <div class="author-avatar">${r.name.charAt(0)}</div>
          <div class="author-meta">
            <h5>${r.name}</h5>
            <span>${r.badge || "Verified Customer"} • ${r.date}</span>
          </div>
        </div>
      </div>
    `).join("");
  }

  renderReviews();

  // Star selector logic
  let selectedRating = 5;
  const starIcons = document.querySelectorAll(".star-rating-select .star");
  starIcons.forEach(star => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.val);
      starIcons.forEach(s => {
        const val = parseInt(s.dataset.val);
        if (val <= selectedRating) {
          s.style.color = "#E5A100";
        } else {
          s.style.color = "#D4C7BA";
        }
      });
    });
  });

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("fbName").value;
      const dish = document.getElementById("fbDish").value;
      const comment = document.getElementById("fbComment").value;

      if (!name || !comment) {
        window.cartManager.showToast("Please fill in your name and comments", "error");
        return;
      }

      const newReview = {
        name: name,
        dish: dish || "Pharma Kitchen Special",
        rating: selectedRating,
        date: "Just now",
        comment: comment,
        badge: "Verified Customer"
      };

      const existing = JSON.parse(localStorage.getItem("dpk_user_reviews") || "[]");
      existing.unshift(newReview);
      localStorage.setItem("dpk_user_reviews", JSON.stringify(existing));

      // Also submit to Firebase so PKN admin can see and moderate it
      if (window.firebaseOrder && window.firebaseOrder.isFirebaseReady()) {
        window.firebaseOrder.submitReviewToFirestore(newReview).then(res => {
          if (res.success) console.log("✅ Review synced to Firebase");
        });
      }

      form.reset();
      renderReviews();

      // Show Thank You Box
      const thankYouBox = document.getElementById("feedbackSuccessAlert");
      if (thankYouBox) {
        thankYouBox.style.display = "block";
        thankYouBox.scrollIntoView({ behavior: "smooth" });
      }

      window.cartManager.showToast("Thank you for your valuable feedback! 🩺❤️", "success");
    });
  }
}

/* ===================================================================
   6. LIVE ORDER TRACKER
   =================================================================== */
function initTracker() {
  const trackerWrapper = document.getElementById("orderTrackerDisplay");
  if (!trackerWrapper) return;

  const urlParams = new URLSearchParams(window.location.search);
  const trackId = urlParams.get("orderId") || "DPK-749281";

  const orderIdSpan = document.getElementById("trackOrderIdSpan");
  if (orderIdSpan) orderIdSpan.textContent = trackId;

  // Track search submit
  const searchForm = document.getElementById("trackerSearchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const inputVal = document.getElementById("trackIdInput").value;
      if (inputVal) {
        window.location.search = `?orderId=${encodeURIComponent(inputVal)}`;
      }
    });
  }
}

/* ===================================================================
   7. NEWSLETTER
   =================================================================== */
function initNewsletter() {
  document.querySelectorAll(".newsletter-form").forEach(form => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        // Sync subscriber to Firebase so PKN admin can see it
        if (window.firebaseOrder && window.firebaseOrder.isFirebaseReady()) {
          window.firebaseOrder.subscribeNewsletter(input.value).then(res => {
            if (res.success) console.log("✅ Subscriber synced to Firebase");
          });
        }

        window.cartManager.showToast("Subscribed! Use coupon 'PHARMA15' on your next order.", "success");
        input.value = "";
      }
    });
  });
}
