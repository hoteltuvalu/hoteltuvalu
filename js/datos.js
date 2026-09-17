/* ============================================================
   HOTEL TUVALU — CAPA DE DATOS
   ------------------------------------------------------------
   Une lo que está en config.js (valores de fábrica) con los
   cambios guardados desde el módulo administrativo (panel.html).

   Hoy los cambios del panel se guardan en el navegador
   (localStorage). Eso significa:
     · Sirven para que la recepción lleve el control y pruebe precios.
     · NO viajan a los visitantes del sitio hasta que copies los
       valores al archivo config.js (el panel tiene un botón para eso)
       o conectes una base de datos.
   Todo el acceso a datos pasa por aquí, así que el día que conectes
   un backend solo hay que cambiar este archivo.
   ============================================================ */

const Datos = (() => {
  const CLAVE_DATOS   = 'tuvalu:datos';
  const CLAVE_RESERVAS = 'tuvalu:reservas';
  const CLAVE_SESION   = 'tuvalu:sesion';

  /* ---------- Lectura y escritura base ---------- */
  function leer(clave, porDefecto) {
    try {
      const crudo = localStorage.getItem(clave);
      return crudo ? JSON.parse(crudo) : porDefecto;
    } catch (e) {
      console.warn('No se pudo leer el almacenamiento local:', e);
      return porDefecto;
    }
  }

  function escribir(clave, valor) {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
      return true;
    } catch (e) {
      console.warn('No se pudo guardar:', e);
      return false;
    }
  }

  /* ---------- Habitaciones ----------
     Devuelve las habitaciones de config.js con los cambios del panel
     aplicados encima (precios, unidades, activa, bloqueos de fechas).
  --------------------------------------------------------------- */
  function habitaciones(incluirInactivas = false) {
    const cambios = leer(CLAVE_DATOS, {});
    const lista = HABITACIONES.map(h => {
      const c = cambios[h.id] || {};
      return {
        ...h,
        precioSinDesayuno: c.precioSinDesayuno ?? h.precioSinDesayuno ?? 0,
        precioConDesayuno: c.precioConDesayuno ?? h.precioConDesayuno ?? 0,
        unidades: c.unidades ?? h.unidades ?? 1,
        activa: c.activa ?? h.activa ?? true,
        bloqueos: c.bloqueos ?? []   // [{ desde:'YYYY-MM-DD', hasta:'YYYY-MM-DD', nota:'' }]
      };
    });
    return incluirInactivas ? lista : lista.filter(h => h.activa);
  }

  function habitacion(id) {
    return habitaciones(true).find(h => h.id === id);
  }

  /** Guarda los cambios de una habitación hechos desde el panel. */
  function guardarHabitacion(id, cambios) {
    const datos = leer(CLAVE_DATOS, {});
    datos[id] = { ...(datos[id] || {}), ...cambios };
    return escribir(CLAVE_DATOS, datos);
  }

  function restablecer() {
    localStorage.removeItem(CLAVE_DATOS);
  }

  /* ---------- Disponibilidad ----------
     Una habitación no está disponible si:
       · está desactivada, o
       · hay un bloqueo manual que se cruza con las fechas, o
       · ya hay tantas reservas confirmadas cruzadas como unidades tiene.
     Las noches se cuentan de entrada (incluida) a salida (excluida),
     así que una salida el día 10 no choca con una entrada el día 10.
  --------------------------------------------------------------- */
  function seCruzan(aEntrada, aSalida, bEntrada, bSalida) {
    return aEntrada < bSalida && bEntrada < aSalida;
  }

  function disponibilidad(id, entrada, salida) {
    const h = habitacion(id);
    if (!h) return { disponible: false, motivo: 'La habitación no existe.' };
    if (!h.activa) return { disponible: false, motivo: 'Esta habitación no está disponible por ahora.' };
    if (!entrada || !salida) return { disponible: true, motivo: '' };

    const choque = (h.bloqueos || []).find(b => seCruzan(entrada, salida, b.desde, b.hasta));
    if (choque) {
      return { disponible: false, motivo: 'La habitación está ocupada o en mantenimiento en esas fechas.' };
    }

    const ocupadas = reservas()
      .filter(r => r.habitacion === id && r.estado === 'confirmada')
      .filter(r => seCruzan(entrada, salida, r.entrada, r.salida))
      .length;

    if (ocupadas >= h.unidades) {
      return { disponible: false, motivo: 'No quedan habitaciones de este tipo en esas fechas.' };
    }
    return { disponible: true, motivo: '', libres: h.unidades - ocupadas };
  }

  /* ---------- Reservas ---------- */
  function reservas() {
    return leer(CLAVE_RESERVAS, []);
  }

  function agregarReserva(reserva) {
    const lista = reservas();
    lista.unshift({ ...reserva, estado: 'pendiente', creada: new Date().toISOString() });
    return escribir(CLAVE_RESERVAS, lista);
  }

  function actualizarReserva(codigo, cambios) {
    const lista = reservas().map(r => (r.codigo === codigo ? { ...r, ...cambios } : r));
    return escribir(CLAVE_RESERVAS, lista);
  }

  function eliminarReserva(codigo) {
    return escribir(CLAVE_RESERVAS, reservas().filter(r => r.codigo !== codigo));
  }

  /* ---------- Sesión del panel ---------- */
  function iniciarSesion(usuario, clave) {
    const ok = usuario === ADMIN.usuario && clave === ADMIN.clave;
    if (ok) sessionStorage.setItem(CLAVE_SESION, '1');
    return ok;
  }
  function haySesion() { return sessionStorage.getItem(CLAVE_SESION) === '1'; }
  function cerrarSesion() { sessionStorage.removeItem(CLAVE_SESION); }

  /* ---------- Exportar para pegar en config.js ---------- */
  function exportarPrecios() {
    return habitaciones(true).map(h =>
      `  { id: '${h.id}', precioSinDesayuno: ${h.precioSinDesayuno}, precioConDesayuno: ${h.precioConDesayuno}, unidades: ${h.unidades}, activa: ${h.activa} }`
    ).join(',\n');
  }

  return {
    habitaciones, habitacion, guardarHabitacion, restablecer,
    disponibilidad,
    reservas, agregarReserva, actualizarReserva, eliminarReserva,
    iniciarSesion, haySesion, cerrarSesion,
    exportarPrecios
  };
})();
