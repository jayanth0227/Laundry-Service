import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always load server/.env regardless of execution working directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Ensure standard Google DNS for MongoDB Atlas SRV record resolution across all network adapters
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('DNS server adjustment notice:', e.message);
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_laundry_jwt_key_2026_production';
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is not defined in server/.env');
}

// Models
import { User } from './models/User.js';
import { Service } from './models/Service.js';
import { Booking } from './models/Booking.js';
import { Customer } from './models/Customer.js';
import { Driver } from './models/Driver.js';
import { Item } from './models/Item.js';
import { PriceAllocation } from './models/PriceAllocation.js';
import { Schedule } from './models/Schedule.js';

app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Sync Admin user dynamically from .env on startup
async function syncAdminFromEnv() {
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : null;
  const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : null;

  if (!adminEmail || !adminPassword) {
    console.warn('[Admin Auth] ADMIN_EMAIL or ADMIN_PASSWORD is not set in .env.');
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(adminPassword, salt);

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log(`[Admin Auth] Admin credentials synced from .env for (${adminEmail})`);
    } else {
      admin = await User.create({
        name: 'Administrator',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: process.env.ADMIN_PHONE || '+1 (555) 234-5678',
        address: 'Central Plant Operations, Springfield',
      });
      console.log(`[Admin Auth] Admin user created in MongoDB Atlas from .env (${adminEmail})`);
    }
  } catch (err) {
    console.error('[Admin Auth] Error synchronizing admin credentials:', err.message);
  }
}

// Connect to MongoDB Atlas
let isMongoConnected = false;

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
  })
  .then(async () => {
    isMongoConnected = true;
    console.log(`[MongoDB Atlas] Connected successfully to: ${MONGODB_URI.split('@')[1] || 'Cluster'}`);
    await syncAdminFromEnv();
  })
  .catch((err) => {
    isMongoConnected = false;
    console.error(`[MongoDB Atlas] Connection Error: ${err.message}`);
  });

// Auth Middleware
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // ignore invalid token in optional auth
    }
  }
  next();
}

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid or expired' });
  }
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
  });
}

function requireCustomer(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'customer') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Customer access only' });
    }
  });
}

// ==================== AUTHENTICATION ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'customer',
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
    });

    // Also register in customer directory
    await Customer.create({
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      address: newUser.address,
      totalOrders: 0,
      totalSpend: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      notes: 'Web user registration',
    });

    const payload = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: payload,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// ==================== SERVICES CRUD (Admin manages, User views) ====================

// Public: Get all active services (or all for admin)
app.get('/api/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    console.error('Fetch services error:', err);
    res.status(500).json({ error: 'Failed to fetch services from database' });
  }
});

// Admin: Add new service
app.post('/api/services', requireAdmin, async (req, res) => {
  try {
    const { name, turnaroundHours, description, image, popular, active, items } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Service name is required' });
    }

    const newService = await Service.create({
      name: name.trim(),
      turnaroundHours: turnaroundHours ? Number(turnaroundHours) : 24,
      description: description ? description.trim() : '',
      image: image || '',
      popular: Boolean(popular),
      active: active !== undefined ? Boolean(active) : true,
      items: Array.isArray(items)
        ? items.map((it) => ({
            itemName: it.itemName?.trim(),
            price: Number(it.price) || 0,
            unit: it.unit || 'piece',
          })).filter(it => it.itemName)
        : [],
    });

    console.log(`[Services] Added new service: "${newService.name}" with ${newService.items.length} priced items`);
    res.status(201).json(newService);
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ error: 'Failed to create service in database' });
  }
});

// Admin: Update service
app.put('/api/services/:id', requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (Array.isArray(updateData.items)) {
      updateData.items = updateData.items
        .map((it) => ({
          itemName: it.itemName?.trim(),
          price: Number(it.price) || 0,
          unit: it.unit || 'piece',
        }))
        .filter((it) => it.itemName);
    }
    const updated = await Service.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Admin: Delete service
app.delete('/api/services/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Service not found' });
    }
    await PriceAllocation.deleteMany({ serviceId: req.params.id });
    console.log(`[Services] Deleted service ID: ${req.params.id}`);
    res.json({ success: true, message: 'Service removed successfully' });
  } catch (err) {
    console.error('Delete service error:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ==================== GARMENT / ITEM REGISTRY (Mandatory & Independent) ====================

// Public / Admin: Get all registered garments/items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: 1 });
    res.json(items);
  } catch (err) {
    console.error('Fetch items error:', err);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Admin: Add new registered garment/item
app.post('/api/items', requireAdmin, async (req, res) => {
  try {
    const { name, unit, description, active } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Garment item name is required' });
    }

    const cleanName = name.trim();
    const existing = await Item.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, 'i') } });
    if (existing) {
      return res.status(400).json({ error: `Item "${cleanName}" already exists in the registry` });
    }

    const newItem = await Item.create({
      name: cleanName,
      unit: unit ? unit.trim() : 'piece',
      description: description ? description.trim() : '',
      active: active !== undefined ? Boolean(active) : true,
    });

    console.log(`[Items] Added new registered garment: "${newItem.name}"`);
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ error: 'Failed to add item to registry' });
  }
});

