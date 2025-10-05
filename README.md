# Kacchi Bhai AI Chatbot

AI-powered customer service chatbot for Kacchi Bhai restaurant chain. Handles reservations, orders, menu inquiries, and delivery questions using OpenAI GPT models.

## Features

- 🍛 **Restaurant-Specific AI**: Trained on Kacchi Bhai menu, prices, and locations
- 📅 **Table Reservations**: Book tables with date, time, party size, and branch selection
- 🚚 **Order Management**: Takeout and delivery orders with real-time cost calculation
- 📍 **Multi-Branch Support**: Gulshan, Dhanmondi, Banani, Uttara locations
- 💬 **Natural Conversations**: Powered by OpenAI GPT-4o-mini
- 📊 **Database Integration**: MongoDB for persistent data storage (Phase 2)
- 🎨 **Authentic Branding**: Kacchi Bhai maroon/burgundy color scheme

## Tech Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **AI**: OpenAI API (GPT-4o-mini, GPT-3.5-turbo, GPT-4)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: OpenAI API Key

## Prerequisites

- Node.js 14+ (Recommended: v18 or higher)
- npm or yarn
- OpenAI API Key
- MongoDB (Local or Atlas)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/kacchi-bhai-chatbot.git
cd kacchi-bhai-chatbot
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/kacchi_bhau
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/kacchi_bhau?retryWrites=true&w=majority
```

### 4. Start the Server

```bash
npm start
```

Server will run on `http://localhost:3000`

## Usage

### 1. Open the Application

Navigate to `http://localhost:3000` in your browser

### 2. Configure API Key

- Enter your OpenAI API key in the settings panel (left side)
- Select preferred model (GPT-4o-mini recommended)
- Click "Save Configuration"

### 3. Start Chatting

Use quick action buttons or type queries like:
- "Show me the menu"
- "I want to book a table for 4 people tomorrow at 7 PM in Gulshan"
- "Do you deliver to Dhanmondi?"
- "I want to order 2 Mutton Kacchi Special and 2 Borhani"

## Project Structure

```
kacchi-bhai-chatbot/
├── server.js              # Express server with OpenAI integration
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
└── public/
    └── index.html        # Frontend interface
```

## Available Functions

The chatbot can execute these restaurant-specific functions:

1. **make_reservation** - Book tables with full details
2. **check_table_availability** - Real-time availability checking
3. **place_kacchi_order** - Process takeout/delivery orders
4. **check_menu_item** - Get item details and pricing
5. **calculate_order_total** - Price calculation
6. **check_delivery_area** - Verify delivery coverage

## API Endpoints

- `POST /api/set-key` - Configure OpenAI API key
- `POST /api/chat` - Send messages to chatbot
- `GET /api/reservations` - View all reservations (requires database)
- `GET /api/orders` - View all orders (requires database)
- `GET /api/health` - Check server and database status

## Database Schema

### Reservations
```javascript
{
  reservationId: String,
  customerName: String,
  phone: String,
  date: Date,
  time: String,
  partySize: Number,
  branch: String,
  specialRequests: String,
  status: String,
  createdAt: Date
}
```

### Orders
```javascript
{
  orderId: String,
  customerName: String,
  phone: String,
  items: [{ name, price, quantity }],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  orderType: String,
  branch: String,
  address: String,
  status: String,
  createdAt: Date
}
```

## Development

### Run in Development Mode

```bash
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/kacchi_bhau |

## Troubleshooting

### "Database: Disconnected"

- Check MongoDB is running: `brew services list` (Mac)
- Verify MONGODB_URI in `.env` file
- For Atlas: Check IP whitelist and credentials

### "API key not configured"

- Enter your OpenAI API key in the settings panel
- Verify key starts with `sk-`
- Check you have credits in your OpenAI account

### "Module not found: mongoose"

```bash
npm install mongoose
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- Railway
- Render
- Heroku
- Vercel

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## Security

- Never commit `.env` file
- Keep API keys secret
- Use environment variables for sensitive data
- Enable IP whitelist on MongoDB Atlas

## License

MIT License - see LICENSE file for details

## Authors

- Your Name - Initial work

## Acknowledgments

- OpenAI for GPT API
- MongoDB for database
- Kacchi Bhai for inspiration

## Support

For issues and questions:
- Open an issue on GitHub
- Email: your-email@example.com

## Roadmap

- [x] Phase 1: Basic chatbot with simulated responses
- [x] Phase 2: Database integration
- [ ] Phase 3: SMS notifications
- [ ] Phase 4: Admin dashboard
- [ ] Phase 5: Payment gateway (bKash/Nagad)
- [ ] Phase 6: Kitchen display system

---

Made with ❤️ for Kacchi Bhai
