
import { useEffect, useState } from "react";
import products from "./data";
import "./App.css";

const isSubscription = (product) =>
  product.id <= 4;

function App() {
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

  const [warning, setWarning] = useState("");
  const [page, setPage] = useState("products");

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

        const newQuantity = item.quantity + change;

        if (isSubscription(item)) {
          return {
            ...item,
            quantity: 1,
          };
        }

        return {
          ...item,
          quantity: Math.max(1, newQuantity),
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

  return (
    <div className="app">
      <header className="navbar">
        <h1>EZTech</h1>

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
        <h2>Welcome to EZTech</h2>
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

      {page === "products" ? (
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
      ) : (
        <main className="cart-page">
          <h2>Your Shopping Cart</h2>

          {cart.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            <>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.img} alt={item.service} />

                  <div className="cart-details">
                    <h3>{item.service}</h3>
                    <p>${item.price.toFixed(2)} each</p>

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
                    ${(item.price * item.quantity).toFixed(2)}
                  </strong>
                </div>
              ))}

              <div className="cart-total">
                <h3>Total: ${total.toFixed(2)}</h3>
                <p>Total items: {itemCount}</p>
              </div>
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
