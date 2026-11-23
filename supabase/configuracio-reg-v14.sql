-- CadaGota v14. Executar a Supabase > SQL Editor amb el rol administrador.
-- Aquest script NO habilita cap control físic de la bomba.
BEGIN;
CREATE TABLE IF NOT EXISTS public.configuracio_reg (
  jardinera integer PRIMARY KEY CHECK (jardinera BETWEEN 1 AND 32),
  humitat_minima integer NOT NULL DEFAULT 30 CHECK (humitat_minima BETWEEN 5 AND 80),
  humitat_maxima integer NOT NULL DEFAULT 50 CHECK (humitat_maxima BETWEEN 10 AND 95),
  mode_automatic boolean NOT NULL DEFAULT true,
  temps_maxim_segons integer NOT NULL DEFAULT 30 CHECK (temps_maxim_segons BETWEEN 5 AND 120),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  CONSTRAINT llindars_coherents CHECK (humitat_maxima >= humitat_minima + 5)
);
INSERT INTO public.configuracio_reg(jardinera) VALUES (1),(2)
ON CONFLICT (jardinera) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.historial_configuracio_reg (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  jardinera integer NOT NULL,
  humitat_minima_anterior integer,
  humitat_maxima_anterior integer,
  mode_automatic_anterior boolean,
  temps_maxim_segons_anterior integer,
  humitat_minima_nova integer NOT NULL,
  humitat_maxima_nova integer NOT NULL,
  mode_automatic_nou boolean NOT NULL,
  temps_maxim_segons_nou integer NOT NULL,
  actor uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.solicituds_reg_prova (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  jardinera integer NOT NULL REFERENCES public.configuracio_reg(jardinera),
  durada_segons integer NOT NULL CHECK (durada_segons BETWEEN 1 AND 30),
  estat text NOT NULL DEFAULT 'simulada' CHECK (estat = 'simulada'),
  actor uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION public.cada_reg_audit_config()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at = now();
    NEW.updated_by = auth.uid();
    IF ROW(OLD.humitat_minima,OLD.humitat_maxima,OLD.mode_automatic,OLD.temps_maxim_segons)
       IS DISTINCT FROM ROW(NEW.humitat_minima,NEW.humitat_maxima,NEW.mode_automatic,NEW.temps_maxim_segons) THEN
      INSERT INTO public.historial_configuracio_reg
      (jardinera,humitat_minima_anterior,humitat_maxima_anterior,mode_automatic_anterior,temps_maxim_segons_anterior,
       humitat_minima_nova,humitat_maxima_nova,mode_automatic_nou,temps_maxim_segons_nou,actor)
      VALUES (NEW.jardinera,OLD.humitat_minima,OLD.humitat_maxima,OLD.mode_automatic,OLD.temps_maxim_segons,
              NEW.humitat_minima,NEW.humitat_maxima,NEW.mode_automatic,NEW.temps_maxim_segons,auth.uid());
    END IF;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS cada_reg_audit ON public.configuracio_reg;
CREATE TRIGGER cada_reg_audit BEFORE UPDATE ON public.configuracio_reg
FOR EACH ROW EXECUTE FUNCTION public.cada_reg_audit_config();

ALTER TABLE public.configuracio_reg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historial_configuracio_reg ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicituds_reg_prova ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.configuracio_reg,public.historial_configuracio_reg,public.solicituds_reg_prova FROM anon,authenticated;
GRANT SELECT,UPDATE (humitat_minima,humitat_maxima,mode_automatic,temps_maxim_segons) ON public.configuracio_reg TO authenticated;
GRANT SELECT ON public.historial_configuracio_reg TO authenticated;
GRANT SELECT,INSERT (jardinera,durada_segons) ON public.solicituds_reg_prova TO authenticated;
GRANT USAGE,SELECT ON SEQUENCE public.solicituds_reg_prova_id_seq TO authenticated;

DROP POLICY IF EXISTS cada_config_select ON public.configuracio_reg;
DROP POLICY IF EXISTS cada_config_update ON public.configuracio_reg;
DROP POLICY IF EXISTS cada_hist_select ON public.historial_configuracio_reg;
DROP POLICY IF EXISTS cada_solicitud_select ON public.solicituds_reg_prova;
DROP POLICY IF EXISTS cada_solicitud_insert ON public.solicituds_reg_prova;
CREATE POLICY cada_config_select ON public.configuracio_reg FOR SELECT TO authenticated
USING (EXISTS(SELECT 1 FROM public.administradores a WHERE a.user_id=(SELECT auth.uid())));
CREATE POLICY cada_config_update ON public.configuracio_reg FOR UPDATE TO authenticated
USING (EXISTS(SELECT 1 FROM public.administradores a WHERE a.user_id=(SELECT auth.uid())))
WITH CHECK (EXISTS(SELECT 1 FROM public.administradores a WHERE a.user_id=(SELECT auth.uid())));
CREATE POLICY cada_hist_select ON public.historial_configuracio_reg FOR SELECT TO authenticated
USING (EXISTS(SELECT 1 FROM public.administradores a WHERE a.user_id=(SELECT auth.uid())));
CREATE POLICY cada_solicitud_select ON public.solicituds_reg_prova FOR SELECT TO authenticated
USING (EXISTS(SELECT 1 FROM public.administradores a WHERE a.user_id=(SELECT auth.uid())));
CREATE POLICY cada_solicitud_insert ON public.solicituds_reg_prova FOR INSERT TO authenticated
WITH CHECK (actor=(SELECT auth.uid()) AND estat='simulada' AND
 EXISTS(SELECT 1 FROM public.administradores a WHERE a.user_id=(SELECT auth.uid())));
COMMIT;
-- Per comprovar: SELECT * FROM public.configuracio_reg ORDER BY jardinera;
