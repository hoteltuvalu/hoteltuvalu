/* ============================================================
   HOTEL TUVALÚ — LÓGICA DEL SITIO
   Requiere que config.js se cargue antes que este archivo.
   Todo lo editable (precios, textos, contacto) está en config.js.
   ============================================================ */

/* ---------- Utilidades ---------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/** Habitaciones vigentes (config.js + cambios del panel). */
const habs = (incluirInactivas = false) => Datos.habitaciones(incluirInactivas);

/** Tarifa por noche de una habitación según se incluya o no el desayuno. */
const tarifa = (h, conDesayuno) => (conDesayuno ? h.precioConDesayuno : h.precioSinDesayuno) || 0;

/** Formatea un número como pesos colombianos. Si el precio es 0 devuelve el marcador [PRECIO]. */
function precioCOP(valor) {
  if (!valor || valor <= 0) return '[PRECIO]';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: HOTEL.moneda, maximumFractionDigits: 0
  }).format(valor);
}

/** Convierte 'YYYY-MM-DD' a una fecha legible: 'vie, 25 de diciembre de 2026' */
function fechaLegible(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/** Diferencia en noches entre dos fechas ISO. */
function noches(entrada, salida) {
  if (!entrada || !salida) return 0;
  const ms = new Date(salida) - new Date(entrada);
  return ms > 0 ? Math.round(ms / 86400000) : 0;
}

function hoyISO() { return new Date().toISOString().split('T')[0]; }

function enlaceWhatsApp(texto) {
  return `https://wa.me/${HOTEL.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/* ---------- Iconos SVG (línea) ---------- */
const ICONOS = {
  wifi:      '<path d="M2 8.8a16 16 0 0 1 20 0M5 12.4a11 11 0 0 1 14 0M8.5 16a6 6 0 0 1 7 0"/><circle cx="12" cy="19.5" r="1.1"/>',
  recepcion: '<path d="M3 20h18M5 20v-5a7 7 0 0 1 14 0v5M12 8V5M9.5 5h5"/>',
  cama:      '<path d="M3 18v-9M3 13h18v5M21 18v-4M7 10h4a2 2 0 0 1 2 2v1H7z"/>',
  atencion:  '<path d="M12 3a7 7 0 0 0-7 7v4M5 14a2 2 0 0 0 2 2h1v-5H7a2 2 0 0 0-2 2ZM19 14v-4a7 7 0 0 0-2-4.9M19 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2ZM17 17v1a3 3 0 0 1-3 3h-2"/>',
  ubicacion: '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
  parqueo:   '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9.5 17V7.5h3.2a2.9 2.9 0 0 1 0 5.8H9.5"/>',
  telefono:  '<path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2.2 2A17 17 0 0 1 4 5.2 2 2 0 0 1 6 3Z"/>',
  correo:    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  reloj:     '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.2 2"/>',
  whatsapp:  '<path d="M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3.5 20.5l1.5-4.3a8.5 8.5 0 1 1 15.5-4.6Z"/><path d="M8.8 9.2c.4 2.6 2.4 4.6 5 5 .7.1 1.4-.4 1.4-1.1l-1.6-.8-.9.8a5 5 0 0 1-2-2l.8-.9-.8-1.6c-.7 0-1.2.7-1.1 1.4"/>',
  check:     '<path d="m5 13 4.5 4.5L19 7"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1"/>',
  facebook:  '<path d="M14.5 21v-8h2.7l.5-3.2h-3.2V7.7c0-.9.3-1.6 1.7-1.6h1.6V3.2A22 22 0 0 0 15.4 3c-2.4 0-4 1.5-4 4.2v2.6H8.6V13h2.8v8Z"/>',
  tiktok:    '<path d="M14 3v11.5a3.5 3.5 0 1 1-3-3.46M14 6.5a4.5 4.5 0 0 0 4.5 4.5"/>'
};
const icono = (nombre, clase = '') =>
  `<svg class="${clase}" viewBox="0 0 24 24" aria-hidden="true" stroke-linecap="round" stroke-linejoin="round">${ICONOS[nombre] || ''}</svg>`;

/* ============================================================
   NAVEGACIÓN
   ============================================================ */
function iniciarNav() {
  const nav = $('#nav');
  const burger = $('#burger');
  const links = $('#navLinks');
  if (!nav) return;

  // Fondo sólido al bajar (solo en la portada, que tiene hero transparente)
  if (nav.classList.contains('nav--portada')) {
    const alternar = () => nav.classList.toggle('nav--solida', window.scrollY > 60);
    alternar();
    window.addEventListener('scroll', alternar, { passive: true });
  }

  // Menú hamburguesa
  if (burger && links) {
    burger.addEventListener('click', () => {
      const abierto = links.classList.toggle('abierto');
      burger.setAttribute('aria-expanded', String(abierto));
    });
    links.addEventListener('click', e => {
      if (e.target.closest('a')) {
        links.classList.remove('abierto');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* Animación suave al entrar las secciones */
function iniciarRevelado() {
  const items = $$('.revelar');
  if (!items.length || !('IntersectionObserver' in window)) {
    items.forEach(i => i.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(i => obs.observe(i));
}

/* ============================================================
   CONTENIDO DINÁMICO (datos de config.js)
   ============================================================ */
function pintarDatosHotel() {
  // Textos simples con data-hotel="clave"
  $$('[data-hotel]').forEach(el => {
    const valor = HOTEL[el.dataset.hotel];
    if (valor) el.textContent = valor;
  });

  // Enlaces de teléfono, correo y WhatsApp
  $$('[data-enlace="telefono"]').forEach(a => { a.href = `tel:${HOTEL.telefonoLink}`; a.textContent = HOTEL.telefono; });
  $$('[data-enlace="correo"]').forEach(a => { a.href = `mailto:${HOTEL.correo}`; a.textContent = HOTEL.correo; });
  $$('[data-enlace="whatsapp"]').forEach(a => { a.href = enlaceWhatsApp(HOTEL.whatsappMensaje); });
  $$('[data-enlace="mapa"]').forEach(a => { a.href = HOTEL.mapaComoLlegar; });

  // Año del footer
  $$('[data-anio]').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Mapa
  const mapa = $('#mapa');
  if (mapa) {
    if (HOTEL.mapaEmbed) {
      mapa.innerHTML = `<iframe src="${HOTEL.mapaEmbed}" loading="lazy" title="Mapa de ubicación del Hotel Tuvalu" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
    } else {
      mapa.innerHTML = `<p class="mapa__vacio">Aquí va el mapa.<br>Abre Google Maps, busca el hotel, elige “Compartir → Insertar un mapa”, copia el enlace del atributo <code>src</code> y pégalo en <code>HOTEL.mapaEmbed</code> dentro de <code>js/config.js</code>.</p>`;
    }
  }

  // Redes del footer
  const redes = $('#redes');
  if (redes) {
    redes.innerHTML = Object.entries(HOTEL.redes)
      .filter(([, url]) => url)
      .map(([nombre, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${nombre}">${icono(nombre)}</a>`)
      .join('');
  }
}

function pintarHabitaciones() {
  const cont = $('#habitaciones');
  if (!cont) return;
  cont.innerHTML = habs().map(h => `
    <article class="habitacion revelar">
      <div class="habitacion__foto">
        <img src="${h.foto}" alt="${h.nombre} del Hotel Tuvalu" loading="lazy">
        <span class="habitacion__capacidad">${h.capacidadTexto}</span>
      </div>
      <div class="habitacion__cuerpo">
        <h3>${h.nombre}</h3>
        <p class="habitacion__desc">${h.descripcion}</p>
        <ul class="habitacion__chips">${h.caracteristicas.map(c => `<li>${c}</li>`).join('')}</ul>
        <div class="habitacion__precio">
          <strong>${precioCOP(h.precioSinDesayuno)}</strong><span>por noche, sin desayuno</span>
        </div>
        <p class="habitacion__extra">Con desayuno incluido: ${precioCOP(h.precioConDesayuno)} por noche</p>
        <div class="habitacion__acciones">
          <button class="btn btn--borde" type="button" data-detalle="${h.id}">Ver detalles</button>
          <a class="btn btn--primario" href="reservas.html?habitacion=${h.id}">Reservar</a>
        </div>
      </div>
    </article>
  `).join('');

  cont.addEventListener('click', e => {
    const btn = e.target.closest('[data-detalle]');
    if (btn) abrirModalHabitacion(btn.dataset.detalle);
  });
}

function pintarServicios() {
  const cont = $('#servicios');
  if (!cont) return;
  cont.innerHTML = SERVICIOS.map(s => `
    <article class="servicio revelar">
      ${icono(s.icono)}
      <h3>${s.titulo}</h3>
      <p>${s.texto}</p>
      ${s.confirmado ? '' : '<span class="servicio__nota">Servicio por confirmar</span>'}
    </article>
  `).join('');
}

function pintarLugares() {
  const cont = $('#lugares');
  if (!cont) return;
  cont.innerHTML = LUGARES.map(l => `
    <article class="lugar revelar">
      <img src="${l.foto}" alt="${l.nombre}, Paipa" loading="lazy">
      <div class="lugar__texto">
        <h3>${l.nombre}</h3>
        <p>${l.texto}</p>
        <p class="lugar__dist">${l.distancia} desde el hotel</p>
      </div>
    </article>
  `).join('');
}

/* ============================================================
   MODAL DE DETALLES DE HABITACIÓN
   ============================================================ */
let ultimoFoco = null;

function abrirModalHabitacion(id) {
  const h = habs(true).find(x => x.id === id);
  const modal = $('#modal');
  if (!h || !modal) return;

  ultimoFoco = document.activeElement;
  $('#modalCuerpo').innerHTML = `
    <button class="modal__cerrar" id="modalCerrar" aria-label="Cerrar">&times;</button>
    <img class="modal__foto" src="${h.foto}" alt="${h.nombre}">
    <div class="modal__cuerpo">
      <h2 id="modalTitulo">${h.nombre}</h2>
      <p>${h.descripcionLarga}</p>
      <ul class="modal__lista">
        <li>Capacidad: ${h.capacidadTexto}</li>
        <li>Cama: ${h.cama}</li>
        <li>Área: ${h.metros}</li>
        <li>Incluye: ${h.caracteristicas.join(', ')}</li>
      </ul>
      <div class="habitacion__precio"><strong>${precioCOP(h.precioSinDesayuno)}</strong><span>por noche, sin desayuno</span></div>
      <p class="habitacion__extra">Con desayuno incluido: ${precioCOP(h.precioConDesayuno)} por noche</p>
      <a class="btn btn--primario btn--bloque" href="reservas.html?habitacion=${h.id}">Reservar esta habitación</a>
    </div>`;
  modal.classList.add('abierto');
  document.body.style.overflow = 'hidden';
  $('#modalCerrar').focus();
}

function cerrarModal() {
  const modal = $('#modal');
  if (!modal) return;
  modal.classList.remove('abierto');
  document.body.style.overflow = '';
  if (ultimoFoco) ultimoFoco.focus();
}

function iniciarModal() {
  const modal = $('#modal');
  if (!modal) return;
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('#modalCerrar')) cerrarModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('abierto')) cerrarModal();
  });
}

