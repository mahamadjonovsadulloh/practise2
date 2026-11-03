import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-black text-indigo-600">Nova<span className="text-slate-900">Store</span></span>
            <span className="text-xs text-slate-400">| Full-Stack E-Commerce</span>
          </div>

          <div className="flex items-center space-x-6 text-sm text-slate-500">
            <Link href="/" className="hover:text-indigo-600 transition">
              Home
            </Link>
            <Link href="/products" className="hover:text-indigo-600 transition">
              Products
            </Link>
            <Link href="/categories" className="hover:text-indigo-600 transition">
              Categories
            </Link>
            <Link href="/admin" className="hover:text-indigo-600 transition">
              Admin
            </Link>
          </div>

          <p className="text-xs text-slate-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} NovaStore. Express + MongoDB Atlas + Next.js Pages Router.
          </p>
        </div>
      </div>
    </footer>
  );
}

