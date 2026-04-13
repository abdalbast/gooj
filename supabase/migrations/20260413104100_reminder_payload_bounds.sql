do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reminders_recipient_name_len'
      and conrelid = 'public.reminders'::regclass
  ) then
    alter table public.reminders
      add constraint reminders_recipient_name_len
      check (char_length(recipient_name) between 1 and 120)
      not valid;
  end if;
end
$$;

alter table public.reminders
  validate constraint reminders_recipient_name_len;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reminders_occasion_len'
      and conrelid = 'public.reminders'::regclass
  ) then
    alter table public.reminders
      add constraint reminders_occasion_len
      check (char_length(occasion) between 1 and 60)
      not valid;
  end if;
end
$$;

alter table public.reminders
  validate constraint reminders_occasion_len;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'reminders_notes_len'
      and conrelid = 'public.reminders'::regclass
  ) then
    alter table public.reminders
      add constraint reminders_notes_len
      check (char_length(notes) <= 1000)
      not valid;
  end if;
end
$$;

alter table public.reminders
  validate constraint reminders_notes_len;
