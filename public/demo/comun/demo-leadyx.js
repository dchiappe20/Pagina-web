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
    { id: 'encargado', titulo: 'Representante expositor', detalle: 'Empresa expositora en un evento ajeno: suma a su equipo y captura en su stand.' },
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

  // Los de sql/95 («Permisos de rol») van como los trae cada rol por defecto.
  var P95 = ['leads.capturar', 'leads.sin_evento', 'leads.editar_propios', 'leads.mover', 'ia.usar', 'correos.enviar', 'kpis.ver', 'networking.usar'];
  var PERMISOS = {
    admin: ['usuarios.gestionar', 'equipos.gestionar', 'empresa.configurar', 'plantillas.gestionar', 'documentos.gestionar',
      'eventos.gestionar', 'leads.ver_todos', 'leads.editar_todos', 'leads.eliminar', 'leads.exportar', 'kpis.empresa', 'stands.gestionar'].concat(P95),
    teamlead: ['equipo.liderar', 'leads.exportar', 'eventos.gestionar'].concat(P95),
    usuario: ['leads.exportar'].concat(P95),
    encargado: ['expositores.equipo', 'leads.ver_todos', 'leads.editar_todos', 'leads.exportar', 'kpis.empresa'].concat(P95),
    expositor: ['leads.exportar', 'kpis.empresa'].concat(P95),
  };
  var ROL_CORE = { admin: 'admin', teamlead: 'seller', usuario: 'user', encargado: 'user', expositor: 'user' };
  var ROL_NOMBRE = { admin: 'Admin', teamlead: 'Team Lead', usuario: 'Usuario', encargado: 'Representante expositor', expositor: 'Usuario expositor' };

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
          temperatura: ['caliente', 'tibio', 'frio', null][i % 4], origen: i % 3 === 0 ? 'qr' : i % 7 === 0 ? 'excel' : 'manual',
          documentos_ids: i % 2 ? ['d0000000-0000-4000-8000-000000000001'] : [],
        };
      });

