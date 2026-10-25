/*
 * demo-leadyx.js — Los datos de prueba de la demo de Leadyx.
 * Empresa ficticia «Andes Industrial SpA» con eventos, leads, equipos,
 * expositoras y Networking (chats, invitaciones, reuniones). Ver
 * demo-supabase.js.
 */
(function () {
  var ROLES = [
    { id: 'admin', titulo: 'Administrador', detalle: 'Ve todo: eventos, leads de la empresa, equipos, plantillas, expositoras y KPIs.' },
    { id: 'teamlead', titulo: 'Team Lead', detalle: 'Lidera su equipo: ve los leads de su gente y reparte eventos.' },
    { id: 'usuario', titulo: 'Usuario', detalle: 'Captura leads en terreno y ve los suyos.' },
    { id: 'encargado', titulo: 'Encargado expositor', detalle: 'Empresa expositora en un evento ajeno: suma a su equipo y captura en su stand.' },
    { id: 'expositor', titulo: 'Usuario expositor', detalle: 'Integrante de una empresa expositora: captura leads sólo en su evento.' },
  ];

  var EMP = 'e0000000-0000-4000-8000-000000000001';
  var EMP_EXPO = 'e0000000-0000-4000-8000-000000000002';
  var U = {
    admin: { id: 'a0000000-0000-4000-8000-000000000001', email: 'daniela.rojas@andesindustrial.cl', nombre: 'Daniela', apellido: 'Rojas' },
    teamlead: { id: 'a0000000-0000-4000-8000-000000000002', email: 'martin.soto@andesindustrial.cl', nombre: 'Martín', apellido: 'Soto' },
    usuario: { id: 'a0000000-0000-4000-8000-000000000003', email: 'camila.perez@andesindustrial.cl', nombre: 'Camila', apellido: 'Pérez' },
    usuario2: { id: 'a0000000-0000-4000-8000-000000000004', email: 'jorge.lagos@andesindustrial.cl', nombre: 'Jorge', apellido: 'Lagos' },
    encargado: { id: 'a0000000-0000-4000-8000-000000000005', email: 'andres.munoz@tecnosur.cl', nombre: 'Andrés', apellido: 'Muñoz' },
    expositor: { id: 'a0000000-0000-4000-8000-000000000006', email: 'valentina.diaz@tecnosur.cl', nombre: 'Valentina', apellido: 'Díaz' },
  };
  var EQ_NORTE = 'q0000000-0000-4000-8000-000000000001';
  var EQ_SUR = 'q0000000-0000-4000-8000-000000000002';

  var PERMISOS = {
    admin: ['usuarios.gestionar', 'equipos.gestionar', 'empresa.configurar', 'plantillas.gestionar', 'documentos.gestionar',
      'eventos.gestionar', 'leads.ver_todos', 'leads.editar_todos', 'leads.eliminar', 'leads.exportar', 'kpis.empresa', 'stands.gestionar'],
    teamlead: ['equipo.liderar', 'leads.exportar', 'eventos.gestionar'],
    usuario: ['leads.exportar'],
    encargado: ['expositores.equipo', 'leads.ver_todos', 'leads.editar_todos', 'leads.exportar', 'kpis.empresa'],
    expositor: ['leads.exportar', 'kpis.empresa'],
  };
  var ROL_CORE = { admin: 'admin', teamlead: 'seller', usuario: 'user', encargado: 'user', expositor: 'user' };
  var ROL_NOMBRE = { admin: 'Admin', teamlead: 'Team Lead', usuario: 'Usuario', encargado: 'Encargado expositor', expositor: 'Usuario expositor' };

  function nombreCompleto(u) { return u.nombre + ' ' + u.apellido; }

  window.RendAppsDemo.iniciar({
    app: 'leadyx',
    nombre: 'Leadyx',
    inicial: 'L',
    base: '/demo/leadyx',
    acento: '#A78BFA',
    fondo: 'radial-gradient(1200px 600px at 20% 0%, #2a1f4d 0%, #0d0b16 60%)',
    roles: ROLES,
    datos: function (rol, x) {
      var esExpo = rol === 'encargado' || rol === 'expositor';
      var yo = U[rol];
      var empresaId = esExpo ? EMP_EXPO : EMP;
      var empresa = esExpo ? 'TecnoSur Ltda.' : 'Andes Industrial SpA';

      // ── Eventos (de la empresa organizadora)
      var EV1 = 'v0000000-0000-4000-8000-000000000001';
      var EV2 = 'v0000000-0000-4000-8000-000000000002';
      var EV3 = 'v0000000-0000-4000-8000-000000000003';
      var EV_GX = 'v0000000-0000-4000-8000-000000000004';
      var BANDEJA = 'v0000000-0000-4000-8000-000000000009';
      var COPIA = 'v0000000-0000-4000-8000-000000000010'; // la copia del evento en la empresa expositora
      var X1 = 'x0000000-0000-4000-8000-000000000001';

      var eventos = esExpo ? [
        { id: COPIA, nombre: 'Expo Minería Andina 2026', ubicacion: 'Espacio Riesco, Huechuraba', fecha: x.dia(0), hora_inicio: '09:00:00',
          fecha_termino: x.dia(1), hora_termino: '19:00:00', tematica: 'Minería, maquinaria y servicios', empresa_id: EMP_EXPO,
          es_bandeja: false, expositora_id: X1, gx_evento_id: null, archivado: false, created_at: x.iso(-20) },
        { id: BANDEJA, nombre: 'Leads sin evento', es_bandeja: true, empresa_id: EMP_EXPO, fecha: null, archivado: false, created_at: x.iso(-60) },
      ] : [
        { id: EV1, nombre: 'Expo Minería Andina 2026', ubicacion: 'Espacio Riesco, Huechuraba', fecha: x.dia(0), hora_inicio: '09:00:00',
          fecha_termino: x.dia(1), hora_termino: '19:00:00', tematica: 'Minería, maquinaria y servicios', empresa_id: EMP,
          es_bandeja: false, expositora_id: null, gx_evento_id: null, equipo_creador: EQ_NORTE, archivado: false, created_at: x.iso(-20) },
        { id: EV2, nombre: 'Feria Agro Sur', ubicacion: 'Parque Saval, Valdivia', fecha: x.dia(-25), hora_inicio: '10:00:00',
          fecha_termino: x.dia(-23), hora_termino: '18:00:00', tematica: 'Agroindustria', empresa_id: EMP,
          es_bandeja: false, expositora_id: null, gx_evento_id: null, equipo_creador: EQ_SUR, archivado: false, created_at: x.iso(-50) },
        { id: EV3, nombre: 'Congreso Salud Digital', ubicacion: 'CasaPiedra, Vitacura', fecha: x.dia(18), hora_inicio: '08:30:00',
          fecha_termino: x.dia(19), hora_termino: '18:30:00', tematica: 'Tecnología en salud', empresa_id: EMP,
          es_bandeja: false, expositora_id: null, gx_evento_id: null, equipo_creador: null, archivado: false, created_at: x.iso(-5) },
        { id: EV_GX, nombre: 'Seminario Logística 4.0', ubicacion: 'Hotel W, Las Condes', fecha: x.dia(9), hora_inicio: '09:00:00',
          fecha_termino: x.dia(9), hora_termino: '14:00:00', tematica: 'Logística y última milla', empresa_id: EMP,
          es_bandeja: false, expositora_id: null, gx_evento_id: 'g0000000-0000-4000-8000-000000000001', archivado: false, created_at: x.iso(-3) },
        { id: BANDEJA, nombre: 'Leads sin evento', es_bandeja: true, empresa_id: EMP, fecha: null, archivado: false, created_at: x.iso(-60) },
      ];
      var eventoActivo = esExpo ? eventos[0] : eventos[0];

      // ── Perfiles (para los nombres de quien capturó)
      var perfiles = Object.keys(U).map(function (k) {
        return { id: U[k].id, nombre_completo: nombreCompleto(U[k]), email: U[k].email, rol: ROL_CORE[k] || 'user' };
      });

      // ── Leads
      var personas = [
        ['Ignacio Fuentes', 'Minera Los Bronces', 'Jefe de Mantención', 'Necesita repuestos para chancadores. Pidió cotización por correo.'],
        ['Francisca Herrera', 'Codelco División Andina', 'Compradora Senior', 'Interesada en contrato marco anual.'],
        ['Rodrigo Valenzuela', 'Komatsu Cummins', 'Gerente Comercial', 'Posible alianza para distribución en el norte.'],
        ['Paula Contreras', 'Antofagasta Minerals', 'Ingeniera de Procesos', 'Quiere demo en faena en diciembre.'],
        ['Sebastián Reyes', 'Finning Chile', 'Product Manager', 'Comparar con su proveedor actual.'],
        ['Catalina Morales', 'SQM', 'Jefa de Abastecimiento', 'Licitación en enero: enviar ficha técnica.'],
        ['Tomás Araya', 'Sandvik', 'Key Account', 'Contacto para integración de sensores.'],
        ['María José Silva', 'Anglo American', 'Analista de Compras', 'Pidió catálogo completo.'],
        ['Felipe Navarro', 'Metso', 'Ingeniero de Ventas', ''],
        ['Josefa Castillo', 'Teck', 'Coordinadora HSEC', 'Le interesan los EPP certificados.'],
        ['Diego Espinoza', 'Minera Escondida', 'Superintendente', 'Volver a llamar el lunes.'],
        ['Antonia Vargas', 'Enaex', 'Jefa de Logística', ''],
        ['Matías Rojas', 'Agrícola San Clemente', 'Gerente General', 'Riego tecnificado para 40 hectáreas.'],
        ['Constanza Pino', 'Viña Concha y Toro', 'Jefa de Operaciones', 'Visitar bodega en Pirque.'],
        ['Benjamín Torres', 'Agrosuper', 'Comprador', 'Pidió precios por volumen.'],
        ['Isidora Medina', 'Hortifrut', 'Encargada de Calidad', ''],
        ['Vicente Sepúlveda', 'Watt\'s', 'Jefe de Planta', 'Mantención preventiva de cámaras de frío.'],
        ['Florencia Ruiz', 'Clínica Alemana', 'Directora TI', 'Agendar reunión para Salud Digital.'],
        ['Cristóbal Soto', 'Red Salud', 'Jefe de Proyectos', ''],
        ['Agustina León', 'Laboratorio Chile', 'Gerenta de Marketing', 'Quiere stand compartido.'],
        ['Joaquín Muñoz', 'Minera Centinela', 'Planificador', 'Cotizar repuestos urgentes.'],
        ['Renata Gómez', 'ENAMI', 'Ingeniera Senior', ''],
        ['Lucas Fernández', 'Atlas Copco', 'Gerente de Servicio', 'Interés en contrato de soporte 24/7.'],
        ['Emilia Carrasco', 'Chilquinta', 'Analista', 'Datos para newsletter.'],
        ['Martina Ortiz', 'Ferreteria Weitzler', 'Compradora', 'Pidió muestras.'],
        ['Gabriel Bravo', 'Minera Spence', 'Jefe de Turno', ''],
      ];
      var capturadores = esExpo ? [U.encargado, U.expositor] : [U.admin, U.teamlead, U.usuario, U.usuario2];
      var leads = personas.map(function (p, i) {
        var evento = esExpo ? COPIA : (i < 12 || i >= 20 ? EV1 : i < 17 ? EV2 : EV3);
        var quien = capturadores[i % capturadores.length];
        var diasAtras = evento === EV2 ? -24 : evento === EV3 ? -2 : (i % 3 === 0 ? -1 : 0);
        var mail = p[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z ]/g, '').split(' ');
        return {
          id: 'l' + String(i + 1).padStart(7, '0') + '-0000-4000-8000-000000000000',
          nombre_completo: p[0], empresa: p[1], cargo: p[2], descripcion: p[3],
          telefono: '+569' + (71000000 + i * 37913 % 28999999),
          email: mail[0] + '.' + mail[mail.length - 1] + '@' + p[1].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '').slice(0, 14) + '.cl',
          evento_id: evento, perfil_id: quien.id, fotos_urls: [],
          correo_estado: i % 4 === 0 ? 'pendiente' : 'enviado', correo_enviado_at: i % 4 === 0 ? null : x.iso(diasAtras, '12:00'),
          correo_error: null, created_at: x.iso(diasAtras, (9 + (i % 9)) + ':' + String((i * 7) % 60).padStart(2, '0')),
          empresa_id: empresaId,
        };
      });

      // ── Equipos
      var equipos = [
        { id: EQ_NORTE, nombre: 'Zona Norte', empresa_id: EMP, lider_id: U.teamlead.id, integrantes: 3, created_at: x.iso(-90) },
        { id: EQ_SUR, nombre: 'Zona Sur', empresa_id: EMP, lider_id: null, integrantes: 1, created_at: x.iso(-80) },
      ];

      // ── Expositoras (organizador)
      var expositoras = [
        { id: X1, empresa: 'TecnoSur Ltda.', rut: '76.543.210-3', encargado_email: U.encargado.email, encargado_nombre: nombreCompleto(U.encargado),
          encargado_sin_clave: false, personas: 2, max_personas: 5, origen: 'leadyx', created_at: x.iso(-15) },
        { id: 'x0000000-0000-4000-8000-000000000002', empresa: 'Hidráulica Pacífico', rut: '77.123.456-7', encargado_email: 'contacto@hidraulicapacifico.cl',
          encargado_nombre: 'Lorena Fuentes', encargado_sin_clave: true, personas: 1, max_personas: 3, origen: 'leadyx', created_at: x.iso(-6) },
        { id: 'x0000000-0000-4000-8000-000000000003', empresa: 'Seguridad Minera Norte', rut: '76.888.120-K', encargado_email: 'ventas@segminera.cl',
          encargado_nombre: 'Pablo Tapia', encargado_sin_clave: false, personas: 4, max_personas: 5, origen: 'leadyx', created_at: x.iso(-9) },
      ];

      // ── Plantillas y documentos
      var plantillas = [
        { id: 'p0000000-0000-4000-8000-000000000001', empresa_id: empresaId, nombre: 'Agradecimiento por visitar el stand', tipo: 'agradecimiento',
          asunto: 'Gracias por visitarnos en {evento}', cuerpo: 'Hola {nombre},\n\nFue un gusto conversar contigo en {evento}. Te dejamos nuestro catálogo y quedamos atentos.\n\nSaludos,\n{remitente}',
          activa: true, created_at: x.iso(-30) },
        { id: 'p0000000-0000-4000-8000-000000000002', empresa_id: empresaId, nombre: 'Seguimiento a 7 días', tipo: 'seguimiento',
          asunto: '¿Pudiste revisar nuestra propuesta?', cuerpo: 'Hola {nombre},\n\nTe escribimos para saber si pudiste revisar la información que te enviamos después de {evento}.\n\nQuedamos atentos.',
          activa: true, created_at: x.iso(-28) },
      ];
      var documentos = [
        { id: 'd0000000-0000-4000-8000-000000000001', empresa_id: empresaId, evento_id: null, nombre: 'Catálogo 2026.pdf', ruta: 'demo/catalogo.pdf', tamano: 2480000, created_at: x.iso(-40) },
        { id: 'd0000000-0000-4000-8000-000000000002', empresa_id: empresaId, evento_id: EV1, nombre: 'Ficha técnica chancadores.pdf', ruta: 'demo/ficha.pdf', tamano: 830000, created_at: x.iso(-10) },
      ];

      // ── Networking
      var gente = [
        { usuario_id: 'n0000000-0000-4000-8000-000000000001', nombre: 'Carolina Ibáñez', cargo: 'Gerenta Comercial', empresa: 'Minera Los Bronces', industria: 'Minería', pais: 'Chile', que_ofrece: 'Compras de repuestos y servicios', en_linea: true },
        { usuario_id: 'n0000000-0000-4000-8000-000000000002', nombre: 'Héctor Salinas', cargo: 'Director de Operaciones', empresa: 'Logística Austral', industria: 'Logística', pais: 'Chile', que_ofrece: 'Transporte y bodegaje', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000003', nombre: 'Natalia Cerda', cargo: 'Product Owner', empresa: 'AgroData', industria: 'Agroindustria', pais: 'Chile', que_ofrece: 'Sensores de riego', en_linea: true },
        { usuario_id: 'n0000000-0000-4000-8000-000000000004', nombre: 'Esteban Rivas', cargo: 'Jefe de Compras', empresa: 'Clínica Santa María', industria: 'Salud', pais: 'Chile', que_ofrece: 'Equipamiento médico', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000005', nombre: 'Lucía Figueroa', cargo: 'CEO', empresa: 'Kallpa Energía', industria: 'Energía', pais: 'Perú', que_ofrece: 'Soluciones solares', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000006', nombre: 'Marco Bustos', cargo: 'Key Account Manager', empresa: 'Hidráulica Pacífico', industria: 'Industrial', pais: 'Chile', que_ofrece: 'Bombas y válvulas', en_linea: true },
      ].map(function (g) { return Object.assign({ foto_ruta: null, logo_ruta: null, logo_url: null }, g); });
      var CX = ['c0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000003'];
      var chats = [
        { cx: CX[0], p: gente[0], msgs: [
          [false, 'Hola! Te vi en la charla de la mañana. ¿Tienen repuestos para chancadores cónicos?', -1, '10:02'],
          [true, '¡Hola Carolina! Sí, trabajamos con Metso y Sandvik. ¿Qué modelo tienen en faena?', -1, '10:05'],
          [false, 'Un HP400 y dos MP800. Necesitamos cotizar revestimientos.', -1, '10:07'],
          [true, 'Perfecto. Te armo una propuesta y te la mando hoy en la tarde.', -1, '10:10'],
          [false, 'Genial. ¿Pasas por nuestro stand mañana? Estamos en el pabellón B.', 0, '09:12'],
          [true, 'Sí, paso a las 11:30. Llevo las fichas técnicas.', 0, '09:15'],
          [false, 'Te espero 👌', 0, '09:16'],
        ] },
        { cx: CX[1], p: gente[1], msgs: [
          [true, 'Héctor, gusto de conocerte. Te comparto el contacto de nuestra área de despacho.', -3, '16:40'],
          [false, 'Gracias. Estamos buscando un partner para envíos a Antofagasta, ¿hacen eso?', -3, '17:02'],
          [true, 'Sí, salimos dos veces por semana. ¿Agendamos una reunión en el seminario?', -2, '09:30'],
          [false, 'Dale, ya te mandé la solicitud de reunión.', -2, '09:45'],
        ] },
        { cx: CX[2], p: gente[2], msgs: [
          [false, '¿Te interesa probar nuestros sensores en alguna faena?', -6, '12:00'],
          [true, 'Puede ser para un cliente agrícola. ¿Tienen piloto gratuito?', -6, '12:20'],
          [false, 'Sí, 30 días sin costo. Te envío el formulario.', -5, '08:10'],
        ] },
      ];
      var mensajes = {};
      chats.forEach(function (c) {
        mensajes[c.cx] = c.msgs.map(function (m, i) {
          var t = x.iso(m[2], m[3]);
          return { id: c.cx.slice(0, 9) + 'm' + i, mio: m[0], tipo: 'texto', texto: m[1], audio_ruta: null, audio_segundos: null,
            transcripcion: null, enviado_en: t, recibido_en: t, leido_en: m[0] ? t : (i === c.msgs.length - 1 && c.cx === CX[0] ? null : t) };
        });
      });
      var perfilNet = {
        usuario_id: yo.id, empresa_id: empresaId, nombre: nombreCompleto(yo), cargo: esExpo ? 'Jefe Comercial' : 'Gerenta Comercial',
        email: yo.email, telefono: '+56 9 7123 4567', industria: esExpo ? 'Tecnología' : 'Industrial', pais: 'Chile',
        que_ofrece: esExpo ? 'Software para faenas mineras' : 'Repuestos y servicios para minería',
        industria_propia: false, ofrece_propia: false, ver_cargo: true, ver_email: true, ver_telefono: false, ver_industria: true,
        ver_pais: true, ver_ofrece: true, foto_ruta: null, acepta_avisos: true, privado: false, ver_eventos: true,
      };
      var eventosRed = [
        { origen: 'leadyx', evento_id: EV1, nombre: 'Expo Minería Andina 2026', desde: x.dia(0), hasta: x.dia(1), hora_inicio: '09:00:00', hora_termino: '19:00:00', ubicacion: 'Espacio Riesco, Huechuraba' },
        { origen: 'gatheryx', evento_id: 'g0000000-0000-4000-8000-000000000001', nombre: 'Seminario Logística 4.0', desde: x.dia(9), hasta: x.dia(9), hora_inicio: '09:00:00', hora_termino: '14:00:00', ubicacion: 'Hotel W, Las Condes' },
      ];

      var acceso = {
        autorizado: true, rol: ROL_CORE[rol], email: yo.email, nombre: yo.nombre, apellido: yo.apellido, nombre_completo: nombreCompleto(yo),
        empresa: empresa, empresa_id: empresaId, logo_url: null, password_definida: true, clave_temporal: false,
        rol_app: rol === 'encargado' ? 'encargado_expositor' : rol === 'expositor' ? 'usuario_expositor' : ROL_CORE[rol],
        rol_nombre: ROL_NOMBRE[rol], permisos: PERMISOS[rol], plan: esExpo ? 'expositora' : 'empresa',
        limites: { usuarios: 10, eventos: null, stands: true, expositoras: 5, correo_automatico: true },
      };
      var usoExpo = esExpo ? [{
        expositora_id: X1, evento_id: COPIA, evento: 'Expo Minería Andina 2026', organizador: 'Andes Industrial SpA', origen: 'leadyx',
        rol: rol === 'encargado' ? 'encargado' : 'usuario', primer_dia: x.dia(0), ultimo_dia: x.dia(4), empezo: true, vigente: true,
      }] : [];
      var estadoDeUso = {
        empresa_id: empresaId, es_stand: false, vence_en: null, dias_restantes: null, modo_lector: false, organizador: esExpo ? 'Andes Industrial SpA' : null,
        puede_stands: rol === 'admin', puede_configurar_qr: rol === 'admin',
        lectura_qr: { activa: rol === 'admin', origen: 'propia', tipo: 'gatheryx', nombre: 'Gatheryx de Andes', pista: '…7f3a', trae_eventos: true },
        plan: acceso.plan, es_expositor: esExpo, solo_expositora: esExpo, gestiona_eventos_gx: true, expositora: usoExpo,
      };
      var miPerfil = {
        id: yo.id, email: yo.email, nombre: yo.nombre, apellido: yo.apellido, nombre_completo: nombreCompleto(yo),
        rol: ROL_CORE[rol], estado: 'activo', password_definida: true, empresa_id: empresaId, empresa: empresa, logo_url: null,
      };
      var miembros = (esExpo ? [U.encargado, U.expositor] : [U.admin, U.teamlead, U.usuario, U.usuario2]).map(function (u, i) {
        var k = Object.keys(U).filter(function (q) { return U[q] === u; })[0];
        return { usuario_id: u.id, id: u.id, email: u.email, nombre: u.nombre, apellido: u.apellido, nombre_completo: nombreCompleto(u),
          estado: 'activo', rol_app: (k === 'usuario2' ? 'user' : ROL_CORE[k]), rol_nombre: ROL_NOMBRE[k] || 'Usuario', rol: ROL_CORE[k] || 'user',
          clave_temporal: i === 3, ultimo_acceso: x.iso(-i), equipo_id: i === 0 ? null : EQ_NORTE, equipo: i === 0 ? null : 'Zona Norte' };
      });
      var conteoLeads = function (ev) { return leads.filter(function (l) { return l.evento_id === ev; }).length; };

      return {
        usuario: { id: yo.id, email: yo.email, nombre: nombreCompleto(yo) },
        antes: function (ls) {
          // El evento activo ya elegido: se entra directo al tablero con cifras.
          ls.setItem('leadyx_evento_activo', JSON.stringify({
            id: eventoActivo.id, nombre: eventoActivo.nombre, fecha: eventoActivo.fecha, hora_inicio: eventoActivo.hora_inicio,
            fecha_termino: eventoActivo.fecha_termino, hora_termino: eventoActivo.hora_termino, ubicacion: eventoActivo.ubicacion, tematica: eventoActivo.tematica,
          }));
        },
        tablas: {
          eventos: eventos, leads: leads, perfiles: perfiles, equipos: equipos, plantillas: plantillas, documentos: documentos,
          evento_equipos: [{ evento_id: EV1, equipo_id: EQ_NORTE }, { evento_id: EV2, equipo_id: EQ_SUR }],
          ajustes: [{ id: 'aj1', empresa_id: empresaId, privacidad: 'empresa', correo_automatico: true, remitente: 'Andes Industrial' }],
          evidencias: [],
        },
        rpc: {
          verificar_acceso_app: function () { return acceso; },
          mi_perfil: function () { return miPerfil; },
          estado_de_uso: function () { return estadoDeUso; },
          mis_participaciones: function () { return []; },
          visibilidad_leads: function () { return rol === 'admin' || rol === 'encargado' ? 'todos' : rol === 'teamlead' ? 'equipo' : 'mios'; },
          version_disponible: function () { return { hay_actualizacion: false }; },
          notas_de_version: function () { return []; },
          historial_de_notas: function () { return []; },
          mi_plan: function () { return { codigo: acceso.plan, nombre: esExpo ? 'Expositora' : 'Empresa', limites: acceso.limites }; },
          cupo_de_app: function () { return { usados: 4, tope: 10 }; },
          puedo_seguir: function () { return true; },
          permiso_tl: function () { return rol === 'admin' || rol === 'teamlead'; },
          permiso_user: function () { return true; },
          permisos_efectivos: function () { return PERMISOS[rol]; },
          mi_equipo: function () { return rol === 'admin' ? null : EQ_NORTE; },
          equipos_de_mi_empresa: function () { return equipos; },
          integrantes_de_mi_equipo: function () { return miembros.slice(1); },
          equipo_de_cada_usuario: function () { return miembros.map(function (m) { return { usuario_id: m.id, equipo_id: m.equipo_id, equipo: m.equipo }; }); },
          equipo_de_app: function () { return miembros; },
          roles_de_app: function () {
            return [
              { id: 'r1', codigo: 'admin', nombre: 'Admin', descripcion: 'Todo en Leadyx', orden: 1 },
              { id: 'r2', codigo: 'seller', nombre: 'Team Lead', descripcion: 'Lidera su equipo', orden: 2 },
              { id: 'r3', codigo: 'user', nombre: 'Usuario', descripcion: 'Captura leads', orden: 3 },
            ];
          },
          eventos_para_expositoras: function () {
            return eventos.filter(function (e) { return !e.es_bandeja; }).map(function (e) {
              return { evento_id: e.id, nombre: e.nombre, fecha: e.fecha, fecha_termino: e.fecha_termino, de_gatheryx: !!e.gx_evento_id,
                terminado: (e.fecha_termino || e.fecha) < x.dia(0), expositoras: e.id === EV1 ? expositoras.length : 0, gestiona: null };
            });
          },
          expositoras_de_evento: function (a) { return a.p_evento === EV1 ? expositoras : []; },
          personas_de_expositora: function () {
            return [
              { usuario_id: U.encargado.id, email: U.encargado.email, nombre_completo: nombreCompleto(U.encargado), rol: 'encargado', sin_clave: false },
              { usuario_id: U.expositor.id, email: U.expositor.email, nombre_completo: nombreCompleto(U.expositor), rol: 'usuario', sin_clave: false },
            ];
          },
          stands_de: function () { return []; },
          kpis_agregados: function () { return null; },
          envios_del_evento: function () { return []; },
          qr_eventos_para_llevar: function () { return []; },
          qr_para_llevar: function () { return []; },
          mis_conexiones_gx: function () { return []; },
          mis_invitaciones_gx: function () { return []; },
          resumen_evento_gx: function () { return null; },
          // Networking
          net_estado: function () {
            return { modo_lector: false, cuenta: { nombre: nombreCompleto(yo), email: yo.email },
              empresa: { id: empresaId, nombre: empresa, industria: perfilNet.industria, que_ofrece: perfilNet.que_ofrece, logo_ruta: null, logo_url: null, por: nombreCompleto(yo), por_mi: true },
              perfil: perfilNet, cargos: ['Gerenta Comercial', 'Ejecutivo de Ventas'], conexiones: 3, invitaciones: 2, avisos_sin_leer: 2, reuniones: 1, solicitudes_reunion: 1 };
          },
          net_sin_leer: function () { return 2; },
          net_chats: function () {
            return chats.map(function (c) {
              var m = mensajes[c.cx], u = m[m.length - 1];
              return { conexion_id: c.cx, usuario_id: c.p.usuario_id, nombre: c.p.nombre, foto_ruta: null, en_linea: c.p.en_linea,
                ultimo_tipo: 'texto', ultimo_texto: u.texto, ultimo_segundos: null, ultimo_mio: u.mio, ultimo_en: u.enviado_en,
                sin_leer: c.cx === CX[0] ? 1 : 0 };
            });
          },
          net_mensajes_de: function (a) { return (mensajes[a.p_conexion] || []).slice().reverse(); },
          net_buscar_mensajes: function (a) {
            return (mensajes[a.p_conexion] || []).filter(function (m) { return (m.texto || '').toLowerCase().indexOf(String(a.p_texto || '').toLowerCase()) >= 0; });
          },
          net_enviar_mensaje: function (a) {
            var m = { id: a.p_id || x.uuid(), mio: true, tipo: a.p_tipo || 'texto', texto: a.p_texto || null, audio_ruta: null, audio_segundos: a.p_segundos || null,
              transcripcion: null, enviado_en: new Date().toISOString(), recibido_en: null, leido_en: null };
            (mensajes[a.p_conexion] = mensajes[a.p_conexion] || []).push(m);
            return [m];
          },
          net_marcar_recibidos: function () { return 0; },
          net_marcar_leidos: function () { return 0; },
          net_conexiones_mias: function () {
            return chats.map(function (c) { return Object.assign({}, c.p, { conexion_id: c.cx, comparte_email: true, comparte_telefono: false, conectado_en: x.iso(-7) }); });
          },
          net_invitaciones: function () {
            return [
              Object.assign({}, gente[3], { conexion_id: 'c0000000-0000-4000-8000-000000000004', sentido: 'recibida', mensaje: 'Hola, me gustaría conversar sobre equipamiento para nuestra clínica.', invitado_en: x.iso(-1, '18:20') }),
              Object.assign({}, gente[4], { conexion_id: 'c0000000-0000-4000-8000-000000000005', sentido: 'enviada', mensaje: null, invitado_en: x.iso(-2, '11:00') }),
            ];
          },
          net_directorio: function () {
            return gente.map(function (g, i) {
              return Object.assign({}, g, { relacion: i < 3 ? 'conectado' : i === 3 ? 'recibida' : i === 4 ? 'enviada' : 'ninguna',
                conexion_id: i < 3 ? CX[i] : null, evento_comun: i % 2 ? 'Expo Minería Andina 2026' : null, eventos_comunes: i % 2 ? 1 : 0, total: gente.length });
            });
          },
          net_sugeridos: function () { return gente.slice(3); },
          net_persona: function (a) {
            if (a.p_usuario === yo.id) {
              return Object.assign({ usuario_id: yo.id, nombre: perfilNet.nombre, cargo: perfilNet.cargo, empresa: empresa, industria: perfilNet.industria,
                pais: 'Chile', que_ofrece: perfilNet.que_ofrece, foto_ruta: null, logo_ruta: null, logo_url: null, en_linea: true,
                visto_en: null, yo: true, relacion: 'ninguna', conexion_id: null, mensaje: null, invitado_en: null, email: yo.email,
                telefono: perfilNet.telefono, eventos: eventosRed.map(function (e) { return Object.assign({ comun: false }, e); }), privado: false, ver_eventos: true });
            }
            var g = gente.filter(function (p) { return p.usuario_id === a.p_usuario; })[0] || gente[0];
            var i = gente.indexOf(g);
            return Object.assign({}, g, { visto_en: x.iso(-1), yo: false, relacion: i < 3 ? 'conectado' : i === 3 ? 'recibida' : i === 4 ? 'enviada' : 'ninguna',
              conexion_id: i < 3 ? CX[i] : null, mensaje: i === 3 ? 'Hola, me gustaría conversar sobre equipamiento para nuestra clínica.' : null,
              invitado_en: i === 3 ? x.iso(-1) : null, email: i < 3 ? g.nombre.split(' ')[0].toLowerCase() + '@demo.cl' : null,
              telefono: null, eventos_comunes: [eventosRed[0]], eventos: eventosRed.map(function (e, j) { return Object.assign({ comun: j === 0 }, e); }) });
          },
          net_mis_eventos: function () { return eventosRed; },
          net_eventos_comunes: function () { return [eventosRed[0]]; },
          net_mis_bloques: function () {
            return [{ id: 'b1', dia: x.dia(0), hora_inicio: '11:00:00', hora_fin: '11:30:00', ocupado: true }, { id: 'b2', dia: x.dia(0), hora_inicio: '15:00:00', hora_fin: '15:30:00', ocupado: false }];
          },
          net_horarios_de: function () {
            return [{ dia: x.dia(1), hora_inicio: '10:00:00', hora_fin: '10:30:00', choca: false }, { dia: x.dia(1), hora_inicio: '16:00:00', hora_fin: '16:30:00', choca: false }];
          },
          net_ofrece_horarios: function () { return true; },
          net_reuniones_mias: function () {
            return [
              { id: 'm1', sentido: 'enviada', estado: 'aceptada', elige: 'invitador', origen: 'leadyx', evento_id: EV1, evento: 'Expo Minería Andina 2026',
                dia: x.dia(0), hora_inicio: '11:30:00', hora_fin: '12:00:00', punto_encuentro: 'Stand B-14', usuario_id: gente[0].usuario_id, nombre: gente[0].nombre,
                cargo: gente[0].cargo, empresa: gente[0].empresa, foto_ruta: null, logo_ruta: null, logo_url: null, telefono: '+56 9 8888 1234', comparto_telefono: true, creado_en: x.iso(-1) },
              { id: 'm2', sentido: 'recibida', estado: 'pendiente', elige: 'invitado', origen: 'gatheryx', evento_id: 'g0000000-0000-4000-8000-000000000001', evento: 'Seminario Logística 4.0',
                dia: null, hora_inicio: null, hora_fin: null, punto_encuentro: null, usuario_id: gente[1].usuario_id, nombre: gente[1].nombre,
                cargo: gente[1].cargo, empresa: gente[1].empresa, foto_ruta: null, logo_ruta: null, logo_url: null, telefono: null, comparto_telefono: false, creado_en: x.iso(-2) },
            ];
          },
          net_campanita: function () {
            return [
              { id: 'av1', tipo: 'mensaje', usuario_id: gente[0].usuario_id, nombre: gente[0].nombre, cargo: gente[0].cargo, empresa: gente[0].empresa, foto_ruta: null, conexion_id: CX[0], creado_en: x.iso(0, '09:16'), leido_en: null },
              { id: 'av2', tipo: 'invitacion', usuario_id: gente[3].usuario_id, nombre: gente[3].nombre, cargo: gente[3].cargo, empresa: gente[3].empresa, foto_ruta: null, conexion_id: 'c0000000-0000-4000-8000-000000000004', creado_en: x.iso(-1, '18:20'), leido_en: null },
              { id: 'av3', tipo: 'reunion', usuario_id: gente[1].usuario_id, nombre: gente[1].nombre, cargo: gente[1].cargo, empresa: gente[1].empresa, foto_ruta: null, conexion_id: CX[1], reunion_id: 'm2', creado_en: x.iso(-2, '09:45'), leido_en: x.iso(-2, '10:00') },
            ];
          },
          net_avisos_mios: function () { return []; },
          net_leer_avisos: function () { return null; },
          net_ia_usos_mios: function () { return { usados: 0, tope: 2 }; },
          net_invitar: function () { return x.uuid(); },
          net_solicitar_reunion: function () { return x.uuid(); },
        },
        funciones: {
          'alta-usuarios': function (b) {
            if (b.accion === 'expositora') return { ok: true, mensaje: 'Listo: ' + (b.nombre || 'la empresa') + ' es expositora (demo: no se envió correo).', correo_enviado: true };
            return { resultados: (b.personas || []).map(function (p) { return { email: p.email, estado: 'creado', mensaje: 'Demo: cuenta creada (sin correo).', correo_enviado: true }; }), agregados: (b.personas || []).length };
          },
          'asistente-app': function () { return { respuesta: 'Soy Jester, el asistente de Leadyx. En esta demo no respondo de verdad, pero en la app te ayudo con cualquier duda de uso.' }; },
          'networking-ia': function () { return { listo: true, que_ofrece: 'Repuestos y servicios para minería', industria: 'Industrial' }; },
          'lectura-qr': function () { return { ok: true, asistente: { nombre: 'Rocío Medina', empresa: 'Minera Centinela', cargo: 'Jefa de Compras', email: 'rocio.medina@centinela.cl', telefono: '+56 9 6123 4455' } }; },
        },
        rpcPorDefecto: function (nombre) { return /^(net_|mis_|lista|eventos|equipos)/.test(nombre) ? [] : null; },
        conteoLeads: conteoLeads,
      };
    },
  });
})();
