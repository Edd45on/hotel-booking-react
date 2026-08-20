# RedDoorzuki PH - Hotel Booking Assistant

A full-stack booking platform built with React, Vite, and Supabase. 
Designed to connect customers with suitable hotels in the Philippines through a personalized assistant experience.

## 🚀 Live Demo
Visit the live application: [reddoorzuki-ph.vercel.app]([https://reddoorzuki-ph.vercel.app](https://reddoorzuki-ph-edd-mo.vercel.app/))

## ✨ Features

- **Customer Form:** Users submit their destination, dates, and budget to request hotel options.
- **Admin Dashboard:** Protected dashboard to manage inquiries, create custom quotations, and track bookings.
- **Draft Editor:** Easily generate 3 distinct hotel options with dynamic pricing, multi-image uploads, and customizable amenities.
- **Customer Quotation Page:** A beautifully designed mobile-responsive page where customers compare up to 3 hotels, select an option, and receive a real-time booking status.
- **RedSeller Workflow:** Admin handoff tools including clipboard copying, availability checking, and booking finalization.

## 🛠️ Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Vercel Serverless API
- **Database:** Supabase (PostgreSQL)
- **Storage:** Cloudflare R2 (Image uploads)

## 📁 Project Structure
hotel-booking-react/
├── api/ # Vercel serverless functions
├── src/
│ ├── components/ # Reusable React components (Hero, AdminPanel, etc.)
│ ├── layouts/ # App layout
│ ├── pages/ # Main entry points
│ └── utils/ # Supabase client
├── public/ # Static assets
└── ...

## 📦 Installation & Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Set up your `.env` file with Supabase keys
4. Run `npm run dev` to start the local server
