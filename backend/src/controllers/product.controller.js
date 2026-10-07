import {
  ProductModel,
  getNextProductId,
} from '../models/product.model.js';
import { AppError } from '../middleware/error.middleware.js';

// Helper to sanitize and format product document response
function formatProduct(doc) {
  if (!doc) return null;
  const product = doc.toObject ? doc.toObject() : doc;
  return {
    ...product,
    id: product.id || product._id,
  };
}

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Public / Admin
 */
export async function createProduct(req, res, next) {
  try {
    const {
      id,
      _id,
      name,
      category,
      subcategory,
      price,
      size,
      description,
      longDescription,
      ingredients,
      activeIngredients,
      howToUse,
      skinTypes,
      image,
      images,
      rating,
      reviewCount,
      badge,
      stock,
    } = req.body;

    const assignedId = (id || _id || (await getNextProductId())).trim();
    const productImg = (image || (Array.isArray(images) && images[0]) || '').trim();

    const product = new ProductModel({
      _id: assignedId,
      name: name.trim(),
      category,
      subcategory: subcategory ? subcategory.trim() : 'General',
      price: Number(price),
      size: size || '50ml',
      description: description.trim(),
      longDescription: longDescription ? longDescription.trim() : description.trim(),
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      activeIngredients: Array.isArray(activeIngredients) ? activeIngredients : [],
      howToUse: howToUse || '',
      skinTypes: Array.isArray(skinTypes) && skinTypes.length > 0 ? skinTypes : ['All Skin Types'],
      image: productImg,
      rating: rating !== undefined ? Number(rating) : 5.0,
      reviewCount: reviewCount !== undefined ? Number(reviewCount) : 0,
      badge: badge || null,
      stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : 0,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: formatProduct(savedProduct),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get all products with query filtering, searching, sorting & pagination
 * @route   GET /api/products
 * @access  Public
 */
export async function getAllProducts(req, res, next) {
  try {
    const {
      category,
      subcategory,
      skinType,
      skinTypes,
      minPrice,
      maxPrice,
      minRating,
      badge,
      status,
      stockFilter,
      inStockOnly,
      search,
      q,
      searchQuery,
      sortBy,
      page,
      limit,
    } = req.query;

    const filter = {};

    // Category filter
    if (category) {
      if (typeof category === 'string' && category.includes(',')) {
        filter.category = { $in: category.split(',').map((c) => c.trim()) };
      } else {
        filter.category = category;
      }
    }

    // Subcategory filter
    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Skin Types filter
    const targetSkinTypes = skinTypes || skinType;
    if (targetSkinTypes) {
      const typeList = targetSkinTypes.split(',').map((t) => t.trim());
      filter.$or = [
        { skinTypes: { $in: typeList } },
        { skinTypes: 'All Skin Types' },
      ];
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined && !isNaN(Number(minPrice))) {
        filter.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Rating filter
    if (minRating !== undefined && !isNaN(Number(minRating))) {
      filter.rating = { $gte: Number(minRating) };
    }

    // Badge filter
    if (badge && typeof badge === 'string') {
      filter.badge = badge;
    }

    // Stock / Inventory filter
    if (
      inStockOnly === 'true' ||
      inStockOnly === true ||
      stockFilter === 'In Stock' ||
      stockFilter === 'inStock' ||
      status === 'In Stock'
    ) {
      filter.stock = { $gt: 0 };
    } else if (
      stockFilter === 'Out of Stock' ||
      stockFilter === 'outOfStock' ||
      status === 'Out of Stock'
    ) {
      filter.stock = { $lte: 0 };
    }

    // Search query across name, category, subcategory, description, ingredients
    const searchTerm = (search || q || searchQuery)?.trim();
    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      const searchConditions = [
        { name: regex },
        { category: regex },
        { subcategory: regex },
        { description: regex },
        { ingredients: regex },
      ];

      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    // Sorting options
    let sortOption = { createdAt: -1 };
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          sortOption = { price: 1 };
          break;
        case 'price-desc':
          sortOption = { price: -1 };
          break;
        case 'rating':
          sortOption = { rating: -1, reviewCount: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'featured':
          sortOption = { rating: -1, reviewCount: -1 };
          break;
        case 'name-asc':
          sortOption = { name: 1 };
          break;
        case 'name-desc':
          sortOption = { name: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    // Pagination
    const pageNum = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNum = limit ? Math.max(1, parseInt(limit, 10)) : 0; // 0 = all

    const total = await ProductModel.countDocuments(filter);

    let query = ProductModel.find(filter).sort(sortOption);
    if (limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const products = await query.exec();

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: limitNum > 0 ? pageNum : 1,
      totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
      data: products.map(formatProduct),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get a single product by ID (_id)
 * @route   GET /api/products/:id
 * @access  Public
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      throw new AppError('Product identifier is required', 400);
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      throw new AppError(`Product not found with identifier: "${id}"`, 404);
    }

    res.status(200).json({
      success: true,
      data: formatProduct(product),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update an existing product by ID (_id)
 * @route   PUT /api/products/:id
 * @access  Public / Admin
 */
export async function updateProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Product identifier is required', 400);
    }

    const product = await ProductModel.findById(id);

    if (!product) {
      throw new AppError(`Product not found with identifier: "${id}"`, 404);
    }

    const updates = req.body;

    // Update fields if provided
    if (updates.name !== undefined) product.name = updates.name.trim();
    if (updates.category !== undefined) product.category = updates.category;
    if (updates.subcategory !== undefined) product.subcategory = updates.subcategory.trim();
    if (updates.price !== undefined) product.price = Number(updates.price);
    if (updates.size !== undefined) product.size = updates.size;
    if (updates.description !== undefined) product.description = updates.description.trim();
    if (updates.longDescription !== undefined) product.longDescription = updates.longDescription.trim();
    if (updates.ingredients !== undefined) product.ingredients = updates.ingredients;
    if (updates.activeIngredients !== undefined) product.activeIngredients = updates.activeIngredients;
    if (updates.howToUse !== undefined) product.howToUse = updates.howToUse;
    if (updates.skinTypes !== undefined) product.skinTypes = updates.skinTypes;
    if (updates.image !== undefined) {
      product.image = updates.image;
    } else if (updates.images !== undefined) {
      product.image = Array.isArray(updates.images) ? updates.images[0] || '' : updates.images;
    }
    if (updates.rating !== undefined) product.rating = Number(updates.rating);
    if (updates.reviewCount !== undefined) product.reviewCount = Number(updates.reviewCount);
    if (updates.badge !== undefined) product.badge = updates.badge;
    if (updates.stock !== undefined && !isNaN(Number(updates.stock))) {
      product.stock = Math.max(0, Number(updates.stock));
    }

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: formatProduct(updatedProduct),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a product by ID (_id)
 * @route   DELETE /api/products/:id
 * @access  Public / Admin
 */
export async function deleteProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (!id) {
      throw new AppError('Product identifier is required', 400);
    }

    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      throw new AppError(`Product not found with identifier: "${id}"`, 404);
    }

    res.status(200).json({
      success: true,
      message: `Product "${deletedProduct.name}" (${deletedProduct._id}) deleted successfully`,
      data: {
        id: deletedProduct._id,
        name: deletedProduct.name,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Add or update review/feedback on a product
 * @route   POST /api/products/:id/feedback or POST /api/products/:id/reviews
 * @access  Private (Authenticated User)
 */
export async function addFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, feedback, comment } = req.body;

    if (!req.user || !req.user.userId) {
      throw new AppError('Authentication required to submit feedback.', 401);
    }

    if (rating === undefined || rating === null || isNaN(Number(rating))) {
      throw new AppError('Rating is required and must be a number between 1 and 5.', 400);
    }

    const reviewRating = Number(rating);
    if (reviewRating < 1 || reviewRating > 5) {
      throw new AppError('Rating must be between 1 and 5 stars.', 400);
    }

    const reviewText = (feedback || comment || '').trim();
    if (!reviewText) {
      throw new AppError('Feedback text is required.', 400);
    }

    const userId = req.user.userId;

    const product = await ProductModel.findById(id);

    if (!product) {
      throw new AppError(`Product not found with identifier: "${id}"`, 404);
    }

    // Initialize reviews array if null
    if (!Array.isArray(product.reviews)) {
      product.reviews = [];
    }

    // Check if user has already reviewed this product
    const existingIndex = product.reviews.findIndex((r) => r.userId === userId);

    if (existingIndex !== -1) {
      product.reviews[existingIndex].rating = reviewRating;
      product.reviews[existingIndex].feedback = reviewText;
      product.reviews[existingIndex].createdAt = new Date();
    } else {
      product.reviews.push({
        userId,
        rating: reviewRating,
        feedback: reviewText,
        createdAt: new Date(),
      });
    }

    // Recalculate average rating & reviewCount
    const totalReviews = product.reviews.length;
    const sumRatings = product.reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avgRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;

    product.reviewCount = totalReviews;
    product.rating = avgRating;

    const updatedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: existingIndex !== -1 ? 'Review updated successfully' : 'Feedback submitted successfully',
      data: formatProduct(updatedProduct),
    });
  } catch (error) {
    next(error);
  }
}

