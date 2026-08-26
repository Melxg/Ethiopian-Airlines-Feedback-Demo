import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from 'wouter';
import {
  AlertCircle,
  Archive,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Filter,
  Headphones,
  Inbox,
  Info,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  ListFilter,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Plane,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  ThumbsUp,
  UserRound,
  Users,
  Video,
  X,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import NotFound from '@/pages/not-found';
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import RoleSelectPage from '@/pages/role-select';

type Role = 'passenger' | 'agent';
type Modality = 'written' | 'audio' | 'video';
type CaseStatus = 'New' | 'In review' | 'Resolved';
type Feedback = {
  id: string;
  subject: string;
  category: string;
  flight: string;
  route: string;
  date: string;
  modality: Modality;
  narrative: string;
  status: CaseStatus;
  sentiment: 'Positive' | 'Mixed' | 'Needs attention';
  score: number;
  submittedAt: string;
  agentNote?: string;
};
type Draft = {
  modality: Modality;
  category: string;
  flight: string;
  route: string;
  date: string;
  subject: string;
  narrative: string;
  audioName: string;
  videoName: string;
};

const seedCases: Feedback[] = [
  {
    id: 'ET-4821',
    subject: 'A thoughtful welcome on a long connection',
    category: 'Cabin crew',
    flight: 'ET 612',
    route: 'Addis Ababa → Stockholm',
    date: '14 Jun 2024',
    modality: 'written',
    narrative: 'The crew noticed my mother was nervous during our connection and checked in with her twice. It made a long travel day feel surprisingly human.',
    status: 'Resolved',
    sentiment: 'Positive',
    score: 91,
    submittedAt: '18 Jun 2024',
    agentNote: 'Shared with the B787 cabin leadership team as a service moment.',
  },
  {
    id: 'ET-4813',
    subject: 'Baggage arrived one day after I did',
    category: 'Baggage',
    flight: 'ET 908',
    route: 'Lusaka → Addis Ababa',
    date: '12 Jun 2024',
    modality: 'written',
    narrative: 'My bag was left behind in Lusaka and reached me the following evening. The tracing team answered quickly, but I had no update for most of the first day.',
    status: 'In review',
    sentiment: 'Mixed',
    score: 54,
    submittedAt: '15 Jun 2024',
  },
  {
    id: 'ET-4807',
    subject: 'A quiet, clear boarding experience',
    category: 'Airport experience',
    flight: 'ET 501',
    route: 'Addis Ababa → London',
    date: '09 Jun 2024',
    modality: 'audio',
    narrative: 'Boarding was well organised and the announcements were easy to hear. The priority lane moved quickly even with a full flight.',
    status: 'New',
    sentiment: 'Positive',
    score: 86,
    submittedAt: '11 Jun 2024',
  },
  {
    id: 'ET-4799',
    subject: 'A better way to find the transfer desk',
    category: 'Airport experience',
    flight: 'ET 701',
    route: 'Nairobi → Addis Ababa',
    date: '06 Jun 2024',
    modality: 'video',
    narrative: 'The transfer signs became difficult to follow after the security checkpoint. A brighter sign at the first split would have saved a lot of backtracking.',
    status: 'In review',
    sentiment: 'Needs attention',
    score: 38,
    submittedAt: '08 Jun 2024',
  },
];

const blankDraft: Draft = {
  modality: 'written',
  category: '',
  flight: '',
  route: '',
  date: '',
  subject: '',
  narrative: '',
  audioName: '',
  videoName: '',
};

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue] as const;
}

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useLocalStorage<Feedback[]>('et-feedbacks', seedCases);
  const [draft, setDraft] = useLocalStorage<Draft>('et-draft', blankDraft);
  const [toast, setToast] = useState('');
  const [dark, setDark] = useLocalStorage('et-dark', false);
  const [location] = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const submitFeedback = () => {
    const id = `ET-${Math.floor(4830 + Math.random() * 99)}`;
    const item: Feedback = {
      id,
      subject: draft.subject || 'Passenger feedback',
      category: draft.category || 'Other',
      flight: draft.flight || 'Not provided',
      route: draft.route || 'Route not provided',
      date: draft.date || 'Recent journey',
      modality: draft.modality,
      narrative: draft.narrative || `A ${draft.modality} reflection shared by a passenger.`,
      status: 'New',
      sentiment: draft.narrative.toLowerCase().includes('thank') || draft.narrative.toLowerCase().includes('great') ? 'Positive' : 'Mixed',
      score: draft.narrative.toLowerCase().includes('thank') ? 82 : 62,
      submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setFeedbacks((current) => [item, ...current]);
    setDraft(blankDraft);
    notify('Feedback received — thank you for helping us improve');
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <Plane size={32} className="mx-auto mb-4 animate-spin text-[hsl(var(--secondary))]" />
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <ErrorBoundary resetKey={window.location.pathname}>
        <Switch>
          <Route path="/" component={RoleSelectPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/passenger/feedback/review">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><ReviewPage draft={draft} onSubmit={submitFeedback} /></AppShell>
          </Route>
          <Route path="/passenger/feedback/result">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><ResultPage feedbacks={feedbacks} /></AppShell>
          </Route>
          <Route path="/passenger/feedback">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><FeedbackWizard draft={draft} setDraft={setDraft} /></AppShell>
          </Route>
          <Route path="/passenger/history/:id">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><FeedbackDetail feedbacks={feedbacks} /></AppShell>
          </Route>
          <Route path="/passenger/history">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><PassengerHistory feedbacks={feedbacks} /></AppShell>
          </Route>
          <Route path="/passenger">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><PassengerDashboard feedbacks={feedbacks} /></AppShell>
          </Route>
          <Route path="/agent/cases/:id">
            <ProtectedRoute allowedRole="agent">
              <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><AgentCaseDetail feedbacks={feedbacks} setFeedbacks={setFeedbacks} notify={notify} /></AppShell>
            </ProtectedRoute>
          </Route>
          <Route path="/agent">
            <ProtectedRoute allowedRole="agent">
              <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><AgentDashboard feedbacks={feedbacks} /></AppShell>
            </ProtectedRoute>
          </Route>
          <Route path="/help">
            <AppShell user={user} onLogout={logout} dark={dark} onDarkChange={setDark}><HelpSettings dark={dark} onDarkChange={setDark} onReset={() => { setFeedbacks(seedCases); setDraft(blankDraft); notify('Demo data restored'); }} /></AppShell>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </ErrorBoundary>
      {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[hsl(var(--sidebar))] px-4 py-3 text-sm font-semibold text-[hsl(var(--sidebar-foreground))] shadow-xl" role="status" data-testid="status-toast"><CheckCircle2 size={16} className="text-[hsl(var(--secondary))]" />{toast}</div>}
    </WouterRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" data-testid="brand-mark">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]">
        <Plane size={20} strokeWidth={2.5} className="-rotate-12" />
        <span className="absolute -bottom-1 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-[hsl(var(--accent))]" />
      </div>
      {!compact && <div><p className="font-display text-lg leading-none">Ethiopian</p><p className="eyebrow mt-1 text-[hsl(var(--secondary))]">Passenger voice</p></div>}
    </div>
  );
}

function RoleSelect({ onChoose }: { onChoose: (role: Role) => void }) {
  const [, setLocation] = useLocation();
  const choose = (role: Role) => {
    onChoose(role);
    setLocation(role === 'agent' ? '/agent' : '/passenger');
  };
  return (
    <main className="paper-grid flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[hsl(var(--background))] px-5 py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[hsl(var(--secondary)/.22)] blur-3xl" />
      <section className="relative w-full max-w-5xl">
        <header className="mb-14 flex items-center justify-between">
          <BrandMark />
          <span className="eyebrow text-[hsl(var(--muted-foreground))]">A simple way to be heard</span>
        </header>
        <div className="grid gap-12 lg:grid-cols-[1fr_.95fr] lg:items-end">
          <div className="animate-rise">
            <p className="eyebrow mb-4 text-[hsl(var(--accent))]">Welcome aboard</p>
            <h1 className="font-display max-w-xl text-5xl leading-[1.04] text-[hsl(var(--sidebar))] md:text-7xl">Every journey leaves a mark.</h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[hsl(var(--muted-foreground))]">Share what happened. We’ll make space for it, understand it, and show you what comes next.</p>
            <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[hsl(var(--primary))]"><ShieldCheck size={18} /> Your experience stays part of the conversation.</div>
          </div>
          <div className="animate-rise animate-rise-delay-1 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] p-3 shadow-[var(--shadow-soft)] backdrop-blur">
            <div className="rounded-[1.5rem] bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))] md:p-9">
              <p className="eyebrow text-[hsl(var(--secondary))]">Choose your view</p>
              <h2 className="mt-3 font-display text-3xl">How will you use the desk?</h2>
              <div className="mt-7 grid gap-3">
                <button onClick={() => choose('passenger')} className="group flex items-center justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent))] p-4 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--secondary))]" data-testid="button-choose-passenger">
                  <span className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]"><UserRound size={20} /></span><span><strong className="block">I’m a passenger</strong><small className="text-[hsl(var(--sidebar-foreground)/.65)]">Tell us about a recent journey</small></span></span><ArrowRight size={19} className="transition group-hover:translate-x-1" />
                </button>
                <button onClick={() => choose('agent')} className="group flex items-center justify-between rounded-2xl border border-[hsl(var(--sidebar-border))] bg-transparent p-4 text-left transition hover:-translate-y-0.5 hover:border-[hsl(var(--secondary))]" data-testid="button-choose-agent">
                  <span className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[hsl(var(--secondary)/.5)] text-[hsl(var(--secondary))]"><Headphones size={20} /></span><span><strong className="block">I’m on the service team</strong><small className="text-[hsl(var(--sidebar-foreground)/.65)]">Review stories and follow through</small></span></span><ArrowRight size={19} className="transition group-hover:translate-x-1" />
                </button>
              </div>
              <p className="mt-7 flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground)/.58)]"><Info size={14} /> Prototype mode · no live passenger records</p>
            </div>
          </div>
        </div>
        <footer className="mt-20 flex items-center gap-6 text-xs text-[hsl(var(--muted-foreground))]"><span>Designed for clarity</span><span className="h-1 w-1 rounded-full bg-[hsl(var(--secondary))]" /><span>Built around listening</span></footer>
      </section>
    </main>
  );
}

function AppShell({ user, onLogout, dark, onDarkChange, children }: { user: { id: string; email: string; name: string; role: Role } | null; onLogout: () => void; dark: boolean; onDarkChange: (value: boolean) => void; children: ReactNode }) {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAgent = user?.role === 'agent';
  const nav = isAgent
    ? [{ href: '/agent', label: 'Inbox', icon: Inbox }, { href: '/help', label: 'Help & demo', icon: CircleHelp }]
    : [{ href: '/passenger', label: 'Overview', icon: LayoutDashboard }, { href: '/passenger/feedback', label: 'Share feedback', icon: Plus }, { href: '/passenger/history', label: 'My history', icon: Archive }, { href: '/help', label: 'Help & demo', icon: CircleHelp }];
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[hsl(var(--sidebar))] px-5 py-6 text-[hsl(var(--sidebar-foreground))] transition-transform md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between"><Link href={isAgent ? '/agent' : '/passenger'} className="text-inherit"><BrandMark /></Link><button className="md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={20} /></button></div>
        <div className="mt-12 rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-accent)/.65)] p-4"><p className="eyebrow text-[hsl(var(--secondary))]">{isAgent ? 'Service desk' : 'Your journey'}</p><p className="mt-2 text-sm leading-6 text-[hsl(var(--sidebar-foreground)/.72)]">{isAgent ? 'Turn passenger stories into visible action.' : 'A calm place to share what mattered.'}</p></div>
        <nav className="mt-8 space-y-1" aria-label="Main navigation">
          {nav.map(({ href, label, icon: Icon }) => <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${location === href || (href !== '/agent' && href !== '/passenger' && location.startsWith(href)) ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--sidebar))]' : 'text-[hsl(var(--sidebar-foreground)/.72)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-[hsl(var(--sidebar-foreground))]'}`} data-testid={`link-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={18} />{label}</Link>)}
        </nav>
        <div className="mt-auto border-t border-[hsl(var(--sidebar-border))] pt-5">
          {user ? (
            <button onClick={() => { onLogout(); setLocation('/'); }} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm text-[hsl(var(--sidebar-foreground)/.72)] transition hover:bg-[hsl(var(--sidebar-accent))]" data-testid="button-logout"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--secondary)/.45)] text-[hsl(var(--secondary))]"><LogOut size={17} /></span><span><span className="block text-xs text-[hsl(var(--sidebar-foreground)/.5)]">Sign out</span><strong>{user.name}</strong></span></button>
          ) : (
            <button onClick={() => setLocation(location.startsWith('/passenger') ? '/login?role=passenger' : '/')} className="flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm text-[hsl(var(--sidebar-foreground)/.72)] transition hover:bg-[hsl(var(--sidebar-accent))]" data-testid="button-login"><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-[hsl(var(--secondary)/.45)] text-[hsl(var(--secondary))]">{location.startsWith('/passenger') ? <UserRound size={17} /> : <Headphones size={17} />}</span><span><span className="block text-xs text-[hsl(var(--sidebar-foreground)/.5)]">{location.startsWith('/passenger') ? 'Passenger access' : 'Service team login'}</span><strong>Sign in</strong></span></button>
          )}
          <div className="mt-3 flex items-center justify-between px-3 text-xs text-[hsl(var(--sidebar-foreground)/.5)]"><span className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${user ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--secondary))]'}`} />{user ? 'Authenticated' : 'Public access'}</span><button onClick={() => onDarkChange(!dark)} className="rounded px-1 py-0.5 hover:text-[hsl(var(--sidebar-foreground))]" aria-label="Toggle colour theme" data-testid="button-toggle-theme">{dark ? 'Light' : 'Dark'}</button></div>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-[hsl(var(--sidebar)/.5)] md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-overlay-close" />}
      <div className="md:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] px-5 backdrop-blur md:px-10">
          <button className="rounded-lg p-2 md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={22} /></button>
          <div className="hidden items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] md:flex"><span className={`h-2 w-2 rounded-full ${user ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--secondary))]'}`} /> {user ? 'Authenticated workspace' : 'Public workspace'} <span className="text-[hsl(var(--border))]">/</span> {isAgent ? 'Service team' : 'Passenger'}</div>
          <div className="ml-auto flex items-center gap-3"><button onClick={() => window.alert('You are all caught up in this demo.')} className="relative rounded-xl border border-[hsl(var(--border))] p-2.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]" aria-label="Notifications" data-testid="button-notifications"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[hsl(var(--accent))]" /></button><div className="flex items-center gap-2 border-l border-[hsl(var(--border))] pl-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))]">{user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'G'}</span><span className="hidden text-sm font-semibold sm:block">{user?.name || 'Guest'}</span></div></div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-8 md:px-10 md:py-10">{children}<PageCrumb role={user?.role || 'passenger'} authenticated={!!user} /></main>
      </div>
    </div>
  );
}

