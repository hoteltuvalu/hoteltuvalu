/* ============================================================
   HOTEL TUVALÚ — CONFIGURACIÓN CENTRAL
   ------------------------------------------------------------
   ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS EDITAR PARA CAMBIAR
   textos de contacto, precios, habitaciones, fotos y el modo
   en que llegan las reservas al hotel.
   ============================================================ */

/* ---------- 1. DATOS DEL HOTEL ---------- */
const HOTEL = {
  nombre: 'Hotel Tuvalu',
  ciudad: 'Paipa, Boyacá',
  pais: 'Colombia',

  // Reemplaza los corchetes por los datos reales del hotel
  direccion: '[DIRECCIÓN DEL HOTEL]',
  telefono: '[TELÉFONO DEL HOTEL]',          // Se muestra tal cual en pantalla
  telefonoLink: '[TELEFONO_SIN_ESPACIOS]',   // Ej: '+573001234567' (para el enlace tel:)
  whatsapp: '[WHATSAPP_SIN_ESPACIOS]',       // Ej: '573001234567' (sin + ni espacios)
  correo: '[CORREO DEL HOTEL]',              // Ej: 'reservas@hoteltuvalu.com'
  horario: 'Recepción abierta las 24 horas', // [EDITABLE]

  // Mensaje con el que se abre WhatsApp desde el botón flotante
  whatsappMensaje: 'Hola, quiero información sobre el Hotel Tuvalu.',

  redes: {
    instagram: '#', // Reemplaza por la URL real o deja '#'
    facebook: '#',
    tiktok: ''      // Vacío = no se muestra
  },

  // Pega aquí el enlace "Insertar mapa" de Google Maps (atributo src del iframe).
  // Si lo dejas vacío se muestra un recuadro con instrucciones.
  mapaEmbed: '',
  // Enlace del botón "Cómo llegar"
  mapaComoLlegar: 'https://www.google.com/maps/dir/?api=1&destination=Paipa+Boyaca+Colombia',

  moneda: 'COP'
};

/* ---------- 2. ¿CÓMO LLEGAN LAS RESERVAS AL HOTEL? ----------
   modo: 'demo'       → No envía nada. Solo muestra el resumen en pantalla (para probar).
         'formsubmit' → Envía la reserva al correo del hotel sin servidor propio.
                        Usa https://formsubmit.co (gratis). Pasos:
                        1) Pon modo: 'formsubmit'
                        2) Escribe el correo real en HOTEL.correo
                        3) Envía UNA reserva de prueba: llegará un correo de
                           FormSubmit pidiendo confirmar. Haz clic y listo.
         'emailjs'    → Envía por EmailJS (necesita cuenta y las 3 claves de abajo).

   En cualquier modo, el huésped siempre puede enviar el resumen por WhatsApp
   desde la pantalla de confirmación (respaldo recomendado).
------------------------------------------------------------- */
const ENVIO = {
  modo: 'demo',

  // Solo para modo 'emailjs'
  emailjs: {
    publicKey: '[EMAILJS_PUBLIC_KEY]',
    serviceId: '[EMAILJS_SERVICE_ID]',
    templateId: '[EMAILJS_TEMPLATE_ID]'
  },

  // Copia visible del asunto que recibirá el hotel
  asunto: 'Nueva solicitud de reserva — Hotel Tuvalu'
};

/* ---------- 3. HABITACIONES ----------
   Para agregar una habitación nueva, copia un bloque completo
   y cambia el id, el nombre, la foto y los precios.
   precioSinDesayuno / precioConDesayuno: valor por noche en pesos (solo números).
   unidades: cuántas habitaciones de ese tipo existen (para la disponibilidad).
   NOTA: estos valores son los de fábrica. Si usas el módulo administrativo
   (panel.html), los cambios que hagas allí mandan sobre estos.
------------------------------------------------------------- */
const HABITACIONES = [
  {
    id: 'sencilla',
    nombre: 'Habitación Sencilla',
    foto: 'images/habitacion-1.svg',      // [FOTOGRAFÍA] reemplazar por images/habitacion-1.jpg
    descripcion: 'Un espacio tranquilo y bien iluminado, pensado para quien viaja solo o por trabajo.',
    descripcionLarga: 'Habitación cómoda y silenciosa, con lo necesario para descansar después de recorrer Paipa. [TEXTO EDITABLE]',
    capacidad: 1,
    capacidadTexto: '1 persona',
    cama: '[TIPO DE CAMA]',
    metros: '[M²]',
    precioSinDesayuno: 0,                 // [PRECIO] por noche sin desayuno, ej: 150000
    precioConDesayuno: 0,                 // [PRECIO] por noche con desayuno, ej: 175000
    unidades: 1,                          // cuántas habitaciones de este tipo tiene el hotel
    activa: true,                         // false = no se muestra ni se puede reservar
    caracteristicas: ['Wi-Fi', 'Baño privado', 'Agua caliente', 'TV']
  },
  {
    id: 'doble',
    nombre: 'Habitación Doble',
    foto: 'images/habitacion-2.svg',
    descripcion: 'Ideal para parejas o para dos viajeros que comparten el plan.',
    descripcionLarga: 'Habitación amplia con espacio para dos huéspedes y zona para descansar. [TEXTO EDITABLE]',
    capacidad: 2,
    capacidadTexto: '2 personas',
    cama: '[TIPO DE CAMA]',
    metros: '[M²]',
    precioSinDesayuno: 0,
    precioConDesayuno: 0,
    unidades: 1,
    activa: true,
    caracteristicas: ['Wi-Fi', 'Baño privado', 'Agua caliente', 'TV', 'Clóset']
  },
  {
    id: 'triple',
    nombre: 'Habitación Triple',
    foto: 'images/habitacion-3.svg',
    descripcion: 'Espacio adicional para grupos pequeños o familias que viajan juntas.',
    descripcionLarga: 'Habitación con capacidad para tres huéspedes, cómoda para estadías de varios días. [TEXTO EDITABLE]',
    capacidad: 3,
    capacidadTexto: '3 personas',
    cama: '[TIPO DE CAMA]',
    metros: '[M²]',
    precioSinDesayuno: 0,
    precioConDesayuno: 0,
    unidades: 1,
    activa: true,
    caracteristicas: ['Wi-Fi', 'Baño privado', 'Agua caliente', 'TV', 'Escritorio']
  },
  {
    id: 'familiar',
    nombre: 'Habitación Familiar',
    foto: 'images/habitacion-4.svg',
    descripcion: 'La opción más amplia, pensada para familias que quieren estar juntas.',
    descripcionLarga: 'Habitación amplia para familias, con espacio de sobra para el equipaje y los niños. [TEXTO EDITABLE]',
    capacidad: 4,
    capacidadTexto: 'Hasta 4 personas',
    cama: '[TIPO DE CAMA]',
    metros: '[M²]',
    precioSinDesayuno: 0,
    precioConDesayuno: 0,
    unidades: 1,
    activa: true,
    caracteristicas: ['Wi-Fi', 'Baño privado', 'Agua caliente', 'TV', 'Espacio familiar']
  }
];

