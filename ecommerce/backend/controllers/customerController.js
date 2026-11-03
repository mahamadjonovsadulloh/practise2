const Customer = require('../models/Customer');

/**
 * @desc    Get all customers with optional search
 * @route   GET /api/customers
 * @access  Public / Admin
 */
const getCustomers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search && search.trim() !== '') {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single customer by ID
 * @route   GET /api/customers/:id
 * @access  Public / Admin
 */
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new customer
 * @route   POST /api/customers
 * @access  Public / Admin
 */
const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and address',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Customer.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this email address already exists',
      });
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      address: address.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this email address already exists',
      });
    }
    next(error);
  }
};

/**
 * @desc    Update a customer
 * @route   PUT /api/customers/:id
 * @access  Public / Admin
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (email && email.toLowerCase().trim() !== customer.email) {
      const normalizedEmail = email.toLowerCase().trim();
      const duplicate = await Customer.findOne({ email: normalizedEmail });
      if (duplicate && duplicate._id.toString() !== customer._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Another customer with this email already exists',
        });
      }
      customer.email = normalizedEmail;
    }

    if (name) customer.name = name.trim();
    if (phone) customer.phone = phone.trim();
    if (address) customer.address = address.trim();

    const updatedCustomer = await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this email address already exists',
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a customer
 * @route   DELETE /api/customers/:id
 * @access  Public / Admin
 */
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