function PageCrumb({ role, authenticated }: { role: Role; authenticated: boolean }) {
  return <div className="pointer-events-none fixed bottom-4 right-5 z-10 hidden items-center gap-2 rounded-full bg-[hsl(var(--card)/.88)] px-3 py-1.5 text-[10px] text-[hsl(var(--muted-foreground))] shadow-sm backdrop-blur md:flex"><span className={`h-1.5 w-1.5 rounded-full ${authenticated ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--secondary))]'}`} />{role === 'agent' ? 'SERVICE DESK' : 'PASSENGER DESK'} · {authenticated ? 'AUTHENTICATED' : 'PUBLIC'}</div>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow mb-3 text-[hsl(var(--accent))]">{eyebrow}</p><h1 className="font-display text-4xl leading-tight text-[hsl(var(--sidebar))] dark:text-[hsl(var(--foreground))] md:text-5xl">{title}</h1>{description && <p className="mt-3 max-w-2xl leading-7 text-[hsl(var(--muted-foreground))]">{description}</p>}</div>{action}</div>;
}

function StatusPill({ status }: { status: CaseStatus }) {
  const classes = status === 'Resolved' ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : status === 'In review' ? 'bg-[hsl(var(--secondary)/.2)] text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--accent)/.12)] text-[hsl(var(--accent))]';
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${classes}`} data-testid={`status-case-${status.toLowerCase().replaceAll(' ', '-')}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function Sentiment({ item }: { item: Feedback }) {
  const positive = item.sentiment === 'Positive';
  return <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${positive ? 'text-[hsl(var(--primary))]' : item.sentiment === 'Mixed' ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--accent))]'}`}><span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10">{positive ? <ThumbsUp size={11} /> : item.sentiment === 'Mixed' ? <Info size={11} /> : <AlertCircle size={11} />}</span>{item.sentiment}</span>;
}

