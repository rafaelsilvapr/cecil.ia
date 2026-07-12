create extension if not exists pgcrypto with schema extensions;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  caregiver_label text not null check (caregiver_label in ('pai', 'mae')),
  created_at timestamptz not null default now(),
  primary key (family_id, user_id),
  unique (family_id, caregiver_label)
);

create table public.learners (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  device_user_id uuid unique references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  paired_at timestamptz,
  unique (id, family_id)
);

create table public.syllable_catalog (
  syllable text primary key check (char_length(syllable) between 1 and 16),
  family_key text not null check (char_length(family_key) between 1 and 24),
  introduced_level smallint not null check (introduced_level between 0 and 59),
  pedagogically_reviewed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.pairing_codes (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  code_hash text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table public.sessions (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_ms integer check (duration_ms between 0 and 7200000),
  start_level smallint not null check (start_level between 0 and 59),
  end_level smallint check (end_level between 0 and 59),
  ended_reason text check (ended_reason in ('normal', 'background', 'crash_recovered')),
  app_version text not null,
  received_at timestamptz not null default now(),
  check (ended_at is null or ended_at >= started_at),
  unique (id, learner_id)
);

create table public.phase_events (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_id uuid not null,
  event_type text not null check (event_type in ('started', 'completed', 'replayed', 'abandoned')),
  level_index smallint not null check (level_index between 0 and 59),
  section_index smallint not null check (section_index between 0 and 5),
  duration_ms integer check (duration_ms between 0 and 7200000),
  exercise_count smallint check (exercise_count between 0 and 30),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  foreign key (session_id, learner_id)
    references public.sessions(id, learner_id) on delete cascade
);

create table public.attempts (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_id uuid not null,
  presentation_id uuid not null,
  word text not null check (char_length(word) between 1 and 64),
  expected_syllable text not null check (char_length(expected_syllable) between 1 and 16),
  clicked_syllable text not null check (char_length(clicked_syllable) between 1 and 16),
  syllable_position smallint not null check (syllable_position between 0 and 15),
  attempt_number smallint not null check (attempt_number between 1 and 20),
  response_time_ms integer not null check (response_time_ms between 0 and 120000),
  listens_before_attempt smallint not null default 0 check (listens_before_attempt between 0 and 20),
  level_index smallint not null check (level_index between 0 and 59),
  section_index smallint not null check (section_index between 0 and 5),
  page_visible boolean not null default true,
  timing_eligible boolean not null default true,
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  is_correct boolean generated always as (expected_syllable = clicked_syllable) stored,
  unique (presentation_id, syllable_position, attempt_number),
  foreign key (session_id, learner_id)
    references public.sessions(id, learner_id) on delete cascade
);

create table public.audio_events (
  id uuid primary key,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_id uuid not null,
  presentation_id uuid,
  target_type text not null check (target_type in ('word', 'syllable', 'celebration')),
  target_text text not null check (char_length(target_text) between 1 and 100),
  trigger_type text not null check (trigger_type in ('automatic', 'user')),
  occurred_at timestamptz not null,
  received_at timestamptz not null default now(),
  foreign key (session_id, learner_id)
    references public.sessions(id, learner_id) on delete cascade
);

create table public.mastery (
  learner_id uuid not null references public.learners(id) on delete cascade,
  syllable text not null check (char_length(syllable) between 1 and 16),
  opportunities integer not null default 0 check (opportunities >= 0),
  first_try_successes integer not null default 0 check (first_try_successes >= 0),
  beta_alpha numeric not null default 3 check (beta_alpha > 0),
  beta_beta numeric not null default 1 check (beta_beta > 0),
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, syllable),
  check (first_try_successes <= opportunities)
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  learner_id uuid not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (learner_id, family_id)
    references public.learners(id, family_id) on delete cascade
);

create table public.mission_words (
  mission_id uuid not null references public.missions(id) on delete cascade,
  position smallint not null check (position between 0 and 19),
  word text not null check (char_length(word) between 1 and 64),
  primary key (mission_id, position),
  unique (mission_id, word)
);

create table public.parent_audio (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  caregiver_label text not null check (caregiver_label in ('pai', 'mae')),
  storage_path text not null unique,
  transcript text not null check (char_length(transcript) between 1 and 160),
  duration_ms integer not null check (duration_ms between 250 and 30000),
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);

create index attempts_learner_time_idx on public.attempts (learner_id, occurred_at desc);
create index attempts_expected_idx on public.attempts (learner_id, expected_syllable, occurred_at desc);
create index sessions_learner_time_idx on public.sessions (learner_id, started_at desc);
create index phase_events_learner_idx on public.phase_events (learner_id, occurred_at desc);
create index family_members_user_idx on public.family_members (user_id, family_id);
create index learners_device_idx on public.learners (device_user_id);

create or replace function public.is_guardian(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id = p_family_id and fm.user_id = (select auth.uid())
  );
$$;

create or replace function public.is_current_learner(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.learners l
    where l.id = p_learner_id and l.device_user_id = (select auth.uid())
  );
$$;

create or replace function public.can_access_learner(p_learner_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.learners l
    where l.id = p_learner_id
      and (l.device_user_id = (select auth.uid()) or public.is_guardian(l.family_id))
  );
$$;

create or replace function public.can_access_family(p_family_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select public.is_guardian(p_family_id) or exists (
    select 1 from public.learners l
    where l.family_id = p_family_id and l.device_user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_guardian(uuid) from public;
revoke all on function public.is_current_learner(uuid) from public;
revoke all on function public.can_access_learner(uuid) from public;
revoke all on function public.can_access_family(uuid) from public;
grant execute on function public.is_guardian(uuid), public.is_current_learner(uuid),
  public.can_access_learner(uuid), public.can_access_family(uuid) to authenticated;

create or replace function public.create_pairing_code(p_learner_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_code text := encode(extensions.gen_random_bytes(18), 'hex');
  v_family_id uuid;
begin
  select family_id into v_family_id from public.learners where id = p_learner_id;
  if v_family_id is null or not public.is_guardian(v_family_id) then
    raise exception 'not_authorized';
  end if;
  if coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'permanent_guardian_required';
  end if;
  delete from public.pairing_codes
    where learner_id = p_learner_id and used_at is null;
  insert into public.pairing_codes (
    learner_id, code_hash, created_by, expires_at
  ) values (
    p_learner_id,
    encode(extensions.digest(v_code, 'sha256'), 'hex'),
    (select auth.uid()),
    now() + interval '30 minutes'
  );
  return v_code;
end;
$$;

create or replace function public.claim_learner(p_code text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_code_id uuid;
  v_learner_id uuid;
begin
  if (select auth.uid()) is null
     or not coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'anonymous_user_required';
  end if;
  if exists (select 1 from public.learners where device_user_id = (select auth.uid())) then
    raise exception 'device_already_paired';
  end if;
  select id, learner_id into v_code_id, v_learner_id
  from public.pairing_codes
  where code_hash = encode(extensions.digest(p_code, 'sha256'), 'hex')
    and used_at is null and expires_at > now()
  for update;
  if v_code_id is null then raise exception 'invalid_or_expired_code'; end if;
  update public.learners set device_user_id = (select auth.uid()), paired_at = now()
    where id = v_learner_id and device_user_id is null;
  if not found then raise exception 'learner_already_paired'; end if;
  update public.pairing_codes set used_at = now() where id = v_code_id;
  return v_learner_id;
end;
$$;

create or replace function public.close_session(
  p_session_id uuid, p_ended_at timestamptz, p_duration_ms integer,
  p_end_level smallint, p_reason text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_reason not in ('normal', 'background', 'crash_recovered')
     or p_duration_ms not between 0 and 7200000
     or p_end_level not between 0 and 59 then
    raise exception 'invalid_session_close';
  end if;
  update public.sessions set ended_at = p_ended_at, duration_ms = p_duration_ms,
    end_level = p_end_level, ended_reason = p_reason
  where id = p_session_id and public.is_current_learner(learner_id)
    and p_ended_at >= started_at;
  if not found then raise exception 'session_not_found'; end if;
end;
$$;

create or replace function public.complete_mission(p_mission_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.missions m set status = 'completed', completed_at = now()
  where m.id = p_mission_id and m.status = 'active'
    and public.is_current_learner(m.learner_id);
  if not found then raise exception 'mission_not_found'; end if;
end;
$$;

create or replace function public.delete_learner_data(p_learner_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_family_id uuid;
begin
  select family_id into v_family_id from public.learners where id = p_learner_id;
  if v_family_id is null or not public.is_guardian(v_family_id) then
    raise exception 'not_authorized';
  end if;
  delete from public.learners where id = p_learner_id;
end;
$$;

create or replace function public.purge_expired_telemetry()
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_deleted bigint;
begin
  delete from public.sessions
  where coalesce(ended_at, started_at) < now() - interval '12 months';
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.create_pairing_code(uuid), public.claim_learner(text),
  public.close_session(uuid, timestamptz, integer, smallint, text),
  public.complete_mission(uuid), public.delete_learner_data(uuid),
  public.purge_expired_telemetry() from public;
grant execute on function public.create_pairing_code(uuid), public.claim_learner(text),
  public.close_session(uuid, timestamptz, integer, smallint, text),
  public.complete_mission(uuid), public.delete_learner_data(uuid) to authenticated;
grant execute on function public.purge_expired_telemetry() to service_role;

create or replace function public.update_mastery_from_attempt()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.attempt_number <> 1 then return new; end if;
  insert into public.mastery (
    learner_id, syllable, opportunities, first_try_successes,
    beta_alpha, beta_beta, last_seen_at, updated_at
  ) values (
    new.learner_id, new.expected_syllable, 1, case when new.is_correct then 1 else 0 end,
    3 + case when new.is_correct then 1 else 0 end,
    1 + case when new.is_correct then 0 else 1 end,
    new.occurred_at, now()
  )
  on conflict (learner_id, syllable) do update set
    opportunities = mastery.opportunities + 1,
    first_try_successes = mastery.first_try_successes + case when new.is_correct then 1 else 0 end,
    beta_alpha = mastery.beta_alpha + case when new.is_correct then 1 else 0 end,
    beta_beta = mastery.beta_beta + case when new.is_correct then 0 else 1 end,
    last_seen_at = greatest(mastery.last_seen_at, new.occurred_at),
    updated_at = now();
  return new;
end;
$$;

create trigger attempts_update_mastery
after insert on public.attempts for each row execute function public.update_mastery_from_attempt();

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.learners enable row level security;
alter table public.syllable_catalog enable row level security;
alter table public.pairing_codes enable row level security;
alter table public.sessions enable row level security;
alter table public.phase_events enable row level security;
alter table public.attempts enable row level security;
alter table public.audio_events enable row level security;
alter table public.mastery enable row level security;
alter table public.missions enable row level security;
alter table public.mission_words enable row level security;
alter table public.parent_audio enable row level security;

create policy families_select on public.families for select to authenticated
  using (public.can_access_family(id));
create policy members_select on public.family_members for select to authenticated
  using (public.is_guardian(family_id));
create policy learners_select on public.learners for select to authenticated
  using (public.can_access_learner(id));
create policy syllable_catalog_select on public.syllable_catalog for select to authenticated
  using (true);

create policy sessions_select on public.sessions for select to authenticated
  using (public.can_access_learner(learner_id));
create policy sessions_insert on public.sessions for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy phase_select on public.phase_events for select to authenticated
  using (public.can_access_learner(learner_id));
create policy phase_insert on public.phase_events for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy attempts_select on public.attempts for select to authenticated
  using (public.can_access_learner(learner_id));
create policy attempts_insert on public.attempts for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy audio_events_select on public.audio_events for select to authenticated
  using (public.can_access_learner(learner_id));
create policy audio_events_insert on public.audio_events for insert to authenticated
  with check (public.is_current_learner(learner_id));
create policy mastery_select on public.mastery for select to authenticated
  using (public.can_access_learner(learner_id));

create policy missions_select on public.missions for select to authenticated
  using (public.can_access_family(family_id));
create policy missions_insert on public.missions for insert to authenticated
  with check (public.is_guardian(family_id) and created_by = (select auth.uid()));
create policy missions_update on public.missions for update to authenticated
  using (public.is_guardian(family_id)) with check (public.is_guardian(family_id));
create policy missions_delete on public.missions for delete to authenticated
  using (public.is_guardian(family_id));
create policy mission_words_select on public.mission_words for select to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id
    and public.can_access_family(m.family_id)));
create policy mission_words_write on public.mission_words for all to authenticated
  using (exists (select 1 from public.missions m where m.id = mission_id
    and public.is_guardian(m.family_id)))
  with check (exists (select 1 from public.missions m where m.id = mission_id
    and public.is_guardian(m.family_id)));
create policy parent_audio_select on public.parent_audio for select to authenticated
  using (public.can_access_family(family_id));
create policy parent_audio_write on public.parent_audio for all to authenticated
  using (public.is_guardian(family_id))
  with check (exists (
    select 1 from public.family_members fm
    where fm.family_id = parent_audio.family_id
      and fm.user_id = (select auth.uid())
      and fm.caregiver_label = parent_audio.caregiver_label
      and parent_audio.created_by = (select auth.uid())
  ));

revoke all on all tables in schema public from anon, authenticated;
grant select on public.families, public.family_members, public.learners, public.syllable_catalog,
  public.sessions,
  public.phase_events, public.attempts, public.audio_events, public.mastery,
  public.missions, public.mission_words, public.parent_audio to authenticated;
grant insert on public.sessions, public.phase_events, public.attempts, public.audio_events,
  public.missions, public.mission_words, public.parent_audio to authenticated;
grant update, delete on public.missions, public.mission_words, public.parent_audio to authenticated;

create view public.v_syllable_metrics with (security_invoker = true) as
select a.learner_id, a.expected_syllable as syllable,
  coalesce(sc.family_key, 'NAO_CLASSIFICADA') as family_key,
  count(*) filter (where attempt_number = 1) as opportunities,
  count(*) filter (where attempt_number = 1 and is_correct) as first_try_successes,
  round(100.0 * count(*) filter (where attempt_number = 1 and is_correct)
    / nullif(count(*) filter (where attempt_number = 1), 0), 1) as first_try_accuracy_pct,
  percentile_cont(0.5) within group (order by response_time_ms)
    filter (where attempt_number = 1 and is_correct and page_visible and timing_eligible
      and response_time_ms between 150 and 60000) as median_correct_response_ms,
  max(a.occurred_at) as last_seen_at
from public.attempts a
left join public.syllable_catalog sc on sc.syllable = a.expected_syllable
group by a.learner_id, a.expected_syllable, sc.family_key;

create view public.v_confusion_matrix with (security_invoker = true) as
select learner_id, expected_syllable, clicked_syllable, count(*) as first_click_count
from public.attempts
where attempt_number = 1 and not is_correct
group by learner_id, expected_syllable, clicked_syllable;

grant select on public.v_syllable_metrics, public.v_confusion_matrix to authenticated;

-- GENERATED SYLLABLE CATALOG
insert into public.syllable_catalog (
  syllable, family_key, introduced_level, pedagogically_reviewed
) values
  ('A', 'VOGAL', 0, false),
  ('Á', 'VOGAL', 50, false),
  ('AL', 'VOGAL', 20, false),
  ('AN', 'VOGAL', 40, false),
  ('ÃO', 'VOGAL', 40, false),
  ('AR', 'VOGAL', 20, false),
  ('ÁR', 'VOGAL', 20, false),
  ('BA', 'B', 0, false),
  ('BAL', 'B', 20, false),
  ('BAN', 'B', 40, false),
  ('BÃO', 'B', 40, false),
  ('BAR', 'B', 20, false),
  ('BE', 'B', 0, false),
  ('BEI', 'B', 40, false),
  ('BI', 'B', 0, false),
  ('BLU', 'BL', 30, false),
  ('BO', 'B', 0, false),
  ('BÔ', 'B', 50, false),
  ('BOL', 'B', 20, false),
  ('BOM', 'B', 40, false),
  ('BOR', 'B', 20, false),
  ('BRA', 'BR', 30, false),
  ('BRIN', 'BR', 50, false),
  ('BRU', 'BR', 30, false),
  ('BU', 'B', 50, false),
  ('BUR', 'B', 50, false),
  ('BÚS', 'B', 50, false),
  ('CA', 'C', 0, false),
  ('ÇA', 'Ç', 20, false),
  ('ÇÃ', 'Ç', 40, false),
  ('CAL', 'C', 20, false),
  ('CAN', 'C', 40, false),
  ('CÃO', 'C', 40, false),
  ('ÇÃO', 'Ç', 40, false),
  ('CAR', 'C', 20, false),
  ('CE', 'C', 20, false),
  ('CEL', 'C', 20, false),
  ('CHA', 'CH', 10, false),
  ('CHÁ', 'CH', 10, false),
  ('CHE', 'CH', 10, false),
  ('CHI', 'CH', 10, false),
  ('CHO', 'CH', 10, false),
  ('CHOR', 'CH', 10, false),
  ('CHU', 'CH', 10, false),
  ('CI', 'C', 30, false),
  ('CIA', 'C', 40, false),
  ('CIR', 'C', 20, false),
  ('CIS', 'C', 50, false),
  ('CLA', 'CL', 30, false),
  ('CLE', 'CL', 30, false),
  ('CO', 'C', 0, false),
  ('ÇO', 'Ç', 10, false),
  ('COL', 'C', 20, false),
  ('COR', 'C', 50, false),
  ('CRO', 'CR', 30, false),
  ('CRUZ', 'CR', 30, false),
  ('DA', 'D', 0, false),
  ('DE', 'D', 0, false),
  ('DEI', 'D', 40, false),
  ('DEN', 'D', 40, false),
  ('DER', 'D', 20, false),
  ('DI', 'D', 10, false),
  ('DIM', 'D', 40, false),
  ('DIO', 'D', 40, false),
  ('DO', 'D', 0, false),
  ('DRA', 'DR', 30, false),
  ('DU', 'D', 10, false),
  ('E', 'VOGAL', 10, false),
  ('EI', 'VOGAL', 10, false),
  ('ES', 'VOGAL', 10, false),
  ('FA', 'F', 0, false),
  ('FÉU', 'F', 30, false),
  ('FIL', 'F', 20, false),
  ('FLA', 'FL', 30, false),
  ('FLAU', 'FL', 30, false),
  ('FLE', 'FL', 30, false),
  ('FLO', 'FL', 30, false),
  ('FLOR', 'FL', 20, false),
  ('FO', 'F', 0, false),
  ('FRI', 'FR', 30, false),
  ('FRU', 'FR', 30, false),
  ('FU', 'F', 20, false),
  ('GA', 'G', 0, false),
  ('GÃO', 'G', 30, false),
  ('GAR', 'G', 20, false),
  ('GI', 'G', 20, false),
  ('GLO', 'GL', 30, false),
  ('GLU', 'GL', 30, false),
  ('GO', 'G', 0, false),
  ('GRA', 'GR', 30, false),
  ('GRE', 'GR', 30, false),
  ('GRI', 'GR', 30, false),
  ('GU', 'GU', 10, false),
  ('GUE', 'GU', 50, false),
  ('GUI', 'GU', 50, false),
  ('GUIA', 'GU', 50, false),
  ('I', 'VOGAL', 10, false),
  ('Í', 'VOGAL', 10, false),
  ('IM', 'VOGAL', 40, false),
  ('ÍN', 'VOGAL', 40, false),
  ('JAR', 'J', 40, false),
  ('JO', 'J', 10, false),
  ('JOR', 'J', 20, false),
  ('LA', 'L', 0, false),
  ('LÃ', 'L', 40, false),
  ('LÂM', 'L', 40, false),
  ('LAN', 'L', 40, false),
  ('LÃO', 'L', 40, false),
  ('LE', 'L', 20, false),
  ('LHA', 'LH', 10, false),
  ('LHO', 'LH', 10, false),
  ('LI', 'L', 10, false),
  ('LO', 'L', 0, false),
  ('LU', 'L', 0, false),
  ('MA', 'M', 0, false),
  ('MÁ', 'M', 50, false),
  ('MÃ', 'M', 40, false),
  ('MÃE', 'M', 40, false),
  ('MAN', 'M', 40, false),
  ('MÃO', 'M', 40, false),
  ('MAR', 'M', 20, false),
  ('ME', 'M', 0, false),
  ('MEL', 'M', 20, false),
  ('MEN', 'M', 40, false),
  ('MI', 'M', 0, false),
  ('MIN', 'M', 30, false),
  ('MO', 'M', 0, false),
  ('MOR', 'M', 50, false),
  ('MOS', 'M', 50, false),
  ('MUN', 'M', 40, false),
  ('NA', 'N', 0, false),
  ('NAL', 'N', 20, false),
  ('NE', 'N', 0, false),
  ('NÉ', 'N', 10, false),
  ('NEL', 'N', 20, false),
  ('NHA', 'NH', 10, false),
  ('NHÃO', 'NH', 10, false),
  ('NHEI', 'NH', 10, false),
  ('NHO', 'NH', 10, false),
  ('NI', 'N', 0, false),
  ('NO', 'N', 0, false),
  ('NOS', 'N', 30, false),
  ('NOU', 'N', 50, false),
  ('NU', 'N', 40, false),
  ('O', 'VOGAL', 10, false),
  ('OS', 'VOGAL', 50, false),
  ('PA', 'P', 0, false),
  ('PÃO', 'P', 40, false),
  ('PAR', 'P', 50, false),
  ('PAS', 'P', 20, false),
  ('PÁS', 'P', 50, false),
  ('PE', 'P', 0, false),
  ('PEN', 'P', 40, false),
  ('PER', 'P', 20, false),
  ('PÊS', 'P', 50, false),
  ('PI', 'P', 0, false),
  ('PIN', 'P', 20, false),
  ('PLA', 'PL', 30, false),
  ('PLAN', 'PL', 30, false),
  ('PLU', 'PL', 30, false),
  ('PO', 'P', 0, false),
  ('POL', 'P', 20, false),
  ('PON', 'P', 40, false),
  ('POR', 'P', 20, false),
  ('PRA', 'PR', 30, false),
  ('PRE', 'PR', 30, false),
  ('PRIN', 'PR', 30, false),
  ('PU', 'P', 40, false),
  ('QUE', 'QU', 50, false),
  ('QUEI', 'QU', 50, false),
  ('QUI', 'QU', 50, false),
  ('QUÍ', 'QU', 50, false),
  ('RA', 'R', 10, false),
  ('RÃ', 'R', 40, false),
  ('RAN', 'R', 50, false),
  ('RÃO', 'R', 40, false),
  ('RAS', 'R', 20, false),
  ('RE', 'R', 10, false),
  ('REI', 'R', 50, false),
  ('RES', 'R', 30, false),
  ('RI', 'R', 50, false),
  ('RIL', 'R', 20, false),
  ('RO', 'R', 10, false),
  ('RU', 'R', 40, false),
  ('SA', 'S', 0, false),
  ('SAL', 'S', 10, false),
  ('SAN', 'S', 10, false),
  ('SAU', 'S', 30, false),
  ('SE', 'S', 10, false),
  ('SEN', 'S', 30, false),
  ('SI', 'S', 10, false),
  ('SO', 'S', 10, false),
  ('SOL', 'S', 20, false),
  ('SOR', 'S', 20, false),
  ('SOU', 'S', 50, false),
  ('SU', 'S', 0, false),
  ('TA', 'T', 0, false),
  ('TAM', 'T', 40, false),
  ('TÃO', 'T', 40, false),
  ('TAR', 'T', 50, false),
  ('TE', 'T', 0, false),
  ('TEL', 'T', 20, false),
  ('TER', 'T', 50, false),
  ('TI', 'T', 30, false),
  ('TIN', 'T', 40, false),
  ('TO', 'T', 0, false),
  ('TOM', 'T', 40, false),
  ('TOR', 'T', 30, false),
  ('TRA', 'TR', 30, false),
  ('TRE', 'TR', 30, false),
  ('TREM', 'TR', 30, false),
  ('TRO', 'TR', 30, false),
  ('TU', 'T', 40, false),
  ('U', 'VOGAL', 10, false),
  ('UR', 'VOGAL', 20, false),
  ('VA', 'V', 0, false),
  ('VAM', 'V', 40, false),
  ('VAS', 'V', 50, false),
  ('VE', 'V', 10, false),
  ('VEI', 'V', 10, false),
  ('VEM', 'V', 40, false),
  ('VI', 'V', 10, false),
  ('VO', 'V', 20, false),
  ('VRO', 'VR', 30, false),
  ('XA', 'X', 30, false),
  ('ZE', 'Z', 30, false)
on conflict (syllable) do update set
  family_key = excluded.family_key,
  introduced_level = least(public.syllable_catalog.introduced_level, excluded.introduced_level),
  updated_at = now();
