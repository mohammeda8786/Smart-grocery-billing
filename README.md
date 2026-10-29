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
3. Create a `.env` file from `.env.example`
4. Start app: `npm run dev`

## Production Deployment

Pushing the repository to GitHub does not start the Express API. Deploy the `backend/` directory to a Node.js host and configure:

- `MONGODB_URI` - connection string for the production MongoDB database
- `JWT_SECRET` - random secret of at least 32 characters
- `NODE_ENV=production`

Set the backend host's start command to `npm start`. Confirm the deployed backend responds at `/` before configuring the frontend.

Deploy `frontend/` as a static Vite site. Set `VITE_API_URL` in the frontend host's build environment to the full backend API URL, for example `https://your-backend-host.example/api`, and rebuild/redeploy the frontend. `VITE_API_URL` is embedded during the frontend build; changing it only at runtime will not update the built site. The Vite `/api` proxy is for local development only and is not included in production builds.

The API enables cross-origin requests by default. If your backend host or deployment proxy applies additional CORS restrictions, allow the frontend's production origin.

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
- The frontend's `.env.example` points to the local backend; production builds must use the deployed backend URL for `VITE_API_URL`
