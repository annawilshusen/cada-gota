-- Executa UNA VEGADA a Supabase SQL Editor després de fer còpia de seguretat.
-- No elimina lectures històriques, no modifica les dades de la jardinera 1.
-- Les configuracions de noves plantes no impliquen sensors físics connectats.
INSERT INTO public.configuracio_reg(jardinera)
VALUES (3),(4),(5),(6)
ON CONFLICT (jardinera) DO NOTHING;
-- Verificació:
SELECT jardinera,nom_planta,especie FROM public.configuracio_reg
WHERE jardinera BETWEEN 1 AND 6 ORDER BY jardinera;