function PassengerDashboard({ feedbacks }: { feedbacks: Feedback[] }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const recent = feedbacks.slice(0, 3);
  return <div className="animate-rise">
    <PageIntro
      eyebrow={user ? `Good morning, ${user.name.split(' ')[0]}` : "Welcome, Guest"}
      title="Your voice travels."
      description="A quick view of what you’ve shared and where it is in the conversation."
      action={
        <div className="flex flex-wrap gap-3">
          {!user && (
            <Link href="/login?role=passenger" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5" data-testid="link-login-passenger">
              <UserRound size={17} /> Sign in
            </Link>
          )}
          <Link href="/passenger/feedback" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition hover:-translate-y-0.5" data-testid="link-start-feedback">
            <Plus size={17} /> Share feedback
          </Link>
        </div>
      }
    />
    <section className="relative overflow-hidden rounded-[1.5rem] bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))] shadow-[var(--shadow-soft)] md:p-9">
      <div className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full border-[35px] border-[hsl(var(--secondary)/.2)]" /><div className="pointer-events-none absolute right-24 top-12 h-3 w-3 rounded-full bg-[hsl(var(--secondary))]" />
      <div className="relative grid gap-8 md:grid-cols-[1.2fr_.8fr] md:items-end"><div><p className="eyebrow text-[hsl(var(--secondary))]">The feedback loop</p><h2 className="mt-3 max-w-xl font-display text-3xl leading-tight md:text-4xl">A few minutes from a shared experience to a better one.</h2><p className="mt-4 max-w-lg text-sm leading-6 text-[hsl(var(--sidebar-foreground)/.68)]">Tell us in the format that feels natural. We’ll keep you updated as your case moves forward.</p></div><div className="grid grid-cols-3 gap-2">{[['01', 'Share'], ['02', 'Understand'], ['03', 'Act']].map(([n, label]) => <div key={n} className="border-l border-[hsl(var(--sidebar-border))] pl-3"><span className="font-mono-ui text-xs text-[hsl(var(--secondary))]">{n}</span><p className="mt-6 text-sm font-semibold">{label}</p></div>)}</div></div>
    </section>
    <div className="mt-8 grid gap-4 md:grid-cols-3"><Metric icon={MessageSquare} label="Stories shared" value={String(feedbacks.length)} detail="Since your first journey" /><Metric icon={Clock3} label="In conversation" value={String(feedbacks.filter((x) => x.status !== 'Resolved').length)} detail="Awaiting a next step" /><Metric icon={CheckCircle2} label="Resolved" value={String(feedbacks.filter((x) => x.status === 'Resolved').length)} detail="Closed with care" /></div>
    <section className="mt-10"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow text-[hsl(var(--muted-foreground))]">Recent stories</p><h2 className="mt-1 text-xl font-bold">Your feedback history</h2></div><Link href="/passenger/history" className="flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-view-history">View all <ChevronRight size={16} /></Link></div><div className="grid gap-3">{recent.map((item, index) => <FeedbackRow item={item} key={item.id} index={index} />)}</div></section>
    <section className="mt-10 grid gap-4 border-t border-[hsl(var(--border))] pt-8 md:grid-cols-[1fr_1fr]"><div className="rounded-2xl bg-[hsl(var(--muted)/.65)] p-5"><div className="flex items-center gap-2 text-[hsl(var(--primary))]"><Sparkles size={18} /><strong className="text-sm">A note on sentiment</strong></div><p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">The tone shown on your stories is a simulated prototype result. It helps the team practise prioritising themes — it is not a judgement of your experience.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] p-5"><p className="eyebrow text-[hsl(var(--muted-foreground))]">Need a hand?</p><p className="mt-2 text-sm leading-6">Learn how the feedback desk works, or explore this demo with a guided reset.</p><Link href="/help" className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[hsl(var(--primary))]" data-testid="link-help-home">Visit help & demo <ArrowRight size={15} /></Link></div></section>
  </div>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: typeof MessageSquare; label: string; value: string; detail: string }) {
  return <div className="card-lift rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5"><div className="flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]"><Icon size={17} /></span><span className="font-mono-ui text-2xl font-medium text-[hsl(var(--primary))]" data-testid={`text-metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</span></div><p className="mt-5 text-sm font-bold">{label}</p><p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{detail}</p></div>;
}

function FeedbackRow({ item, index = 0 }: { item: Feedback; index?: number }) {
  return <Link href={`/passenger/history/${item.id}`} className={`card-lift flex items-center justify-between gap-4 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 animate-rise animate-rise-delay-${Math.min(index + 1, 3)}`} data-testid={`card-feedback-${item.id}`}><span className="flex min-w-0 items-center gap-4"><span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--muted))] text-[hsl(var(--primary))] sm:flex">{item.modality === 'audio' ? <Mic size={19} /> : item.modality === 'video' ? <Video size={19} /> : <FileText size={19} />}</span><span className="min-w-0"><span className="block truncate text-sm font-bold">{item.subject}</span><span className="mt-1 block truncate text-xs text-[hsl(var(--muted-foreground))]">{item.category} · {item.flight} · {item.submittedAt}</span></span></span><span className="flex shrink-0 items-center gap-5"><span className="hidden md:block"><Sentiment item={item} /></span><StatusPill status={item.status} /><ChevronRight size={17} className="text-[hsl(var(--muted-foreground))]" /></span></Link>;
}

function FeedbackWizard({ draft, setDraft }: { draft: Draft; setDraft: (value: Draft) => void }) {
  const [, setLocation] = useLocation();
  const [error, setError] = useState('');
  const [recording, setRecording] = useState<Modality | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chooseMedia = async (mode: Modality) => {
    if (mode === 'written') return;
    if (recording) {
      mediaRef.current?.stop();
      setRecording(null);
      return;
    }
    try {
      const stream = await navigator.mediaDevices?.getUserMedia({ audio: true, video: mode === 'video' });
      if (stream && 'MediaRecorder' in window) {
        const recorder = new MediaRecorder(stream);
        mediaRef.current = recorder;
        recorder.onstop = () => stream.getTracks().forEach((track) => track.stop());
        recorder.start();
        setRecording(mode);
      } else {
        setDraft({ ...draft, [`${mode}Name`]: mode === 'audio' ? 'Voice note · 00:18' : 'Cabin note · 00:32' });
      }
    } catch {
      setDraft({ ...draft, [`${mode}Name`]: mode === 'audio' ? 'Voice note · demo recording' : 'Video note · demo recording' });
    }
  };
  const update = (key: keyof Draft, value: string) => setDraft({ ...draft, [key]: value });
  const next = () => {
    if (!draft.category || !draft.subject || (!draft.narrative && !draft.audioName && !draft.videoName)) {
      setError('Add a category, a short subject, and your experience before continuing.');
      return;
    }
    setError('');
    setLocation('/passenger/feedback/review');
  };
  return <div className="animate-rise">
    <PageIntro eyebrow="Share feedback · 01 / 02" title="What would you like us to hear?" description="Choose a format, add the journey details you remember, and review everything before it reaches our service team." />
    <div className="grid gap-7 lg:grid-cols-[.85fr_1.15fr]">
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-7"><p className="eyebrow text-[hsl(var(--muted-foreground))]">Choose your format</p><div className="mt-5 space-y-3">{([['written', FileText, 'Write it down', 'Best for a detailed account'], ['audio', Mic, 'Record a voice note', 'Speak naturally, hands-free'], ['video', Video, 'Share a video', 'Show us what happened']] as const).map(([value, Icon, title, detail]) => <button key={value} onClick={() => update('modality', value)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${draft.modality === value ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)]' : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/.5)]'}`} data-testid={`button-modality-${value}`}><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${draft.modality === value ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--primary))]'}`}><Icon size={18} /></span><span className="flex-1"><strong className="block text-sm">{title}</strong><small className="text-xs text-[hsl(var(--muted-foreground))]">{detail}</small></span>{draft.modality === value && <Check size={17} className="text-[hsl(var(--primary))]" />}</button>)}</div><div className="mt-7 rounded-xl bg-[hsl(var(--muted)/.6)] p-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]"><div className="flex items-center gap-2 font-bold text-[hsl(var(--foreground))]"><ShieldCheck size={15} className="text-[hsl(var(--primary))]" /> Kept safe in this demo</div><p className="mt-1">Nothing leaves this browser. Your story is stored only in localStorage until you reset the demo.</p></div></section>
      <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 md:p-7"><p className="eyebrow text-[hsl(var(--muted-foreground))]">Tell us about the moment</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Category" required><select value={draft.category} onChange={(e) => update('category', e.target.value)} className="field" data-testid="select-feedback-category"><option value="">Select a category</option><option>Cabin crew</option><option>Airport experience</option><option>Baggage</option><option>Booking & payment</option><option>Accessibility</option><option>Other</option></select></Field><Field label="Flight number"><input value={draft.flight} onChange={(e) => update('flight', e.target.value)} placeholder="e.g. ET 612" className="field" data-testid="input-flight-number" /></Field><Field label="Route"><input value={draft.route} onChange={(e) => update('route', e.target.value)} placeholder="e.g. Addis Ababa → Paris" className="field" data-testid="input-route" /></Field><Field label="Travel date"><input type="date" value={draft.date} onChange={(e) => update('date', e.target.value)} className="field" data-testid="input-travel-date" /></Field></div><div className="mt-5"><Field label="Give this story a short title" required><input value={draft.subject} onChange={(e) => update('subject', e.target.value)} placeholder="The moment I want to remember" className="field" data-testid="input-feedback-subject" /></Field></div><div className="mt-5"><Field label={draft.modality === 'written' ? 'What happened?' : 'Add a little context'} required><textarea value={draft.narrative} onChange={(e) => update('narrative', e.target.value)} placeholder="Tell us what happened, what worked, and what could have felt better…" className="field min-h-32 resize-y" data-testid="textarea-feedback-narrative" /><div className="mt-1 text-right text-xs text-[hsl(var(--muted-foreground))]">{draft.narrative.length} characters</div></Field></div>{draft.modality !== 'written' && <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary)/.05)] p-3"><button onClick={() => void chooseMedia(draft.modality)} className="flex items-center gap-2 rounded-lg bg-[hsl(var(--primary))] px-3 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))]" data-testid={`button-record-${draft.modality}`}>{recording === draft.modality ? <><span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--secondary))]" /> Stop recording</> : draft[`${draft.modality}Name` as 'audioName' | 'videoName'] ? <><Check size={14} /> Replace recording</> : <>{draft.modality === 'audio' ? <Mic size={14} /> : <Video size={14} />} Start {draft.modality}</>}</button><span className="text-xs text-[hsl(var(--muted-foreground))]">{draft[`${draft.modality}Name` as 'audioName' | 'videoName'] || 'Browser permission is requested only when you start.'}</span></div>}{error && <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--accent))]" role="alert" data-testid="error-feedback-form"><AlertCircle size={16} />{error}</p>}<div className="mt-7 flex justify-end"><button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] transition hover:-translate-y-0.5" data-testid="button-review-feedback">Review feedback <ArrowRight size={17} /></button></div></section>
    </div>
  </div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="block text-sm font-bold">{label}{required && <span className="ml-1 text-[hsl(var(--accent))]">*</span>}<span className="mt-2 block">{children}</span></label>;
}

