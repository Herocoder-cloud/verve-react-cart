# Verve — React Product Cart

A small storefront demo built to show real React state management: product
filtering, sorting, quantity steppers, a cart drawer, and a promo code —
all without a backend.

**Live demo:** _add your Netlify URL here after deploying_
**Try the promo code:** `STUDENT10` for 10% off.

## Why this project

"Build a shopping cart" is one of the most common frontend interview
tasks, because it tests real state management rather than just styling.
This project is the answer to that brief.

## React concepts this project demonstrates

**`useReducer` instead of `useState` for the cart.**
The cart supports several related actions — add, decrement, remove,
clear, hydrate from storage. Instead of writing separate `setCart(...)`
calls with slightly different logic in different places, all of that
logic lives in one function: `cartReducer`. Every action goes through
the same door, which makes the cart's behavior easy to reason about and
easy to test in isolation.

**`useMemo` for derived values.**
Things like the filtered/sorted product list, the cart subtotal, and the
item count are all *derived* from other state — they shouldn't be
recalculated on every single render if their actual inputs haven't
changed. `useMemo` caches them and only recomputes when their
dependencies change.

**`useEffect` for syncing with `localStorage`.**
One effect loads the saved cart on first render; another saves the cart
every time it changes. This is the same "persist without a backend"
pattern as the Math Rush game, just applied to cart data instead of a
high score.

**Component composition.**
`ProductCard` and `CartDrawer` are separate components that receive data
and callback functions as props — they don't know about `cartReducer`
directly, which keeps them reusable and easy to test on their own.

## Tech stack note — no build step, on purpose

This project loads React, ReactDOM, and Babel Standalone directly from a
CDN, so it runs as plain static files with zero `npm install` or build
step. That's a deliberate simplification for a portfolio demo that needs
to deploy instantly with nothing but static hosting.

**In a real job, you would not do this.** Production React apps use a
build tool (Vite, Next.js, or Create React App) that compiles JSX ahead
of time, tree-shakes unused code, and produces optimized bundles —
Babel-in-the-browser re-compiles the JSX on every page load, which is
too slow and heavy for production traffic. It's worth being able to
explain this trade-off if it comes up.

## Deploying this yourself

1. Push this folder to a GitHub repository.
2. Go to [Netlify](https://app.netlify.com) → **Add new site** → import the
   repo. No build command needed, publish directory `.`.
3. Deploy — no environment variables or backend setup needed.

## Possible extensions

- Migrate to a real build setup (Vite) to show the "production" version
- Add product detail pages with React Router
- Replace the static `PRODUCTS` array with a fetched API response
- Add form validation on the promo code field
- Add unit tests for `cartReducer` with Jest or Vitest
