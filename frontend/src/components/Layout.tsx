import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItem = (to: string, label: string) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          active ? 'bg-brand-100 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-brand-700">Credits Wallet</span>
            <nav className="ml-6 flex gap-1">
              {navItem('/wallet', 'Wallet')}
              {navItem('/campaigns', 'Campaigns')}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
            <button className="btn-secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
