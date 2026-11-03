import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiFetch } from '../../utils/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        // Will fetch from backend /products endpoint in later phases
        const data = await apiFetch('/products');
        if (isMounted && data?.products) {
          setProducts(data.products);
        }
      } catch (err) {
        // Backend /products endpoint will be implemented in Phase 5
        console.log('Products API status:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [searchTerm, selectedCategory, sortBy]);

  return (
    <>
      <Head>
        <title>All Products — NovaStore</title>
      </Head>
      <div className="container-custom py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Explore Products</h1>
          <p className="text-slate-500 text-sm mt-1">Discover high quality items from our curated catalog</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Search Products</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home">Home & Kitchen</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sort by Price</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500 mt-3">Loading catalog...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
                  {item.image ? (
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <span>No Image</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-slate-800 text-base">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-black text-indigo-600">${item.price}</span>
                    <button className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-800">No Products in Database Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Connect your MongoDB Atlas in backend/.env, then create products via the Admin dashboard or backend API.
            </p>
            <Link
              href="/admin"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Open Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

