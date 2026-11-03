import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: 'Total Products', value: '0', icon: '📦', color: 'bg-blue-50 text-blue-700' },
    { label: 'Active Categories', value: '0', icon: '🗂️', color: 'bg-emerald-50 text-emerald-700' },
    { label: 'Registered Customers', value: '0', icon: '👥', color: 'bg-purple-50 text-purple-700' },
    { label: 'Total Orders', value: '0', icon: '🛒', color: 'bg-amber-50 text-amber-700' },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard — NovaStore</title>
      </Head>
      <div className="bg-slate-100 min-h-[calc(100vh-4rem)] py-8">
        <div className="container-custom">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase rounded bg-indigo-100 text-indigo-700">
                  Admin Panel
                </span>
                <span className="text-xs text-slate-500">Full-Stack Control Center</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 mt-1">Store Dashboard</h1>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/products"
                className="px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-sm"
              >
                View Public Store
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-6 space-x-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: 'Products' },
              { id: 'categories', label: 'Categories' },
              { id: 'customers', label: 'Customers' },
              { id: 'orders', label: 'Orders' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-bold rounded-t-xl transition ${
                  activeTab === tab.id
                    ? 'bg-white text-indigo-600 border-t-2 border-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {stat.label}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Status / Instructions Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-base font-bold text-slate-800 mb-2">Admin Modules Ready</h2>
            <p className="text-xs text-slate-500 mb-4">
              The Admin Dashboard structure is prepared. In upcoming phases, full CRUD operations for Products, Categories, Customers, and Orders will be wired to your Express backend and MongoDB Atlas collections.
            </p>

            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-700 border-b border-slate-100">
                Connected API Endpoints Reference
              </div>
              <div className="divide-y divide-slate-100 font-mono text-[11px] text-slate-600">
                <div className="px-4 py-2 flex justify-between">
                  <span>GET /api/products</span>
                  <span className="text-indigo-600 font-semibold">Product Catalog</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>GET /api/categories</span>
                  <span className="text-indigo-600 font-semibold">Category Hierarchy</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>GET /api/customers</span>
                  <span className="text-indigo-600 font-semibold">Customer Records</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>GET /api/orders</span>
                  <span className="text-indigo-600 font-semibold">Order Fulfillment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

