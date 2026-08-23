// 💳 RAZORPAY FRONTEND CLIENT INTEGRATION UTILITY
// Provides seamless dynamic script loading, order initiation, modal opening, and cryptographic payment verification.

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayConfig {
  enabled: boolean;
  keyId: string;
  merchantName: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

export interface StudentCheckoutPayload {
  firstName: string;
  lastName: string;
  email: string;
  number: string;
  role?: string;
  plan?: string;
  courseId?: string;
  courseTitle?: string;
  amount: number;
  couponCode?: string;
}

// 1. Dynamically loads the official Razorpay Checkout JavaScript SDK
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.Razorpay) {
        clearInterval(checkInterval);
        resolve(true);
      }
    }, 100);

    // Timeout after 4 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 4000);

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        clearInterval(checkInterval);
        resolve(true);
      });
      existingScript.addEventListener("error", () => {
        clearInterval(checkInterval);
        resolve(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      clearInterval(checkInterval);
      resolve(true);
    };
    script.onerror = () => {
      clearInterval(checkInterval);
      console.error("Failed to load Razorpay Checkout SDK script.");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// 2. Fetches public Razorpay configuration from server (Key ID only, secret is never sent)
export async function fetchRazorpayConfig(): Promise<RazorpayConfig> {
  try {
    const res = await fetch("/api/razorpay/config");
    if (res.ok) {
      const data = await res.json();
      return {
        enabled: Boolean(data.enabled),
        keyId: data.keyId || "",
        merchantName: data.merchantName || "Pehlakadam Career & Personality Development"
      };
    }
  } catch (error) {
    console.warn("Failed to fetch Razorpay config:", error);
  }
  return { enabled: false, keyId: "", merchantName: "Pehlakadam" };
}

// 3. Creates an order on the backend
export async function createRazorpayOrder(
  amount: number,
  notes?: Record<string, any>
): Promise<RazorpayOrderResponse> {
  try {
    const res = await fetch("/api/razorpay/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, notes })
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to initialize payment gateway order." };
    }

    return {
      success: true,
      orderId: data.orderId,
      amount: data.amount,
      currency: data.currency,
      keyId: data.keyId
    };
  } catch (err: any) {
    console.error("Error creating Razorpay order:", err);
    return { success: false, error: err.message || "Network error while connecting to payment gateway." };
  }
}

// 4. Verifies the captured payment cryptographically with the backend
export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  studentDetails: StudentCheckoutPayload;
}) {
  const res = await fetch("/api/razorpay/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Payment signature verification failed.");
  }
  return data;
}

// 5. High-level wrapper that opens the standard Razorpay modal and resolves when paid or dismissed
export async function launchRazorpayCheckout(
  student: StudentCheckoutPayload,
  onProgress?: (stage: "init" | "opening" | "verifying" | "success" | "error", message?: string) => void
): Promise<{ success: boolean; data?: any; error?: string; dismissed?: boolean }> {
  try {
    onProgress?.("init", "Connecting to payment gateway...");
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      throw new Error("Unable to load Razorpay payment window. Please check your internet connection.");
    }

    const config = await fetchRazorpayConfig();
    if (!config.enabled || !config.keyId) {
      throw new Error("Razorpay online payment gateway is currently unavailable. Please use the Manual UPI transfer option.");
    }

    onProgress?.("init", "Creating secure payment token...");
    const orderRes = await createRazorpayOrder(student.amount, {
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      phone: student.number,
      email: student.email,
      programOrCourse: student.courseTitle || student.role || student.plan,
      plan: student.plan,
      courseId: student.courseId,
      couponCode: student.couponCode
    });

    if (!orderRes.success || !orderRes.orderId) {
      throw new Error(orderRes.error || "Failed to create order on payment gateway.");
    }

    onProgress?.("opening", "Opening secure checkout window...");

    return new Promise((resolve) => {
      let isHandled = false;

      const options = {
        key: config.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency || "INR",
        name: config.merchantName,
        description: `Enrollment for ${student.courseTitle || student.role || student.plan || 'Pehlakadam Program'}`,
        order_id: orderRes.orderId,
        prefill: {
          name: `${student.firstName} ${student.lastName}`.trim(),
          email: student.email,
          contact: student.number
        },
        theme: {
          color: "#059669" // emerald-600
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          confirm_close: true,
          ondismiss: function () {
            if (!isHandled) {
              isHandled = true;
              onProgress?.("error", "Payment cancelled by user.");
              resolve({ success: false, dismissed: true, error: "Payment window was closed before completing transaction." });
            }
          }
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          if (isHandled) return;
          isHandled = true;

          try {
            onProgress?.("verifying", "Verifying payment & activating instant student access...");
            const verificationResult = await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              studentDetails: student
            });

            onProgress?.("success", "Payment verified! Instant access activated.");
            resolve({ success: true, data: verificationResult });
          } catch (verErr: any) {
            console.error("Verification error:", verErr);
            onProgress?.("error", verErr.message || "Payment verification failed.");
            resolve({ success: false, error: verErr.message || "Failed to verify transaction with server." });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        if (!isHandled) {
          isHandled = true;
          const errorMsg = response.error?.description || response.error?.reason || "Payment failed at bank/UPI provider.";
          onProgress?.("error", errorMsg);
          resolve({ success: false, error: errorMsg });
        }
      });

      rzp.open();
    });
  } catch (err: any) {
    console.error("Razorpay checkout exception:", err);
    onProgress?.("error", err.message || "Payment initiation error.");
    return { success: false, error: err.message || "Unable to initiate payment gateway." };
  }
}
