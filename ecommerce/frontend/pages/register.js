import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { apiFetch } from '../utils/api';

export default function RegisterPage() {
  const router = useRouter();

  // Form input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUser, setRegisteredUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validations
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Send registration request to Express Backend POST /api/auth/register
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      if (data?.success) {
        setSuccessMessage(data.message || 'Registration successful!');
        setRegisteredUser(data.user);
        // Reset sensitive inputs
        setPassword('');
        setConfirmPassword('');
      } else {
        setErrorMessage(data?.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. Please verify your details and backend connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Account — NovaStore</title>
      </Head>
      <div className="container-custom py-12 flex justify-center items-center min-h-[75vh]">
        <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900">Create an Account</h1>
            <p className="text-sm text-slate-500 mt-1">Join NovaStore to start shopping</p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <div className="flex items-center space-x-2 font-bold text-sm mb-1">
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
              <p className="text-xs text-emerald-700">
                Welcome, <strong>{registeredUser?.name}</strong>! Your account has been registered and verified.
              </p>
              <div className="mt-3 flex space-x-2">
                <Link
                  href="/login"
                  className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  Proceed to Sign In &rarr;
                </Link>
                <Link
                  href="/products"
                  className="inline-block px-3 py-1.5 bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition"
                >
                  Browse Store
                </Link>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
              <span className="font-bold text-sm leading-none mt-0.5">⚠️</span>
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  disabled={loading}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  disabled={loading}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition disabled:bg-slate-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register</span>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
