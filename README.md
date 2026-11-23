# VELOUR Atelier — Luxury Clothing E-Commerce Platform

A complete, modern, and responsive luxury clothing e-commerce web platform engineered with **Next.js (App Router, JavaScript)**, styled with **Tailwind CSS**, backed by **MongoDB Atlas** and **Prisma ORM**, authenticated with **Auth.js / NextAuth**, and secured with **Razorpay** payment processing.

---

## Key Features & Highlights

1. **High-Converting Editorial Storefront**:
   - Luxury campaign hero banner with animated CTA buttons and Autumn/Winter 2026 drop showcase.
   - Curated category navigation cards (Outerwear, Hoodies & Sweats, Tailored Trousers, Silk Shirts, Knitwear, Leather Goods).
   - Brand value proposition pillars (Complimentary Global Courier, 14-Day Exchanges, Encrypted Razorpay Checkout).

2. **Advanced Product Catalog & Filtering**:
   - Real-time search query filtering.
   - Category and gender filter tabs (All, Men, Women, Unisex).
   - Price range slider and multi-attribute sorting (Price Low to High, High to Low, Highest Rated, Newest).
   - Responsive product cards with image hover transitions, discount percentages, and quick add-to-bag drawers.

3. **Product Details Page**:
   - Multi-angle high-resolution image gallery with interactive thumbnail switching and zoom.
   - Size selection (`XS`, `S`, `M`, `L`, `XL`, `XXL`) with size guide reference.
   - Color selection swatches with active hex and swatch previews.
   - Quantity adjustment stepper with real-time stock availability indicators.
   - Architectural garment specifications and recommended items lookbook.

4. **Cart & Wishlist State Management**:
   - Global React Context with `localStorage` persistence across page reloads.
   - Side cart drawer and full-page `/cart` interface with quantity increment/decrement/delete.
   - Free shipping progress threshold indicator (Complimentary shipping above ₹2,499).
   - Dedicated `/wishlist` with one-click "Move to Bag" actions.

5. **Customer Authentication & Account Portal**:
   - NextAuth.js Credentials provider with bcrypt-hashed passwords.
   - Form validation for Registration and Login with quick-fill test accounts.
   - Client `/profile` with saved delivery address book (Add, Set Default, Delete).
   - Customer `/orders` with real-time fulfillment progress tracker (Placed &rarr; Confirmed &rarr; Shipped &rarr; Delivered).

6. **Tamper-Proof Razorpay Payment Integration**:
   - Server-side price calculation endpoint (`/api/checkout/create-order`): Cart prices are never trusted from the frontend.
   - Razorpay Checkout SDK integration with multi-mode payment (UPI, Cards, NetBanking, EMI).
   - Server-side HMAC SHA-256 cryptographic signature verification (`/api/checkout/verify`).
   - Integrated test/mock payment capability for instant evaluation without requiring live credentials.
   - Printable order invoice confirmation page (`/order-success/[id]`).

7. **Protected Admin Management Portal (`/admin`)**:
   - Analytics overview: Total Revenue, Total Orders, Live Garments, Low-Stock Warnings.
   - Inventory & Product Management: Add new garments, adjust inventory stock in real time, delete products.
   - Order Fulfillment Desk: Filter orders by status and transition status (`Processing` &rarr; `Confirmed` &rarr; `Shipped` &rarr; `Delivered`).

---

## Technology Stack

- **Frontend & Fullstack**: Next.js 14 (App Router, JavaScript)
- **Styling**: Tailwind CSS, Lucide React Icons
- **Database**: MongoDB Atlas
- **ORM**: Prisma ORM
- **Authentication**: Auth.js / NextAuth.js (JWT Sessions, bcryptjs)
- **Payments**: Razorpay Node.js SDK & Checkout JS
- **Deployment**: Netlify (`@netlify/plugin-nextjs`)
- **Version Control**: Git & GitHub

---

## Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+` or `v22+`
- npm `v9+` or `v10+`

### 2. Installation
```bash
git clone <repository-url>
cd clothing-brand
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env.local
```

Configure your environment variables in `.env.local`:
```env
# MongoDB Atlas Connection URI
DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/velour_ecommerce?retryWrites=true&w=majority"

# NextAuth Secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_secure_random_secret_string"

# Razorpay API Keys (from https://dashboard.razorpay.com/app/keys)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_YourKeyId"
RAZORPAY_KEY_SECRET="YourRazorpaySecret"

# Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Mock Payment Setting (set to 'true' for local testing without live keys)
NEXT_PUBLIC_ENABLE_MOCK_PAYMENT="true"
```

### 4. Database Setup & Seeding (Prisma + MongoDB)
Generate the Prisma Client:
```bash
npx prisma generate
```

Seed the fashion catalog, categories, and test user accounts:
```bash
npm run prisma:seed
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Test Credentials

| Account | Email | Password | Access Level |
|---|---|---|---|
| **Demo Customer** | `demo@velour.com` | `User@Velour2026` | Customer Storefront, Profile, Orders |
| **Admin Director** | `admin@velour.com` | `Admin@Velour2026` | Admin Dashboard, Stock, Orders |

*(Convenient one-click autofill buttons are built directly into the `/login` page for instant evaluation!)*

---

## Deployment on Netlify

1. Push your repository to GitHub.
2. Log in to [Netlify](https://www.netlify.com/) and click **"Add new site" &rarr; "Import an existing project"**.
3. Select your GitHub repository.
4. Set Build Settings:
   - **Base directory**: `.`
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. Under **Environment variables**, add:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (set to your Netlify URL e.g. `https://your-site.netlify.app`)
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_ENABLE_MOCK_PAYMENT` (`true` or `false`)
6. Deploy! The `@netlify/plugin-nextjs` plugin handles Next.js App Router, SSR, and API endpoints automatically.

---

## Security Best Practices
- **No Client Secrets**: `DATABASE_URL` and `RAZORPAY_KEY_SECRET` are never referenced in client components.
- **Server-Side Price Integrity**: All totals are verified server-side against catalog rates before charging.
- **HMAC Verification**: Razorpay payment signatures are validated with cryptographic hash matches.
- **Password Protection**: Passwords are saved only as salted bcrypt hashes.