function ReviewPage({ draft, onSubmit }: { draft: Draft; onSubmit: () => void }) {
  const [, setLocation] = useLocation();
  const [sending, setSending] = useState(false);
  const submit = () => { setSending(true); window.setTimeout(() => { onSubmit(); setLocation('/passenger/feedback/result'); }, 650); };
  return <div className="animate-rise max-w-4xl"><PageIntro eyebrow="Share feedback · 02 / 02" title="A moment to make sure it feels right." description="Review your story before sending it to the Ethiopian Airlines service team." /><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-9"><div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-5"><span className="flex items-center gap-2 text-sm font-bold"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">{draft.modality === 'audio' ? <Mic size={16} /> : draft.modality === 'video' ? <Video size={16} /> : <FileText size={16} />}</span>{draft.modality === 'written' ? 'Written story' : draft.modality === 'audio' ? 'Voice note' : 'Video note'}</span><span className="font-mono-ui text-xs text-[hsl(var(--muted-foreground))]">PRIVATE PREVIEW</span></div><dl className="mt-7 grid gap-6 sm:grid-cols-2"><ReviewItem label="Title" value={draft.subject || 'Untitled story'} /><ReviewItem label="Category" value={draft.category || 'Other'} /><ReviewItem label="Flight" value={draft.flight || 'Not provided'} /><ReviewItem label="Route" value={draft.route || 'Not provided'} /><ReviewItem label="Travel date" value={draft.date || 'Not provided'} /></dl><div className="mt-8 rounded-xl bg-[hsl(var(--muted)/.55)] p-5"><p className="eyebrow text-[hsl(var(--muted-foreground))]">Your experience</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7">{draft.narrative || 'A media note is attached with this feedback.'}</p>{(draft.audioName || draft.videoName) && <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))]"><CheckCircle2 size={16} />{draft.audioName || draft.videoName}</div>}</div><div className="mt-8 flex flex-col-reverse gap-3 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:justify-between"><button onClick={() => setLocation('/passenger/feedback')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] px-5 py-3 text-sm font-bold hover:bg-[hsl(var(--muted))]" data-testid="button-edit-feedback"><ArrowLeft size={16} /> Edit story</button><button disabled={sending} onClick={submit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:opacity-60" data-testid="button-submit-feedback">{sending ? 'Sending securely…' : 'Send feedback'} {!sending && <Send size={16} />}</button></div></div></div>;
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return <div><dt className="eyebrow text-[hsl(var(--muted-foreground))]">{label}</dt><dd className="mt-2 text-sm font-bold">{value}</dd></div>;
}