/* ============================================================
   GALERÍA + LIGHTBOX
   ============================================================ */
let galeriaVisible = [];
let indiceLightbox = 0;

function pintarGaleria(filtro = 'todas') {
  const cont = $('#galeria');
  if (!cont) return;
  galeriaVisible = filtro === 'todas' ? GALERIA : GALERIA.filter(g => g.categoria === filtro);
  cont.innerHTML = galeriaVisible.map((g, i) => `
    <button class="galeria__item" type="button" data-i="${i}" aria-label="Ampliar: ${g.alt}">
      <img src="${g.src}" alt="${g.alt}" loading="lazy">
    </button>
  `).join('');
}

function iniciarGaleria() {
  const cont = $('#galeria');
  if (!cont) return;
  pintarGaleria();

  $$('.filtro').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filtro').forEach(b => b.setAttribute('aria-pressed', 'false'));
      btn.setAttribute('aria-pressed', 'true');
      pintarGaleria(btn.dataset.filtro);
    });
  });

  cont.addEventListener('click', e => {
    const item = e.target.closest('.galeria__item');
    if (item) abrirLightbox(Number(item.dataset.i));
  });

  const lb = $('#lightbox');
  lb.addEventListener('click', e => {
    if (e.target === lb || e.target.closest('.lb-cerrar')) cerrarLightbox();
    if (e.target.closest('.lb-prev')) moverLightbox(-1);
    if (e.target.closest('.lb-next')) moverLightbox(1);
  });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('abierto')) return;
    if (e.key === 'Escape') cerrarLightbox();
    if (e.key === 'ArrowLeft') moverLightbox(-1);
    if (e.key === 'ArrowRight') moverLightbox(1);
  });
}

