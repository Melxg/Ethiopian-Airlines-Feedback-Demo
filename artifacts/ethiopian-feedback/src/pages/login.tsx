import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Mail, Lock, ArrowRight, Headphones, UserRound, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  // Determine role from URL query parameter
  const params = new URLSearchParams(window.location.search);
  const targetRole = (params.get('role') as 'passenger' | 'agent') || 'agent';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password, targetRole);
      setLocation(targetRole === 'agent' ? '/agent' : '/passenger');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="paper-grid flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[hsl(var(--secondary)/.22)] blur-3xl" />
      <section className="relative w-full max-w-md">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]">
            {targetRole === 'agent' ? <Headphones size={28} /> : <UserRound size={28} />}
          </div>
          <h1 className="font-display text-3xl text-[hsl(var(--sidebar))]">
            {targetRole === 'agent' ? 'Service team login' : 'Passenger login'}
          </h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
            {targetRole === 'agent'
              ? 'Sign in to access the agent dashboard'
              : 'Sign in to view your feedback history'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold">Email</label>
            <div className="relative">
              {!email && <Mail size={18} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" />}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`field h-12 w-full ${email ? 'pl-14' : 'pl-10'}`}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Password</label>
            <div className="relative">
              {!password && <Lock size={18} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" />}
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`field h-12 w-full pr-10 ${password ? 'pl-14' : 'pl-10'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-[hsl(var(--accent)/.1)] px-4 py-3 text-sm font-bold text-[hsl(var(--accent))]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="button-primary flex w-full items-center justify-center gap-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="/" className="font-bold text-[hsl(var(--primary))] hover:underline">
              ← Back to role selection
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
