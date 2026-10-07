import { CustomerModel } from '../models/customer.model.js';
import { AdminModel } from '../models/admin.model.js';
import { AppError } from '../middleware/error.middleware.js';
import { validateEmail, validatePhone } from '../middleware/validate.middleware.js';

/**
 * Helper to sanitize customer document and strip sensitive passwordHash
 */
function sanitizeCustomer(doc) {
  if (!doc) return null;
  const customer = doc.toObject ? doc.toObject() : doc;
  const { passwordHash, ...safeCustomer } = customer;
  const firstName = safeCustomer.firstName || '';
  const lastName = safeCustomer.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || safeCustomer.name || 'Customer';

  return {
    ...safeCustomer,
    id: safeCustomer.id || safeCustomer._id?.toString?.(),
    firstName,
    lastName,
    name: fullName,
    role: safeCustomer.role || 'Customer',
    phone: safeCustomer.phone || null,
    address: safeCustomer.address || null,
    city: safeCustomer.city || null,
    district: safeCustomer.district || null,
    avatar: safeCustomer.avatar || null,
    isActive: safeCustomer.isActive ?? true,
    createdAt: safeCustomer.createdAt,
    updatedAt: safeCustomer.updatedAt,
  };
}

/**
 * @desc    Get all customers with filtering, search, sorting & pagination (Admin only)
 * @route   GET /api/customers
 * @access  Private / Admin
 */
export async function getAllCustomers(req, res, next) {
  try {
    const {
      search,
      q,
      status,
      isActive,
      city,
      district,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    // Search query across name, email, phone, city, district
    const searchKeyword = (search || q || '').trim();
    if (searchKeyword) {
      const searchRegex = new RegExp(searchKeyword, 'i');
      filter.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex },
        { district: searchRegex },
      ];
    }

    // Status / isActive filter
    if (status !== undefined) {
      const statusLower = String(status).toLowerCase();
      if (statusLower === 'active' || statusLower === 'true') {
        filter.isActive = true;
      } else if (statusLower === 'blocked' || statusLower === 'inactive' || statusLower === 'false') {
        filter.isActive = false;
      }
    } else if (isActive !== undefined) {
      filter.isActive = String(isActive).toLowerCase() === 'true';
    }

    // City & District filters
    if (city) {
      filter.city = new RegExp(`^${city.trim()}$`, 'i');
    }
    if (district) {
      filter.district = new RegExp(`^${district.trim()}$`, 'i');
    }

    // Pagination setup
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    const validSortFields = ['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'isActive'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = String(order).toLowerCase() === 'asc' ? 1 : -1;
    const sortOption = { [sortField]: sortDirection };

    // Fetch data and count concurrently
    const [customers, totalCount, activeCount, blockedCount] = await Promise.all([
      CustomerModel.find(filter)
        .select('-passwordHash')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CustomerModel.countDocuments(filter),
      CustomerModel.countDocuments({ isActive: true }),
      CustomerModel.countDocuments({ isActive: false }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.status(200).json({
      success: true,
      message: 'Customers retrieved successfully',
      data: customers.map((c) => sanitizeCustomer(c)),
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      stats: {
        totalCustomers: activeCount + blockedCount,
        activeCustomers: activeCount,
        blockedCustomers: blockedCount,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Get single customer by ID (Admin only)
 * @route   GET /api/customers/:id
 * @access  Private / Admin
 */
export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await CustomerModel.findById(id).select('-passwordHash');

    if (!customer) {
      return next(new AppError(`Customer with ID '${id}' was not found.`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Customer retrieved successfully',
      data: sanitizeCustomer(customer),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Update customer profile details by Admin
 * @route   PUT /api/customers/:id or PATCH /api/customers/:id
 * @access  Private / Admin
 */
export async function updateCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      name,
      email,
      phone,
      address,
      city,
      district,
      avatar,
      isActive,
    } = req.body;

    const customer = await CustomerModel.findById(id);

    if (!customer) {
      return next(new AppError(`Customer with ID '${id}' was not found.`, 404));
    }

    // Name handling
    if (firstName !== undefined) {
      if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
        return next(new AppError('First name cannot be empty.', 400));
      }
      customer.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
        return next(new AppError('Last name cannot be empty.', 400));
      }
      customer.lastName = lastName.trim();
    }

    if (name !== undefined && firstName === undefined && lastName === undefined) {
      const parts = name.trim().split(' ');
      customer.firstName = parts[0] || customer.firstName;
      customer.lastName = parts.slice(1).join(' ') || customer.lastName;
    }

    // Email validation & uniqueness check
    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      if (!validateEmail(normalizedEmail)) {
        return next(new AppError('Please provide a valid email address.', 400));
      }

      if (normalizedEmail !== customer.email) {
        const [existingCustomer, existingAdmin] = await Promise.all([
          CustomerModel.findOne({ email: normalizedEmail, _id: { $ne: id } }),
          AdminModel.findOne({ email: normalizedEmail }),
        ]);

        if (existingCustomer || existingAdmin) {
          return next(new AppError('Email is already in use by another account.', 409));
        }

        customer.email = normalizedEmail;
      }
    }

    // Phone validation
    if (phone !== undefined) {
      if (phone && phone.trim() !== '') {
        if (!validatePhone(phone.trim())) {
          return next(new AppError('Please enter a valid phone number.', 400));
        }
        customer.phone = phone.trim();
      } else {
        customer.phone = null;
      }
    }

    // Location / Address fields
    if (address !== undefined) {
      customer.address = address ? address.trim() : null;
    }
    if (city !== undefined) {
      customer.city = city ? city.trim() : null;
    }
    if (district !== undefined) {
      customer.district = district ? district.trim() : null;
    }
    if (avatar !== undefined) {
      customer.avatar = avatar ? avatar.trim() : null;
    }

    // Status update
    if (isActive !== undefined) {
      customer.isActive = Boolean(isActive);
    }

    const updatedCustomer = await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: sanitizeCustomer(updatedCustomer),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Block or unblock a customer (toggle or explicitly set status)
 * @route   PATCH /api/customers/:id/block or PATCH /api/customers/:id/status
 * @access  Private / Admin
 */
export async function toggleBlockCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive, block } = req.body;

    const customer = await CustomerModel.findById(id);

    if (!customer) {
      return next(new AppError(`Customer with ID '${id}' was not found.`, 404));
    }

    // Determine target isActive state
    let targetState;
    if (isActive !== undefined) {
      targetState = Boolean(isActive);
    } else if (block !== undefined) {
      targetState = !Boolean(block);
    } else {
      // Toggle current status if not explicitly passed
      targetState = !customer.isActive;
    }

    customer.isActive = targetState;
    const updatedCustomer = await customer.save();

    const statusAction = targetState ? 'unblocked and activated' : 'blocked and deactivated';

    res.status(200).json({
      success: true,
      message: `Customer ${statusAction} successfully`,
      data: sanitizeCustomer(updatedCustomer),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc    Delete a customer account by Admin
 * @route   DELETE /api/customers/:id
 * @access  Private / Admin
 */
export async function deleteCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const customer = await CustomerModel.findByIdAndDelete(id);

    if (!customer) {
      return next(new AppError(`Customer with ID '${id}' was not found.`, 404));
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      data: { id: customer._id },
    });
  } catch (error) {
    next(error);
  }
}
