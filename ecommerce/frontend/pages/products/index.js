import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../../utils/api';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Sync category query param from URL if present
  useEffect(() => {
    if (router.query.category) {
      setSelectedCategory(router.query.category);
    }
  }, [router.query.category]);

  // Load categories
  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        const data = await apiFetch('/categories');
        if (isMounted && data?.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error('Error fetching categories:', err.message);
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load products based on filters
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('search', searchTerm.trim());
        if (selectedCategory) params.append('category', selectedCategory);
        if (sortBy) params.append('sort', sortBy);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const data = await apiFetch(`/products${queryString}`);
        if (isMounted && data?.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    // Debounce search slightly
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);

    return () => {
      clearTimeout(timer);
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
              placeholder="Search by title or description..."
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
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Sort by Price</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Featured (Newest)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="oldest">Oldest First</option>
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
            {products.map((item) => {
              const imageSrc = item.image
                ? item.image.startsWith('http')
                  ? item.image
                  : `http://localhost:5000${item.image}`
                : 'https://placehold.co/400x300?text=Product';

              return (
                <div key={item._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                  <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden">
                    <img
                      src={imageSrc}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x300?text=Product';
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                      {item.category?.name || 'General'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-grow">{item.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-lg font-black text-indigo-600">${item.price?.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 block">{item.stock} in stock</span>
                      </div>
                      <Link
                        href={`/admin`}
                        className="text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Manage
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
              📦
            </div>
            <h3 className="text-base font-bold text-slate-800">No Products Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              There are no products matching your filter criteria. You can create new products in the Admin Dashboard.
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
