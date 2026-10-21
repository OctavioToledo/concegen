// Ícono del sitio: la inicial de la agencia sobre el color primario.
import type { APIRoute } from 'astro';
import { agencia, tema } from '../lib/agencia';

export const GET: APIRoute = () => {
  const inicial = agencia.nombre.trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="${tema['--c-primario']}"/><text x="16" y="23" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="20" fill="${tema['--c-primario-texto']}">${inicial}</text></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
};
