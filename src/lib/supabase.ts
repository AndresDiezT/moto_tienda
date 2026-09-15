import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con la secret key (reemplaza a la antigua "service role key" en
// los proyectos nuevos de Supabase): solo se usa en el servidor (Route
// Handlers / Server Actions), nunca se expone al navegador. Se usa para
// Storage (docs/CONTRACTS-API/archivos.md) y, en Fase 1, para verificación
// de sesión.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
