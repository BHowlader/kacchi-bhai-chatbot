const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let openai;

// MongoDB Connection
const connectDB = async () => {
    try {
        console.log('⚠️ Running without database (data will not be saved)');
        console.log('✅ Server will use simulated responses');
    } catch (error) {
        console.error('Error:', error.message);
    }
};

connectDB();

// Database Models
const reservationSchema = new mongoose.Schema({
    reservationId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    partySize: { type: Number, required: true },
    branch: { type: String, enum: ['Gulshan', 'Dhanmondi', 'Banani', 'Uttara', 'Mirpur -1'], required: true },
    specialRequests: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    items: [{ name: String, price: Number, quantity: { type: Number, default: 1 } }],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    orderType: { type: String, enum: ['takeout', 'delivery'], required: true },
    branch: { type: String, enum: ['Gulshan', 'Dhanmondi', 'Banani', 'Uttara', 'Mirpur -1'], required: true },
    address: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    estimatedTime: { type: Number, default: 45 },
    createdAt: { type: Date, default: Date.now }
});

const Reservation = mongoose.model('Reservation', reservationSchema);
const Order = mongoose.model('Order', orderSchema);

// Restaurant Functions (same as before)
const functions = [
    {
        name: "make_reservation",
        description: "Make a table reservation at Kacchi Bhai",
        parameters: {
            type: "object",
            properties: {
                date: { type: "string", description: "Reservation date (YYYY-MM-DD)" },
                time: { type: "string", description: "Reservation time (HH:MM in 24h format)" },
                party_size: { type: "integer", description: "Number of people" },
                name: { type: "string", description: "Customer name" },
                phone: { type: "string", description: "Contact phone number" },
                branch: { type: "string", enum: ["Gulshan", "Dhanmondi", "Banani", "Uttara", 'Mirpur -1'], description: "Preferred branch" },
                special_requests: { type: "string", description: "Special requests (optional)" }
            },
            required: ["date", "time", "party_size", "name", "phone", "branch"]
        }
    },
    {
        name: "check_menu_item",
        description: "Get detailed information about a menu item",
        parameters: {
            type: "object",
            properties: { item_name: { type: "string", description: "Name of the menu item" } },
            required: ["item_name"]
        }
    },
    {
        name: "check_table_availability",
        description: "Check table availability",
        parameters: {
            type: "object",
            properties: {
                date: { type: "string", description: "Date (YYYY-MM-DD)" },
                time: { type: "string", description: "Time (HH:MM)" },
                party_size: { type: "integer", description: "Number of people" },
                branch: { type: "string", enum: ["Gulshan", "Dhanmondi", "Banani", "Uttara", 'Mirpur -1'] }
            },
            required: ["date", "time", "party_size", "branch"]
        }
    },
    {
        name: "place_kacchi_order",
        description: "Place a Kacchi order",
        parameters: {
            type: "object",
            properties: {
                items: { type: "array", items: { type: "string" } },
                customer_name: { type: "string" },
                phone: { type: "string" },
                order_type: { type: "string", enum: ["takeout", "delivery"] },
                branch: { type: "string", enum: ["Gulshan", "Dhanmondi", "Banani", "Uttara", 'Mirpur -1'] },
                address: { type: "string" }
            },
            required: ["items", "customer_name", "phone", "order_type", "branch"]
        }
    },
    {
        name: "calculate_order_total",
        description: "Calculate order total",
        parameters: {
            type: "object",
            properties: { items: { type: "array", items: { type: "string" } } },
            required: ["items"]
        }
    },
    {
        name: "check_delivery_area",
        description: "Check delivery availability",
        parameters: {
            type: "object",
            properties: { area: { type: "string" } },
            required: ["area"]
        }
    }
];

// Menu Database
const menuItems = {
    "mutton kacchi regular": { price: 380, category: "biriyani", description: "Traditional mutton kacchi", halal: true },
    "mutton kacchi special": { price: 450, category: "biriyani", description: "Premium mutton kacchi", halal: true },
    "beef kacchi regular": { price: 350, category: "biriyani", description: "Tender beef kacchi", halal: true },
    "beef kacchi special": { price: 420, category: "biriyani", description: "Premium beef kacchi", halal: true },
    "chicken kacchi": { price: 320, category: "biriyani", description: "Flavorful chicken kacchi", halal: true },
    "borhani": { price: 40, category: "beverage", description: "Traditional yogurt drink", halal: true },
    "firni": { price: 80, category: "dessert", description: "Sweet rice pudding", halal: true },
    "raita": { price: 50, category: "side", description: "Yogurt with spices", halal: true },
    "salad": { price: 30, category: "side", description: "Fresh salad", halal: true },
    "soft drink": { price: 30, category: "beverage", halal: true },
    "mineral water": { price: 20, category: "beverage", halal: true },
    "mango lassi": { price: 120, category: "beverage", description: "Mango yogurt drink", halal: true },
    "sweet lassi": { price: 100, category: "beverage", description: "Sweet yogurt drink", halal: true }
};

