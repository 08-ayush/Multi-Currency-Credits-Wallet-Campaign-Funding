import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/endpoints';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => authApi.signup(email, password),
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
        <h1 className="mb-1 text-center text-2xl font-bold text-brand-700">Create account</h1>
        <p className="mb-6 text-center text-sm text-slate-500">Start with your multi-currency wallet</p>
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
              minLength={8}
              required
            />
            <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
          </div>
          {mutation.isError && (
            <p className="text-sm text-red-600">{extractErrorMessage(mutation.error)}</p>
          )}
          <button className="btn-primary w-full" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Sign up'}
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
