import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import PageTransition from "../components/PageTransition";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../lib/firebase";

const OPAY_ACCOUNT_NAME = "UPDATE_ME";
const OPAY_ACCOUNT_NUMBER = "UPDATE_ME";

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [creating, setCreating] = useState(false);

  const createOrder = async () => {
    if (!currentUser || cart.length === 0) return;
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        userId: currentUser.uid,
        email: currentUser.email?.toLowerCase() || "",
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          size: i.size || "",
          quantity: i.quantity,
          price: i.price,
          image: i.image || "",
        })),
        total: getCartTotal(),
        status: "awaiting_payment",
        createdAt: serverTimestamp(),
      });
      setOrderId(docRef.id);
    } catch (e) {
      console.error("Failed to create order", e);
    } finally {
      setCreating(false);
    }
  };

  const openWhatsApp = () => {
    const phoneIntl = "2348107869063";
    const text = encodeURIComponent(
      `Hello, I have paid for Order ID: ${orderId}. Attaching receipt now.`
    );
    window.open(`https://wa.me/${phoneIntl}?text=${text}`, "_blank");
  };

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {}
  };

  if (cart.length === 0) {
    return (
      <PageTransition>
        <div className="pt-32 pb-20 min-h-screen flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-2xl font-bold uppercase tracking-tighter mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-8">Add items to your cart to continue to checkout.</p>
          <button onClick={() => navigate("/shop")} className="bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
            Go to Shop
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="pt-32 pb-20 min-h-screen bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tighter uppercase mb-12">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-50 p-8">
                <h2 className="text-lg font-bold uppercase tracking-widest mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex justify-between border-b border-gray-200 py-3 text-sm">
                      <div>
                        <p className="font-medium uppercase">{item.name}</p>
                        <p className="text-gray-500 capitalize">{item.category} {item.size ? `— ${item.size}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p>Qty: {item.quantity}</p>
                        <p className="font-medium">₦{Number(item.price * item.quantity).toLocaleString("en-NG")}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-lg pt-4">
                  <span>Total</span>
                  <span>₦{Number(getCartTotal()).toLocaleString("en-NG")}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-8">
                <h2 className="text-lg font-bold uppercase tracking-widest mb-6">Payment Instructions</h2>
                <div className="space-y-3 text-sm">
                  <p>1. Create your Order ID.</p>
                  <p>2. Pay the total amount to the OPay account below.</p>
                  <p>3. Send the payment receipt screenshot to WhatsApp 08107869063 with your Order ID.</p>
                  <p>4. Keep your phone reachable; we will confirm and follow up.</p>
                </div>
                <div className="mt-6 border border-gray-200 p-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500">OPay Account</p>
                  <div className="mt-2">
                    <p className="text-sm"><span className="font-bold">Name:</span> {"ADELEKE KEHINDE"}</p>
                    <p className="text-sm"><span className="font-bold">Number:</span> {"08107869063"}</p>
                  </div>
                </div>

                <div className="mt-6">
                  {orderId ? (
                    <div className="bg-white border border-gray-200 p-6">
                      <p className="text-xs uppercase tracking-widest text-gray-500">Your Order ID</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-mono text-sm">{orderId}</p>
                        <button onClick={copyOrderId} className="text-xs uppercase font-bold border-b border-black">Copy</button>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <button onClick={openWhatsApp} className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
                          Open WhatsApp
                        </button>
                        <button onClick={() => { clearCart(); navigate("/shop"); }} className="px-6 py-3 text-xs font-bold uppercase tracking-widest border border-black hover:bg-black hover:text-white transition-colors">
                          Done
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={createOrder}
                      disabled={creating}
                      className="bg-black text-white px-8 py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                      {creating ? "Creating..." : "Create Order ID"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 sticky top-32">
                <h3 className="text-lg font-bold uppercase tracking-widest mb-6">Need Help?</h3>
                <p className="text-sm text-gray-600">If you have any issues, send us a message on the Contact page or WhatsApp 08107869063.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