function ResultPage({ feedbacks }: { feedbacks: Feedback[] }) {
  const [, setLocation] = useLocation();
  const item = feedbacks[0];
  const [processing, setProcessing] = useState(true);
  useEffect(() => { const timer = window.setTimeout(() => setProcessing(false), 1150); return () => window.clearTimeout(timer); }, [item?.id]);
  if (!item) return <EmptyState icon={MessageSquare} title="No feedback yet" description="Your first story will appear here after you send it." action={<Link href="/passenger/feedback" className="button-primary" data-testid="link-first-feedback">Share a story</Link>} />;
  return <div className="animate-rise mx-auto max-w-3xl"><div className="mb-10 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary)/.25)] text-[hsl(var(--primary))]">{processing ? <Sparkles className="animate-pulse" size={27} /> : <CheckCircle2 size={30} />}</div><p className="eyebrow mt-6 text-[hsl(var(--accent))]">{processing ? 'Making sense of your story' : 'Feedback received'}</p><h1 className="mt-3 font-display text-4xl">{processing ? 'One thoughtful pause.' : 'Thank you for sharing.'}</h1><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[hsl(var(--muted-foreground))]">{processing ? 'We’re preparing a simulated summary so you can see how your experience might be understood.' : 'Your experience is now in the service team’s conversation.'}</p></div>{processing ? <div className="space-y-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7"><div className="shimmer h-5 w-2/5 rounded" /><div className="shimmer h-4 w-full rounded" /><div className="shimmer h-4 w-4/5 rounded" /><div className="shimmer mt-5 h-20 w-full rounded-xl" /></div> : <div className="space-y-4"><section className="rounded-2xl bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))]"><div className="flex items-start justify-between"><div><p className="eyebrow text-[hsl(var(--secondary))]">Simulated sentiment</p><h2 className="mt-3 font-display text-3xl">{item.sentiment}</h2></div><div className="text-right"><span className="font-mono-ui text-4xl text-[hsl(var(--secondary))]">{item.score}</span><p className="text-xs text-[hsl(var(--sidebar-foreground)/.6)]">tone score / 100</p></div></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-[hsl(var(--sidebar-accent))]"><div className="h-full rounded-full bg-[hsl(var(--secondary))]" style={{ width: `${item.score}%` }} /></div><p className="mt-5 text-sm leading-6 text-[hsl(var(--sidebar-foreground)/.72)]">“{item.subject}” reads as a {item.sentiment.toLowerCase()} experience. A service teammate will consider the details, not just this prototype signal.</p></section><div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--secondary)/.5)] bg-[hsl(var(--secondary)/.1)] p-4 text-sm"><Info size={17} className="mt-0.5 shrink-0 text-[hsl(var(--accent))]" /><p><strong>Quietly simulated.</strong> Sentiment is generated locally for this prototype. It does not make decisions about your care, compensation, or case priority.</p></div><div className="flex flex-col gap-3 pt-3 sm:flex-row"><Link href={`/passenger/history/${item.id}`} className="button-primary flex-1 justify-center" data-testid="link-view-submitted-feedback">View my feedback <ArrowRight size={16} /></Link><Link href="/passenger" className="button-secondary flex-1 justify-center" data-testid="link-result-home">Back to overview</Link></div></div>}</div>;
}

