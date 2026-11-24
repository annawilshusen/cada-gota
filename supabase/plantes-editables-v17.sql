-- CadaGota v17: afegir identitat de planta i permetre'n l'edició
-- Executeu aquest script a SQL Editor amb sessió administrativa postgres.
-- No elimina dades ni canvia els llindars ni l'Arduino.
BEGIN;
SET LOCAL ROLE postgres;

ALTER TABLE public.configuracio_reg
  ADD COLUMN IF NOT EXISTS nom_planta text,
  ADD COLUMN IF NOT EXISTS especie text,
  ADD COLUMN IF NOT EXISTS data_plantacio date,
  ADD COLUMN IF NOT EXISTS observacions text;

-- Restringir longituds des del servidor, a més de l'HTML
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cada_nom_planta_len' AND conrelid='public.configuracio_reg'::regclass) THEN
    ALTER TABLE public.configuracio_reg ADD CONSTRAINT cada_nom_planta_len CHECK (char_length(nom_planta)<=80);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cada_especie_len' AND conrelid='public.configuracio_reg'::regclass) THEN
    ALTER TABLE public.configuracio_reg ADD CONSTRAINT cada_especie_len CHECK (char_length(especie)<=120);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='cada_observacions_len' AND conrelid='public.configuracio_reg'::regclass) THEN
    ALTER TABLE public.configuracio_reg ADD CONSTRAINT cada_observacions_len CHECK (char_length(observacions)<=1000);
  END IF;
END $$;

GRANT UPDATE (nom_planta, especie, data_plantacio, observacions)
  ON public.configuracio_reg TO authenticated;
-- Les polítiques RLS existents sobre configuracio_reg continuen aplicant-se.
COMMIT;
