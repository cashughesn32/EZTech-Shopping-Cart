
import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import products from "./data";
import "./App.css";

const isSubscription = (product) => product.id <= 4;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("products");
  const [warning, setWarning] = useState("");

  const [cart, setCart] = useState(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("eztech-cart") || "[]"
      );
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiration, setExpiration] = useState("");
  const [cvv, setCvv] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    localStorage.setItem("eztech-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(
      (item) => item.id === product.id
    );

    if (existing && isSubscription(product)) {
      setWarning(
        "You can only add one of this subscription."
      );
      return;
    }

    setWarning("");

    if (existing) {
      setCart((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((current) => [
        ...current,
        { ...product, quantity: 1 },
      ]);
    }
  };

  const removeItem = (id) => {
    setCart((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const updateQuantity = (id, change) => {
    setCart((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        if (isSubscription(item)) {
          return { ...item, quantity: 1 };
        }

        return {
          ...item,
          quantity: Math.max(1, item.quantity + change),
        };
      })
    );
  };

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiration = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length > 2) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    }

    return digits;
  };

  const handleCheckout = (event) => {
    event.preventDefault();

    const digits = cardNumber.replace(/\D/g, "");
    const [month, year] = expiration.split("/");

    if (digits.length !== 16) {
      alert("Please enter a 16-digit test card number.");
      return;
    }

    if (
      !month ||
      !year ||
      Number(month) < 1 ||
      Number(month) > 12
    ) {
      alert("Please enter a valid expiration month.");
      return;
    }

    if (cvv.length < 3) {
      alert("Please enter a test security code.");
      return;
    }

    // Demo only: never store the full card number or CVV.
    localStorage.setItem(
      "eztech-demo-payment",
      JSON.stringify({
        cardholder: cardName,
        lastFour: digits.slice(-4),
        expiration,
      })
    );

    setCardNumber("");
    setCvv("");
    setCart([]);
    setOrderComplete(true);
  };

  // Require Google login before showing the application.
  if (!isLoggedIn) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        <h1>Welcome to EZTech Movie</h1>
        <p>Please sign in with Google to continue.</p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "25px",
          }}
        >
          <GoogleLogin
            onSuccess={() => {
              setIsLoggedIn(true);
              setPage("products");
            }}
            onError={() => {
              alert("Google login failed. Please try again.");
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <h1>EZTech Movie</h1>

        <nav>
          <button onClick={() => setPage("products")}>
            Shop
          </button>

          <button onClick={() => setPage("cart")}>
            Cart ({itemCount})
          </button>
        </nav>
      </header>

      <section className="hero">
        <h2>Welcome to EZTech Movie</h2>
        <p>
          Explore our subscriptions and accessories!
        </p>
      </section>

      {warning && (
        <div className="warning" role="alert">
          {warning}
          <button onClick={() => setWarning("")}>
            Close
          </button>
        </div>
      )}

      {page === "products" && (
        <main>
          <h2 className="section-title">
            Subscriptions
          </h2>

          <div className="product-grid">
            {products
              .filter(isSubscription)
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
          </div>

          <h2 className="section-title">
            EZTech Accessories
          </h2>

          <div className="product-grid">
            {products
              .filter((product) => !isSubscription(product))
              .map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCart={addToCart}
                />
              ))}
          </div>
        </main>
      )}

      {page === "cart" && (
        <main className="cart-page">
          <h2>Your Shopping Cart</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img
                    src={item.img}
                    alt={item.service}
                  />

                  <div className="cart-details">
                    <h3>{item.service}</h3>
                    <p>
                      ${item.price.toFixed(2)} each
                    </p>

                    <div className="quantity">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, -1)
                        }
                        disabled={
                          item.quantity === 1 ||
                          isSubscription(item)
                        }
                      >
                        -
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(item.id, 1)
                        }
                        disabled={isSubscription(item)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-button"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>

                  <strong>
                    $
                    {(
                      item.price * item.quantity
                    ).toFixed(2)}
                  </strong>
                </div>
              ))}

              <div className="cart-total">
                <h3>
                  Total: ${total.toFixed(2)}
                </h3>

                <p>Total items: {itemCount}</p>

                <button
                  onClick={() => {
                    setOrderComplete(false);
                    setPage("checkout");
                  }}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </main>
      )}

      {page === "checkout" && (
        <main className="cart-page">
          {orderComplete ? (
            <div className="cart-total">
              <h2>Order Complete!</h2>

              <p>
                Your EZTech demo order was
                completed successfully.
              </p>

              <p>
                No real payment was processed.
              </p>

              <button
                onClick={() => {
                  setOrderComplete(false);
                  setPage("products");
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <h2>Credit Card Management</h2>

              <p>
                Enter fictional test card information
                to complete your demo checkout.
              </p>

              <div className="cart-total">
                <h3>
                  Order Total: ${total.toFixed(2)}
                </h3>
              </div>

              <form
                onSubmit={handleCheckout}
                style={{
                  maxWidth: "450px",
                  margin: "25px auto",
                  display: "grid",
                  gap: "15px",
                }}
              >
                <label>
                  Name on Card
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) =>
                      setCardName(e.target.value)
                    }
                    placeholder="Test Customer"
                    required
                    style={{ width: "100%", padding: "12px" }}
                  />
                </label>

                <label>
                  Card Number
                  <input
                    type="text"
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(
                        formatCardNumber(e.target.value)
                      )
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                    style={{ width: "100%", padding: "12px" }}
                  />
                </label>

                <label>
                  Expiration Date
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expiration}
                    onChange={(e) =>
                      setExpiration(
                        formatExpiration(e.target.value)
                      )
                    }
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    style={{ width: "100%", padding: "12px" }}
                  />
                </label>

                <label>
                  Security Code
                  <input
                    type="password"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) =>
                      setCvv(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 4)
                      )
                    }
                    placeholder="CVV"
                    maxLength={4}
                    required
                    style={{ width: "100%", padding: "12px" }}
                  />
                </label>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                >
                  Complete Demo Checkout
                </button>

                <button
                  type="button"
                  onClick={() => setPage("cart")}
                >
                  Back to Cart
                </button>
              </form>
            </>
          )}
        </main>
      )}

      <footer>
        <p>EZTech Shopping Cart | Team Project</p>
      </footer>
    </div>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <div className="product-card">
      <img
        src={product.img}
        alt={product.service}
      />

      <h3>{product.service}</h3>
      <p>{product.serviceInfo}</p>

      <h4>${product.price.toFixed(2)}</h4>

      <button onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}

export default App;
