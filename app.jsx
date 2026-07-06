// ============================================================
// VERVE — a React product catalog + cart
// ============================================================
// This project is built to demonstrate real React state management,
// not just rendering static markup. The two ideas worth understanding
// if you get asked about this in an interview:
//
// 1. useReducer for the cart instead of useState.
//    The cart has several related actions (add, remove, change
//    quantity, clear) that all update the same piece of state.
//    useReducer keeps that logic in one place (cartReducer) instead
//    of scattering "setCart(...)" calls with slightly different
//    logic all over the component tree.
//
// 2. useMemo for derived values (filtered/sorted product list,
//    cart totals). These are recalculated only when their actual
//    inputs change, not on every render — the kind of thing that
//    matters once an app has real data volume.
// ============================================================

const { useState, useReducer, useMemo, useEffect, createContext, useContext } = React;

// ---------- Product data ----------
// In a real app this would come from an API call (like the Groq/Firebase
// projects). Here it's static so the project can be judged purely on
// the React logic, without needing a backend.
const PRODUCTS = [
  { id: 1, name: 'Ridge Canvas Tote', category: 'Bags', price: 1499, tag: 'Bestseller' },
  { id: 2, name: 'Field Notebook, Set of 3', category: 'Stationery', price: 449, tag: null },
  { id: 3, name: 'Aster Ceramic Mug', category: 'Home', price: 699, tag: null },
  { id: 4, name: 'Loom Wool Scarf', category: 'Apparel', price: 1899, tag: 'New' },
  { id: 5, name: 'Grain Leather Wallet', category: 'Bags', price: 2199, tag: null },
  { id: 6, name: 'Solstice Desk Lamp', category: 'Home', price: 3499, tag: 'Bestseller' },
  { id: 7, name: 'Harbor Linen Shirt', category: 'Apparel', price: 2599, tag: null },
  { id: 8, name: 'Pocket Fountain Pen', category: 'Stationery', price: 899, tag: 'New' },
  { id: 9, name: 'Drift Cotton Throw', category: 'Home', price: 1999, tag: null },
  { id: 10, name: 'Trail Crossbody Bag', category: 'Bags', price: 2799, tag: null },
];

const CATEGORIES = ['All', ...new Set(PRODUCTS.map(p => p.category))];

// ---------- Cart reducer ----------
// action.type tells us which of the cart's operations to run.
// Cart is stored as { [productId]: quantity } — a plain object is
// enough here and makes "does this item already exist" a simple key lookup.
function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const current = state[action.id] || 0;
      return { ...state, [action.id]: current + 1 };
    }
    case 'DECREMENT': {
      const current = state[action.id] || 0;
      if (current <= 1) {
        const next = { ...state };
        delete next[action.id];
        return next;
      }
      return { ...state, [action.id]: current - 1 };
    }
    case 'REMOVE': {
      const next = { ...state };
      delete next[action.id];
      return next;
    }
    case 'CLEAR':
      return {};
    case 'HYDRATE':
      return action.cart || {};
    default:
      return state;
  }
}

function formatPrice(paise) {
  return `₹${paise.toLocaleString('en-IN')}`;
}

// ---------- Product card ----------
function ProductCard({ product, quantity, onAdd, onDecrement }) {
  return (
    <div className="product-card">
      {product.tag && <span className={`tag tag-${product.tag === 'New' ? 'new' : 'best'}`}>{product.tag}</span>}
      <div className="product-swatch" aria-hidden="true"></div>
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>
        <span className="product-price">{formatPrice(product.price)}</span>
      </div>
      {quantity > 0 ? (
        <div className="qty-stepper">
          <button className="qty-btn" onClick={() => onDecrement(product.id)} aria-label={`Decrease quantity of ${product.name}`}>−</button>
          <span className="qty-value">{quantity}</span>
          <button className="qty-btn" onClick={() => onAdd(product.id)} aria-label={`Increase quantity of ${product.name}`}>+</button>
        </div>
      ) : (
        <button className="add-btn" onClick={() => onAdd(product.id)}>Add to cart</button>
      )}
    </div>
  );
}

