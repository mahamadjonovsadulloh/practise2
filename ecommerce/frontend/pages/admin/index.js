import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiFetch } from '../../utils/api';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'product' | 'category' | 'customer' | 'order' | 'delete' | null
  const [editingItem, setEditingItem] = useState(null); // item being edited or null if creating
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'product'|'category'|..., id: '', title: '' }

  // Form states
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '',
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [orderForm, setOrderForm] = useState({
    customer: '',
    productId: '',
    quantity: 1,
    status: 'Pending',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch all collections from Express backend
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [prodData, catData, custData, ordData] = await Promise.all([
        apiFetch('/products?limit=100').catch(() => ({ products: [] })),
        apiFetch('/categories').catch(() => ({ categories: [] })),
        apiFetch('/customers').catch(() => ({ customers: [] })),
        apiFetch('/orders').catch(() => ({ orders: [] })),
      ]);

      setProducts(prodData?.products || []);
      setCategories(catData?.categories || []);
      setCustomers(custData?.customers || []);
      setOrders(ordData?.orders || []);
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  // Image upload handler using Multer endpoint /api/upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await apiFetch('/upload', {
        method: 'POST',
        body: formData,
      });

      if (res?.image) {
        setProductForm((prev) => ({ ...prev, image: res.image }));
        showAlert('success', 'Image uploaded successfully!');
      }
    } catch (err) {
      showAlert('error', err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // ==================== PRODUCT CRUD ====================
  const openProductModal = (product = null) => {
    if (product) {
      setEditingItem(product);
      setProductForm({
        title: product.title || '',
        description: product.description || '',
        price: product.price ?? '',
        category: product.category?._id || product.category || '',
        stock: product.stock ?? '',
        image: product.image || '',
      });
    } else {
      setEditingItem(null);
      setProductForm({
        title: '',
        description: '',
        price: '',
        category: categories[0]?._id || '',
        stock: '10',
        image: '',
      });
    }
    setActiveModal('product');
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (!productForm.title || !productForm.description || !productForm.price || !productForm.category) {
      showAlert('error', 'Please fill in all required product fields');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        category: productForm.category,
        stock: Number(productForm.stock) || 0,
        image: productForm.image || '/uploads/sample.jpg',
      };

      if (editingItem) {
        await apiFetch(`/products/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showAlert('success', 'Product updated successfully!');
      } else {
        await apiFetch('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showAlert('success', 'Product created successfully!');
      }
      setActiveModal(null);
      fetchAllData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to save product');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== CATEGORY CRUD ====================
  const openCategoryModal = (cat = null) => {
    if (cat) {
      setEditingItem(cat);
      setCategoryForm({
        name: cat.name || '',
        description: cat.description || '',
      });
    } else {
      setEditingItem(null);
      setCategoryForm({ name: '', description: '' });
    }
    setActiveModal('category');
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      showAlert('error', 'Category name is required');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
      };

      if (editingItem) {
        await apiFetch(`/categories/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showAlert('success', 'Category updated successfully!');
      } else {
        await apiFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showAlert('success', 'Category created successfully!');
      }
      setActiveModal(null);
      fetchAllData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to save category');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== CUSTOMER CRUD ====================
  const openCustomerModal = (customer = null) => {
    if (customer) {
      setEditingItem(customer);
      setCustomerForm({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
    } else {
      setEditingItem(null);
      setCustomerForm({ name: '', email: '', phone: '', address: '' });
    }
    setActiveModal('customer');
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.email || !customerForm.phone || !customerForm.address) {
      showAlert('error', 'All customer fields are required');
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        address: customerForm.address.trim(),
      };

      if (editingItem) {
        await apiFetch(`/customers/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showAlert('success', 'Customer updated successfully!');
      } else {
        await apiFetch('/customers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showAlert('success', 'Customer created successfully!');
      }
      setActiveModal(null);
      fetchAllData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to save customer');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== ORDER CRUD ====================
  const openOrderModal = (order = null) => {
    if (order) {
      setEditingItem(order);
      setOrderForm({
        customer: order.customer?._id || order.customer || '',
        productId: order.products?.[0]?.product?._id || '',
        quantity: order.products?.[0]?.quantity || 1,
        status: order.status || 'Pending',
      });
    } else {
      setEditingItem(null);
      setOrderForm({
        customer: customers[0]?._id || '',
        productId: products[0]?._id || '',
        quantity: 1,
        status: 'Pending',
      });
    }
    setActiveModal('order');
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (editingItem) {
      // Status update
      try {
        setActionLoading(true);
        await apiFetch(`/orders/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: orderForm.status }),
        });
        showAlert('success', `Order status updated to ${orderForm.status}!`);
        setActiveModal(null);
        fetchAllData();
      } catch (err) {
        showAlert('error', err.message || 'Failed to update order status');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    // Creating new order
    if (!orderForm.customer || !orderForm.productId) {
      showAlert('error', 'Please select both a customer and a product');
      return;
    }

    const selectedProduct = products.find((p) => p._id === orderForm.productId);
    const qty = Number(orderForm.quantity) || 1;
    const unitPrice = selectedProduct ? selectedProduct.price : 10;
    const totalPrice = Math.round(unitPrice * qty * 100) / 100;

    try {
      setActionLoading(true);
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customer: orderForm.customer,
          products: [
            {
              product: orderForm.productId,
              title: selectedProduct?.title || 'Product Item',
              quantity: qty,
              price: unitPrice,
            },
          ],
          totalPrice,
          status: orderForm.status,
        }),
      });
      showAlert('success', 'Order created successfully!');
      setActiveModal(null);
      fetchAllData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to create order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatusQuick = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      showAlert('success', `Order status changed to ${newStatus}`);
      fetchAllData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to update order');
    }
  };

  // ==================== DELETE HANDLER ====================
  const confirmDelete = (type, id, title) => {
    setDeleteTarget({ type, id, title });
    setActiveModal('delete');
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      const endpoint = `/${deleteTarget.type}s/${deleteTarget.id}`;
      await apiFetch(endpoint, { method: 'DELETE' });
      showAlert('success', `${deleteTarget.type.toUpperCase()} deleted successfully from database!`);
      setActiveModal(null);
      setDeleteTarget(null);
      fetchAllData();
    } catch (err) {
      showAlert('error', err.message || `Failed to delete ${deleteTarget.type}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Stats calculation
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.totalPrice || 0), 0);
  const overviewStats = [
    { label: 'Total Products', value: products.length, icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Categories', value: categories.length, icon: '🗂️', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Registered Customers', value: customers.length, icon: '👥', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Orders', value: orders.length, icon: '🛒', color: 'bg-amber-50 text-amber-700' },
  ];

  // Filtered products
  const filteredProducts = products.filter((p) =>
    productSearch === ''
      ? true
      : p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Filtered customers
  const filteredCustomers = customers.filter((c) =>
    customerSearch === ''
      ? true
      : c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.phone?.includes(customerSearch)
  );

  // Filtered orders
  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'all' ? true : o.status === orderStatusFilter
  );

  return (
    <>
      <Head>
        <title>Admin Dashboard — NovaStore Control Center</title>
      </Head>

      <div className="bg-slate-100 min-h-[calc(100vh-4rem)] py-8">
        <div className="container-custom">
          {/* Top Banner / Alert */}
          {alert && (
            <div
              className={`mb-6 p-4 rounded-xl flex items-center justify-between text-sm font-semibold shadow-sm transition ${
                alert.type === 'success'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{alert.type === 'success' ? '✓' : '⚠️'}</span>
                <span>{alert.message}</span>
              </div>
              <button
                onClick={() => setAlert(null)}
                className="text-white/80 hover:text-white text-xs uppercase px-2 py-1 rounded bg-black/10"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-indigo-100 text-indigo-700">
                  Store Management
                </span>
                <span className="text-xs text-slate-500">Live MongoDB Atlas Database</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 mt-1">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAllData}
                disabled={loading}
                className="px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm flex items-center space-x-1"
              >
                <span>🔄</span>
                <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <Link
                href="/products"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
              >
                View Public Catalog &rarr;
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-6 space-x-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'products', label: `Products (${products.length})`, icon: '📦' },
              { id: 'categories', label: `Categories (${categories.length})`, icon: '🗂️' },
              { id: 'customers', label: `Customers (${customers.length})`, icon: '👥' },
              { id: 'orders', label: `Orders (${orders.length})`, icon: '🛒' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition whitespace-nowrap flex items-center space-x-1.5 ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* ==================== TAB 1: OVERVIEW ==================== */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {overviewStats.map((stat, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {stat.label}
                      </span>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${stat.color}`}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Financial & System Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm">
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    Total Gross Revenue
                  </span>
                  <div className="text-3xl font-black mt-2 mb-1">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-indigo-200">Calculated from {orders.length} store orders</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm md:col-span-2">
                  <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Actions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      onClick={() => openProductModal()}
                      className="p-3 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold transition text-center"
                    >
                      + Add Product
                    </button>
                    <button
                      onClick={() => openCategoryModal()}
                      className="p-3 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-bold transition text-center"
                    >
                      + Add Category
                    </button>
                    <button
                      onClick={() => openCustomerModal()}
                      className="p-3 rounded-xl border border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-50 text-purple-700 text-xs font-bold transition text-center"
                    >
                      + Add Customer
                    </button>
                    <button
                      onClick={() => openOrderModal()}
                      className="p-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-amber-700 text-xs font-bold transition text-center"
                    >
                      + Create Order
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Store Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    View All Orders &rarr;
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No orders recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                        <tr>
                          <th className="py-2.5 px-3">Order ID</th>
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Total Price</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((ord) => (
                          <tr key={ord._id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                              #{ord._id.slice(-6)}
                            </td>
                            <td className="py-2.5 px-3 text-slate-800">
                              {ord.customer?.name || 'Walk-in Customer'}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              ${ord.totalPrice?.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 2: PRODUCTS ==================== */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Product Management</h2>
                  <p className="text-xs text-slate-500">Create, edit, upload images, and manage inventory</p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search by title..."
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-60"
                  />
                  <button
                    onClick={() => openProductModal()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                  >
                    + Add Product
                  </button>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600">No products found</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    {categories.length === 0
                      ? 'Please create at least one Category first before adding products.'
                      : 'Get started by creating your first product item.'}
                  </p>
                  {categories.length === 0 ? (
                    <button
                      onClick={() => openCategoryModal()}
                      className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                    >
                      + Create Category First
                    </button>
                  ) : (
                    <button
                      onClick={() => openProductModal()}
                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                    >
                      + Add First Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Product</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price</th>
                        <th className="py-3 px-3">Stock</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 text-slate-400">
                              {p.image ? (
                                <img
                                  src={p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://placehold.co/100x100?text=Item';
                                  }}
                                />
                              ) : (
                                <span>📦</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{p.title}</div>
                              <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                                {p.description}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                              {p.category?.name || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900">${p.price?.toFixed(2)}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`font-semibold ${
                                p.stock > 5 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {p.stock} units
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => openProductModal(p)}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete('product', p._id, p.title)}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: CATEGORIES ==================== */}
          {activeTab === 'categories' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Category Hierarchy</h2>
                  <p className="text-xs text-slate-500">Organize your store products into discoverable sections</p>
                </div>
                <button
                  onClick={() => openCategoryModal()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  + Add Category
                </button>
              </div>

              {categories.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600">No categories created yet</p>
                  <button
                    onClick={() => openCategoryModal()}
                    className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    + Create First Category
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3 px-3">Description</th>
                        <th className="py-3 px-3">Associated Products</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((c) => {
                        const count = products.filter(
                          (p) => p.category?._id === c._id || p.category === c._id
                        ).length;
                        return (
                          <tr key={c._id} className="hover:bg-slate-50/60">
                            <td className="py-3 px-3 font-bold text-slate-800 text-sm">{c.name}</td>
                            <td className="py-3 px-3 text-slate-500">{c.description || '—'}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                                {count} products
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right space-x-2">
                              <button
                                onClick={() => openCategoryModal(c)}
                                className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => confirmDelete('category', c._id, c.name)}
                                className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 4: CUSTOMERS ==================== */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Customer Records</h2>
                  <p className="text-xs text-slate-500">Manage buyer contact information, phone numbers, and addresses</p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <input
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search by name, email, phone..."
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                  />
                  <button
                    onClick={() => openCustomerModal()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                  >
                    + Add Customer
                  </button>
                </div>
              </div>

              {filteredCustomers.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600">No customers registered yet</p>
                  <button
                    onClick={() => openCustomerModal()}
                    className="mt-3 px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl"
                  >
                    + Create First Customer
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Name</th>
                        <th className="py-3 px-3">Email Address</th>
                        <th className="py-3 px-3">Phone</th>
                        <th className="py-3 px-3">Delivery Address</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCustomers.map((c) => (
                        <tr key={c._id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3 font-bold text-slate-800 text-sm">{c.name}</td>
                          <td className="py-3 px-3 font-mono text-slate-600">{c.email}</td>
                          <td className="py-3 px-3 text-slate-700">{c.phone}</td>
                          <td className="py-3 px-3 text-slate-500 max-w-xs truncate">{c.address}</td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => openCustomerModal(c)}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete('customer', c._id, c.name)}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 5: ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Order Fulfillment</h2>
                  <p className="text-xs text-slate-500">Track shipments, change order status, and create custom orders</p>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button
                    onClick={() => openOrderModal()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-sm transition whitespace-nowrap"
                  >
                    + Create Order
                  </button>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600">No orders found</p>
                  <button
                    onClick={() => openOrderModal()}
                    className="mt-3 px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl"
                  >
                    + Create First Order
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3">Order</th>
                        <th className="py-3 px-3">Customer Details</th>
                        <th className="py-3 px-3">Items Summary</th>
                        <th className="py-3 px-3">Total</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-3">
                            <div className="font-mono font-bold text-slate-800">#{ord._id.slice(-6)}</div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{ord.customer?.name || 'Walk-in'}</div>
                            <div className="text-[11px] text-slate-400">{ord.customer?.phone || ord.customer?.email}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-slate-700">
                              {ord.products?.map((p, i) => (
                                <div key={i} className="text-[11px]">
                                  • {p.title || p.product?.title || 'Item'} &times; {p.quantity} (${p.price})
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-black text-slate-900 text-sm">
                            ${ord.totalPrice?.toFixed(2)}
                          </td>
                          <td className="py-3 px-3">
                            <select
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatusQuick(ord._id, e.target.value)}
                              className="text-xs font-bold rounded-lg border border-slate-200 px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-right space-x-2">
                            <button
                              onClick={() => openOrderModal(ord)}
                              className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDelete('order', ord._id, `Order #${ord._id.slice(-6)}`)}
                              className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ==================== MODAL: PRODUCT ==================== */}
          {activeModal === 'product' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {editingItem ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">Saved directly into MongoDB Atlas catalog</p>

                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="e.g. Wireless Noise-Cancelling Headphones"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select a Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="99.99"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Stock Units *</label>
                      <input
                        type="number"
                        required
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        placeholder="25"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Product features, specifications, and details..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Multer Upload or Image Path */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Product Image (Upload or URL)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      {uploadingImage && <span className="text-xs text-indigo-600 animate-pulse">Uploading...</span>}
                    </div>
                    <input
                      type="text"
                      value={productForm.image}
                      onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                      placeholder="/uploads/... or https://..."
                      className="w-full mt-2 px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none text-slate-600 bg-slate-50"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : editingItem ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== MODAL: CATEGORY ==================== */}
          {activeModal === 'category' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {editingItem ? 'Edit Category' : 'Create New Category'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">Adds or modifies category structure</p>

                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
                    <input
                      type="text"
                      required
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="e.g. Consumer Electronics"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="Brief category summary..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : editingItem ? 'Update Category' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== MODAL: CUSTOMER ==================== */}
          {activeModal === 'customer' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {editingItem ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">Customer database record</p>

                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      placeholder="e.g. John Smith"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      placeholder="123 Main St, Springfield..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : editingItem ? 'Update Customer' : 'Save Customer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== MODAL: ORDER ==================== */}
          {activeModal === 'order' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {editingItem ? `Edit Status: Order #${editingItem._id.slice(-6)}` : 'Create New Store Order'}
                </h3>
                <p className="text-xs text-slate-500 mb-4">Direct store order creation & fulfillment</p>

                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  {!editingItem && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
                        <select
                          required
                          value={orderForm.customer}
                          onChange={(e) => setOrderForm({ ...orderForm, customer: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="">Select a Customer</option>
                          {customers.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name} ({c.email})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Select Product *</label>
                        <select
                          required
                          value={orderForm.productId}
                          onChange={(e) => setOrderForm({ ...orderForm, productId: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                          <option value="">Select a Product</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.title} — ${p.price} ({p.stock} in stock)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={orderForm.quantity}
                          onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Order Status</label>
                    <select
                      value={orderForm.status}
                      onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl disabled:opacity-50"
                    >
                      {actionLoading ? 'Saving...' : editingItem ? 'Update Status' : 'Create Order'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ==================== MODAL: DELETE CONFIRMATION ==================== */}
          {activeModal === 'delete' && deleteTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-xl mb-3">
                  ⚠️
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">Confirm Permanent Deletion</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-slate-800">"{deleteTarget.title}"</span>? This will permanently
                  remove the record from MongoDB Atlas.
                </p>

                <div className="flex justify-center space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      setDeleteTarget(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={executeDelete}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm disabled:opacity-50"
                  >
                    {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
