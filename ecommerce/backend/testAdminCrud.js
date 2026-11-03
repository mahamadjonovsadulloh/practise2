const mongoose = require('mongoose');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Order = require('./models/Order');

const categoryController = require('./controllers/categoryController');
const productController = require('./controllers/productController');
const customerController = require('./controllers/customerController');
const orderController = require('./controllers/orderController');

function createMockRes() {
  return {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
}

async function runAdminCrudTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING ADMIN DASHBOARD FULL CRUD TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Category Schema & Controller Validation
  console.log('\n--- 1. Testing Category CRUD ---');
  const catMissing = new Category({});
  const catValErr = catMissing.validateSync();
  assert(catValErr?.errors?.name !== undefined, 'Category model rejects missing name');

  const validCategory = new Category({
    name: 'Electronics & Gadgets',
    description: 'High-tech electronics',
  });
  assert(validCategory.validateSync() === undefined, 'Category model accepts valid attributes');

  // Test Category Controller: Create validation
  const mockResCatNoName = createMockRes();
  await categoryController.createCategory({ body: { name: '' } }, mockResCatNoName, () => {});
  assert(mockResCatNoName.statusCode === 400, 'createCategory returns 400 when name is empty');

  // 2. Product Schema & Controller Validation
  console.log('\n--- 2. Testing Product CRUD ---');
  const prodMissing = new Product({});
  const prodValErr = prodMissing.validateSync();
  assert(prodValErr?.errors?.title !== undefined, 'Product model rejects missing title');
  assert(prodValErr?.errors?.price !== undefined, 'Product model rejects missing price');
  assert(prodValErr?.errors?.category !== undefined, 'Product model rejects missing category');

  const dummyCatId = new mongoose.Types.ObjectId();
  const validProduct = new Product({
    title: 'Wireless Earbuds',
    description: 'Noise cancelling Bluetooth 5.3 earbuds',
    price: 49.99,
    category: dummyCatId,
    stock: 50,
  });
  assert(validProduct.validateSync() === undefined, 'Product model accepts valid attributes');

  // Test Product Controller: Create validation
  const mockResProdNoPrice = createMockRes();
  await productController.createProduct(
    { body: { title: 'Headphones', description: 'Desc', category: dummyCatId.toString() } },
    mockResProdNoPrice,
    () => {}
  );
  assert(mockResProdNoPrice.statusCode === 400, 'createProduct returns 400 when price is missing');

  // 3. Customer Schema & Controller Validation
  console.log('\n--- 3. Testing Customer CRUD ---');
  const custMissing = new Customer({});
  const custValErr = custMissing.validateSync();
  assert(custValErr?.errors?.name !== undefined, 'Customer model rejects missing name');
  assert(custValErr?.errors?.email !== undefined, 'Customer model rejects missing email');
  assert(custValErr?.errors?.phone !== undefined, 'Customer model rejects missing phone');
  assert(custValErr?.errors?.address !== undefined, 'Customer model rejects missing address');

  const custBadEmail = new Customer({
    name: 'John',
    email: 'bad-email-format',
    phone: '123456789',
    address: 'City St',
  });
  const custEmailErr = custBadEmail.validateSync();
  assert(custEmailErr?.errors?.email !== undefined, 'Customer model rejects invalid email format');

  const validCust = new Customer({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555-0199',
    address: '456 Market St, San Francisco, CA',
  });
  assert(validCust.validateSync() === undefined, 'Customer model accepts valid customer record');

  // Test Customer Controller: Create validation
  const mockResCustNoPhone = createMockRes();
  await customerController.createCustomer(
    { body: { name: 'Bob', email: 'bob@example.com', address: 'Main St' } },
    mockResCustNoPhone,
    () => {}
  );
  assert(mockResCustNoPhone.statusCode === 400, 'createCustomer returns 400 when phone is missing');

  // 4. Order Schema & Controller Validation
  console.log('\n--- 4. Testing Order CRUD ---');
  const ordMissing = new Order({});
  const ordValErr = ordMissing.validateSync();
  assert(ordValErr?.errors?.customer !== undefined, 'Order model rejects missing customer');
  assert(ordValErr?.errors?.products !== undefined, 'Order model rejects empty products list');

  const dummyCustId = new mongoose.Types.ObjectId();
  const dummyProdId = new mongoose.Types.ObjectId();
  const validOrder = new Order({
    customer: dummyCustId,
    products: [
      {
        product: dummyProdId,
        title: 'Wireless Earbuds',
        quantity: 2,
        price: 49.99,
      },
    ],
    totalPrice: 99.98,
    status: 'Pending',
  });
  assert(validOrder.validateSync() === undefined, 'Order model accepts valid order record');

  // Test Order status enum validation
  const badStatusOrder = new Order({
    customer: dummyCustId,
    products: [
      {
        product: dummyProdId,
        title: 'Wireless Earbuds',
        quantity: 1,
        price: 49.99,
      },
    ],
    totalPrice: 49.99,
    status: 'InvalidStatusString',
  });
  const badStatusErr = badStatusOrder.validateSync();
  assert(badStatusErr?.errors?.status !== undefined, 'Order model rejects invalid status enum');

  // Test Order Controller: Update status validation
  const mockResBadStatus = createMockRes();
  const mockOrder = {
    _id: new mongoose.Types.ObjectId(),
    status: 'Pending',
    save: async function () { return this; },
    populate: async function () { return this; },
  };

  // Mock Order.findById
  const originalFindById = Order.findById;
  Order.findById = () => mockOrder;

  await orderController.updateOrder(
    { params: { id: mockOrder._id }, body: { status: 'NotAValidStatus' } },
    mockResBadStatus,
    () => {}
  );
  assert(mockResBadStatus.statusCode === 400, 'updateOrder returns 400 on invalid status');

  // Valid status update
  const mockResGoodStatus = createMockRes();
  await orderController.updateOrder(
    { params: { id: mockOrder._id }, body: { status: 'Delivered' } },
    mockResGoodStatus,
    () => {}
  );
  assert(
    mockResGoodStatus.statusCode === 200 && mockOrder.status === 'Delivered',
    'updateOrder updates status to Delivered successfully'
  );

  Order.findById = originalFindById;

  console.log('\n====================================================');
  console.log(`CRUD TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAdminCrudTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