function abrirLightbox(i) {
  indiceLightbox = i;
  const lb = $('#lightbox');
  ultimoFoco = document.activeElement;
  actualizarLightbox();
  lb.classList.add('abierto');
  document.body.style.overflow = 'hidden';
  $('.lb-cerrar', lb).focus();
}

function actualizarLightbox() {
  const item = galeriaVisible[indiceLightbox];
  $('#lightboxImg').src = item.src;
  $('#lightboxImg').alt = item.alt;
  $('#lightboxPie').textContent = `${item.alt} · ${indiceLightbox + 1} de ${galeriaVisible.length}`;
}

function moverLightbox(paso) {
  indiceLightbox = (indiceLightbox + paso + galeriaVisible.length) % galeriaVisible.length;
  actualizarLightbox();
}

function cerrarLightbox() {
  $('#lightbox').classList.remove('abierto');
  document.body.style.overflow = '';
  if (ultimoFoco) ultimoFoco.focus();
}

/* ============================================================
   RESERVAS
   ============================================================ */
function iniciarReservas() {
  const form = $('#formReserva');
  if (!form) return;

  const entrada = $('#entrada');
  const salida  = $('#salida');
  const select  = $('#habitacion');

  // Opciones de habitación desde config.js
  select.innerHTML = '<option value="">Selecciona una habitación</option>' +
    habs().map(h => `<option value="${h.id}">${h.nombre} — desde ${precioCOP(h.precioSinDesayuno)} por noche</option>`).join('');

  // Si llega desde "Reservar" con ?habitacion=doble, queda preseleccionada
  const params = new URLSearchParams(location.search);
  if (params.get('habitacion')) select.value = params.get('habitacion');

  // Casilla de desayuno (textos y comportamiento desde DESAYUNO en config.js)
  const desayuno = $('#desayuno');
  if (desayuno) {
    const bloque = desayuno.closest('.campo');
    if (!DESAYUNO.activo) {
      bloque.hidden = true;
    } else {
      $('#desayunoEtiqueta').textContent = DESAYUNO.etiqueta;
      $('#desayunoDetalle').textContent = DESAYUNO.detalle;
      desayuno.checked = DESAYUNO.marcadoPorDefecto;
    }
  }

  // No se pueden elegir fechas pasadas
  entrada.min = hoyISO();
  salida.min = hoyISO();
  entrada.addEventListener('change', () => {
    const minSalida = new Date(entrada.value);
    minSalida.setDate(minSalida.getDate() + 1);
    salida.min = minSalida.toISOString().split('T')[0];
    if (salida.value && salida.value <= entrada.value) salida.value = salida.min;
    actualizarResumen();
  });

  // El resumen lateral se recalcula con cada cambio
  form.addEventListener('input', actualizarResumen);
  form.addEventListener('change', actualizarResumen);
  actualizarResumen();

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const errores = validar(form);
    if (errores) {
      $('#formAlerta').innerHTML = `<div class="alerta alerta--error">Revisa los campos marcados: faltan datos para completar la reserva.</div>`;
      $('.campo--error input, .campo--error select')?.focus();
      return;
    }
    $('#formAlerta').innerHTML = '';
    const datos = leerFormulario(form);
    const boton = $('#btnEnviar');
    boton.disabled = true;
    boton.textContent = 'Enviando…';

    // Queda registrada en el módulo administrativo
    Datos.agregarReserva(datos);

    const resultado = await enviarReserva(datos);

    boton.disabled = false;
    boton.textContent = 'Enviar solicitud de reserva';
    mostrarConfirmacion(datos, resultado);
  });
}