const deliveryAreas = ["dhanmondi", "gulshan", "banani", "mohakhali", "uttara", "mirpur", "bashundhara", "baridhara", "badda", "mohammadpur"];

// Function Implementations with DATABASE
async function executeFunction(functionName, args) {
    console.log(`Executing: ${functionName}`, args);
    
    try {
        switch(functionName) {
            case 'make_reservation':
                const reservationId = 'KB' + Date.now();
                
                // Save to database
                const reservation = new Reservation({
                    reservationId,
                    customerName: args.name,
                    phone: args.phone,
                    date: new Date(args.date),
                    time: args.time,
                    partySize: args.party_size,
                    branch: args.branch,
                    specialRequests: args.special_requests || '',
                    status: 'confirmed'
                });
                
                await reservation.save();
                console.log('✅ Reservation saved to database:', reservationId);
                
                return {
                    success: true,
                    reservation_id: reservationId,
                    message: `🎉 Reservation Confirmed at Kacchi Bhai!\n\n📋 Reservation Details:\n━━━━━━━━━━━━━━━━━━━━\nID: ${reservationId}\n📅 Date: ${args.date}\n🕐 Time: ${args.time}\n👥 Party Size: ${args.party_size} people\n👤 Name: ${args.name}\n📞 Phone: ${args.phone}\n🏢 Branch: ${args.branch}${args.special_requests ? `\n📝 Special Requests: ${args.special_requests}` : ''}\n\n✅ Saved to our system! We'll send confirmation SMS shortly.\n\n🍛 Looking forward to serving you!\nJazakAllah Khair! 🌙`
                };
            
            case 'check_table_availability':
                // Check real availability from database
                const bookingDate = new Date(args.date);
                const existingReservations = await Reservation.find({
                    date: bookingDate,
                    time: args.time,
                    branch: args.branch,
                    status: { $in: ['pending', 'confirmed'] }
                });
                
                const maxTables = 20; // Assuming 20 tables per branch
                const availableTables = maxTables - existingReservations.length;
                const available = availableTables > 0;
                
                if (available) {
                    return {
                        available: true,
                        tables_left: availableTables,
                        message: `✅ Alhamdulillah! Tables available!\n\n📅 Date: ${args.date}\n🕐 Time: ${args.time}\n👥 Party Size: ${args.party_size}\n🏢 Branch: ${args.branch}\n📊 Tables Available: ${availableTables}/${maxTables}\n\nWould you like me to confirm this reservation?`
                    };
                } else {
                    return {
                        available: false,
                        message: `😔 Sorry, we're fully booked at ${args.time} on ${args.date} at ${args.branch}.\n\nPlease try a different time or branch!`
                    };
                }
            
            case 'place_kacchi_order':
                const orderId = 'KBO' + Date.now();
                const orderItems = args.items.map(item => {
                    const menuItem = menuItems[item.toLowerCase()];
                    return menuItem ? { name: item, price: menuItem.price, quantity: 1 } : null;
                }).filter(Boolean);
                
                const orderTotal = orderItems.reduce((sum, item) => sum + item.price, 0);
                const deliveryFee = args.order_type === 'delivery' ? 50 : 0;
                const total = orderTotal + deliveryFee;
                
                // Save order to database
                const order = new Order({
                    orderId,
                    customerName: args.customer_name,
                    phone: args.phone,
                    items: orderItems,
                    subtotal: orderTotal,
                    deliveryFee,
                    total,
                    orderType: args.order_type,
                    branch: args.branch,
                    address: args.address || '',
                    status: 'pending',
                    estimatedTime: args.order_type === 'delivery' ? 50 : 35
                });
                
                await order.save();
                console.log('✅ Order saved to database:', orderId);
                
                return {
                    success: true,
                    order_id: orderId,
                    items: orderItems,
                    total: total,
                    message: `🎉 Order Confirmed!\n\n📦 Order ID: ${orderId}\n\n🍛 Items:\n${orderItems.map(i => `• ${i.name} - ৳${i.price}`).join('\n')}\n\nSubtotal: ৳${orderTotal}${deliveryFee > 0 ? `\n🚚 Delivery Fee: ৳${deliveryFee}` : ''}\n━━━━━━━━━━━━━━━━━━━━\n💰 TOTAL: ৳${total}\n\n👤 ${args.customer_name}\n📞 ${args.phone}\n🏢 ${args.branch}\n${args.order_type === 'delivery' ? `📍 ${args.address}\n⏱️ Delivery: 40-60 min` : '🏃 Takeout: 30-40 min'}\n\n✅ Saved! We'll call you soon!\nJazakAllah Khair! 🍛`
                };
            
            case 'check_menu_item':
                const itemName = args.item_name.toLowerCase();
                const item = menuItems[itemName];
                
                if (item) {
                    return {
                        found: true,
                        item: itemName,
                        details: item,
                        message: `🍽️ ${args.item_name.toUpperCase()}\n\n💰 Price: ৳${item.price}\n📂 Category: ${item.category}\n${item.description ? `📝 ${item.description}` : ''}\n✅ 100% Halal`
                    };
                }
                return { found: false, message: `❌ "${args.item_name}" not found on menu.` };
            
            case 'calculate_order_total':
                const calcItems = args.items.map(item => {
                    const menuItem = menuItems[item.toLowerCase()];
                    return menuItem ? { name: item, price: menuItem.price } : null;
                }).filter(Boolean);
                
                const subtotal = calcItems.reduce((sum, item) => sum + item.price, 0);
                return {
                    items: calcItems,
                    subtotal,
                    message: `💰 Total: ৳${subtotal}\n\n${calcItems.map(i => `• ${i.name} - ৳${i.price}`).join('\n')}\n\n(+ ৳50 delivery if applicable)`
                };
            
            case 'check_delivery_area':
                const area = args.area.toLowerCase();
                const delivers = deliveryAreas.some(da => area.includes(da) || da.includes(area));
                
                return delivers ? 
                    { delivers: true, message: `✅ We deliver to ${args.area}!\n🚚 Fee: ৳50 | Time: 40-60 min` } :
                    { delivers: false, message: `😔 Sorry, we don't deliver to ${args.area} yet.` };
            
            default:
                return { error: 'Function not found' };
        }
    } catch (error) {
        console.error('Function execution error:', error);
        return { error: error.message };
    }
}

