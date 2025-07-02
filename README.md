# PH Feed - Product Hunt Daily

A Twitter/X-style feed showing the best Product Hunt launches for any given day.

## Features

- 🚀 Browse Product Hunt launches by date
- 🌙 Dark/light mode support
- 📱 Responsive Twitter-like UI
- ⚡ Built with Next.js, TypeScript, and Tailwind CSS

## Setup

1. **Clone and install dependencies:**

   ```bash
   yarn install
   ```

2. **Get a Product Hunt API token:**

   - Visit [Product Hunt API Documentation](https://api.producthunt.com/v2/docs)
   - Create an account and generate a developer token
   - Copy your token

3. **Create environment file:**

   ```bash
   cp .env.local.example .env.local
   ```

   Add your Product Hunt API token:

   ```env
   PRODUCT_HUNT_TOKEN=your_product_hunt_api_token_here
   ```

4. **Start the development server:**

   ```bash
   yarn dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

- Use the date picker in the header to select any date
- Browse products launched on that day
- Click vote buttons and interact with products
- Toggle between light and dark modes

## API Endpoints

- `GET /api/posts?date=YYYY-MM-DD` - Fetch Product Hunt posts for a specific date

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **API:** Product Hunt GraphQL API
- **Deployment:** Vercel-ready

## Contributing

Feel free to submit issues and feature requests!
