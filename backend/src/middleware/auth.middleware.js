import { verifyToken } from '../utils/jwt.js';
import { CustomerModel } from '../models/customer.model.js';
import { AdminModel } from '../models/admin.model.js';

// Helper to look up an account by ID across Admin and Customer collections
export async function findUserById(id, rolePreference) {
  const roleUpper = rolePreference?.toUpperCase();

  if (roleUpper === 'ADMIN') {
    const admin = await AdminModel.findById(id);
    if (admin) return { user: admin, role: admin.role || 'Admin' };
  } else if (roleUpper === 'CUSTOMER') {
    const customer = await CustomerModel.findById(id);
    if (customer) return { user: customer, role: customer.role || 'Customer' };
  }

  // Fallback search across both models
  const admin = await AdminModel.findById(id);
  if (admin) return { user: admin, role: admin.role || 'Admin' };

  const customer = await CustomerModel.findById(id);
  if (customer) return { user: customer, role: customer.role || 'Customer' };

  return null;
}

/**
 * Middleware: Authenticates JWT token and retrieves current user data from DB
 * Attaches the authenticated user object to req.user and req.currentUser
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. No token provided.',
    });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const userId = decoded.userId || decoded.id;

    // Fetch fresh user data from database
    const result = await findUserById(userId, decoded.role);

    if (!result || !result.user) {
      res.status(401).json({
        success: false,
        message: 'Authenticated user account no longer exists.',
      });
      return;
    }

    const { user, role } = result;

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
      return;
    }

    const userObj = user.toObject ? user.toObject() : user;
    const { passwordHash, ...safeUser } = userObj;

    const currentUserData = {
      ...safeUser,
      id: userObj.id || userObj._id,
      userId: userObj.id || userObj._id,
      role: userObj.role || role,
      doc: user,
    };

    req.user = currentUserData;
    req.currentUser = currentUserData;

    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.',
    });
  }
}

/**
 * Alias middleware for authenticateToken
 */
export const getCurrentUser = authenticateToken;

/**
 * Middleware: Restricts route to Admin role only
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role?.toUpperCase() !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access forbidden: Admin privileges required.',
    });
    return;
  }

  next();
}

/**
 * Middleware: Optional token authentication with DB user lookup
 */
export async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (token) {
    try {
      const decoded = verifyToken(token);
      const userId = decoded.userId || decoded.id;
      const result = await findUserById(userId, decoded.role);

      if (result && result.user && result.user.isActive) {
        const userObj = result.user.toObject ? result.user.toObject() : result.user;
        const { passwordHash, ...safeUser } = userObj;

        const currentUserData = {
          ...safeUser,
          id: userObj.id || userObj._id,
          userId: userObj.id || userObj._id,
          role: userObj.role || result.role,
          doc: result.user,
        };

        req.user = currentUserData;
        req.currentUser = currentUserData;
      }
    } catch {
      // Ignore token decode error for optional authentication
    }
  }
  next();
}

