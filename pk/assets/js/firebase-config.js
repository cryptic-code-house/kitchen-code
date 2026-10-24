// ============================================================
// DIPJIT'S PHARMA KITCHEN — Customer Site Firebase Engine
// Live Firebase Project: dipjitkt
// Works 100% on file:// (double-click) and http/https!
// ============================================================

window.firebaseConfig = {
  apiKey: "AIzaSyDtOTv7Yg31r65tRV_zX6dArcIKrqAvGgk",
  authDomain: "dipjitkt.firebaseapp.com",
  projectId: "dipjitkt",
  storageBucket: "dipjitkt.firebasestorage.app",
  messagingSenderId: "22423577133",
  appId: "1:22423577133:web:880013a28b648906efcea4"
};

// Initialize Firebase App globally
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps || !firebase.apps.length) {
      firebase.initializeApp(window.firebaseConfig);
    }
    window.firebaseDb = firebase.firestore();
    console.log("🔥 PK Customer Site Connected to Live Firebase: dipjitkt");
  } catch (err) {
    console.warn("Firebase live init note:", err);
  }
} else {
  console.warn("Firebase CDN SDK not loaded yet.");
}
