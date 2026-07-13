import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Headphones,
  Leaf,
  LoaderCircle,
  LogOut,
  Mail,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { buildDashboardModel } from '../parent/analytics';
import { isParentDashboardConfigured, parentSupabase } from '../parent/client';
import { loadDashboardData } from '../parent/data';
import type { DashboardModel } from '../parent/types';

const TIME_ZONE = 'America/Sao_Paulo';

const formatDateTime = (value: string) => new Intl.DateTimeFormat('pt-BR', {
  timeZone: TIME_ZONE,
  weekday: 'long',
  day: '2-digit',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(value));

const formatPercent = (value: number | null) => value === null
  ? 'Poucos dados'
  : `${Math.round(value * 100)}%`;

const familyName = (key: string) => key === 'VOGAL' ? 'Vogais' : `Família ${key}`;

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
};

function MetricCard({ label, value, detail, icon }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500">{label}</span>
        <span className="rounded-2xl bg-emerald-50 p-2 text-emerald-700">{icon}</span>
      </div>
      <p className="text-3xl font-black tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function LoginPanel({ onAuthenticated }: { onAuthenticated: (session: Session) => void }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parentSupabase || !email.trim()) return;
    setSending(true);
    setError('');
    const { error: signInError } = await parentSupabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/painel` },
    });
    setSending(false);
    if (signInError) {
      setError('Não foi possível enviar o acesso agora. Confira o e-mail e tente novamente.');
      return;
    }
    setSent(true);
  };

  useEffect(() => {
    if (!parentSupabase) return;
    const { data: listener } = parentSupabase.auth.onAuthStateChange((_event, session) => {
      if (session && !session.user.is_anonymous) onAuthenticated(session);
    });
    return () => listener.subscription.unsubscribe();
  }, [onAuthenticated]);

  return (
    <main className="min-h-screen bg-[#f4fbf7] px-5 py-10 text-slate-800">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800">
            <Leaf size={17} /> Jardim das Sílabas
          </div>
          <h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Acompanhe o que está florescendo na leitura.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Um resumo reservado para a família, sem comparação com outras crianças e sem rótulos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><ShieldCheck size={17} /> Dados protegidos</span>
            <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm"><Users size={17} /> Mesmo acesso para os dois</span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-900/5 sm:p-8">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Entrar no painel</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Digite o e-mail cadastrado. Você receberá um link de acesso, sem senha compartilhada.</p>

          {sent ? (
            <div className="mt-7 rounded-2xl bg-emerald-50 p-5 text-emerald-900" role="status">
              <div className="flex items-center gap-2 font-bold"><CheckCircle2 size={20} /> Link enviado</div>
              <p className="mt-2 text-sm leading-6">Abra o e-mail neste aparelho. O link expira e só dá acesso à família vinculada.</p>
              <button className="mt-4 text-sm font-bold underline" onClick={() => setSent(false)}>Usar outro e-mail</button>
            </div>
          ) : (
            <form className="mt-7" onSubmit={submit}>
              <label className="text-sm font-bold text-slate-700" htmlFor="parent-email">E-mail</label>
              <input
                id="parent-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
              {error && <p className="mt-3 text-sm font-semibold text-red-600" role="alert">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {sending ? <LoaderCircle className="animate-spin" size={20} /> : <Mail size={20} />}
                Enviar link de acesso
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function DashboardContent({ model, onRefresh, refreshing, onSignOut }: {
  model: DashboardModel;
  onRefresh: () => void;
  refreshing: boolean;
  onSignOut: () => void;
}) {
  const lastSessionText = model.lastSession ? formatDateTime(model.lastSession.startedAt) : 'Nenhuma sessão registrada';
  return (
    <main className="min-h-screen bg-[#f4fbf7] text-slate-800">
      <header className="border-b border-emerald-100 bg-white/90 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white"><Leaf size={21} /></span>
            <div>
              <p className="font-black text-slate-900">Jardim das Sílabas</p>
              <p className="text-xs text-slate-500">Painel da família</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Atualizar dados" onClick={onRefresh} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <RefreshCw size={19} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button aria-label="Sair do painel" onClick={onSignOut} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100"><LogOut size={19} /></button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-700">Visão da semana</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Acompanhamento da Cecília</h1>
            <p className="mt-2 text-slate-500">Última atividade: <span className="font-semibold text-slate-700">{lastSessionText}</span></p>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">
            <Users size={17} /> {model.guardianCount === 2 ? 'Papai e mamãe têm o mesmo acesso' : 'Acesso familiar protegido'}
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Resumo da semana">
          <MetricCard label="Sessões" value={String(model.week.sessions)} detail="nos últimos 7 dias" icon={<CalendarDays size={20} />} />
          <MetricCard label="Tempo ativo" value={`${model.week.activeMinutes} min`} detail="tempo de jogo registrado" icon={<Clock3 size={20} />} />
          <MetricCard label="Fases concluídas" value={String(model.week.completedPhases)} detail={`${model.week.replayedPhases} fase(s) revisitadas`} icon={<Sparkles size={20} />} />
          <MetricCard label="Ouvir por escolha" value={String(model.week.voluntaryListens)} detail="vezes em que ela pediu o som" icon={<Headphones size={20} />} />
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
          <article className="rounded-3xl border border-emerald-100 bg-emerald-700 p-6 text-white shadow-sm sm:p-7">
            <p className="text-sm font-bold text-emerald-100">Última sessão</p>
            {model.lastSession ? (
              <div className="mt-4 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-3xl bg-white/15">
                  <span className="text-3xl font-black">{model.lastSession.durationMinutes}</span>
                  <span className="text-xs font-bold text-emerald-100">minutos</span>
                </div>
                <div>
                  <p className="text-xl font-black">{model.lastSession.completedPhases} fase(s) concluída(s)</p>
                  <p className="mt-2 text-sm leading-6 text-emerald-100">
                    {model.lastSession.words.length > 0 ? `Palavras trabalhadas: ${model.lastSession.words.join(', ')}.` : 'A sessão foi iniciada, mas ainda não há palavras completas para resumir.'}
                  </p>
                </div>
              </div>
            ) : <p className="mt-4 text-emerald-100">O primeiro resumo aparecerá depois de uma sessão sincronizada.</p>}
          </article>
          <article className="rounded-3xl border border-amber-100 bg-amber-50 p-6 sm:p-7">
            <p className="text-sm font-bold text-amber-800">Sequência de dias</p>
            <p className="mt-3 text-5xl font-black text-amber-950">{model.streakDays}</p>
            <p className="mt-2 text-sm leading-6 text-amber-900/70">dia(s) consecutivos até a atividade mais recente. Não é meta nem cobrança.</p>
          </article>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-700">Reconhecimento autônomo</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900">Famílias silábicas</h2>
            </div>
            <p className="hidden max-w-md text-right text-sm leading-5 text-slate-500 sm:block">Percentuais usam somente o primeiro toque e aparecem depois de 5 oportunidades.</p>
          </div>
          {model.families.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {model.families.map(family => (
                <article key={family.key} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-slate-900">{familyName(family.key)}</h3>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{family.opportunities} oportunidades</span>
                  </div>
                  <p className="mt-5 text-3xl font-black text-emerald-700">{formatPercent(family.accuracy)}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${family.accuracy === null ? 0 : family.accuracy * 100}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{family.consolidated} consolidada(s) · {family.developing} em desenvolvimento</p>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-white p-7 text-slate-500">Ainda não há tentativas suficientes para organizar as famílias silábicas.</div>}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Trocas que merecem observação</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Uma troca só aparece após repetição suficiente. Ela orienta apoio; não é diagnóstico.</p>
            {model.confusions.length > 0 ? (
              <div className="mt-5 space-y-3">
                {model.confusions.map(item => (
                  <div key={`${item.expected}-${item.clicked}`} className="rounded-2xl bg-rose-50 p-4">
                    <p className="font-black text-rose-950">{item.expected} → {item.clicked}</p>
                    <p className="mt-1 text-sm leading-5 text-rose-900/70">Ela tocou primeiro em {item.clicked} quando esperava {item.expected}, em {item.count} ocasiões. Vale oferecer contraste e escuta gentil.</p>
                  </div>
                ))}
              </div>
            ) : <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Nenhuma troca atingiu o mínimo necessário para ser destacada.</p>}
          </article>

          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Fluência relativa</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Comparamos cada sílaba apenas com ela mesma, entre duas semanas com pelo menos 10 respostas válidas.</p>
            {model.fluency.length > 0 ? (
              <div className="mt-5 space-y-4">
                {model.fluency.map(item => (
                  <div key={item.syllable} className="grid grid-cols-[3rem_1fr_auto] items-center gap-3">
                    <span className="font-black text-slate-900">{item.syllable}</span>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.max(12, Math.min(100, 100 + item.changePercent))}%` }} /></div>
                    <span className="text-sm font-bold text-slate-600">{item.changePercent <= 0 ? 'mais ágil' : 'mais tempo'}</span>
                  </div>
                ))}
              </div>
            ) : <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Ainda não há repetições suficientes da mesma sílaba em duas semanas.</p>}
          </article>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">O que já está consolidando</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">“Consolidada” é uma regra prática do jogo: repetição suficiente, bons primeiros toques e estabilidade recente.</p>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sílabas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {model.consolidatedSyllables.length > 0 ? model.consolidatedSyllables.map(item => <span key={item} className="rounded-xl bg-emerald-100 px-3 py-2 font-black text-emerald-900">{item}</span>) : <span className="text-sm text-slate-500">Ainda em construção.</span>}
              </div>
            </div>
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Palavras</p>
              <p className="mt-2 text-sm font-semibold text-slate-700">{model.consolidatedWords.length > 0 ? model.consolidatedWords.join(', ') : 'Ainda não há três apresentações suficientes para confirmar palavras.'}</p>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">Sinais de esforço</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Servem para revisar conteúdo e apresentação. Nunca medem capacidade ou comportamento.</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-900">Esforço alto</p>
                <p className="mt-1 text-2xl font-black text-amber-950">{formatPercent(model.week.effortRate)}</p>
                <p className="mt-1 text-xs leading-5 text-amber-900/65">oportunidades recentes com dois ou mais erros</p>
              </div>
              <div className="rounded-2xl bg-sky-50 p-4">
                <p className="text-sm font-bold text-sky-900">Abandono de fase</p>
                <p className="mt-1 text-2xl font-black text-sky-950">{formatPercent(model.week.abandonmentRate)}</p>
                <p className="mt-1 text-xs leading-5 text-sky-900/65">aparece somente com cinco fases iniciadas</p>
              </div>
            </div>
          </article>
        </section>

        {model.thresholdsAreProvisional && (
          <aside className="mt-6 flex gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p className="text-sm leading-6"><strong>Leitura provisória:</strong> os cortes serão revistos depois de pelo menos 100 primeiras tentativas em 3 sessões. O painel não muda esses critérios sozinho.</p>
          </aside>
        )}
      </div>
    </main>
  );
}

