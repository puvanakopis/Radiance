import { OrderModel } from '../models/order.model.js';
import { ProductModel } from '../models/product.model.js';
import { CustomerModel } from '../models/customer.model.js';
import { AppError } from '../middleware/error.middleware.js';

const STATUS_SEQUENCE = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

function generateInitialTimeline(paymentMethod, paymentStatus) {
  const now = new Date().toISOString();
  const isPaidOrConfirmed = paymentMethod === 'PayHere' || paymentStatus === 'Paid';

  return [
    {
      status: 'Placed',
      timestamp: now,
      description: 'Order submitted online',
      completed: true,
    },
    {
      status: 'Confirmed',
      timestamp: isPaidOrConfirmed ? now : '',
      description: isPaidOrConfirmed
        ? 'Payment verified and order confirmed'
        : 'Awaiting payment/WhatsApp confirmation',
      completed: isPaidOrConfirmed,
    },
    {
      status: 'Processing',
      timestamp: '',
      description: 'Dispatched to cleanroom botanical formulation',
      completed: false,
    },
    {
      status: 'Shipped',
      timestamp: '',
      description: 'Courier dispatch scheduled islandwide',
      completed: false,
    },
    {
      status: 'Delivered',
      timestamp: '',
      description: 'Delivered to recipient destination',
      completed: false,
    },
  ];
}

/**
 * 1. POST /api/orders
 * Create a new order (Supports guest and authenticated customer checkout)
 */
