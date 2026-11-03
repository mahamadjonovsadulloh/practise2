import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur shadow-sm border-b border-slate-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 transition">
              <span className="text-2xl font-black tracking-tight">Nova<span className="text-slate-900">Store</span></span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
              Home
            </Link>
            <Link href="/products" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
              Products
            </Link>
            <Link href="/categories" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition">
              Categories
            </Link>
            <Link href="/admin" className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-100 text-amber-800 hover:bg-amber-200 transition">
              Admin Area
            </Link>
          </nav>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
            >
              Register
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2"
              aria-label="Toggle navigation"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Products
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Categories
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 hover:bg-amber-50"
            >
              Admin Dashboard
            </Link>
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