/** Lee todos los campos y calcula noches y total. */
function leerFormulario(form) {
  const d = Object.fromEntries(new FormData(form).entries());
  const hab = habs(true).find(h => h.id === d.habitacion);
  const n = noches(d.entrada, d.salida);
  const conDesayuno = Boolean(d.desayuno);
  const porNoche = hab ? tarifa(hab, conDesayuno) : 0;
  return {
    ...d,
    desayuno: conDesayuno,
    habitacionNombre: hab ? hab.nombre : '—',
    precioNoche: porNoche,
    noches: n,
    total: porNoche * n,
    codigo: 'TUV-' + hoyISO().replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000)
  };
}

/** Valida campos obligatorios, formato de correo, teléfono y coherencia de fechas. */
function validar(form) {
  let hayError = false;
  const marcar = (id, mensaje) => {
    const campo = $(`#${id}`).closest('.campo');
    campo.classList.toggle('campo--error', Boolean(mensaje));
    $('.campo__error', campo).textContent = mensaje || '';
    if (mensaje) hayError = true;
  };

  const v = id => (form[id]?.value || '').trim();

  marcar('nombre',  v('nombre').length < 3 ? 'Escribe tu nombre completo.' : '');
  marcar('correo',  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('correo')) ? '' : 'Escribe un correo válido.');
  marcar('telefono', v('telefono').replace(/\D/g, '').length < 7 ? 'Escribe un número de contacto válido.' : '');
  marcar('entrada', v('entrada') ? '' : 'Elige la fecha de entrada.');
  marcar('salida',  !v('salida') ? 'Elige la fecha de salida.'
                    : (noches(v('entrada'), v('salida')) < 1 ? 'La salida debe ser posterior a la entrada.' : ''));
  marcar('habitacion', v('habitacion') ? '' : 'Elige una habitación.');

  // Capacidad
  const hab = habs(true).find(h => h.id === v('habitacion'));
  const personas = Number(v('adultos') || 0) + Number(v('ninos') || 0);
  marcar('adultos', Number(v('adultos')) < 1 ? 'Debe viajar al menos un adulto.'
                    : (hab && personas > hab.capacidad ? `${hab.nombre} admite hasta ${hab.capacidad} personas.` : ''));

  // Disponibilidad en las fechas elegidas
  if (hab && v('entrada') && v('salida') && noches(v('entrada'), v('salida')) >= 1) {
    const d = Datos.disponibilidad(hab.id, v('entrada'), v('salida'));
    if (!d.disponible) marcar('habitacion', d.motivo);
  }

  return hayError;
}

