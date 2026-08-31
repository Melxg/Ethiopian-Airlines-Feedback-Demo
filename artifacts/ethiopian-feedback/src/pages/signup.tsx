import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Plane, Mail, Lock, User, ArrowRight, UserRound, Headphones, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type UserRole = 'passenger' | 'agent';

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(email, password, name, role);
      setLocation(role === 'agent' ? '/agent' : '/passenger');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
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
            <Plane size={28} strokeWidth={2.5} className="-rotate-12" />
          </div>
          <h1 className="font-display text-3xl text-[hsl(var(--sidebar))]">Create your account</h1>
          <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">Join the Ethiopian Airlines feedback desk</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-bold">Full name</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aster Mekonnen"
                className="field h-12 w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field h-12 w-full pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-[hsl(var(--muted-foreground))]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="field h-12 w-full pl-10"
                required
                minLength={8}
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-bold">I want to join as</label>
            <div className="grid gap-3">
              <button
                type="button"
                onClick={() => setRole('passenger')}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  role === 'passenger'
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)]'
                }`}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      role === 'passenger'
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'
                    }`}
                  >
                    <UserRound size={20} />
                  </span>
                  <span>
                    <strong className="block text-sm">Passenger</strong>
                    <small className="text-xs text-[hsl(var(--muted-foreground))]">Share my travel experiences</small>
                  </span>
                </span>
                {role === 'passenger' && <Check size={18} className="text-[hsl(var(--primary))]" />}
              </button>

              <button
                type="button"
                onClick={() => setRole('agent')}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  role === 'agent'
                    ? 'border-[hsl(var(--secondary))] bg-[hsl(var(--secondary)/.15)]'
                    : 'border-[hsl(var(--border))] hover:border-[hsl(var(--secondary)/.5)]'
                }`}
              >
                <span className="flex items-center gap-4">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      role === 'agent'
                        ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--secondary))]'
                    }`}
                  >
                    <Headphones size={20} />
                  </span>
                  <span>
                    <strong className="block text-sm">Service team</strong>
                    <small className="text-xs text-[hsl(var(--muted-foreground))]">Review and respond to feedback</small>
                  </span>
                </span>
                {role === 'agent' && <Check size={18} className="text-[hsl(var(--secondary))]" />}
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
            {isLoading ? 'Creating account...' : 'Create account'}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[hsl(var(--primary))] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