export async function createOrder(req, res, next) {
  try {
    const {
      customer,
      deliveryAddress,
      items,
      subtotal,
      discount = 0,
      shipping = 450,
      total,
      paymentMethod = 'WhatsApp',
      paymentStatus = 'Pending',
      paymentReference = '',
      notes = '',
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Order must contain at least one item.', 400);
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.district) {
      throw new AppError('Complete delivery address (street, city, district) is required.', 400);
    }

    // Determine customer identification
    const authUserId = req.user?.id || req.user?._id || req.user?.userId;
    const customerId = authUserId || customer?.id || `cust-guest-${Date.now()}`;
    const customerName = req.user?.name || customer?.name || `${customer?.firstName || ''} ${customer?.lastName || ''}`.trim() || 'Valued Patron';
    const customerEmail = req.user?.email || customer?.email || '';
    const customerPhone = req.user?.phone || customer?.phone || deliveryAddress.phone || '';

    if (!customerEmail || !customerPhone) {
      throw new AppError('Customer email and phone number are required for order tracking.', 400);
    }

    // Determine default status
    const initialStatus = paymentMethod === 'PayHere' || paymentStatus === 'Paid' ? 'Confirmed' : 'Placed';
    const initialPaymentStatus = paymentMethod === 'PayHere' ? 'Paid' : paymentStatus || 'Pending';
    const timeline = generateInitialTimeline(paymentMethod, initialPaymentStatus);

    // Calculate or verify total
    const computedSubtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
    const finalSubtotal = subtotal !== undefined ? Number(subtotal) : computedSubtotal;
    const finalTotal = total !== undefined ? Number(total) : finalSubtotal - Number(discount) + Number(shipping);

    // Create the order document
    const newOrder = await OrderModel.create({
      customer: {
        id: customerId,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      deliveryAddress: {
        id: deliveryAddress.id || `addr-${Date.now()}`,
        label: deliveryAddress.label || 'Primary Delivery Destination',
        recipientName: deliveryAddress.recipientName || customerName,
        phone: deliveryAddress.phone || customerPhone,
        street: deliveryAddress.street,
        apartment: deliveryAddress.apartment || '',
        city: deliveryAddress.city,
        district: deliveryAddress.district,
        postalCode: deliveryAddress.postalCode || '00100',
        country: deliveryAddress.country || 'Sri Lanka',
        isDefault: deliveryAddress.isDefault || false,
      },
      items: items.map((item) => ({
        productId: item.productId || item.id,
        productName: item.productName || item.name || 'Botanical Formula',
        productImage: item.productImage || item.image || '',
        size: item.size || '50ml',
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        sku: item.sku || item.productId || item.id || '',
      })),
      subtotal: finalSubtotal,
      discount: Number(discount) || 0,
      shipping: Number(shipping) || 450,
      total: finalTotal,
      status: initialStatus,
      paymentMethod,
      paymentStatus: initialPaymentStatus,
      paymentReference,
      notes,
      timeline,
      date: new Date().toISOString(),
    });

    // Update inventory stock for each product
    for (const item of items) {
      const prodId = item.productId || item.id;
      if (prodId) {
        await ProductModel.findByIdAndUpdate(prodId, {
          $inc: { stock: -Math.max(1, Number(item.quantity) || 1) },
        }).catch((err) => console.warn(`Stock decrement failed for ${prodId}:`, err.message));
      }
    }

    // If customer exists in CustomerModel, increment their stats
    if (authUserId || (customerEmail && !customerId.startsWith('cust-guest'))) {
      const userLookupId = authUserId || customerId;
      await CustomerModel.findByIdAndUpdate(userLookupId, {
        $inc: { totalOrders: 1, totalSpend: finalTotal },
      }).catch(() => {});
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: newOrder,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. GET /api/orders/my-orders
 * Get orders placed by current authenticated customer
 */
export async function getMyOrders(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const userEmail = req.user?.email;

    if (!userId && !userEmail) {
      throw new AppError('Authentication required.', 401);
    }

    const query = {
      $or: [
        ...(userId ? [{ 'customer.id': userId }] : []),
        ...(userEmail ? [{ 'customer.email': userEmail.toLowerCase() }] : []),
      ],
    };

    const orders = await OrderModel.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. GET /api/orders
 * Get all orders (Admin overview or Customer fallback)
 */
export async function getAllOrders(req, res, next) {
  try {
    const isAdmin = req.user?.role?.toUpperCase() === 'ADMIN';

    // If customer accesses /orders, redirect internally to their own orders
    if (!isAdmin) {
      return getMyOrders(req, res, next);
    }

    const { status, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
        { 'items.productName': searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      OrderModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
      data: orders,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. GET /api/orders/:id
 * Get single order by ID or orderNumber
 */
export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Order ID is required.', 400);
    }

    const order = await OrderModel.findOne({
      $or: [{ _id: id }, { orderNumber: id }],
    });

    if (!order) {
      throw new AppError(`Order "${id}" not found.`, 404);
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. PATCH /api/orders/:id/status
 * Update order status and lifecycle timeline (Admin only)
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!status || !validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const order = await OrderModel.findOne({
      $or: [{ _id: id }, { orderNumber: id }],
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    order.status = status;

    if (status === 'Cancelled') {
      order.timeline.push({
        status: 'Cancelled',
        timestamp: new Date().toISOString(),
        description: 'Order cancelled',
        completed: true,
      });
    } else {
      const targetIdx = STATUS_SEQUENCE.indexOf(status);
      const existingTimeline = order.timeline || [];

      order.timeline = STATUS_SEQUENCE.map((st, idx) => {
        const existing = existingTimeline.find((t) => t.status === st);
        const isPastOrCurrent = idx <= targetIdx;

        return {
          status: st,
          timestamp: isPastOrCurrent ? (existing?.timestamp || new Date().toISOString()) : '',
          description: existing?.description || (isPastOrCurrent ? `${st} step completed` : `Pending ${st}`),
          completed: isPastOrCurrent,
        };
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to ${status}.`,
      data: order,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. PATCH /api/orders/:id/payment
 * Update order payment status and reference (Admin only)
 */
export async function updateOrderPayment(req, res, next) {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentReference } = req.body;

    const order = await OrderModel.findOne({
      $or: [{ _id: id }, { orderNumber: id }],
    });

    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (paymentReference !== undefined) {
      order.paymentReference = paymentReference;
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment details updated.',
      data: order,
    });
  } catch (err) {
    next(err);
  }
}
