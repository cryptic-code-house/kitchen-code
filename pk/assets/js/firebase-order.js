// ============================================================
// PK → PKN Bridge: Submit customer orders to shared Firestore
// and enable real-time order tracking + dynamic menu loading
// Works 100% on file:// (double-click) and http/https!
// ============================================================

(function () {
  'use strict';

  function getDb() {
    if (window.firebaseDb) return window.firebaseDb;
    if (typeof firebase !== 'undefined') {
      if (!firebase.apps || !firebase.apps.length) {
        if (window.firebaseConfig) {
          firebase.initializeApp(window.firebaseConfig);
        }
      }
      if (firebase.apps && firebase.apps.length) {
        window.firebaseDb = firebase.firestore();
        return window.firebaseDb;
      }
    }
    return null;
  }

  function isFirebaseReady() {
    return getDb() !== null;
  }

  /**
   * Submit an order to Firestore so it appears on PKN's Live Orders Kanban.
   */
  async function submitOrderToFirestore(orderData) {
    const db = getDb();
    if (!db) {
      console.warn("Firebase not ready. Order saved locally.");
      return { success: false, error: "Firebase not ready" };
    }

    // Check if kitchen is closed by admin
    if (window.kitchenSettings && window.kitchenSettings.isOpen === false) {
      console.warn("Kitchen is currently closed. Cannot submit order.");
      return { success: false, error: "Kitchen is currently closed. Orders cannot be placed right now." };
    }

    try {
      const isTakeaway = (orderData.details.orderType || "").toLowerCase() === "takeaway";
      const orderDoc = {
        // Customer details
        customerName:    orderData.details.name || "Guest",
        customerPhone:   orderData.details.phone || "",
        customerEmail:   orderData.details.email || "",
        deliveryAddress: isTakeaway ? "Self Takeaway (Pickup at Kitchen)" : (orderData.details.address || "Udaipur"),
        landmark:        isTakeaway ? "Kitchen Pickup" : (orderData.details.landmark || ""),
        city:            orderData.details.city || "Udaipur",

        // Order details
        items: (orderData.items || []).map(item => ({
          id:    item.id,
          name:  item.name,
          price: item.price,
          qty:   item.qty,
          image: item.image || ""
        })),
        subtotal:      orderData.subtotal,
        deliveryFee:   isTakeaway ? 0 : (orderData.delivery || 0),
        packagingFee:  orderData.packagingFee || 20,
        discount:      orderData.discount || 0,
        couponCode:    orderData.couponCode || "",
        total:         orderData.total,

        // Order meta - COD ONLY
        orderType:     isTakeaway ? "Takeaway" : "Delivery",
        paymentMethod: "Cash on Delivery",
        specialNotes:  orderData.details.notes || "",
        deliveryTime:  orderData.details.deliveryTime || "ASAP",
        status:        "new",                    // PKN Kanban picks this up immediately
        source:        "website",
        createdAt:     firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt:     firebase.firestore.FieldValue.serverTimestamp(),

        // Status history for live tracking
        statusHistory: [{
          status: "new",
          timestamp: new Date().toISOString(),
          note: "Order placed via website"
        }]
      };

      const docRef = await db.collection("orders").add(orderDoc);
      console.log("✅ Order submitted to Live Firestore:", docRef.id);
      return { success: true, orderId: docRef.id };
    } catch (error) {
      console.error("❌ Failed to submit order to Firestore:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Listen to real-time status changes for a specific order (for track.html).
   */
  function trackOrderRealtime(orderId, callback) {
    const db = getDb();
    if (!db) {
      console.warn("Firebase not ready for tracking.");
      callback(null);
      return function () {};
    }

    return db.collection("orders").doc(orderId).onSnapshot(function (docSnap) {
      if (docSnap.exists) {
        callback({ id: docSnap.id, ...docSnap.data() });
      } else {
        callback(null);
      }
    }, function (error) {
      console.error("Tracking listener error:", error);
      callback(null);
    });
  }

  /**
   * Fetch live menu from Firestore (dishes collection managed by PKN admin).
   */
  async function fetchMenuFromFirestore() {
    const db = getDb();
    if (!db) return null;
    try {
      const snapshot = await db.collection("dishes").get();
      const items = [];
      snapshot.forEach(function (docSnap) {
        const d = docSnap.data();
        if (d.available !== false && d.visible !== false) {
          items.push({
            id:       docSnap.id,
            name:     d.name || "Special Dish",
            category: d.category || "snacks",
            price:    d.price || 0,
            image:    d.imageUrl || d.image || "assets/images/default_dish.jpg",
            desc:     d.description || "",
            tag:      d.tag || "",
            isVeg:    d.isVeg !== false,
            rating:   d.rating || 4.8,
            reviews:  d.reviewCount || 10
          });
        }
      });
      return items.length > 0 ? items : null;
    } catch (error) {
      console.warn("Could not fetch menu from Firestore:", error);
      return null;
    }
  }

  /**
   * Submit a customer review to Firestore.
   */
  async function submitReviewToFirestore(reviewData) {
    const db = getDb();
    if (!db) return { success: false };
    try {
      await db.collection("reviews").add({
        name:      reviewData.name,
        dish:      reviewData.dish || "Pharma Kitchen Special",
        rating:    reviewData.rating || 5,
        comment:   reviewData.comment,
        badge:     "Verified Customer",
        approved:  true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Review submit error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Submit a contact message to Firestore.
   */
  async function submitContactMessage(messageData) {
    const db = getDb();
    if (!db) return { success: false };
    try {
      await db.collection("messages").add({
        name:      messageData.name,
        email:     messageData.email || "",
        phone:     messageData.phone || "",
        subject:   messageData.subject || "",
        message:   messageData.message,
        read:      false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Contact message error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe email to newsletter in Firestore.
   */
  async function subscribeNewsletter(email) {
    const db = getDb();
    if (!db) return { success: false };
    try {
      await db.collection("subscribers").add({
        email:     email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Newsletter error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Listen to real-time Kitchen open/closed status from Firestore
   */
  function listenKitchenStatus(callback) {
    const db = getDb();
    if (!db) {
      console.warn("Firebase not ready for kitchen status listener.");
      return function () {};
    }

    return db.collection("settings").doc("kitchen").onSnapshot(function (docSnap) {
      const data = docSnap.exists ? docSnap.data() : { isOpen: true };
      window.kitchenSettings = data;
      if (typeof callback === 'function') {
        callback(data);
      }
      window.dispatchEvent(new CustomEvent("kitchenStatusChanged", { detail: data }));
    }, function (error) {
      console.warn("Kitchen status listener note:", error);
    });
  }

  // Expose globally on window
  window.firebaseOrder = {
    isFirebaseReady,
    submitOrderToFirestore,
    trackOrderRealtime,
    fetchMenuFromFirestore,
    submitReviewToFirestore,
    submitContactMessage,
    subscribeNewsletter,
    listenKitchenStatus
  };

  // Signal ready
  window.dispatchEvent(new CustomEvent("firebaseReady", { detail: { ready: true } }));
  console.log("🔥 Firebase Order Bridge Active (Works on file:// and http/https)");
})();