/** Resumen lateral en vivo: noches y total. */
function actualizarResumen() {
  const form = $('#formReserva');
  if (!form) return;
  const hab = habs(true).find(h => h.id === form.habitacion.value);
  const conDesayuno = form.desayuno ? form.desayuno.checked : false;
  const n = noches(form.entrada.value, form.salida.value);
  const porNoche = hab ? tarifa(hab, conDesayuno) : 0;
  const total = porNoche * n;

  $('#rHabitacion').textContent = hab ? hab.nombre : 'Sin seleccionar';
  $('#rEntrada').textContent = form.entrada.value ? fechaLegible(form.entrada.value) : '—';
  $('#rSalida').textContent  = form.salida.value ? fechaLegible(form.salida.value) : '—';
  $('#rNoches').textContent  = n ? `${n} ${n === 1 ? 'noche' : 'noches'}` : '—';
  $('#rHuespedes').textContent = `${form.adultos.value || 0} adultos · ${form.ninos.value || 0} niños`;
  $('#rDesayuno').textContent = conDesayuno ? 'Incluido' : 'No incluido';
  $('#rTarifa').textContent = hab ? `${precioCOP(porNoche)} por noche` : '—';
  $('#rCalculo').textContent = (hab && n && porNoche > 0)
    ? `${precioCOP(porNoche)} × ${n} ${n === 1 ? 'noche' : 'noches'}` : '—';
  $('#rTotal').textContent  = (hab && n && porNoche > 0) ? precioCOP(total) : '[PRECIO]';

  // Aviso de disponibilidad en vivo
  const aviso = $('#rDisponibilidad');
  if (aviso) {
    if (hab && form.entrada.value && form.salida.value && n >= 1) {
      const d = Datos.disponibilidad(hab.id, form.entrada.value, form.salida.value);
      aviso.textContent = d.disponible ? 'Hay disponibilidad en esas fechas.' : d.motivo;
      aviso.className = 'resumen__aviso ' + (d.disponible ? 'es-ok' : 'es-no');
    } else {
      aviso.textContent = '';
      aviso.className = 'resumen__aviso';
    }
  }
}

