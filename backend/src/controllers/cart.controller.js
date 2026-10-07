import { CustomerModel } from '../models/customer.model.js';
import { ProductModel } from '../models/product.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * Format raw customer cart with populated products into client-friendly CartItem objects
 */
function formatCartItems(customer) {
  if (!customer || !Array.isArray(customer.cart)) {
    return [];
  }

  return customer.cart
    .filter((entry) => entry && entry.productId)
    .map((entry) => {
      const product = entry.productId;
      const size = entry.selectedSize || product.size || '50ml';
      const productId = product._id || product.id;
      return {
        id: `${productId}-${size}`,
        product,
        quantity: entry.quantity || 1,
        selectedSize: size,
      };
    });
}

/**
 * 1. GET /api/cart
 * Retrieve current customer's shopping bag
 */
export async function getCart(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const customer = await CustomerModel.findById(userId).populate({
      path: 'cart.productId',
      model: 'Product',
    });

    if (!customer) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const items = formatCartItems(customer);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. POST /api/cart
 * Add an item to the customer's shopping bag
 */
export async function addItemToCart(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { productId, quantity = 1, selectedSize = '50ml' } = req.body;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }

    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const size = String(selectedSize || '50ml').trim();

    // Verify product exists in catalog
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError(`Product with ID "${productId}" not found.`, 404);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    // Check if item with identical product and size already exists
    const existingIndex = customer.cart.findIndex(
      (item) => String(item.productId) === String(productId) && item.selectedSize === size
    );

    if (existingIndex > -1) {
      customer.cart[existingIndex].quantity += qty;
    } else {
      customer.cart.push({
        productId,
        quantity: qty,
        selectedSize: size,
      });
    }

    await customer.save();

    await customer.populate({
      path: 'cart.productId',
      model: 'Product',
    });

    const items = formatCartItems(customer);

    res.status(200).json({
      success: true,
      message: `${product.name} added to your bag.`,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. PUT /api/cart/item
 * Update quantity of a cart item
 */
export async function updateCartItemQuantity(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { productId, selectedSize = '50ml', quantity } = req.body;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }

    const qty = parseInt(quantity, 10);
    const size = String(selectedSize || '50ml').trim();

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    if (qty <= 0) {
      // Remove item if quantity is zero or negative
      customer.cart = customer.cart.filter(
        (item) => !(String(item.productId) === String(productId) && item.selectedSize === size)
      );
    } else {
      const existingIndex = customer.cart.findIndex(
        (item) => String(item.productId) === String(productId) && item.selectedSize === size
      );

      if (existingIndex > -1) {
        customer.cart[existingIndex].quantity = qty;
      } else {
        customer.cart.push({
          productId,
          quantity: qty,
          selectedSize: size,
        });
      }
    }

    await customer.save();

    await customer.populate({
      path: 'cart.productId',
      model: 'Product',
    });

    const items = formatCartItems(customer);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. DELETE /api/cart/item
 * Remove a specific item from cart
 */
export async function removeCartItem(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const productId = req.query.productId || req.body.productId;
    const selectedSize = req.query.selectedSize || req.body.selectedSize || '50ml';

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    if (Array.isArray(customer.cart)) {
      customer.cart = customer.cart.filter(
        (item) => !(String(item.productId) === String(productId) && item.selectedSize === String(selectedSize))
      );
      await customer.save();
    }

    await customer.populate({
      path: 'cart.productId',
      model: 'Product',
    });

    const items = formatCartItems(customer);

    res.status(200).json({
      success: true,
      message: 'Item removed from bag.',
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. DELETE /api/cart
 * Empty the shopping cart
 */
export async function clearCart(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    const customer = await CustomerModel.findById(userId);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    res.status(200).json({
      success: true,
      message: 'Shopping bag cleared.',
      count: 0,
      data: [],
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. POST /api/cart/sync
 * Sync guest local cart items into database after authentication
 */
export async function syncCart(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { items = [] } = req.body;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    if (!Array.isArray(customer.cart)) {
      customer.cart = [];
    }

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const prodId = item.productId || item.product?.id || item.product?._id;
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        const size = item.selectedSize || item.size || '50ml';

        if (prodId) {
          const existingIndex = customer.cart.findIndex(
            (c) => String(c.productId) === String(prodId) && c.selectedSize === size
          );

          if (existingIndex > -1) {
            customer.cart[existingIndex].quantity = Math.max(customer.cart[existingIndex].quantity, qty);
          } else {
            customer.cart.push({
              productId: prodId,
              quantity: qty,
              selectedSize: size,
            });
          }
        }
      }

      await customer.save();
    }

    await customer.populate({
      path: 'cart.productId',
      model: 'Product',
    });

    const formatted = formatCartItems(customer);

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}
