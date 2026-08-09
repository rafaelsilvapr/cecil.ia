-- Solta o aparelho da criança para permitir um novo pareamento.
--
-- Por que isso existe: se o tablet tiver os dados do navegador limpos ou o app
-- reinstalado, ele recebe um auth.uid() anônimo novo. A partir daí claim_learner
-- recusa o pareamento ('learner_already_paired') porque a criança já tem um
-- device_user_id gravado — e a telemetria fica quebrada em definitivo.
-- Com quem acompanha a 1.500 km de distância, isso significaria meses sem dado.
-- Esta função é o botão de reconectar sem precisar viajar: um responsável solta
-- o aparelho, gera um código novo e alguém aí abre o link uma vez.
create or replace function public.unbind_learner_device(p_learner_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_family_id uuid;
begin
  select family_id into v_family_id from public.learners where id = p_learner_id;
  if v_family_id is null or not public.is_guardian(v_family_id) then
    raise exception 'not_authorized';
  end if;
  if coalesce(((select auth.jwt()) ->> 'is_anonymous')::boolean, false) then
    raise exception 'permanent_guardian_required';
  end if;
  update public.learners
    set device_user_id = null, paired_at = null
    where id = p_learner_id;
end;
$$;

revoke all on function public.unbind_learner_device(uuid) from public;
grant execute on function public.unbind_learner_device(uuid) to authenticated;
