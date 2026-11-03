const Order = require('../models/Order');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Public / Admin
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate('customer', 'name email phone address')
      .populate('products.product', 'title price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Public / Admin
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('products.product', 'title price image');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Public / Admin
 */
const createOrder = async (req, res, next) => {
  try {
    const { customer, products, totalPrice, status } = req.body;

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Order requires a valid customer ID',
      });
    }

    const customerExists = await Customer.findById(customer);
    if (!customerExists) {
      return res.status(400).json({
        success: false,
        message: 'Specified customer does not exist',
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product',
      });
    }

    // Verify products and calculate total
    let calculatedTotal = 0;
    const validatedProducts = [];

    for (const item of products) {
      const prodId = item.product || item._id;
      const productDoc = await Product.findById(prodId);
      if (!productDoc) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${prodId} not found`,
        });
      }

      const qty = Number(item.quantity) || 1;
      const unitPrice = item.price !== undefined ? Number(item.price) : productDoc.price;
      calculatedTotal += unitPrice * qty;

      validatedProducts.push({
        product: productDoc._id,
        title: productDoc.title,
        quantity: qty,
        price: unitPrice,
      });

      // Optionally decrement stock if sufficient
      if (productDoc.stock >= qty) {
        productDoc.stock -= qty;
        await productDoc.save();
      }
    }

    const order = await Order.create({
      customer,
      products: validatedProducts,
      totalPrice: totalPrice !== undefined ? Number(totalPrice) : Math.round(calculatedTotal * 100) / 100,
      status: status || 'Pending',
    });

    const populatedOrder = await order.populate([
      { path: 'customer', select: 'name email phone address' },
      { path: 'products.product', select: 'title price image' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status or order details
 * @route   PUT /api/orders/:id
 * @access  Public / Admin
 */
const updateOrder = async (req, res, next) => {
  try {
    const { status, totalPrice, customer } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (status) {
      const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        });
      }
      order.status = status;
    }

    if (totalPrice !== undefined) order.totalPrice = Number(totalPrice);
    if (customer) order.customer = customer;

    const updatedOrder = await order.save();
    const populated = await updatedOrder.populate([
      { path: 'customer', select: 'name email phone address' },
      { path: 'products.product', select: 'title price image' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an order
 * @route   DELETE /api/orders/:id
 * @access  Public / Admin
 */
const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};
