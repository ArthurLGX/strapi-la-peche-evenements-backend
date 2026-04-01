import type { Core } from "@strapi/strapi";

/** Origines autorisées pour les requêtes navigateur (CORS). Compléter via `CORS_ORIGIN` dans `.env` (séparateur virgule). */
const DEFAULT_CORS_ORIGINS = [
  "https://la-peche-evenements.staginglab.fr",
  "https://api.la-peche-evenements.staginglab.fr",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => {
  const fromEnv = env("CORS_ORIGIN", "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const origin = [...new Set([...DEFAULT_CORS_ORIGINS, ...fromEnv])];

  return [
    "strapi::logger",
    "strapi::errors",
    "strapi::security",
    {
      name: "strapi::cors",
      config: {
        enabled: true,
        origin,
        headers: "*",
      },
    },
    "strapi::poweredBy",
    "strapi::query",
    "strapi::body",
    "strapi::session",
    "strapi::favicon",
    "strapi::public",
  ];
};
