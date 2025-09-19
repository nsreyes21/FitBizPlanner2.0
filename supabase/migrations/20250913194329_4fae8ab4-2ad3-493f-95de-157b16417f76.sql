-- Create batch upsert function for plans
CREATE OR REPLACE FUNCTION upsert_plan(p_events jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  e jsonb;
  m jsonb;
  new_event_id uuid;
BEGIN
  FOR e IN SELECT * FROM jsonb_array_elements(p_events)
  LOOP
    INSERT INTO events(id, user_id, name, type, category, date, city, business_type, tags, status)
    VALUES (
      COALESCE((e->>'id')::uuid, gen_random_uuid()),
      auth.uid(),
      e->>'name',
      e->>'type',
      COALESCE(e->>'category', e->>'type'),
      (e->>'date')::date,
      e->>'city',
      e->>'business_type',
      COALESCE(string_to_array(e->>'tags', ','), ARRAY[]::text[]),
      COALESCE(e->>'status', 'planned')
    )
    ON CONFLICT (id) DO UPDATE
      SET name = EXCLUDED.name,
          type = EXCLUDED.type,
          category = EXCLUDED.category,
          date = EXCLUDED.date,
          city = EXCLUDED.city,
          business_type = EXCLUDED.business_type,
          tags = EXCLUDED.tags,
          status = EXCLUDED.status,
          updated_at = now()
    RETURNING id INTO new_event_id;

    -- Simple replace for milestones for this event
    DELETE FROM milestones WHERE event_id = new_event_id;

    FOR m IN SELECT * FROM jsonb_array_elements(COALESCE(e->'milestones', '[]'::jsonb))
    LOOP
      INSERT INTO milestones(event_id, user_id, name, offset_days, absolute_date, owner, status, notes, sort_order)
      VALUES (
        new_event_id,
        auth.uid(),
        m->>'name',
        (m->>'offset_days')::int,
        (m->>'absolute_date')::date,
        m->>'owner',
        COALESCE(m->>'status', 'open'),
        m->>'notes',
        COALESCE((m->>'sort_order')::int, 0)
      );
    END LOOP;
  END LOOP;
END;
$$;