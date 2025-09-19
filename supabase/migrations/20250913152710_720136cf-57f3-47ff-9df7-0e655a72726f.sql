-- Create events table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'apparel',
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  business_type TEXT,
  city TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create milestones table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  offset_days INTEGER NOT NULL,
  absolute_date TIMESTAMP WITH TIME ZONE NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'apparel',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'planned';

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for events
CREATE POLICY IF NOT EXISTS "Users can view their own events" 
ON public.events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own events" 
ON public.events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for milestones
CREATE POLICY IF NOT EXISTS "Users can view milestones for their events" 
ON public.milestones 
FOR SELECT 
USING (auth.uid() = (SELECT user_id FROM public.events WHERE id = event_id));

CREATE POLICY IF NOT EXISTS "Users can create milestones for their events" 
ON public.milestones 
FOR INSERT 
WITH CHECK (auth.uid() = (SELECT user_id FROM public.events WHERE id = event_id));

CREATE POLICY IF NOT EXISTS "Users can update milestones for their events" 
ON public.milestones 
FOR UPDATE 
USING (auth.uid() = (SELECT user_id FROM public.events WHERE id = event_id));

CREATE POLICY IF NOT EXISTS "Users can delete milestones for their events" 
ON public.milestones 
FOR DELETE 
USING (auth.uid() = (SELECT user_id FROM public.events WHERE id = event_id));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_milestones_updated_at ON public.milestones;
CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();