/* ---------- 4. SERVICIOS ----------
   'confirmado: false' marca el servicio como pendiente de confirmar
   y lo muestra con una nota discreta. Cámbialo a true cuando lo confirmes.
------------------------------------------------------------- */
const SERVICIOS = [
  { icono: 'wifi',       titulo: 'Wi-Fi',                texto: 'Conexión disponible en las habitaciones y zonas comunes.', confirmado: true },
  { icono: 'recepcion',  titulo: 'Recepción',            texto: '[HORARIO DE RECEPCIÓN EDITABLE]', confirmado: true },
  { icono: 'cama',       titulo: 'Habitaciones cómodas', texto: 'Espacios limpios y silenciosos para descansar de verdad.', confirmado: true },
  { icono: 'atencion',   titulo: 'Atención al huésped',  texto: 'Te ayudamos a organizar tus planes en Paipa.', confirmado: true },
  { icono: 'ubicacion',  titulo: 'Ubicación',            texto: 'A pocos minutos de los principales atractivos de Paipa.', confirmado: true },
  { icono: 'parqueo',    titulo: 'Estacionamiento',      texto: '[CONFIRMAR DISPONIBILIDAD DE PARQUEADERO]', confirmado: false }
];

/* ---------- 5. GALERÍA ----------
   categoria: 'habitaciones' | 'comunes' | 'fachada' | 'entorno'
------------------------------------------------------------- */
const GALERIA = [
  { src: 'images/galeria-1.svg',  alt: 'Habitación del Hotel Tuvalu',        categoria: 'habitaciones' },
  { src: 'images/galeria-2.svg',  alt: 'Detalle de habitación',              categoria: 'habitaciones' },
  { src: 'images/galeria-3.svg',  alt: 'Zona común del hotel',               categoria: 'comunes' },
  { src: 'images/galeria-4.svg',  alt: 'Recepción del hotel',                categoria: 'comunes' },
  { src: 'images/galeria-5.svg',  alt: 'Fachada del Hotel Tuvalu',           categoria: 'fachada' },
  { src: 'images/galeria-6.svg',  alt: 'Entrada principal',                  categoria: 'fachada' },
  { src: 'images/galeria-7.svg',  alt: 'Paisaje de Paipa',                   categoria: 'entorno' },
  { src: 'images/galeria-8.svg',  alt: 'Lago Sochagota',                     categoria: 'entorno' },
  { src: 'images/galeria-9.svg',  alt: 'Alrededores del hotel',              categoria: 'entorno' },
  { src: 'images/galeria-10.svg', alt: 'Baño de habitación',                 categoria: 'habitaciones' }
];

/* ---------- 6. QUÉ HAY CERCA (Descubre Paipa) ----------
   Deja 'distancia' como texto editable: no pongas datos que no hayas verificado.
------------------------------------------------------------- */
const LUGARES = [
  { foto: 'images/lugar-1.svg', nombre: 'Lago Sochagota',   texto: 'Caminatas, paseos en bote y atardeceres sobre el agua.', distancia: '[DISTANCIA]' },
  { foto: 'images/lugar-2.svg', nombre: 'Termales de Paipa', texto: 'Aguas termales, el plan más conocido de la región.',     distancia: '[DISTANCIA]' },
  { foto: 'images/lugar-3.svg', nombre: 'Pantano de Vargas', texto: 'Monumento y escenario histórico de Boyacá.',             distancia: '[DISTANCIA]' },
  { foto: 'images/lugar-4.svg', nombre: 'Centro de Paipa',   texto: 'Parque principal, artesanías y gastronomía boyacense.',  distancia: '[DISTANCIA]' }
];

/* ---------- 7. DESAYUNO Y MÓDULO ADMINISTRATIVO ---------- */
const DESAYUNO = {
  activo: true,                    // false = no se ofrece la opción en el formulario
  etiqueta: 'Incluir desayuno',
  detalle: 'Desayuno servido en el hotel para todos los huéspedes de la habitación.',
  marcadoPorDefecto: false
};

/* Acceso al panel en panel.html.
   AVISO: esta clave solo evita que alguien entre por curiosidad; no es
   seguridad real, porque todo corre en el navegador. Cuando conectes una
   base de datos, el acceso debe validarse en el servidor. */
const ADMIN = {
  usuario: 'admin',
  clave: 'tuvalu2026'              // cámbiala antes de publicar el sitio
};
