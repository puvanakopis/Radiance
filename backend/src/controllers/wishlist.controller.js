import { CustomerModel } from '../models/customer.model.js';
import { ProductModel } from '../models/product.model.js';
import { AppError } from '../middleware/error.middleware.js';

/**
 * 1. GET /api/wishlist
 * Retrieve all products in current customer's wishlist
 */
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    // Populate the product details
    await customer.populate({
      path: 'wishlist',
      model: 'Product',
    });

    const items = (customer.wishlist || []).filter((item) => item !== null && item !== undefined);

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
 * 2. POST /api/wishlist/:productId
 * Add one product to the current customer's wishlist
 */
export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }

    // Verify product exists in catalog
    const product = await ProductModel.findById(productId);
    if (!product) {
      throw new AppError(`Product with ID "${productId}" does not exist.`, 404);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    // Add product to customer's wishlist array (avoiding duplicates)
    await CustomerModel.findByIdAndUpdate(
      userId,
      { $addToSet: { wishlist: productId } },
      { new: true }
    );

    // Fetch updated populated wishlist
    const updatedCustomer = await CustomerModel.findById(userId).populate({
      path: 'wishlist',
      model: 'Product',
    });

    const items = (updatedCustomer?.wishlist || []).filter(Boolean);

    res.status(200).json({
      success: true,
      message: `${product.name} added to your wishlist.`,
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. DELETE /api/wishlist/:productId
 * Remove one product from the current customer's wishlist
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    if (!productId) {
      throw new AppError('Product ID is required.', 400);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    // Remove product from wishlist array
    await CustomerModel.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: productId } },
      { new: true }
    );

    // Fetch updated populated wishlist
    const updatedCustomer = await CustomerModel.findById(userId).populate({
      path: 'wishlist',
      model: 'Product',
    });

    const items = (updatedCustomer?.wishlist || []).filter(Boolean);

    res.status(200).json({
      success: true,
      message: 'Product removed from your wishlist.',
      count: items.length,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. DELETE /api/wishlist
 * Remove all products from the current customer's wishlist
 */
export async function clearWishlist(req, res, next) {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      throw new AppError('Authentication required.', 401);
    }

    const customer = await CustomerModel.findById(userId);
    if (!customer) {
      throw new AppError('Customer account not found.', 404);
    }

    await CustomerModel.findByIdAndUpdate(
      userId,
      { $set: { wishlist: [] } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'All products removed from your wishlist.',
      count: 0,
      data: [],
    });
  } catch (err) {
    next(err);
  }
}
