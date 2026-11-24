-- CadaGota v18: calibració configurable i noms públics de les plantes.
-- Executar una sola vegada al SQL Editor. No obre permisos d'escriptura públics.
BEGIN;
SET LOCAL ROLE postgres;

ALTER TABLE public.configuracio_reg
 ADD COLUMN IF NOT EXISTS raw_sec integer,
 ADD COLUMN IF NOT EXISTS raw_humit integer;

DO $$ BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cada_raw_calibracio' AND conrelid='public.configuracio_reg'::regclass) THEN
   ALTER TABLE public.configuracio_reg ADD CONSTRAINT cada_raw_calibracio CHECK (
     (raw_sec IS NULL AND raw_humit IS NULL) OR
     (raw_sec BETWEEN 0 AND 4095 AND raw_humit BETWEEN 0 AND 4095 AND abs(raw_sec - raw_humit) >= 20)
   );
 END IF;
END $$;

GRANT UPDATE (raw_sec,raw_humit) ON public.configuracio_reg TO authenticated;

-- El web públic només pot llegir camps no sensibles.
GRANT SELECT (jardinera,nom_planta,especie,raw_sec,raw_humit)
 ON public.configuracio_reg TO anon;
DROP POLICY IF EXISTS cada_noms_plantes_publics ON public.configuracio_reg;
CREATE POLICY cada_noms_plantes_publics ON public.configuracio_reg
 FOR SELECT TO anon USING (true);

COMMIT;