// ── KPIs (sql/67 y sql/88), calculados sobre los leads de la demo
      function kpisDemo(alcance, evento) {
        var puede = alcance === 'mios' || (alcance === 'equipo' && (rol === 'admin' || rol === 'teamlead')) || (alcance === 'empresa' && (rol === 'admin' || rol === 'encargado'));
        if (!puede) throw Object.assign(new Error('No tienes acceso a estos KPIs'), { code: '42501' });
        var gente = alcance === 'mios' ? [yo] : alcance === 'equipo' ? (esExpo ? capturadores : [U.teamlead, U.usuario]) : capturadores;
        var ids = gente.map(function (g) { return g.id; });
        var ls = leads.filter(function (l) { return ids.indexOf(l.perfil_id) >= 0 && (!evento || l.evento_id === evento); });
        var hoy = x.iso(0).slice(0, 10);
        var lleno = function (v) { return String(v || '').trim() !== ''; };
        var cuenta = function (f) { return ls.filter(f).length; };
        var filas = gente.map(function (g) {
          var m = leads.filter(function (l) { return l.perfil_id === g.id; });
          var dias = {}; m.forEach(function (l) { var d = l.created_at.slice(0, 10); dias[d] = (dias[d] || 0) + 1; });
          return { perfil_id: g.id, nombre: nombreCompleto(g), equipo_id: g === U.usuario2 ? EQ_SUR : EQ_NORTE, equipo_nombre: g === U.usuario2 ? 'Equipo Sur' : 'Equipo Norte',
            total: m.length, hoy: m.filter(function (l) { return l.created_at.slice(0, 10) === hoy; }).length, semana: m.length,
            con_email: m.filter(function (l) { return lleno(l.email); }).length, agradecidos: m.filter(function (l) { return l.correo_estado === 'enviado'; }).length,
            eventos: 2, dias_activos: Object.keys(dias).length, mejor_dia: Math.max.apply(null, [0].concat(Object.keys(dias).map(function (k) { return dias[k]; }))),
            ultimo: m.length ? m[m.length - 1].created_at : null };
        });
        var horas = {}; ls.forEach(function (l) { var h = Number(l.created_at.slice(11, 13)); horas[h] = (horas[h] || 0) + 1; });
        var top = function (campo) {
          var m = {}; ls.forEach(function (l) { if (lleno(l[campo])) m[l[campo]] = (m[l[campo]] || 0) + 1; });
          return Object.keys(m).map(function (k) { return { nombre: k, n: m[k] }; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 6);
        };
        var porEv = {}; ls.forEach(function (l) { porEv[l.evento_id] = (porEv[l.evento_id] || 0) + 1; });
        var detalle = {
          total: ls.length, hoy: cuenta(function (l) { return l.created_at.slice(0, 10) === hoy; }),
          por_hora: Object.keys(horas).map(function (h) { return { h: Number(h), n: horas[h] }; }).sort(function (a, b) { return a.h - b.h; }),
          ritmo: 3.4, ritmo_equipo: alcance === 'mios' ? 2.9 : undefined, minutos_entre: 11.5,
          calidad: { con_email: cuenta(function (l) { return lleno(l.email); }), con_telefono: cuenta(function (l) { return lleno(l.telefono); }),
            con_cargo: cuenta(function (l) { return lleno(l.cargo); }), con_nota: cuenta(function (l) { return lleno(l.descripcion); }),
            completos: cuenta(function (l) { return lleno(l.email) && lleno(l.telefono) && lleno(l.cargo) && lleno(l.descripcion); }),
            con_fotos: 0, con_docs: cuenta(function (l) { return (l.documentos_ids || []).length > 0; }) },
          temperatura: { caliente: cuenta(function (l) { return l.temperatura === 'caliente'; }), tibio: cuenta(function (l) { return l.temperatura === 'tibio'; }),
            frio: cuenta(function (l) { return l.temperatura === 'frio'; }), sin: cuenta(function (l) { return !l.temperatura; }) },
          origen: { qr: cuenta(function (l) { return l.origen === 'qr'; }), manual: cuenta(function (l) { return l.origen === 'manual'; }),
            excel: cuenta(function (l) { return l.origen === 'excel'; }), sin: 0 },
          embudo: { con_email: cuenta(function (l) { return lleno(l.email); }), agradecidos: cuenta(function (l) { return l.correo_estado === 'enviado'; }),
            entregados: Math.round(ls.length * 0.68), abiertos: Math.round(ls.length * 0.41), rebotados: 1, con_envio: Math.round(ls.length * 0.35), bajas: 1 },
          cargos: top('cargo'), empresas: top('empresa'),
          personas: filas.map(function (f) {
            var m = ls.filter(function (l) { return l.perfil_id === f.perfil_id; });
            return { id: f.perfil_id, nombre: f.nombre, total: m.length, con_email: m.length,
              completos: m.filter(function (l) { return lleno(l.descripcion); }).length, calientes: m.filter(function (l) { return l.temperatura === 'caliente'; }).length };
          }).sort(function (a, b) { return b.total - a.total; }),
          eventos: eventos.filter(function (e) { return !e.es_bandeja && porEv[e.id]; }).map(function (e, i) {
            return { id: e.id, nombre: e.nombre, fecha: e.fecha, leads: porEv[e.id], costo: i === 0 ? 1800000 : null, personas: gente.length, peak: 11 + i };
          }),
          documentos: [{ nombre: 'Catálogo 2026.pdf', n: 9 }, { nombre: 'Ficha técnica chancadores.pdf', n: 4 }],
          envios: [{ nombre: 'Seguimiento post feria', enviados: 14, errores: 1 }, { nombre: 'Invitación a demo', enviados: 6, errores: 0 }],
          meta_diaria: 12, puede_ajustar: rol === 'admin',
          networking: { invitaciones: 6, aceptadas: 4, conexiones: 5, reuniones: 3, reuniones_pendientes: 1 },
        };
        if (alcance === 'empresa' && !esExpo) {
          detalle.expositoras = [
            { empresa: 'TecnoSur Ltda.', evento: 'Expo Minería Andina 2026', personas: 2, max_personas: 5, leads: 18, ultimo: x.iso(0) },
            { empresa: 'Hidráulica Pacífico', evento: 'Expo Minería Andina 2026', personas: 1, max_personas: 3, leads: 0, ultimo: null },
          ];
        }
        return { filas: filas, detalle: detalle };
      }
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
        { id: 'p0000000-0000-4000-8000-000000000002', empresa_id: empresaId, nombre: 'Seguimiento de la feria', tipo: 'instantaneo',
          asunto: '¿Pudiste revisar nuestra propuesta?', cuerpo: 'Hola {nombre},\n\nTe escribimos para saber si pudiste revisar la información que te enviamos después de {evento}.\n\nQuedamos atentos.',
          activa: true, created_at: x.iso(-28) },
        // Tipos quitados el 04-11-2026 (periódico e invitaciones): siguen en la
        // base y la app los oculta. Están aquí para probar que no rompen nada.
        { id: 'p0000000-0000-4000-8000-000000000005', empresa_id: empresaId, nombre: 'Seguimiento a 7 días', tipo: 'periodico',
          asunto: '¿Pudiste revisar nuestra propuesta?', cuerpo: 'Hola {nombre},\n\nTe escribimos de nuevo después de {evento}.',
          frecuencia: 'dias', cada_dias: 7, hora: 9, activa: true, created_at: x.iso(-27) },
        { id: 'p0000000-0000-4000-8000-000000000003', empresa_id: empresaId, nombre: 'Invitar a representante expositor', tipo: 'invitar_lider',
          asunto: '{empresa} es expositora en {evento}', cuerpo: 'Hola {nombre},\n\n{empresa} ha sido registrada como empresa expositora en el evento {evento} y tú has sido asignado(a) como representante para capturar los leads de su stand, junto a los {expositores} expositores de tu equipo.\n\nPara capturar leads, descarga Leadyx desde {enlace} e ingresa con el usuario y password que te indicamos abajo.',
          firma: 'Un saludo,\n{mi_empresa}', activa: true, created_at: x.iso(-20) },
        { id: 'p0000000-0000-4000-8000-000000000004', empresa_id: empresaId, nombre: 'Invitación a nuevo hoster', tipo: 'invitar_anfitrion',
          asunto: '{hoster} es hoster con {mi_empresa}', cuerpo: 'Hola {nombre},\n\n{hoster} ha sido registrado como hoster de sus eventos con {mi_empresa} y tú has sido asignado(a) como representante para capturar los leads de esos eventos, y para sumar a las {personas} personas de tu equipo.\n\nPara capturar leads, descarga Leadyx desde {enlace} e ingresa con el usuario y password que te indicamos abajo.',
          firma: 'Un saludo,\n{mi_empresa}', activa: true, created_at: x.iso(-20) },
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
        { usuario_id: 'n0000000-0000-4000-8000-000000000007', nombre: 'Paula Henríquez', cargo: 'Jefa de Abastecimiento', empresa: 'Minera Centinela', industria: 'Minería', pais: 'Chile', que_ofrece: 'Contratos de suministro', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000008', nombre: 'Tomás Aguirre', cargo: 'Gerente de Proyectos', empresa: 'Andes Montajes', industria: 'Construcción', pais: 'Chile', que_ofrece: 'Montaje industrial', en_linea: true },
        { usuario_id: 'n0000000-0000-4000-8000-000000000009', nombre: 'Valentina Soto', cargo: 'Subgerenta de Ventas', empresa: 'TecnoSur', industria: 'Tecnología', pais: 'Chile', que_ofrece: 'Software de mantenimiento', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000010', nombre: 'Andrés Palma', cargo: 'Director Comercial', empresa: 'Frío Austral', industria: 'Logística', pais: 'Argentina', que_ofrece: 'Cadena de frío', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000011', nombre: 'Camila Rojas', cargo: 'Ingeniera de Procesos', empresa: 'Cobre Norte', industria: 'Minería', pais: 'Chile', que_ofrece: 'Optimización de plantas', en_linea: true },
        { usuario_id: 'n0000000-0000-4000-8000-000000000012', nombre: 'Felipe Vargas', cargo: 'Jefe de Mantenimiento', empresa: 'Energía del Sur', industria: 'Energía', pais: 'Chile', que_ofrece: 'Servicios de subestaciones', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000013', nombre: 'Isidora Molina', cargo: 'Product Manager', empresa: 'AgroVal', industria: 'Agroindustria', pais: 'Perú', que_ofrece: 'Fertilizantes de precisión', en_linea: false },
        { usuario_id: 'n0000000-0000-4000-8000-000000000014', nombre: 'Rodrigo Tapia', cargo: 'Socio', empresa: 'Consultora Tapia', industria: 'Servicios', pais: 'Chile', que_ofrece: 'Asesoría en compras', en_linea: true },
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
        expositora_id: X1, evento_id: COPIA, evento: 'Expo Minería Andina 2026', organizador: 'Andes Industrial SpA', origen: 'gatheryx',
        rol: rol === 'encargado' ? 'encargado' : 'usuario', primer_dia: x.dia(0), ultimo_dia: x.dia(4), empezo: true, vigente: true,
      }] : [];
      // ── Datos de la empresa (sql/104, 04-11-2026). La expositora todavía no
      //    tiene industria ni «qué ofrecemos»: su representante entra editándolos.
      var DE = esExpo
        ? { id: empresaId, nombre: empresa, rut: '76543210-3', logo_url: null, industria: null, que_ofrece: null }
        : { id: empresaId, nombre: empresa, rut: '76111222-8', logo_url: null, industria: 'Minería', que_ofrece: 'Equipos y repuestos para la gran minería, con servicio técnico en terreno.' };
      var datosEmpresa = function () {
        var faltan = [];
        if (!DE.industria) faltan.push('industria');
        if (!DE.que_ofrece) faltan.push('que_ofrece');
        return { id: DE.id, nombre: DE.nombre, rut: DE.rut, logo_url: DE.logo_url, industria: DE.industria, que_ofrece: DE.que_ofrece,
          puedo_editar: rol === 'admin' || rol === 'encargado', faltan: faltan, por: null };
      };
      var estadoDeUso = {
        empresa_id: empresaId, es_stand: false, vence_en: null, dias_restantes: null, modo_lector: false, organizador: esExpo ? 'Andes Industrial SpA' : null,
        puede_stands: rol === 'admin', puede_configurar_qr: rol === 'admin',
        lectura_qr: { activa: rol === 'admin', origen: 'propia', tipo: 'gatheryx', nombre: 'Gatheryx de Andes', pista: '…7f3a', trae_eventos: true },
        plan: acceso.plan, es_expositor: esExpo, solo_expositora: esExpo, gestiona_eventos_gx: true, expositora: usoExpo,
      };
      // ── Mi perfil (sql/105). Con localStorage rd_demo_sin_nombre = 1 se prueba
      //    la ventana de nombre obligatorio.
      var sinNombre = localStorage.getItem('rd_demo_sin_nombre') === '1';
      var miPerfil = {
        id: yo.id, email: yo.email, nombre: sinNombre ? null : yo.nombre, apellido: sinNombre ? null : yo.apellido,
        nombre_completo: sinNombre ? null : nombreCompleto(yo),
        cargo: perfilNet.cargo, telefono: perfilNet.telefono, pais: perfilNet.pais, foto_ruta: null,
        rol: ROL_CORE[rol], estado: 'activo', password_definida: true, empresa_id: empresaId, empresa: empresa, logo_url: null,
      };
      if (sinNombre) { acceso.nombre = null; acceso.apellido = null; acceso.nombre_completo = null; }
      // Lo que hace la base al cambiar el nombre: lo parte por el primer espacio y Networking lo copia.
      var fijarNombre = function (n) {
        var limpio = String(n || '').trim().replace(/\s+/g, ' ');
        var i = limpio.indexOf(' ');
        miPerfil.nombre = i < 0 ? limpio : limpio.slice(0, i);
        miPerfil.apellido = i < 0 ? null : limpio.slice(i + 1);
        miPerfil.nombre_completo = limpio;
        acceso.nombre = miPerfil.nombre; acceso.apellido = miPerfil.apellido; acceso.nombre_completo = limpio;
        perfilNet.nombre = limpio;
        localStorage.removeItem('rd_demo_sin_nombre');
        return miPerfil;
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
          actualizar_mi_nombre: function (a) { return fijarNombre(a.p_nombre); },
          guardar_mi_perfil: function (a) {
            fijarNombre(a.p_nombre);
            miPerfil.cargo = a.p_cargo || null; miPerfil.telefono = a.p_telefono || null; miPerfil.pais = a.p_pais || null;
            perfilNet.cargo = miPerfil.cargo || ''; perfilNet.telefono = miPerfil.telefono || ''; perfilNet.pais = miPerfil.pais || '';
            return miPerfil;
          },
          fijar_mi_foto: function (a) { miPerfil.foto_ruta = a.p_ruta || null; perfilNet.foto_ruta = miPerfil.foto_ruta; return miPerfil; },
          estado_de_uso: function () { return estadoDeUso; },
          datos_de_mi_empresa: function () { return datosEmpresa(); },
          guardar_datos_mi_empresa: function (a) {
            DE.nombre = a.p_nombre; DE.rut = String(a.p_rut || '').replace(/[^0-9kK]/g, '').replace(/^(\d+)([0-9kK])$/, '$1-$2').toUpperCase();
            DE.industria = a.p_industria || null; DE.que_ofrece = a.p_que_ofrece || null;
            return datosEmpresa();
          },
          fijar_logo_mi_empresa: function (a) { DE.logo_url = a.p_ruta ? DE.logo_url : null; return datosEmpresa(); },
          // La participación del expositor (llega de Gatheryx desde el 04-11-2026), para Equipo expositor.
          mis_participaciones: function () {
            return esExpo ? [{
              expositora_id: X1, rol: rol === 'encargado' ? 'encargado' : 'usuario', empresa: empresa, organizador: 'Andes Industrial SpA',
              origen: 'gatheryx', gx_evento_id: 'g0000000-0000-4000-8000-000000000002', lx_espejo_id: COPIA, evento: 'Expo Minería Andina 2026',
              ultimo_dia: x.dia(4), vigente: true, max_personas: 5, personas: 2,
            }] : [];
          },
          visibilidad_leads: function () { return rol === 'admin' || rol === 'encargado' ? 'todos' : rol === 'teamlead' ? 'equipo' : 'mios'; },
          version_disponible: function () { return { hay_actualizacion: false }; },
          notas_de_version: function () { return []; },
          historial_de_notas: function () { return []; },
          mi_plan: function () { return { codigo: acceso.plan, nombre: esExpo ? 'Expositora' : 'Empresa', limites: acceso.limites, metricas: [], funciones: [] }; },
          cupo_de_app: function () { return { usados: 4, tope: 10 }; },
          puedo_seguir: function () { return true; },
          permiso_tl: function () { return rol === 'admin' || rol === 'teamlead'; },
          permiso_user: function () { return true; },
          permisos_efectivos: function () { return PERMISOS[rol]; },
          // Permisos del rol Usuario (sql/95), para Mi empresa → Permisos (02-11-2026).
          permisos_ajustables: function () {
            if (rol !== 'admin') return [];
            var p = function (clave, nombre, descripcion, grupo, activo) { return { clave: clave, nombre: nombre, descripcion: descripcion, grupo: grupo, activo: activo, por_defecto: activo }; };
            return [{ rol: 'user', rol_nombre: 'Usuario', permisos: [
              p('leads.capturar', 'Capturar leads', 'Escanear o escribir leads en los eventos.', 'Captura', true),
              p('leads.sin_evento', 'Capturar sin evento', 'Guardar leads fuera de un evento.', 'Captura', true),
              p('leads.mover', 'Mover leads de evento', 'Pasar un lead a otro evento.', 'Captura', true),
              p('ia.usar', 'Dictado con IA', 'Dictar el comentario del lead.', 'Captura', true),
              p('leads.ver_todos', 'Ver todos los leads', 'Ver los leads de toda la empresa.', 'Eventos y leads', false),
              p('leads.editar_todos', 'Editar leads de otros', 'Cambiar leads que capturó otra persona.', 'Eventos y leads', false),
              p('leads.exportar', 'Exportar a planilla', 'Bajar los leads a Excel.', 'Eventos y leads', true),
              p('kpis.ver', 'Ver KPIs', 'Ver las cifras de captura.', 'Cifras', true),
            ] }];
          },
          ajustar_permiso_rol: function () { return null; },
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
          kpis_agregados: function (a) { return kpisDemo(a.p_alcance).filas; },
          kpis_detalle: function (a) { return kpisDemo(a.p_alcance, a.p_evento).detalle; },
          fijar_meta_diaria: function () { return null; },
          fijar_costo_evento: function () { return null; },
          envios_del_evento: function () { return []; },
          qr_eventos_para_llevar: function () { return []; },
          qr_para_llevar: function () { return []; },
          mis_conexiones_gx: function () { return []; },
          mis_invitaciones_gx: function () { return []; },
          resumen_evento_gx: function () { return null; },
          // Networking
          // Con localStorage rd_demo_sin_net = 1 se prueba la primera vez en Networking (sql/106).
          net_estado: function () {
            perfilNet.industria = DE.industria || ''; perfilNet.que_ofrece = DE.que_ofrece || '';
            return { modo_lector: false,
              cuenta: { nombre: miPerfil.nombre_completo, email: yo.email, cargo: miPerfil.cargo, telefono: miPerfil.telefono, pais: miPerfil.pais, foto_ruta: miPerfil.foto_ruta },
              empresa: { id: empresaId, nombre: DE.nombre, industria: DE.industria, que_ofrece: DE.que_ofrece, logo_ruta: null, logo_url: DE.logo_url, por: nombreCompleto(yo), por_mi: true, puedo_editar: rol === 'admin' || rol === 'encargado' },
              perfil: localStorage.getItem('rd_demo_sin_net') === '1' ? null : perfilNet, cargos: ['Gerenta Comercial', 'Ejecutivo de Ventas'], conexiones: 3, invitaciones: 2, avisos_sin_leer: 2, reuniones: 1, solicitudes_reunion: 1 };
          },
          net_activar_perfil: function () { localStorage.removeItem('rd_demo_sin_net'); return null; },
          net_fijar_visible: function (a) {
            var col = { email: 'ver_email', telefono: 'ver_telefono', eventos: 'ver_eventos', cargo: 'ver_cargo', industria: 'ver_industria', pais: 'ver_pais', ofrece: 'ver_ofrece' }[a.p_campo];
            perfilNet[col] = !!a.p_visible; return null;
          },
          net_fijar_portada: function (a) { perfilNet.portada_fondo = a.p_fondo; perfilNet.portada_imagen = a.p_imagen; perfilNet.portada_tamano = a.p_tamano; return null; },
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
          net_directorio: function (a) {
            var sinTildes = function (s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
            var q = sinTildes(a.p_busqueda).split(/\s+/).filter(Boolean);
            var filas = gente.map(function (g, i) {
              return Object.assign({}, g, { relacion: i < 3 ? 'conectado' : i === 3 ? 'recibida' : i === 4 ? 'enviada' : 'ninguna',
                conexion_id: i < 3 ? CX[i] : null, evento_comun: i % 2 ? 'Expo Minería Andina 2026' : null, eventos_comunes: i % 2 ? 1 : 0 });
            }).filter(function (g) {
              var texto = sinTildes([g.nombre, g.empresa, g.cargo, g.que_ofrece].join(' '));
              return q.every(function (w) { return texto.indexOf(w) >= 0; })
                && (!a.p_industria || sinTildes(g.industria).indexOf(a.p_industria) >= 0)
                && (!a.p_mis_eventos || !!g.evento_comun);
            });
            var desde = a.p_desde || 0;
            return filas.slice(desde, desde + (a.p_limite || 40)).map(function (g) { return Object.assign(g, { total: filas.length }); });
          },
          net_sugeridos: function (a) { return gente.slice(3, 3 + (a.p_limite || 6)); },
          net_persona: function (a) {
            if (a.p_usuario === yo.id) {
              return Object.assign({ usuario_id: yo.id, nombre: miPerfil.nombre_completo, cargo: perfilNet.ver_cargo ? miPerfil.cargo : null, empresa: DE.nombre, industria: perfilNet.ver_industria ? DE.industria : null,
                pais: perfilNet.ver_pais ? miPerfil.pais : null, que_ofrece: perfilNet.ver_ofrece ? DE.que_ofrece : null, foto_ruta: miPerfil.foto_ruta, logo_ruta: null, logo_url: DE.logo_url, en_linea: true,
                visto_en: null, yo: true, relacion: 'ninguna', conexion_id: null, mensaje: null, invitado_en: null, email: yo.email,
                portada_fondo: perfilNet.portada_fondo || 'rayas', portada_imagen: perfilNet.portada_imagen || null, portada_tamano: perfilNet.portada_tamano || 1,
                telefono: perfilNet.telefono, eventos: eventosRed.map(function (e) { return Object.assign({ comun: false }, e); }), privado: false, ver_eventos: true });
            }
            var g = gente.filter(function (p) { return p.usuario_id === a.p_usuario; })[0] || gente[0];
            var i = gente.indexOf(g);
            return Object.assign({}, g, { portada_fondo: ['puntos', 'rejilla', 'circulos', 'franjas', 'liso'][i % 5], portada_imagen: null, portada_tamano: 1, visto_en: x.iso(-1), yo: false, relacion: i < 3 ? 'conectado' : i === 3 ? 'recibida' : i === 4 ? 'enviada' : 'ninguna',
              conexion_id: i < 3 ? CX[i] : null, mensaje: i === 3 ? 'Hola, me gustaría conversar sobre equipamiento para nuestra clínica.' : null,
              invitado_en: i === 3 ? x.iso(-1) : null, email: i < 3 ? g.nombre.split(' ')[0].toLowerCase() + '@demo.cl' : null,
              telefono: null, eventos_comunes: [eventosRed[0]], eventos: eventosRed.map(function (e, j) { return Object.assign({ comun: j === 0 }, e); }) });
          },
          net_mis_eventos: function () { return eventosRed; },
          net_eventos_comunes: function () { return [eventosRed[0]]; },
          net_mis_bloques: function (a) {
            if (a.p_origen === 'gatheryx') return [{ id: 'b3', dia: x.dia(9), hora_inicio: '10:00:00', hora_fin: '10:30:00', ocupado: true }, { id: 'b4', dia: x.dia(9), hora_inicio: '12:00:00', hora_fin: '12:30:00', ocupado: false }];
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
              { id: 'm3', sentido: 'recibida', estado: 'aceptada', elige: 'invitado', origen: 'gatheryx', evento_id: 'g0000000-0000-4000-8000-000000000001', evento: 'Seminario Logística 4.0',
                dia: x.dia(9), hora_inicio: '10:00:00', hora_fin: '10:30:00', punto_encuentro: 'Lobby del hotel', usuario_id: gente[2].usuario_id, nombre: gente[2].nombre,
                cargo: gente[2].cargo, empresa: gente[2].empresa, foto_ruta: null, logo_ruta: null, logo_url: null, telefono: null, comparto_telefono: false, creado_en: x.iso(-1) },
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
