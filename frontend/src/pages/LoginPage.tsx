import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (data) => {
      login(data.token, data.user);
      navigate('/wallet');
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-brand-700">Credits Wallet</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Sign in to your account</p>
        <form className="card space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-600">{extractErrorMessage(mutation.error)}</p>
          )}
          <button className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-center text-sm text-slate-500">
            No account?{' '}
            <Link to="/signup" className="font-medium text-brand-600">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
