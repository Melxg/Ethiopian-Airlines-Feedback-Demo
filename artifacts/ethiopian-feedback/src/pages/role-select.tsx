import { useState } from 'react';
import { Link } from 'wouter';
import { Plane, UserRound, Headphones, ArrowRight, ArrowLeft, Plus } from 'lucide-react';

export default function RoleSelectPage() {
  const [view, setView] = useState<'main' | 'passenger-options'>('main');

  return (
    <main className="paper-grid flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[hsl(var(--secondary)/.22)] blur-3xl" />
      <section className="relative w-full max-w-5xl">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]">
              <Plane size={20} strokeWidth={2.5} className="-rotate-12" />
            </div>
            <div>
              <p className="font-display text-lg leading-none">Ethiopian</p>
              <p className="eyebrow mt-1 text-[hsl(var(--secondary))]">Passenger voice</p>
            </div>
          </div>
          <span className="eyebrow text-[hsl(var(--muted-foreground))]">A simple way to be heard</span>
        </header>

        {view === 'main' ? (
          <div className="grid gap-12 lg:grid-cols-[1fr_.95fr] lg:items-end">
            <div className="animate-rise">
              <p className="eyebrow mb-4 text-[hsl(var(--accent))]">Welcome aboard</p>
              <h1 className="font-display max-w-xl text-5xl leading-[1.04] text-[hsl(var(--sidebar))] md:text-7xl">Every journey leaves a mark.</h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">Share what happened. We'll make space for it, understand it, and show you what comes next.</p>
              <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[hsl(var(--primary))]">
                <UserRound size={18} /> Your experience stays part of the conversation.
              </div>
            </div>
            <div className="animate-rise animate-rise-delay-1 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] p-3 shadow-[var(--shadow-soft)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))] md:p-9">
                <p className="eyebrow text-[hsl(var(--secondary))]">Choose your view</p>
                <h2 className="mt-3 font-display text-3xl">How will you use the desk?</h2>
                <div className="mt-7 grid gap-3">
                  <button onClick={() => setView('passenger-options')} className="group flex items-center justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-4 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--secondary))]">
                    <span className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]">
                        <UserRound size={20} />
                      </span>
                      <span>
                        <strong className="block">I'm a passenger</strong>
                        <small className="text-[hsl(var(--sidebar-foreground)/.65)]">Tell us about a recent journey</small>
                      </span>
                    </span>
                    <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                  </button>
                  <Link href="/login" className="group flex items-center justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-transparent p-4 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--secondary))]">
                    <span className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--secondary)/.5)] text-[hsl(var(--secondary))]">
                        <Headphones size={20} />
                      </span>
                      <span>
                        <strong className="block">I'm on the service team</strong>
                        <small className="text-[hsl(var(--sidebar-foreground)/.65)]">Review stories and follow through</small>
                      </span>
                    </span>
                    <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                  </Link>
                </div>
                <p className="mt-7 flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground)/.58)]">
                  <UserRound size={14} /> Passengers can access without login · Staff requires authentication
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_.95fr] lg:items-center">
            <div className="animate-rise">
              <button onClick={() => setView('main')} className="mb-6 flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]">
                <ArrowLeft size={16} /> Back to selection
              </button>
              <p className="eyebrow mb-4 text-[hsl(var(--secondary))]">Passenger Access</p>
              <h1 className="font-display max-w-xl text-5xl leading-[1.04] text-[hsl(var(--sidebar))] md:text-7xl">Ready to share your story?</h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">Continue as a guest for a quick reflection, or create an account to track your feedback over time.</p>
            </div>
            <div className="animate-rise animate-rise-delay-1 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] p-3 shadow-[var(--shadow-soft)] backdrop-blur">
              <div className="rounded-[1.5rem] bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))] md:p-9">
                <p className="eyebrow text-[hsl(var(--secondary))]">Passenger options</p>
                <h2 className="mt-3 font-display text-3xl">How would you like to proceed?</h2>
                <div className="mt-7 grid gap-3">
                  <Link href="/passenger" className="group flex items-center justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-4 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--secondary))]">
                    <span className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--secondary)/.3)] text-[hsl(var(--secondary))]">
                        <UserRound size={20} />
                      </span>
                      <span>
                        <strong className="block">Continue as guest</strong>
                        <small className="text-[hsl(var(--sidebar-foreground)/.65)]">Access the dashboard immediately</small>
                      </span>
                    </span>
                    <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                  </Link>
                  <Link href="/login?role=passenger" className="group flex items-center justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--primary))] p-4 text-left text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5 shadow-lg">
                    <span className="flex items-center gap-4">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-white">
                        <UserRound size={20} />
                      </span>
                      <span>
                        <strong className="block">Sign in</strong>
                        <small className="text-white/70">Access your saved history</small>
                      </span>
                    </span>
                    <ArrowRight size={19} className="transition group-hover:translate-x-1" />
                  </Link>
                </div>
                <div className="mt-6 text-center">
                  <Link href="/signup" className="text-xs font-bold text-[hsl(var(--sidebar-foreground)/.6)] hover:text-[hsl(var(--secondary))] hover:underline">
                    Don't have an account? Create one
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-20 flex items-center gap-6 text-xs text-[hsl(var(--muted-foreground))]">
          <span>Designed for clarity</span>
          <span className="h-1 w-1 rounded-full bg-[hsl(var(--secondary))]" />
          <span>Built around listening</span>
        </footer>
      </section>
    </main>
  );
}
