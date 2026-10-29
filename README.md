# Grocery Billing Web App

A mobile-first billing application for seasonal grocery and pulses shops. Built with React, Tailwind CSS, Node.js, Express, and MongoDB.

## Folder Structure

- `backend/`: Express API, MongoDB models, bill sending endpoint
- `frontend/`: React + Vite + Tailwind mobile-first billing UI

## Setup

### Backend

1. Open a terminal in `backend/`
2. Run `npm install`
3. Create a `.env` file from `.env.example`
4. Set `MONGODB_URI`
5. Set `JWT_SECRET` to a random secret of at least 32 characters (for example, generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
6. Run sample data seed: `npm run seed`
7. Start server: `npm run dev`

### Frontend

1. Open a terminal in `frontend/`
2. Run `npm install`
3. Create a `.env` file from `.env.example` if needed
4. Start app: `npm run dev`

## API Endpoints

- `POST /api/auth/register` - create an account
- `POST /api/auth/login` - sign in and receive a bearer token
- `GET /api/auth/me` - verify the signed-in account
- `GET /api/products?search=` - search products (requires a bearer token)
- `GET /api/products/:id` - fetch a product by id (requires a bearer token)
- `POST /api/products` - create a product (requires a bearer token)
- `POST /api/send-bill` - build a bill message and return WhatsApp link (requires a bearer token)

## Key Features

- email/password registration and sign-in with protected billing APIs
- development-only demo login: `demo@gmail.com` / `Demo1234!`
- mobile-first responsive UI
- on-demand product search in English or Tamil
- KG / PADI weight units
- editable price for bargaining
- quantity controls
- dynamic totals and discounts
- WhatsApp bill link generation and printable receipts

## Notes

- The backend uses free WhatsApp link generation (`wa.me`)
- Ensure MongoDB is reachable from `MONGODB_URI`
- The demo account is created automatically by `npm run dev` only; production mode does not create it
- The frontend defaults to `http://localhost:5000/api` if `VITE_API_URL` is not set