/** Texto plano de la reserva, usado en el correo y en WhatsApp. */
function textoReserva(d) {
  return [
    `Solicitud de reserva — ${HOTEL.nombre}`,
    `Código: ${d.codigo}`,
    ``,
    `Huésped: ${d.nombre}`,
    `Correo: ${d.correo}`,
    `Teléfono: ${d.telefono}`,
    ``,
    `Habitación: ${d.habitacionNombre}`,
    `Entrada: ${fechaLegible(d.entrada)}`,
    `Salida: ${fechaLegible(d.salida)}`,
    `Noches: ${d.noches}`,
    `Desayuno: ${d.desayuno ? 'Incluido' : 'No incluido'}`,
    `Huéspedes: ${d.adultos} adultos, ${d.ninos} niños`,
    `Tarifa por noche: ${precioCOP(d.precioNoche)}`,
    `Total estimado: ${d.total > 0 ? precioCOP(d.total) : '[PRECIO]'}`,
    ``,
    `Comentarios: ${d.comentarios || 'Sin comentarios'}`
  ].join('\n');
}

/**
 * Envía la reserva según ENVIO.modo (config.js).
 * Devuelve { ok: boolean, mensaje: string }
 */
async function enviarReserva(d) {
  try {
    if (ENVIO.modo === 'formsubmit') {
      const respuesta = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(HOTEL.correo)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          _subject: `${ENVIO.asunto} · ${d.codigo}`,
          _template: 'table',
          Codigo: d.codigo,
          Nombre: d.nombre,
          Correo: d.correo,
          Telefono: d.telefono,
          Habitacion: d.habitacionNombre,
          Entrada: d.entrada,
          Salida: d.salida,
          Noches: d.noches,
          Desayuno: d.desayuno ? 'Incluido' : 'No incluido',
          Adultos: d.adultos,
          Ninos: d.ninos,
          Total: d.total,
          Comentarios: d.comentarios || '—'
        })
      });
      if (!respuesta.ok) throw new Error('Respuesta no válida');
      return { ok: true, mensaje: 'La solicitud llegó al correo del hotel.' };
    }

    if (ENVIO.modo === 'emailjs') {
      if (!window.emailjs) throw new Error('Falta la librería de EmailJS');
      emailjs.init({ publicKey: ENVIO.emailjs.publicKey });
      await emailjs.send(ENVIO.emailjs.serviceId, ENVIO.emailjs.templateId, {
        to_email: HOTEL.correo,
        asunto: `${ENVIO.asunto} · ${d.codigo}`,
        mensaje: textoReserva(d),
        nombre: d.nombre,
        correo: d.correo,
        telefono: d.telefono
      });
      return { ok: true, mensaje: 'La solicitud llegó al correo del hotel.' };
    }

    // modo 'demo'
    console.log('[Hotel Tuvalu] Reserva (modo demo, no se envió):\n' + textoReserva(d));
    return { ok: true, demo: true, mensaje: 'Modo de prueba: la reserva no se envió todavía.' };

  } catch (error) {
    console.error(error);
    return { ok: false, mensaje: 'No pudimos enviar la solicitud. Envíala por WhatsApp o escríbenos al correo.' };
  }
}

