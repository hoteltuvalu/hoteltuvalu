/* ============================================================
   HOTEL TUVALU — MÓDULO ADMINISTRATIVO
   Trabaja siempre a través de Datos (js/datos.js).
   ============================================================ */

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

const pesos = v => (!v || v <= 0)
  ? '[PRECIO]'
  : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);

const fechaCorta = iso => {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

const aviso = (contenedor, texto, tipo = 'ok') => {
  $(contenedor).innerHTML = `<div class="alerta alerta--${tipo}">${texto}</div>`;
  setTimeout(() => { $(contenedor).innerHTML = ''; }, 4000);
};

/* ============================================================
   ACCESO
   ============================================================ */
function iniciarAcceso() {
  if (Datos.haySesion()) return mostrarPanel();

  $('#formAcceso').addEventListener('submit', e => {
    e.preventDefault();
    if (Datos.iniciarSesion($('#usuario').value.trim(), $('#clave').value)) {
      mostrarPanel();
    } else {
      aviso('#accesoAlerta', 'Usuario o contraseña incorrectos.', 'error');
    }
  });
}

function mostrarPanel() {
  $('#acceso').hidden = true;
  $('#panel').hidden = false;
  pintarTarifas();
  pintarSelectBloqueo();
  pintarBloqueos();
  pintarReservas();
}

/* ============================================================
   PESTAÑAS
   ============================================================ */
function iniciarPestanas() {
  $$('.panel-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.panel-tab').forEach(t => t.setAttribute('aria-selected', 'false'));
      tab.setAttribute('aria-selected', 'true');
      $$('.vista').forEach(v => { v.hidden = true; });
      $(`#vista-${tab.dataset.vista}`).hidden = false;
    });
  });

  $('#salir').addEventListener('click', () => {
    Datos.cerrarSesion();
    location.reload();
  });
}

/* ============================================================
   TARIFAS
   ============================================================ */
function pintarTarifas() {
  const cuerpo = $('#tablaTarifas tbody');
  cuerpo.innerHTML = Datos.habitaciones(true).map(h => `
    <tr data-id="${h.id}">
      <td data-etiqueta="Habitación"><strong>${h.nombre}</strong><br><small>${h.capacidadTexto}</small></td>
      <td data-etiqueta="Sin desayuno"><input type="number" min="0" step="1000" class="t-sin" value="${h.precioSinDesayuno}"></td>
      <td data-etiqueta="Con desayuno"><input type="number" min="0" step="1000" class="t-con" value="${h.precioConDesayuno}"></td>
      <td data-etiqueta="Unidades"><input type="number" min="0" max="99" class="t-uni" value="${h.unidades}"></td>
      <td data-etiqueta="Visible">
        <label class="interruptor">
          <input type="checkbox" class="t-act" ${h.activa ? 'checked' : ''}>
          <span></span>
        </label>
      </td>
    </tr>
  `).join('');
  actualizarExportado();
}

function guardarTarifas() {
  $$('#tablaTarifas tbody tr').forEach(fila => {
    Datos.guardarHabitacion(fila.dataset.id, {
      precioSinDesayuno: Number($('.t-sin', fila).value) || 0,
      precioConDesayuno: Number($('.t-con', fila).value) || 0,
      unidades: Number($('.t-uni', fila).value) || 0,
      activa: $('.t-act', fila).checked
    });
  });
  actualizarExportado();
  pintarSelectBloqueo();
  aviso('#alertaTarifas', 'Tarifas guardadas. Recarga la página pública para verlas.');
}

function actualizarExportado() {
  $('#exportado').value = Datos.exportarPrecios();
}

/* ============================================================
   DISPONIBILIDAD
   ============================================================ */
function pintarSelectBloqueo() {
  $('#bHabitacion').innerHTML = Datos.habitaciones(true)
    .map(h => `<option value="${h.id}">${h.nombre}</option>`).join('');
}

function pintarBloqueos() {
  const lista = Datos.habitaciones(true);
  const hayAlguno = lista.some(h => (h.bloqueos || []).length);

  $('#listaBloqueos').innerHTML = !hayAlguno
    ? '<p class="vacio">No hay fechas bloqueadas. Todas las habitaciones activas se pueden reservar.</p>'
    : lista.filter(h => (h.bloqueos || []).length).map(h => `
      <article class="bloqueo">
        <h3>${h.nombre}</h3>
        <ul>
          ${h.bloqueos.map((b, i) => `
            <li>
              <span><strong>${fechaCorta(b.desde)} → ${fechaCorta(b.hasta)}</strong>${b.nota ? ' · ' + b.nota : ''}</span>
              <button class="enlace-borrar" type="button" data-hab="${h.id}" data-i="${i}">Quitar</button>
            </li>`).join('')}
        </ul>
      </article>`).join('');
}