function PassengerHistory({ feedbacks }: { feedbacks: Feedback[] }) {
  const [filter, setFilter] = useState<'All' | CaseStatus>('All');
  const filtered = feedbacks.filter((item) => filter === 'All' || item.status === filter);
  return <div className="animate-rise"><PageIntro eyebrow="Your record" title="Stories you’ve shared." description="A private timeline of the moments you’ve brought into the conversation." action={<Link href="/passenger/feedback" className="button-secondary" data-testid="link-history-new-feedback"><Plus size={16} /> New story</Link>} /><div className="mb-5 flex flex-wrap items-center gap-2"><Filter size={16} className="mr-1 text-[hsl(var(--muted-foreground))]" />{(['All', 'New', 'In review', 'Resolved'] as const).map((value) => <button key={value} onClick={() => setFilter(value)} className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filter === value ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`} data-testid={`button-filter-${value.toLowerCase().replaceAll(' ', '-')}`}>{value}{value !== 'All' && <span className="ml-1 opacity-70">· {feedbacks.filter((x) => x.status === value).length}</span>}</button>)}</div>{filtered.length ? <div className="space-y-3">{filtered.map((item, index) => <FeedbackRow item={item} key={item.id} index={index} />)}</div> : <EmptyState icon={Archive} title="Nothing in this view" description="Try another status filter to find the story you’re looking for." action={<button onClick={() => setFilter('All')} className="button-secondary" data-testid="button-clear-history-filter">Show all stories</button>} />}</div>;
}

function FeedbackDetail({ feedbacks }: { feedbacks: Feedback[] }) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const item = feedbacks.find((feedback) => feedback.id === id);
  if (!item) return <EmptyState icon={AlertCircle} title="Story not found" description="This feedback may have been cleared from the local demo." action={<Link href="/passenger/history" className="button-secondary" data-testid="link-back-history">Back to history</Link>} />;
  return (
    <div className="animate-rise max-w-4xl">
      <button onClick={() => setLocation('/passenger/history')} className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" data-testid="button-back-history"><ArrowLeft size={16} /> My history</button>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div><p className="eyebrow text-[hsl(var(--accent))]">{item.id} · {item.category}</p><h1 className="mt-3 font-display text-4xl leading-tight">{item.subject}</h1><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{item.route} · {item.flight} · {item.date}</p></div>
        <StatusPill status={item.status} />
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-[1fr_.65fr]">
        <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <p className="eyebrow text-[hsl(var(--muted-foreground))]">Your experience</p>
          <p className="mt-4 text-base leading-8">{item.narrative}</p>
          <div className="mt-8 border-t border-[hsl(var(--border))] pt-5"><span className="text-xs font-bold text-[hsl(var(--muted-foreground))]">Shared {item.submittedAt} · {item.modality} format</span></div>
        </article>
        <aside className="space-y-4">
          <div className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))]"><p className="eyebrow text-[hsl(var(--secondary))]">Tone, simulated</p><div className="mt-3 flex items-end gap-2"><span className="font-display text-3xl">{item.sentiment}</span><span className="mb-1 font-mono-ui text-xs text-[hsl(var(--secondary))]">{item.score}/100</span></div><p className="mt-3 text-xs leading-5 text-[hsl(var(--sidebar-foreground)/.65)]">A local prototype signal, never a verdict on your experience.</p></div>
          <div className="rounded-2xl border border-[hsl(var(--border))] p-6"><p className="eyebrow text-[hsl(var(--muted-foreground))]">What happens next</p><div className="mt-4 space-y-4">{[['Received', true], ['Service team review', item.status !== 'New'], ['A response or action', item.status === 'Resolved']].map(([label, done]) => <div className="flex items-center gap-3 text-sm" key={String(label)}><span className={`flex h-7 w-7 items-center justify-center rounded-full ${done ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}`}>{done ? <Check size={14} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span><span className={done ? 'font-bold' : 'text-[hsl(var(--muted-foreground))]'}>{label}</span></div>)}</div></div>
        </aside>
      </div>
    </div>
  );
}

function AgentDashboard({ feedbacks }: { feedbacks: Feedback[] }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | CaseStatus>('All');
  const filtered = useMemo(() => feedbacks.filter((item) => (status === 'All' || item.status === status) && `${item.subject} ${item.id} ${item.category} ${item.route}`.toLowerCase().includes(search.toLowerCase())), [feedbacks, search, status]);
  return <div className="animate-rise"><PageIntro eyebrow="Service desk · Tuesday, 18 June" title="Listen closely. Act visibly." description="A working inbox for the moments passengers want the airline to remember." action={<div className="flex items-center gap-2 rounded-full bg-[hsl(var(--secondary)/.2)] px-3 py-2 text-xs font-bold"><span className="h-2 w-2 rounded-full bg-[hsl(var(--secondary))]" /> All data is local demo data</div>} /><div className="grid gap-4 md:grid-cols-4"><Metric icon={Inbox} label="Total cases" value={String(feedbacks.length)} detail="Across all journeys" /><Metric icon={AlertCircle} label="Needs attention" value={String(feedbacks.filter((x) => x.sentiment === 'Needs attention').length)} detail="Prioritise with context" /><Metric icon={Clock3} label="In review" value={String(feedbacks.filter((x) => x.status === 'In review').length)} detail="Active conversations" /><Metric icon={BarChart3} label="Positive tone" value={`${Math.round(feedbacks.filter((x) => x.sentiment === 'Positive').length / Math.max(feedbacks.length, 1) * 100)}%`} detail="Simulated signal" /></div><section className="mt-9 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))]"><div className="flex flex-col gap-4 border-b border-[hsl(var(--border))] p-5 md:flex-row md:items-center md:justify-between"><div><p className="eyebrow text-[hsl(var(--muted-foreground))]">Case inbox</p><h2 className="mt-1 text-xl font-bold">Passenger experiences</h2></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={16} className="absolute left-3 top-2.5 text-[hsl(var(--muted-foreground))]" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="field h-10 w-full pl-9 sm:w-56" placeholder="Search cases…" aria-label="Search cases" data-testid="input-search-cases" /></label><select value={status} onChange={(e) => setStatus(e.target.value as 'All' | CaseStatus)} className="field h-10 sm:w-36" aria-label="Filter cases by status" data-testid="select-case-status"><option>All</option><option>New</option><option>In review</option><option>Resolved</option></select></div></div><div className="hidden grid-cols-[.7fr_1.6fr_1fr_.8fr_.85fr_24px] gap-4 border-b border-[hsl(var(--border))] px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] md:grid"><span>Case</span><span>Experience</span><span>Journey</span><span>Tone</span><span>Status</span><span /></div><div>{filtered.map((item) => <CaseRow item={item} key={item.id} />)}</div>{!filtered.length && <EmptyState icon={Search} title="No cases match" description="Try a different phrase or status filter." action={<button onClick={() => { setSearch(''); setStatus('All'); }} className="button-secondary" data-testid="button-clear-case-search">Clear filters</button>} />}</section></div>;
}

function CaseRow({ item }: { item: Feedback }) {
  return <Link href={`/agent/cases/${item.id}`} className="grid items-center gap-4 border-b border-[hsl(var(--border))] px-5 py-4 transition last:border-0 hover:bg-[hsl(var(--muted)/.5)] md:grid-cols-[.7fr_1.6fr_1fr_.8fr_.85fr_24px]" data-testid={`row-case-${item.id}`}><span className="font-mono-ui text-xs text-[hsl(var(--primary))]">{item.id}</span><span className="min-w-0"><strong className="block truncate text-sm">{item.subject}</strong><span className="mt-1 block truncate text-xs text-[hsl(var(--muted-foreground))]">{item.category} · {item.submittedAt}</span></span><span className="hidden text-xs text-[hsl(var(--muted-foreground))] md:block">{item.route}</span><Sentiment item={item} /><StatusPill status={item.status} /><ChevronRight size={17} className="text-[hsl(var(--muted-foreground))]" /></Link>;
}

function AgentCaseDetail({ feedbacks, setFeedbacks, notify }: { feedbacks: Feedback[]; setFeedbacks: (value: Feedback[] | ((current: Feedback[]) => Feedback[])) => void; notify: (message: string) => void }) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const item = feedbacks.find((feedback) => feedback.id === id);
  const [note, setNote] = useState('');
  if (!item) return <EmptyState icon={AlertCircle} title="Case not found" description="Return to the inbox to choose another experience." action={<Link href="/agent" className="button-secondary" data-testid="link-back-inbox">Back to inbox</Link>} />;
  const updateStatus = (next: CaseStatus) => {
    setFeedbacks((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: next } : entry));
    notify(`Case marked ${next.toLowerCase()}`);
  };
  const saveNote = () => {
    if (!note.trim()) return;
    setFeedbacks((current) => current.map((entry) => entry.id === item.id ? { ...entry, agentNote: note.trim() } : entry));
    setNote('');
    notify('Internal note saved');
  };
  const suggestions: Array<[string, string, typeof CheckCircle2]> = [['Acknowledge', 'Let the passenger know their story was seen.', CheckCircle2], ['Coordinate', 'Bring the right airport or cabin team in.', Users], ['Close the loop', 'Leave a clear, visible next step.', ThumbsUp]];
  return <div className="animate-rise"><button onClick={() => setLocation('/agent')} className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" data-testid="button-back-inbox"><ArrowLeft size={16} /> Case inbox</button><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="eyebrow text-[hsl(var(--accent))]">{item.id} · {item.category}</p><h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight">{item.subject}</h1><p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">{item.route} · {item.flight} · submitted {item.submittedAt}</p></div><div className="flex flex-wrap gap-2"><select value={item.status} onChange={(e) => updateStatus(e.target.value as CaseStatus)} className="field h-10 w-36 font-bold" aria-label="Update case status" data-testid="select-update-case-status"><option>New</option><option>In review</option><option>Resolved</option></select><button onClick={() => notify('More case actions are available in the full service system')} className="rounded-xl border border-[hsl(var(--border))] p-2.5 hover:bg-[hsl(var(--muted))]" aria-label="More case actions" data-testid="button-more-case-actions"><MoreHorizontal size={18} /></button></div></div><div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><section className="space-y-5"><article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"><div className="flex items-center justify-between"><p className="eyebrow text-[hsl(var(--muted-foreground))]">Passenger account</p><span className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--primary))]"><ShieldCheck size={15} /> Identity protected</span></div><p className="mt-5 text-lg leading-8">{item.narrative}</p><div className="mt-7 grid gap-4 border-t border-[hsl(var(--border))] pt-5 sm:grid-cols-3"><ReviewItem label="Format" value={item.modality} /><ReviewItem label="Travel date" value={item.date} /><ReviewItem label="Tone signal" value={`${item.sentiment} · ${item.score}/100`} /></div></article><section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><div className="flex items-center justify-between"><div><p className="eyebrow text-[hsl(var(--muted-foreground))]">Internal note</p><p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">Only visible to the service team.</p></div><Tag size={19} className="text-[hsl(var(--primary))]" /></div>{item.agentNote && <div className="mt-4 rounded-xl bg-[hsl(var(--muted)/.65)] p-4 text-sm leading-6">{item.agentNote}</div>}<div className="mt-4 flex flex-col gap-2 sm:flex-row"><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add context, an owner, or a next step…" className="field min-h-20 flex-1 resize-none" aria-label="Internal note" data-testid="textarea-internal-note" /><button onClick={saveNote} className="button-primary self-end sm:self-stretch" data-testid="button-save-internal-note"><Send size={15} /> Save note</button></div></section></section><aside className="space-y-5"><div className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))]"><p className="eyebrow text-[hsl(var(--secondary))]">Service signal · simulated</p><div className="mt-4 flex items-end justify-between"><span className="font-display text-3xl">{item.sentiment}</span><span className="font-mono-ui text-3xl text-[hsl(var(--secondary))]">{item.score}</span></div><div className="mt-5 h-2 rounded-full bg-[hsl(var(--sidebar-accent))]"><div className="h-full rounded-full bg-[hsl(var(--secondary))]" style={{ width: `${item.score}%` }} /></div><p className="mt-4 text-xs leading-5 text-[hsl(var(--sidebar-foreground)/.62)]">Use this as a conversation starter, never as an automated decision.</p></div><div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><p className="eyebrow text-[hsl(var(--muted-foreground))]">Suggested rhythm</p><div className="mt-5 space-y-5">{suggestions.map(([title, desc, Icon]) => <div className="flex gap-3" key={title}><Icon size={17} className="mt-0.5 shrink-0 text-[hsl(var(--primary))]" /><div><strong className="text-sm">{title}</strong><p className="mt-1 text-xs leading-5 text-[hsl(var(--muted-foreground))]">{desc}</p></div></div>)}</div></div></aside></div></div>;
}

function HelpSettings({ dark, onDarkChange, onReset }: { dark: boolean; onDarkChange: (value: boolean) => void; onReset: () => void }) {
  const [open, setOpen] = useState('process');
  const [resetConfirm, setResetConfirm] = useState(false);
  const faqs = [{ id: 'process', q: 'How does the feedback loop work?', a: 'Share a written, audio, or video account. Review it before sending. The service team can then review the case, add internal context, and show a status as the conversation moves.' }, { id: 'sentiment', q: 'What does simulated sentiment mean?', a: 'This prototype creates a simple local tone signal to demonstrate how a service desk might surface patterns. It is not a live model, a complaint score, or a decision about your case.' }, { id: 'privacy', q: 'Where does my information go?', a: 'Nowhere outside this browser. The experience uses localStorage only, so it is safe for demos and presentations. Use Reset demo data below to clear your local changes.' }];
  return <div className="animate-rise max-w-4xl"><PageIntro eyebrow="Orientation & controls" title="Help the demo do its best work." description="A small guide to the experience, its boundaries, and the settings that shape your view." /><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6"><p className="eyebrow text-[hsl(var(--muted-foreground))]">How it works</p><div className="mt-4 divide-y divide-[hsl(var(--border))]">{faqs.map((faq) => <div key={faq.id}><button onClick={() => setOpen(open === faq.id ? '' : faq.id)} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-bold" data-testid={`button-help-${faq.id}`}><span>{faq.q}</span><ChevronDown size={17} className={`shrink-0 transition ${open === faq.id ? 'rotate-180' : ''}`} /></button>{open === faq.id && <p className="pb-5 pr-8 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{faq.a}</p>}</div>)}</div></section><aside className="space-y-5"><div className="rounded-2xl bg-[hsl(var(--sidebar))] p-6 text-[hsl(var(--sidebar-foreground))]"><p className="eyebrow text-[hsl(var(--secondary))]">Prototype controls</p><div className="mt-5 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))] pb-4"><div><strong className="text-sm">Colour theme</strong><p className="mt-1 text-xs text-[hsl(var(--sidebar-foreground)/.58)]">Try a warmer night desk.</p></div><button onClick={() => onDarkChange(!dark)} className={`rounded-full p-1 transition ${dark ? 'bg-[hsl(var(--secondary))]' : 'bg-[hsl(var(--sidebar-accent))]'}`} aria-label="Toggle colour theme" data-testid="button-help-theme"><span className={`block h-5 w-5 rounded-full bg-[hsl(var(--card))] transition ${dark ? 'translate-x-5' : ''}`} /></button></div><div className="mt-4 flex items-center justify-between"><div><strong className="text-sm">Local persistence</strong><p className="mt-1 text-xs text-[hsl(var(--sidebar-foreground)/.58)]">Always on for this demo.</p></div><span className="flex items-center gap-1.5 text-xs font-bold text-[hsl(var(--secondary))]"><CheckCircle2 size={14} /> Active</span></div></div><div className="rounded-2xl border border-[hsl(var(--border))] p-6"><div className="flex items-start gap-3"><RotateCcw size={18} className="mt-0.5 text-[hsl(var(--accent))]" /><div><strong className="text-sm">Reset this demo</strong><p className="mt-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">Restore the fictional Ethiopian Airlines cases and clear any stories you added.</p>{!resetConfirm ? <button onClick={() => setResetConfirm(true)} className="mt-4 text-xs font-bold text-[hsl(var(--accent))]" data-testid="button-reset-demo">Prepare reset</button> : <div className="mt-4 flex items-center gap-2"><button onClick={() => { onReset(); setResetConfirm(false); }} className="rounded-lg bg-[hsl(var(--accent))] px-3 py-2 text-xs font-bold text-white" data-testid="button-confirm-reset">Reset now</button><button onClick={() => setResetConfirm(false)} className="rounded-lg border border-[hsl(var(--border))] px-3 py-2 text-xs font-bold" data-testid="button-cancel-reset">Cancel</button></div>}</div></div></div></aside></div><div className="mt-8 flex items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/.5)] p-5 text-sm"><LifeBuoy size={19} className="text-[hsl(var(--primary))]" /><span>For this prototype, all controls are designed for a guided presentation — no service requests are sent.</span></div></div>;
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof Archive; title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-16 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--muted))] text-[hsl(var(--primary))]"><Icon size={21} /></span><h2 className="mt-5 text-lg font-bold">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

export default App;