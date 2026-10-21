// Plantillas de WhatsApp. Sin emojis.
// Cada función recibe los datos ya formateados y devuelve el texto del mensaje.

export const mensajes = {
  fichaConsulta: (d: { auto: string; link: string }) =>
    `Hola! Me interesa el ${d.auto} (${d.link}). ¿Sigue disponible?`,

  fichaFinanciacion: (d: { auto: string; link: string }) =>
    `Hola! Quiero consultar opciones de financiación para el ${d.auto} (${d.link}).`,

  fichaTestDrive: (d: { auto: string; link: string }) =>
    `Hola! Quiero coordinar un test drive del ${d.auto} (${d.link}). ¿Qué días y horarios tienen?`,

  fichaVendida: (d: { auto: string; link: string }) =>
    `Hola! Vi que el ${d.auto} ya se vendió (${d.link}). ¿Tienen algo similar?`,

  financiacion: (d: { nombre: string; auto: string | null; anticipo: string; cuotas: string }) =>
    `Hola! Soy ${d.nombre}. Quiero financiar ${d.auto ? `el ${d.auto}` : 'un auto'}. ` +
    `Tengo un anticipo de ${d.anticipo} y me interesan ${d.cuotas} cuotas. ¿Qué opciones tienen?`,

  usado: (d: { auto: string; anio: string; km: string; estado: string; comentario: string }) =>
    `Hola! Quiero cotizar mi usado: ${d.auto} ${d.anio}, ${d.km} km, estado ${d.estado}.` +
    (d.comentario ? ` ${d.comentario}` : '') +
    ' Les puedo mandar fotos por acá.',

  stockVacio: (d: { filtros: string }) =>
    `Hola! Estoy buscando ${d.filtros} y no lo encontré en la web. ¿Me avisan si les entra algo así?`,

  general: (d: { agencia: string }) =>
    `Hola! Estoy viendo la web de ${d.agencia} y quiero hacer una consulta.`,
};

// Versiones genéricas para cuando los formularios se envían sin JavaScript.
export const mensajesSinJs = {
  financiacion: 'Hola! Quiero consultar opciones de financiación.',
  usado: 'Hola! Quiero cotizar mi usado.',
};