function iniciarBloqueos() {
  $('#formBloqueo').addEventListener('submit', e => {
    e.preventDefault();
    const id = $('#bHabitacion').value;
    const desde = $('#bDesde').value;
    const hasta = $('#bHasta').value;

    if (!desde || !hasta || hasta <= desde) {
      return aviso('#alertaBloqueo', 'La fecha final debe ser posterior a la inicial.', 'error');
    }
    const h = Datos.habitacion(id);
    const bloqueos = [...(h.bloqueos || []), { desde, hasta, nota: $('#bNota').value.trim() }];
    Datos.guardarHabitacion(id, { bloqueos });
    $('#formBloqueo').reset();
    pintarBloqueos();
    aviso('#alertaBloqueo', 'Fechas bloqueadas.');
  });

  $('#listaBloqueos').addEventListener('click', e => {
    const btn = e.target.closest('.enlace-borrar');
    if (!btn) return;
    const h = Datos.habitacion(btn.dataset.hab);
    const bloqueos = (h.bloqueos || []).filter((_, i) => i !== Number(btn.dataset.i));
    Datos.guardarHabitacion(h.id, { bloqueos });
    pintarBloqueos();
  });
}

/* ============================================================
   RESERVAS
   ============================================================ */
function pintarReservas() {
  const lista = Datos.reservas();
  $('#listaReservas').innerHTML = !lista.length
    ? '<p class="vacio">Todavía no hay solicitudes registradas en este equipo.</p>'
    : lista.map(r => `
      <article class="reserva-item es-${r.estado}">
        <header>
          <div>
            <h3>${r.nombre}</h3>
            <p>${r.codigo} · ${r.habitacionNombre}</p>
          </div>
          <span class="etiqueta">${r.estado}</span>
        </header>
        <dl>
          <div><dt>Entrada</dt><dd>${fechaCorta(r.entrada)}</dd></div>
          <div><dt>Salida</dt><dd>${fechaCorta(r.salida)}</dd></div>
          <div><dt>Noches</dt><dd>${r.noches}</dd></div>
          <div><dt>Huéspedes</dt><dd>${r.adultos} adultos · ${r.ninos} niños</dd></div>
          <div><dt>Desayuno</dt><dd>${r.desayuno ? 'Incluido' : 'No incluido'}</dd></div>
          <div><dt>Total</dt><dd>${pesos(r.total)}</dd></div>
          <div><dt>Contacto</dt><dd>${r.telefono}<br>${r.correo}</dd></div>
          ${r.comentarios ? `<div><dt>Comentarios</dt><dd>${r.comentarios}</dd></div>` : ''}
        </dl>
        <footer>
          <button class="btn btn--primario" type="button" data-accion="confirmada" data-codigo="${r.codigo}">Confirmar</button>
          <button class="btn btn--borde" type="button" data-accion="cancelada" data-codigo="${r.codigo}">Cancelar</button>
          <button class="btn btn--borde" type="button" data-accion="eliminar" data-codigo="${r.codigo}">Eliminar</button>
        </footer>
      </article>`).join('');
}

function iniciarReservasPanel() {
  $('#listaReservas').addEventListener('click', e => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const { accion, codigo } = btn.dataset;

    if (accion === 'eliminar') {
      if (confirm('¿Eliminar esta solicitud? No se puede deshacer.')) Datos.eliminarReserva(codigo);
    } else {
      Datos.actualizarReserva(codigo, { estado: accion });
    }
    pintarReservas();
  });

  $('#exportarCsv').addEventListener('click', () => {
    const lista = Datos.reservas();
    if (!lista.length) return;
    const cabecera = ['Codigo','Estado','Nombre','Correo','Telefono','Habitacion','Entrada','Salida','Noches','Adultos','Ninos','Desayuno','Total','Comentarios'];
    const filas = lista.map(r => [
      r.codigo, r.estado, r.nombre, r.correo, r.telefono, r.habitacionNombre,
      r.entrada, r.salida, r.noches, r.adultos, r.ninos,
      r.desayuno ? 'Si' : 'No', r.total, (r.comentarios || '').replace(/[\r\n;]/g, ' ')
    ]);
    const csv = '\uFEFF' + [cabecera, ...filas].map(f => f.join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-tuvalu-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ============================================================
   ARRANQUE
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  iniciarAcceso();
  iniciarPestanas();
  iniciarBloqueos();
  iniciarReservasPanel();

  $('#guardarTarifas').addEventListener('click', guardarTarifas);

  $('#copiar').addEventListener('click', async () => {
    $('#exportado').select();
    try {
      await navigator.clipboard.writeText($('#exportado').value);
      aviso('#alertaTarifas', 'Copiado. Pégalo en js/config.js.');
    } catch {
      document.execCommand('copy');
    }
  });

  $('#restablecer').addEventListener('click', () => {
    if (!confirm('Se descartan los cambios hechos aquí y vuelven los valores de config.js. ¿Continuar?')) return;
    Datos.restablecer();
    pintarTarifas();
    pintarBloqueos();
    aviso('#alertaTarifas', 'Listo, se restablecieron los valores de config.js.');
  });
});
