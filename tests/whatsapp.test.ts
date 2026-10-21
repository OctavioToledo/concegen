import { describe, expect, it } from 'vitest';
import { whatsappUrl } from '../src/lib/whatsapp';
import { mensajes } from '../src/config/mensajes';

const NUMERO = '5492634280036';

function textoDe(url: string) {
  return new URL(url).searchParams.get('text');
}

describe('whatsappUrl', () => {
  it('arma el link wa.me con el número', () => {
    expect(whatsappUrl(NUMERO, 'Hola')).toBe('https://wa.me/5492634280036?text=Hola');
  });

  it('conserva tildes, ñ, «¿», «&», «#» y saltos de línea', () => {
    const mensaje = 'Hola! ¿Tienen el Peugeot 2008 & la Ñandú? Modelo #3, diésel.\nGracias.';
    const url = whatsappUrl(NUMERO, mensaje);
    expect(url).not.toMatch(/\s/);
    expect(url.split('?text=')[1]).not.toContain('&');
    expect(url.split('?text=')[1]).not.toContain('#');
    expect(textoDe(url)).toBe(mensaje);
  });
});

describe('plantillas', () => {
  const link = 'https://andino.demo.devott.com.ar/autos/toyota-hilux-srx-2022-h7k2';
  const auto = 'Toyota Hilux 2.8 TDI SRX 4x4 AT 2022';

  it('consulta desde la ficha', () => {
    expect(mensajes.fichaConsulta({ auto, link })).toBe(
      `Hola! Me interesa el ${auto} (${link}). ¿Sigue disponible?`,
    );
  });

  it('financiación sin auto elegido', () => {
    const m = mensajes.financiacion({ nombre: 'Ana', auto: null, anticipo: '$ 5.000.000', cuotas: '24' });
    expect(m).toBe('Hola! Soy Ana. Quiero financiar un auto. Tengo un anticipo de $ 5.000.000 y me interesan 24 cuotas. ¿Qué opciones tienen?');
  });

  it('usado sin comentario no deja espacios dobles', () => {
    const m = mensajes.usado({ auto: 'Fiat Palio Attractive', anio: '2015', km: '120.000', estado: 'bueno', comentario: '' });
    expect(m).not.toContain('  ');
    expect(m).toContain('Les puedo mandar fotos por acá.');
  });

  it('los mensajes viajan intactos por la URL', () => {
    const m = mensajes.usado({ auto: 'Citroën C4 Lounge', anio: '2018', km: '80.000', estado: 'con detalles', comentario: 'Tiene un rayón & un golpe #2.\nCubiertas nuevas.' });
    expect(textoDe(whatsappUrl(NUMERO, m))).toBe(m);
  });
});