// API Endpoints
app.post('/api/set-key', (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) return res.status(400).json({ error: 'API key required' });
        openai = new OpenAI({ apiKey });
        res.json({ success: true, message: 'API key configured' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model, systemPrompt, knowledgeBase } = req.body;
        
        if (!openai) {
            return res.status(400).json({ error: 'OpenAI API key not configured' });
        }

        const fullMessages = [
            { role: 'system', content: `${systemPrompt}\n\nKnowledge Base:\n${knowledgeBase || ''}` },
            ...messages
        ];

        const response = await openai.chat.completions.create({
            model: model || 'gpt-4o-mini',
            messages: fullMessages,
            functions: functions,
            function_call: 'auto',
            temperature: 0.7
        });

        const assistantMessage = response.choices[0].message;

        if (assistantMessage.function_call) {
            const functionName = assistantMessage.function_call.name;
            const functionArgs = JSON.parse(assistantMessage.function_call.arguments);
            const functionResult = await executeFunction(functionName, functionArgs);
            
            const messagesWithFunction = [
                ...fullMessages,
                { role: 'assistant', content: null, function_call: assistantMessage.function_call },
                { role: 'function', name: functionName, content: JSON.stringify(functionResult) }
            ];

            const finalResponse = await openai.chat.completions.create({
                model: model || 'gpt-4o-mini',
                messages: messagesWithFunction,
                temperature: 0.7
            });

            return res.json({
                message: finalResponse.choices[0].message.content,
                function_called: functionName,
                function_args: functionArgs,
                function_result: functionResult,
                usage: {
                    prompt_tokens: response.usage.prompt_tokens + finalResponse.usage.prompt_tokens,
                    completion_tokens: response.usage.completion_tokens + finalResponse.usage.completion_tokens,
                    total_tokens: response.usage.total_tokens + finalResponse.usage.total_tokens
                }
            });
        }

        res.json({ message: assistantMessage.content, usage: response.usage });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// New Database Query Endpoints
app.get('/api/reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, reservations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        openai_configured: !!openai,
        database_connected: mongoose.connection.readyState === 1,
        restaurant: 'Kacchi Bhai'
    });
});

app.listen(PORT, () => {
    console.log(`🍛 Kacchi Bhai Chatbot running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
});

module.exports = app;