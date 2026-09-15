import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Habilita forbidden()/unauthorized() (HU-01.4: proteger rutas por rol
  // devolviendo un error real, no solo escondiendo UI).
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
