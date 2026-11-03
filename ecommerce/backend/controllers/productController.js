const Product = require('../models/Product');
const Category = require('../models/Category');

/**
 * @desc    Get all products with search, category filtering, price sorting and pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { keyword, search, category, minPrice, maxPrice, sort, page = 1, limit = 50 } = req.query;

    const query = {};

    // Search by title or description
    const searchTerm = search || keyword;
    if (searchTerm && searchTerm.trim() !== '') {
      query.$or = [
        { title: { $regex: searchTerm.trim(), $options: 'i' } },
        { description: { $regex: searchTerm.trim(), $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'all' && category.trim() !== '') {
      query.category = category;
    }

    // Filter by price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined && minPrice !== '') {
        query.price.$gte = Number(minPrice);
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        query.price.$lte = Number(maxPrice);
      }
    }

    // Determine sorting order
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc' || sort === 'lowest') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc' || sort === 'highest') {
      sortOption = { price: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Public / Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, image, stock } = req.body;

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, description, price, and category',
      });
    }

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID: Category does not exist',
      });
    }

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      image: image || '/uploads/sample.jpg',
      stock: stock !== undefined ? Number(stock) : 0,
    });

    const populatedProduct = await product.populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Public / Admin
 */
const updateProduct = async (req, res, next) => {
  try {
    const { title, description, price, category, image, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID: Category does not exist',
        });
      }
      product.category = category;
    }

    if (title) product.title = title.trim();
    if (description) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (image !== undefined) product.image = image;
    if (stock !== undefined) product.stock = Number(stock);

    const updatedProduct = await product.save();
    const populated = await updatedProduct.populate('category', 'name');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Public / Admin
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