/** Reemplaza el formulario por la pantalla de confirmación. */
function mostrarConfirmacion(d, resultado) {
  const zona = $('#zonaReserva');
  const total = d.total > 0 ? precioCOP(d.total) : '[PRECIO]';

  const aviso = resultado.ok
    ? (resultado.demo
        ? `<div class="alerta alerta--ok">Modo de prueba activo: la reserva no se envió al hotel. Cambia <code>ENVIO.modo</code> en <code>js/config.js</code> para activar el envío por correo.</div>`
        : '')
    : `<div class="alerta alerta--error">${resultado.mensaje}</div>`;

  zona.innerHTML = `
    <div class="confirmacion" tabindex="-1" id="confirmacion">
      <div class="confirmacion__check">${icono('check')}</div>
      <h2>Recibimos tu solicitud, ${d.nombre.split(' ')[0]}</h2>
      <p>Es una solicitud de reserva, todavía no un cupo confirmado. El hotel revisa la disponibilidad y te responde al correo o al teléfono que dejaste.</p>
      <span class="confirmacion__codigo">${d.codigo}</span>
      ${aviso}

      <div class="detalle">
        <p class="detalle__titulo">Resumen de tu estadía</p>
        <dl>
          <div><dt>Habitación</dt><dd>${d.habitacionNombre}</dd></div>
          <div><dt>Huéspedes</dt><dd>${d.adultos} adultos · ${d.ninos} niños</dd></div>
          <div><dt>Entrada</dt><dd>${fechaLegible(d.entrada)}</dd></div>
          <div><dt>Salida</dt><dd>${fechaLegible(d.salida)}</dd></div>
          <div><dt>Noches</dt><dd>${d.noches}</dd></div>
          <div><dt>Desayuno</dt><dd>${d.desayuno ? 'Incluido' : 'No incluido'}</dd></div>
          <div><dt>Tarifa por noche</dt><dd>${precioCOP(d.precioNoche)}</dd></div>
          <div><dt>Cálculo</dt><dd>${precioCOP(d.precioNoche)} × ${d.noches} ${d.noches === 1 ? 'noche' : 'noches'}</dd></div>
          <div><dt>Nombre</dt><dd>${d.nombre}</dd></div>
          <div><dt>Contacto</dt><dd>${d.correo}<br>${d.telefono}</dd></div>
          ${d.comentarios ? `<div style="grid-column:1/-1"><dt>Comentarios</dt><dd>${d.comentarios}</dd></div>` : ''}
          <div class="detalle--total"><dt>Total estimado</dt><dd>${total}</dd></div>
        </dl>
      </div>

      <div class="confirmacion__pasos">
        <h3>Qué sigue</h3>
        <ol>
          <li>El hotel confirma la disponibilidad de la habitación.</li>
          <li>Recibes la respuesta con las condiciones y la forma de pago.</li>
          <li>La reserva queda confirmada cuando el hotel te lo indique por escrito.</li>
        </ol>
      </div>

      <div class="confirmacion__acciones">
        <a class="btn btn--dorado" href="${enlaceWhatsApp(textoReserva(d))}" target="_blank" rel="noopener">Enviar también por WhatsApp</a>
        <button class="btn btn--borde" type="button" onclick="window.print()">Guardar como PDF</button>
        <a class="btn btn--borde" href="index.html">Volver al inicio</a>
      </div>
    </div>`;

  $('#confirmacion').focus();
  window.scrollTo({ top: zona.offsetTop - 100, behavior: 'smooth' });
}

/* ============================================================
   ARRANQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  pintarDatosHotel();
  pintarHabitaciones();
  pintarServicios();
  pintarLugares();
  iniciarNav();
  iniciarModal();
  iniciarGaleria();
  iniciarReservas();
  iniciarRevelado();
});