export function ParentDashboard() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [model, setModel] = useState<DashboardModel | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [notLinked, setNotLinked] = useState(false);
  const [error, setError] = useState('');

  const acceptSession = useCallback((nextSession: Session) => {
    setSession(nextSession);
    setUser(nextSession.user);
  }, []);

  useEffect(() => {
    if (!parentSupabase) {
      setAuthLoading(false);
      return;
    }
    void parentSupabase.auth.getSession().then(({ data }) => {
      if (data.session && !data.session.user.is_anonymous) acceptSession(data.session);
      setAuthLoading(false);
    });
    const { data: listener } = parentSupabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession && !nextSession.user.is_anonymous) acceptSession(nextSession);
      else {
        setSession(null);
        setUser(null);
        setModel(null);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, [acceptSession]);

  const refresh = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError('');
    setNotLinked(false);
    try {
      const data = await loadDashboardData(user);
      if (!data) {
        setNotLinked(true);
        setModel(null);
      } else {
        setModel(buildDashboardModel(data));
      }
    } catch {
      setError('Não foi possível carregar os dados agora. Tente novamente em alguns instantes.');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const signOut = async () => {
    await parentSupabase?.auth.signOut();
    setSession(null);
    setUser(null);
    setModel(null);
  };

  const loadingScreen = useMemo(() => (
    <main className="flex min-h-screen items-center justify-center bg-[#f4fbf7] text-emerald-800">
      <div className="text-center"><LoaderCircle className="mx-auto animate-spin" size={32} /><p className="mt-3 font-bold">Preparando o painel…</p></div>
    </main>
  ), []);

  if (!isParentDashboardConfigured) return <main className="p-8 font-sans">Painel indisponível: configuração do Supabase ausente.</main>;
  if (authLoading) return loadingScreen;
  if (!session) return <LoginPanel onAuthenticated={acceptSession} />;
  if (dataLoading && !model && !notLinked) return loadingScreen;
  if (notLinked) return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4fbf7] px-5">
      <section className="max-w-lg rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
        <Users className="mx-auto text-amber-600" size={34} />
        <h1 className="mt-4 text-2xl font-black text-slate-900">Conta ainda não vinculada</h1>
        <p className="mt-3 leading-7 text-slate-600">O acesso por e-mail funcionou, mas esta conta ainda não foi ligada à família. Faça o vínculo administrativo e atualize o painel.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => void refresh()} className="rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white">Atualizar</button>
          <button onClick={() => void signOut()} className="rounded-2xl bg-slate-100 px-5 py-3 font-bold text-slate-700">Sair</button>
        </div>
      </section>
    </main>
  );
  if (error) return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4fbf7] px-5"><section className="max-w-lg rounded-3xl bg-white p-8 text-center"><AlertCircle className="mx-auto text-red-500" /><p className="mt-4 font-semibold text-slate-700">{error}</p><button onClick={() => void refresh()} className="mt-5 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white">Tentar novamente</button></section></main>
  );
  if (!model) return loadingScreen;
  return <DashboardContent model={model} onRefresh={() => void refresh()} refreshing={dataLoading} onSignOut={() => void signOut()} />;
}