// Admin: Update garment/item
app.put('/api/items/:id', requireAdmin, async (req, res) => {
  try {
    const { name, unit, description, active } = req.body;
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (unit) updateData.unit = unit.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (active !== undefined) updateData.active = Boolean(active);

    const updated = await Item.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Sync itemName in price allocations if name changed
    if (name) {
      await PriceAllocation.updateMany(
        { itemId: req.params.id },
        { itemName: updated.name, unit: updated.unit }
      );
      // Sync service items
      const services = await Service.find({ 'items.itemName': { $exists: true } });
      for (const srv of services) {
        let changed = false;
        srv.items = srv.items.map((it) => {
          if (it.itemName === name || it.itemId?.toString() === req.params.id) {
            changed = true;
            return { ...it.toObject(), itemName: updated.name, unit: updated.unit };
          }
          return it;
        });
        if (changed) await srv.save();
      }
    }

    res.json(updated);
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Admin: Delete garment/item
app.delete('/api/items/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Item.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Remove from allocations and services
    await PriceAllocation.deleteMany({ itemId: req.params.id });
    await Service.updateMany(
      {},
      { $pull: { items: { itemName: deleted.name } } }
    );

    console.log(`[Items] Removed garment: "${deleted.name}"`);
    res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// ==================== PRICE ALLOCATION (Allocate item price based on service) ====================

// Get all price allocations (optionally filter by serviceId)
app.get('/api/price-allocations', async (req, res) => {
  try {
    const filter = {};
    if (req.query.serviceId) filter.serviceId = req.query.serviceId;
    const allocations = await PriceAllocation.find(filter);
    res.json(allocations);
  } catch (err) {
    console.error('Fetch price allocations error:', err);
    res.status(500).json({ error: 'Failed to fetch price allocations' });
  }
});

// Admin: Allocate/update prices for a service
app.post('/api/price-allocations/allocate', requireAdmin, async (req, res) => {
  try {
    const { serviceId, allocations } = req.body;
    if (!serviceId) {
      return res.status(400).json({ error: 'Service ID is required for price allocation' });
    }

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (!Array.isArray(allocations)) {
      return res.status(400).json({ error: 'Allocations array is required' });
    }

    const updatedServiceItems = [];

    for (const alloc of allocations) {
      const { itemId, itemName, price, unit } = alloc;
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) continue;

      let itemDoc = null;
      if (itemId) {
        itemDoc = await Item.findById(itemId);
      } else if (itemName) {
        itemDoc = await Item.findOne({ name: itemName.trim() });
      }

      const finalName = itemDoc ? itemDoc.name : itemName?.trim();
      if (!finalName) continue;

      const finalUnit = itemDoc?.unit || unit || 'piece';

      // Upsert into PriceAllocation collection
      await PriceAllocation.findOneAndUpdate(
        { serviceId, itemName: finalName },
        {
          serviceId,
          itemId: itemDoc?._id || new mongoose.Types.ObjectId(),
          itemName: finalName,
          price: numPrice,
          unit: finalUnit,
        },
        { upsert: true, new: true }
      );

      updatedServiceItems.push({
        itemName: finalName,
        price: numPrice,
        unit: finalUnit,
      });
    }

    // Simultaneously sync into Service.items so user booking page fetches them cleanly
    service.items = updatedServiceItems;
    await service.save();

    console.log(`[Price Allocation] Allocated ${updatedServiceItems.length} item prices for service "${service.name}"`);
    res.json({
      success: true,
      serviceName: service.name,
      allocatedCount: updatedServiceItems.length,
      items: service.items,
    });
  } catch (err) {
    console.error('Price allocation error:', err);
    res.status(500).json({ error: 'Failed to allocate prices for service' });
  }
});

// ==================== BOOKINGS / ORDERS ROUTES ====================

// Customer places a booking -> Goes to Admin Dashboard and MongoDB Atlas
app.post('/api/bookings', async (req, res) => {
  try {
    // Strict RBAC: Admins are not allowed to place customer bookings
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        if (decoded.role === 'admin') {
          return res.status(403).json({ error: 'Forbidden: Administrators cannot book customer doorstep pickups. Please use a customer account.' });
        }
      } catch (e) {
        // invalid token
      }
    }

    const count = await Booking.countDocuments();
    const bookingNumber = `BKG-${8940 + count + 1}`;

    const subtotal = Number(req.body.totalAmount) || 0;
    const deliveryFee = req.body.deliveryFee !== undefined ? Number(req.body.deliveryFee) : (subtotal >= 499 ? 0 : 50);
    const tax = req.body.tax !== undefined ? Number(req.body.tax) : Math.round(subtotal * 0.05 * 100) / 100;
    const grandTotal = req.body.grandTotal !== undefined ? Number(req.body.grandTotal) : Math.round((subtotal + deliveryFee + tax) * 100) / 100;

    const newBooking = await Booking.create({
      bookingNumber,
      customerId: req.body.customerId || '',
      customerName: req.body.customerName || 'Customer',
      customerPhone: req.body.customerPhone || '',
      customerEmail: req.body.customerEmail || '',
      serviceType: req.body.serviceType || 'Garment Care',
      items: req.body.items || [],
      weightKg: req.body.weightKg || null,
      pickupDate: req.body.pickupDate || new Date().toISOString().split('T')[0],
      pickupSlot: req.body.pickupSlot || '14:00 - 16:00',
      deliveryDate: req.body.deliveryDate || '',
      deliverySlot: req.body.deliverySlot || '17:00 - 19:00',
      address: req.body.address || { street: '', city: 'Springfield', zipCode: '97477', instructions: '' },
      detergentPreference: req.body.detergentPreference || 'Standard Eco Detergent',
      specialInstructions: req.body.specialInstructions || '',
      status: 'booking_received',
      statusHistory: [
        {
          status: 'booking_received',
          timestamp: new Date(),
          note: 'Booking submitted by customer. Awaiting pickup dispatch.',
        },
      ],
      totalAmount: subtotal,
      deliveryFee,
      tax,
      grandTotal,
      paymentStatus: 'confirmed',
      paymentMethod: req.body.paymentMethod || 'Direct Booking',
      assignedDriver: 'Unassigned',
    });

    // Upsert customer CRM record in MongoDB
    if (newBooking.customerPhone || newBooking.customerEmail) {
      await Customer.findOneAndUpdate(
        {
          $or: [
            ...(newBooking.customerPhone ? [{ phone: newBooking.customerPhone }] : []),
            ...(newBooking.customerEmail ? [{ email: newBooking.customerEmail }] : []),
          ],
        },
        {
          $setOnInsert: {
            name: newBooking.customerName,
            phone: newBooking.customerPhone,
            email: newBooking.customerEmail,
            address: `${newBooking.address.street}, ${newBooking.address.city}`,
            registeredDate: new Date().toISOString().split('T')[0],
          },
          $inc: {
            totalOrders: 1,
            totalSpend: grandTotal,
          },
        },
        { upsert: true, new: true }
      );
    }

    console.log(`[MongoDB Atlas] Saved Booking #${newBooking.bookingNumber} for ${newBooking.customerName} (₹${newBooking.grandTotal})`);
    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Failed to create booking in database' });
  }
});

// Bookings Route (Admin views all/filtered; Customer views their own; Guest views empty list)
app.get('/api/bookings', optionalAuth, async (req, res) => {
  try {
    // If Admin, can view all bookings (and filter/search)
    if (req.user && req.user.role === 'admin') {
      const { status, search } = req.query;
      const filter = {};

      if (status && status !== 'all') {
        filter.status = status;
      }

      if (search) {
        const q = String(search).trim();
        filter.$or = [
          { bookingNumber: { $regex: q, $options: 'i' } },
          { customerName: { $regex: q, $options: 'i' } },
          { customerPhone: { $regex: q, $options: 'i' } },
          { 'address.street': { $regex: q, $options: 'i' } },
        ];
      }

      const bookings = await Booking.find(filter).sort({ createdAt: -1 });
      return res.json(bookings);
    }

    // If Customer, return ONLY that customer's bookings
    if (req.user && req.user.role === 'customer') {
      const filter = {
        $or: [
          { customerId: req.user.id },
          ...(req.user.email ? [{ customerEmail: req.user.email }] : []),
          ...(req.user.phone ? [{ customerPhone: req.user.phone }] : []),
        ],
      };
      const bookings = await Booking.find(filter).sort({ createdAt: -1 });
      return res.json(bookings);
    }

    // Guest / non-authenticated: return empty list safely
    return res.json([]);
  } catch (err) {
    console.error('Fetch bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Customer gets their own bookings
app.get('/api/bookings/my', requireCustomer, async (req, res) => {
  try {
    const filter = {
      $or: [
        { customerId: req.user.id },
        ...(req.user.email ? [{ customerEmail: req.user.email }] : []),
        ...(req.user.phone ? [{ customerPhone: req.user.phone }] : []),
      ],
    };
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer bookings' });
  }
});

// Admin updates booking status / driver
app.patch('/api/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, note, assignedDriver } = req.body;
    const query = {
      $or: [{ bookingNumber: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }].filter(Boolean),
    };

    const booking = await Booking.findOne(query);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (status) {
      booking.status = status;
      booking.statusHistory.push({
        status,
        timestamp: new Date(),
        note: note || `Status updated to ${status.replace(/_/g, ' ')}`,
      });
    }

    if (assignedDriver !== undefined) {
      booking.assignedDriver = assignedDriver;
    }

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Admin deletes a booking
app.delete('/api/bookings/:id', requireAdmin, async (req, res) => {
  try {
    const query = {
      $or: [{ bookingNumber: req.params.id }, { _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }].filter(Boolean),
    };
    await Booking.deleteOne(query);
    res.json({ success: true, message: 'Booking removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Legacy /api/orders routing aliases
app.get('/api/orders', requireAdmin, async (req, res) => {
  req.url = '/api/bookings';
  app.handle(req, res);
});
app.post('/api/orders', async (req, res) => {
  req.url = '/api/bookings';
  app.handle(req, res);
});
app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  req.url = `/api/bookings/${req.params.id}/status`;
  app.handle(req, res);
});

// Metrics
app.get('/api/metrics', optionalAuth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json({
        activeOrders: 0,
        pendingPickup: 0,
        inProcessing: 0,
        readyOrOut: 0,
        completedToday: 0,
        totalRevenue: 0,
        totalOrdersCount: 0,
        totalCustomersCount: 0,
        isMongoConnected,
      });
    }

    const [allBookings, customerCount] = await Promise.all([
      Booking.find(),
      Customer.countDocuments(),
    ]);

    const activeOrders = allBookings.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
    const pendingPickup = allBookings.filter((o) => o.status === 'booking_received' || o.status === 'pickup_scheduled').length;
    const inProcessing = allBookings.filter((o) =>
      ['picked_up', 'in_wash_and_iron', 'washing', 'drying', 'quality_check'].includes(o.status)
    ).length;
    const readyOrOut = allBookings.filter((o) => ['ready_for_delivery', 'out_for_delivery'].includes(o.status)).length;
    const completedToday = allBookings.filter((o) => o.status === 'delivered').length;
    const totalRevenue = allBookings.reduce((sum, o) => sum + (o.grandTotal || o.totalAmount || 0), 0);

    res.json({
      activeOrders,
      pendingPickup,
      inProcessing,
      readyOrOut,
      completedToday,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrdersCount: allBookings.length,
      totalCustomersCount: customerCount,
      isMongoConnected,
    });
  } catch (err) {
    console.error('Metrics error:', err);
    res.status(500).json({ error: 'Failed to compute metrics' });
  }
});

// Drivers
app.get('/api/drivers', optionalAuth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json([]);
    }
    const drivers = await Driver.find();
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drivers' });
  }
});

// Customers
app.get('/api/customers', optionalAuth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.json([]);
    }
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// DEFAULT WEEKLY OPERATIONAL SCHEDULE (Monday - Sunday)
const DEFAULT_WEEKLY_SCHEDULE = [
  { day: 'monday', label: 'Monday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'tuesday', label: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'wednesday', label: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'thursday', label: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'friday', label: 'Friday', isOpen: true, openTime: '08:00', closeTime: '20:00' },
  { day: 'saturday', label: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
  { day: 'sunday', label: 'Sunday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
];

function generateSlotsForDay(openTime = '08:00', closeTime = '20:00', slotDurationMinutes = 30) {
  const [openH, openM] = (openTime || '08:00').split(':').map(Number);
  const [closeH, closeM] = (closeTime || '20:00').split(':').map(Number);
  const openTotalMin = openH * 60 + (openM || 0);
  const closeTotalMin = closeH * 60 + (closeM || 0);
  const durationMin = Math.max(15, Number(slotDurationMinutes) || 30);

  const slots = [];
  for (let start = openTotalMin; start + durationMin <= closeTotalMin; start += durationMin) {
    const end = start + durationMin;
    const startH = Math.floor(start / 60);
    const startM = start % 60;
    const endH = Math.floor(end / 60);
    const endM = end % 60;

    const formatTime = (h, m) => {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(displayH)}:${pad(m)} ${period}`;
    };

    const pad = (n) => String(n).padStart(2, '0');
    const id = `${pad(startH)}:${pad(startM)} - ${pad(endH)}:${pad(endM)}`;
    const label = `${formatTime(startH, startM)} - ${formatTime(endH, endM)}`;

    let period = 'Morning';
    if (startH >= 12 && startH < 17) period = 'Afternoon';
    else if (startH >= 17) period = 'Evening';

    slots.push({ id, label, period, startMinutes: start, endMinutes: end });
  }
  return slots;
}

// Operational Schedule Endpoints (Get schedule & query slots for a date)
app.get('/api/schedule', async (req, res) => {
  try {
    let scheduleDoc = await Schedule.findOne({ key: 'weekly_operational_schedule' });
    if (!scheduleDoc) {
      scheduleDoc = await Schedule.create({
        key: 'weekly_operational_schedule',
        days: DEFAULT_WEEKLY_SCHEDULE,
        slotDurationMinutes: 30,
        slotDurationHours: 0.5,
      });
    }

    const durationMinutes = Number(scheduleDoc.slotDurationMinutes) || (Number(scheduleDoc.slotDurationHours) ? Number(scheduleDoc.slotDurationHours) * 60 : 30);

    const { date } = req.query;
    if (date) {
      const dateObj = new Date(date + 'T00:00:00');
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayIndex = isNaN(dateObj.getDay()) ? new Date().getDay() : dateObj.getDay();
      const dayName = dayNames[dayIndex];

      const dayConfig = (scheduleDoc.days && scheduleDoc.days.find((d) => d.day.toLowerCase() === dayName)) || {
        day: dayName,
        label: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        isOpen: true,
        openTime: '08:00',
        closeTime: '20:00',
      };

      const openTime = dayConfig.openTime || '08:00';
      const closeTime = dayConfig.closeTime || '20:00';

      const generatedSlots = generateSlotsForDay(
        openTime,
        closeTime,
        durationMinutes
      );

      // Slots can be booked anytime without artificial past cutoffs or capacity limits
      const availableSlots = generatedSlots.map((slot) => {
        return {
          id: slot.id,
          label: slot.label,
          period: slot.period,
          available: true,
          isPast: false,
          isFull: false,
        };
      });

      return res.json({
        isOpen: true,
        day: dayConfig.day,
        label: dayConfig.label,
        openTime,
        closeTime,
        slotDurationMinutes: durationMinutes,
        availableSlots,
        schedule: scheduleDoc.days,
      });
    }

    return res.json({
      days: scheduleDoc.days,
      slotDurationMinutes: durationMinutes,
      slotDurationHours: durationMinutes / 60,
    });
  } catch (err) {
    console.error('Schedule fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Update Operational Schedule (Admin sets weekly availability, timings, and slot duration)
app.put('/api/schedule', optionalAuth, async (req, res) => {
  try {
    const { days, slotDurationMinutes, slotDurationHours } = req.body;
    if (!Array.isArray(days)) {
      return res.status(400).json({ error: 'days must be an array of day schedule objects' });
    }

    let scheduleDoc = await Schedule.findOne({ key: 'weekly_operational_schedule' });
    if (!scheduleDoc) {
      scheduleDoc = new Schedule({ key: 'weekly_operational_schedule' });
    }

    scheduleDoc.days = days;
    if (slotDurationMinutes !== undefined) {
      scheduleDoc.slotDurationMinutes = Number(slotDurationMinutes);
      scheduleDoc.slotDurationHours = Number(slotDurationMinutes) / 60;
    } else if (slotDurationHours !== undefined) {
      scheduleDoc.slotDurationHours = Number(slotDurationHours);
      scheduleDoc.slotDurationMinutes = Number(slotDurationHours) * 60;
    }

    await scheduleDoc.save();
    res.json({
      success: true,
      schedule: scheduleDoc,
      slotDurationMinutes: scheduleDoc.slotDurationMinutes,
    });
  } catch (err) {
    console.error('Schedule update error:', err);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 AquaClean Laundry Backend API Server running on port ${PORT} (0.0.0.0)`);
  console.log(`   Database Status: MongoDB Atlas (${MONGODB_URI ? (MONGODB_URI.split('@')[1] || 'Connected') : 'Not Configured'})`);
  console.log(`   Admin Email (from .env): ${process.env.ADMIN_EMAIL || 'Not configured'}`);
  console.log(`=======================================================`);
});
