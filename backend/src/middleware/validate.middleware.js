export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone) {
  const clean = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^(\+?[0-9]{7,15})$/;
  return phoneRegex.test(clean);
}

export function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !validateEmail(email)) {
    res.status(400).json({ success: false, message: 'Valid email address is required.' });
    return;
  }
  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    return;
  }
  next();
}

export function validateSendOtp(req, res, next) {
  const { firstName, lastName, name, email, password, phone, phoneNumber } = req.body;
  const fName = (firstName || name?.split(' ')?.[0] || '').trim();
  const lName = (lastName || name?.split(' ')?.slice(1).join(' ') || '').trim();

  if (!fName || fName.length < 1) {
    res.status(400).json({ success: false, message: 'First name is required.' });
    return;
  }

  if (!lName || lName.length < 1) {
    res.status(400).json({ success: false, message: 'Last name is required.' });
    return;
  }

  if (!email || !validateEmail(email)) {
    res.status(400).json({ success: false, message: 'A valid email address is required.' });
    return;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    return;
  }

  const phoneVal = phone || phoneNumber;
  if (phoneVal && !validatePhone(phoneVal)) {
    res.status(400).json({ success: false, message: 'Please enter a valid phone number (e.g., +94771234567 or 0771234567).' });
    return;
  }

  next();
}

export function validateResendOtp(req, res, next) {
  const { email } = req.body;
  if (!email || !validateEmail(email)) {
    res.status(400).json({ success: false, message: 'A valid email address is required.' });
    return;
  }
  next();
}

export function validateVerifyOtp(req, res, next) {
  const { email, otp } = req.body;
  if (!email || !validateEmail(email)) {
    res.status(400).json({ success: false, message: 'A valid email address is required.' });
    return;
  }
  if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
    res.status(400).json({ success: false, message: 'A valid 6-digit OTP code is required.' });
    return;
  }
  next();
}

export function validateForgotPasswordVerifyOtp(req, res, next) {
  const { email, otp, newPassword, password } = req.body;
  if (!email || !validateEmail(email)) {
    res.status(400).json({ success: false, message: 'A valid email address is required.' });
    return;
  }
  if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
    res.status(400).json({ success: false, message: 'A valid 6-digit OTP code is required.' });
    return;
  }
  const pass = newPassword || password;
  if (pass !== undefined && (typeof pass !== 'string' || pass.length < 6)) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    return;
  }
  next();
}

export function validateUpdateProfile(req, res, next) {
  const { firstName, lastName, name, phone } = req.body;

  if (firstName !== undefined && (typeof firstName !== 'string' || firstName.trim().length < 1)) {
    res.status(400).json({ success: false, message: 'First name cannot be empty.' });
    return;
  }

  if (lastName !== undefined && (typeof lastName !== 'string' || lastName.trim().length < 1)) {
    res.status(400).json({ success: false, message: 'Last name cannot be empty.' });
    return;
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    res.status(400).json({ success: false, message: 'Name must be at least 2 characters.' });
    return;
  }

  if (phone && !validatePhone(phone)) {
    res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    return;
  }

  next();
}

export function validateChangePassword(req, res, next) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    res.status(400).json({ success: false, message: 'Current password is required.' });
    return;
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
    res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    return;
  }

  next();
}

export function validateCreateProduct(req, res, next) {
  const { name, category, price, description } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Product name is required.' });
    return;
  }

  const validCategories = ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'];
  if (!category || !validCategories.includes(category)) {
    res.status(400).json({
      success: false,
      message: `Product category is required and must be one of: ${validCategories.join(', ')}.`,
    });
    return;
  }

  if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
    res.status(400).json({ success: false, message: 'A valid product price (>= 0) is required.' });
    return;
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    res.status(400).json({ success: false, message: 'Product description is required.' });
    return;
  }

  next();
}

export function validateUpdateProduct(req, res, next) {
  const { name, category, price } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    res.status(400).json({ success: false, message: 'Product name cannot be empty.' });
    return;
  }

  const validCategories = ['Skincare', 'Haircare', 'Body Care', 'Sun Care', 'Gift Sets'];
  if (category !== undefined && !validCategories.includes(category)) {
    res.status(400).json({
      success: false,
      message: `Category must be one of: ${validCategories.join(', ')}.`,
    });
    return;
  }

  if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
    res.status(400).json({ success: false, message: 'Price must be a positive number.' });
    return;
  }

  next();
}
