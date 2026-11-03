import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiFetch } from '../utils/api';

export default function HomePage() {
  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [healthError, setHealthError] = useState(null);

  // Check backend health status on mount
  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      try {
        setLoadingHealth(true);
        const data = await apiFetch('/health');
        if (isMounted) {
          setHealth(data);
          setHealthError(null);
        }
      } catch (err) {
        if (isMounted) {
          setHealthError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoadingHealth(false);
        }
      }
    }

    checkBackend();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white py-16 md:py-24">
        <div className="container-custom">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-indigo-500/30 text-indigo-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4 border border-indigo-400/30">
              Next.js 16 • Express.js • MongoDB Atlas
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Modern Full-Stack <span className="text-indigo-400">E-Commerce</span> Platform
            </h1>
            <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
              Explore high-performance shopping with secure JWT authentication, real-time MongoDB Atlas persistence, and clean MVC architecture.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition transform hover:-translate-y-0.5"
              >
                Browse Products
              </Link>
              <Link
                href="/categories"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur border border-white/20 transition"
              >
                View Categories
              </Link>
              <Link
                href="/admin"
                className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-xl shadow-md transition"
              >
                Admin Panel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Backend & Database Connection Diagnostic Widget */}
      <section className="container-custom -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">System Integration Status</h2>
              <p className="text-xs text-slate-500">Live communication test between Next.js frontend and Express backend</p>
            </div>
            <button
              onClick={() => {
                setLoadingHealth(true);
                apiFetch('/health')
                  .then((data) => {
                    setHealth(data);
                    setHealthError(null);
                  })
                  .catch((err) => setHealthError(err.message))
                  .finally(() => setLoadingHealth(false));
              }}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            >
              Refresh Status
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Express Server Card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  loadingHealth
                    ? 'bg-amber-400 animate-pulse'
                    : health?.status === 'ok'
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Express Backend</p>
                <p className="text-sm font-semibold text-slate-800">
                  {loadingHealth
                    ? 'Connecting to port 5000...'
                    : health?.status === 'ok'
                    ? 'Online (Port 5000)'
                    : 'Offline / Unreachable'}
                </p>
              </div>
            </div>

            {/* MongoDB Atlas Card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  loadingHealth
                    ? 'bg-amber-400 animate-pulse'
                    : health?.database?.status === 'connected'
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">MongoDB Atlas</p>
                <p className="text-sm font-semibold text-slate-800">
                  {loadingHealth
                    ? 'Checking state...'
                    : health?.database?.status === 'connected'
                    ? `Connected (${health.database.name || 'db'})`
                    : 'Pending MONGO_URI in .env'}
                </p>
              </div>
            </div>

            {/* Next.js Pages Router Card */}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center space-x-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Next.js Router</p>
                <p className="text-sm font-semibold text-slate-800">Pages Router (Active)</p>
              </div>
            </div>
          </div>

          {healthError && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <span className="font-semibold">Note:</span> {healthError}
              <br />
              <span className="text-slate-600 mt-1 block">
                Run the backend with <code className="bg-amber-100 px-1 py-0.5 rounded">npm run dev</code> inside <code className="bg-amber-100 px-1 py-0.5 rounded">ecommerce/backend</code>.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Feature cards */}
      <section className="container-custom py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">Built for Full-Stack Mastery</h2>
          <p className="text-slate-600 mt-2">Every feature designed for real-world e-commerce architecture.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              🛍️
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Product Catalog</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Full CRUD with category associations, stock tracking, price sorting, and Multer file upload handling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              🔒
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">JWT Authentication</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Safe authentication using bcrypt password hashing and HTTP-only cookies to eliminate XSS token theft.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold text-lg mb-4">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Admin Dashboard</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Protected administration interface for managing products, categories, registered customers, and customer orders.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

