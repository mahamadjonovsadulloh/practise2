import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiFetch } from '../../utils/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadCategories() {
      try {
        setLoading(true);
        // Will fetch from backend /categories endpoint in Phase 5
        const data = await apiFetch('/categories');
        if (isMounted && data?.categories) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.log('Categories API status:', err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>Categories — NovaStore</title>
      </Head>
      <div className="container-custom py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900">Shop by Category</h1>
          <p className="text-slate-500 text-sm mt-1">Browse products organized by curated categories</p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent" />
            <p className="text-sm text-slate-500 mt-3">Loading categories...</p>
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <h3 className="text-xl font-bold text-slate-800">{cat.name}</h3>
                <p className="text-sm text-slate-500 mt-2">{cat.description || 'No description provided.'}</p>
                <div className="mt-6">
                  <Link
                    href={`/products?category=${cat._id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                  >
                    View Products &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto text-2xl mb-3">
              🗂️
            </div>
            <h3 className="text-base font-bold text-slate-800">No Categories Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Create your first category using the Admin dashboard or backend /api/categories endpoint.
            </p>
            <Link
              href="/admin"
              className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

