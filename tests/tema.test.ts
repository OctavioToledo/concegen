import { describe, expect, it } from 'vitest';
import { chequearContraste, contraste, derivarTema } from '../src/lib/tema';

describe('tema', () => {
  it('la paleta de la demo pasa el chequeo de contraste', () => {
    const tema = derivarTema({ primario: '#0F3B57', acento: '#F0A202', fondo: '#F3F5F7' });
    expect(chequearContraste(tema)).toEqual([]);
    expect(tema['--c-primario-texto']).toBe('#FFFFFF');
    expect(tema['--c-acento-texto']).toBe('#1B2129');
  });

  it('un fondo oscuro invierte la tinta', () => {
    const tema = derivarTema({ primario: '#3FA7D6', acento: '#F0A202', fondo: '#14181D' });
    expect(tema['--c-tinta']).toBe('#F3F5F7');
    expect(contraste(tema['--c-tinta-suave'], tema['--c-fondo'])).toBeGreaterThanOrEqual(4.5);
  });

  it('avisa cuando un primario claro no llega a 3:1', () => {
    const tema = derivarTema({ primario: '#FFE066', acento: '#F0A202', fondo: '#F3F5F7' });
    expect(chequearContraste(tema).map((a) => a.par)).toContain('primario contra fondo (chips activos)');
    expect(tema['--c-foco']).toBe('#1B2129');
  });
});