// ---------- Cart drawer ----------
function CartDrawer({ open, onClose, cart, onAdd, onDecrement, onRemove, onClear }) {
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const lineItems = useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => ({ product: PRODUCTS.find(p => p.id === Number(id)), qty }))
      .filter(item => item.product);
  }, [cart]);

  const subtotal = useMemo(
    () => lineItems.reduce((sum, item) => sum + item.product.price * item.qty, 0),
    [lineItems]
  );

  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.rate) : 0;
  const total = subtotal - discount;

  function applyPromo(e) {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'STUDENT10') {
      setAppliedPromo({ code, rate: 0.10 });
      setPromoError('');
    } else {
      setPromoError('That code is not valid. Try STUDENT10.');
      setAppliedPromo(null);
    }
  }

  return (
    <div className={`cart-drawer-overlay ${open ? 'open' : ''}`} onClick={onClose}>
      <aside className="cart-drawer" onClick={e => e.stopPropagation()}>
        <div className="cart-drawer-head">
          <h2>Your cart</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close cart">&times;</button>
        </div>

        {lineItems.length === 0 ? (
          <div className="cart-empty">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="cart-lines">
              {lineItems.map(({ product, qty }) => (
                <div className="cart-line" key={product.id}>
                  <div className="cart-line-info">
                    <span className="cart-line-name">{product.name}</span>
                    <span className="cart-line-price">{formatPrice(product.price)} each</span>
                  </div>
                  <div className="qty-stepper">
                    <button className="qty-btn" onClick={() => onDecrement(product.id)}>−</button>
                    <span className="qty-value">{qty}</span>
                    <button className="qty-btn" onClick={() => onAdd(product.id)}>+</button>
                  </div>
                  <button className="remove-link" onClick={() => onRemove(product.id)}>Remove</button>
                </div>
              ))}
            </div>

            <form className="promo-form" onSubmit={applyPromo}>
              <input
                type="text"
                placeholder="Promo code (try STUDENT10)"
                value={promoInput}
                onChange={e => setPromoInput(e.target.value)}
              />
              <button type="submit">Apply</button>
            </form>
            {promoError && <p className="promo-error">{promoError}</p>}
            {appliedPromo && <p className="promo-success">Code {appliedPromo.code} applied — 10% off</p>}

            <div className="cart-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>Discount</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <button className="checkout-btn" onClick={() => alert('This is a portfolio demo — no real checkout is wired up.')}>
              Checkout
            </button>
            <button className="clear-btn" onClick={onClear}>Clear cart</button>
          </>
        )}
      </aside>
    </div>
  );
}

// ---------- Main app ----------
function App() {
  const [cart, dispatch] = useReducer(cartReducer, {});
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [cartOpen, setCartOpen] = useState(false);

  // Persist cart to localStorage so a refresh doesn't lose it —
  // same idea as the Math Rush high score, just applied to a cart.
  useEffect(() => {
    const saved = localStorage.getItem('verveCart');
    if (saved) {
      try {
        dispatch({ type: 'HYDRATE', cart: JSON.parse(saved) });
      } catch (e) {
        // ignore corrupted data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('verveCart', JSON.stringify(cart));
  }, [cart]);

  const visibleProducts = useMemo(() => {
    let list = category === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);
    if (sortBy === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, sortBy]);

  const itemCount = useMemo(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  return (
    <div className="app">
      <header className="site-header">
        <span className="brand">VERVE</span>
        <button className="cart-toggle" onClick={() => setCartOpen(true)}>
          Cart
          {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </button>
      </header>

      <section className="hero">
        <h1>Small batch goods,<br />made to last.</h1>
        <p>A demo storefront built to show real cart state management — filtering, sorting, quantities, and a promo code, all in React.</p>
      </section>

      <section className="toolbar">
        <div className="category-chips">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`chip ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </section>

      <section className="product-grid">
        {visibleProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={cart[product.id] || 0}
            onAdd={id => dispatch({ type: 'ADD', id })}
            onDecrement={id => dispatch({ type: 'DECREMENT', id })}
          />
        ))}
      </section>

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cart}
        onAdd={id => dispatch({ type: 'ADD', id })}
        onDecrement={id => dispatch({ type: 'DECREMENT', id })}
        onRemove={id => dispatch({ type: 'REMOVE', id })}
        onClear={() => dispatch({ type: 'CLEAR' })}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
