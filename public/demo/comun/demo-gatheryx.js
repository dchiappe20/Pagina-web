/*
 * demo-gatheryx.js — Los datos de prueba de la demo de Gatheryx.
 * Productora ficticia «Eventos Cordillera» con eventos, inscritos, acreditados,
 * clientes, plantillas y empresas expositoras. Ver demo-supabase.js.
 */
(function () {
  var ROLES = [
    { id: 'admin', titulo: 'Administrador', detalle: 'Crea y gestiona eventos, clientes, cobros, plantillas y empresas expositoras.' },
    { id: 'usuario', titulo: 'Usuario', detalle: 'Registra y acredita asistentes en el evento.' },
    { id: 'encargado', titulo: 'Encargado expositor', detalle: 'Empresa expositora: registra a sus invitados y suma a su equipo.' },
    { id: 'expositor', titulo: 'Usuario expositor', detalle: 'Integrante de una empresa expositora: registra invitados en su evento.' },
  ];

  var EMP = 'e1000000-0000-4000-8000-000000000001';
  var EMP_EXPO = 'e1000000-0000-4000-8000-000000000002';
  var U = {
    admin: { id: 'b0000000-0000-4000-8000-000000000001', email: 'sofia.vera@eventoscordillera.cl', nombre: 'Sofía', apellido: 'Vera' },
    usuario: { id: 'b0000000-0000-4000-8000-000000000002', email: 'nicolas.pena@eventoscordillera.cl', nombre: 'Nicolás', apellido: 'Peña' },
    usuario2: { id: 'b0000000-0000-4000-8000-000000000003', email: 'fernanda.rios@eventoscordillera.cl', nombre: 'Fernanda', apellido: 'Ríos' },
    encargado: { id: 'b0000000-0000-4000-8000-000000000004', email: 'andres.munoz@tecnosur.cl', nombre: 'Andrés', apellido: 'Muñoz' },
    expositor: { id: 'b0000000-0000-4000-8000-000000000005', email: 'valentina.diaz@tecnosur.cl', nombre: 'Valentina', apellido: 'Díaz' },
  };
  var PERMISOS = {
    admin: ['usuarios.gestionar', 'eventos.gestionar', 'registrados.ver_todos', 'clientes.gestionar', 'datos.exportar',
      'plantillas.gestionar', 'cobros.gestionar', 'expositores.gestionar'],
    usuario: ['registrados.ver_todos'],
    encargado: ['expositores.equipo', 'registrados.ver_todos'],
    expositor: ['registrados.ver_todos'],
  };
  var ROL_CORE = { admin: 'admin', usuario: 'user', encargado: 'user', expositor: 'user' };
  var ROL_NOMBRE = { admin: 'Admin', usuario: 'Usuario', encargado: 'Encargado expositor', expositor: 'Usuario expositor' };
  function nc(u) { return u.nombre + ' ' + u.apellido; }

  window.RendAppsDemo.iniciar({
    app: 'gatheryx',
    nombre: 'Gatheryx',
    inicial: 'G',
    base: '/demo/gatheryx',
    acento: '#4ADE80',
    fondo: 'radial-gradient(1200px 600px at 20% 0%, #10331f 0%, #07110b 60%)',
    roles: ROLES,
    datos: function (rol, x) {
      var esExpo = rol === 'encargado' || rol === 'expositor';
      var yo = U[rol];
      var empresaId = esExpo ? EMP_EXPO : EMP;
      var empresa = esExpo ? 'TecnoSur Ltda.' : 'Eventos Cordillera';

      var EV1 = 'f0000000-0000-4000-8000-000000000001';
      var EV2 = 'f0000000-0000-4000-8000-000000000002';
      var EV3 = 'f0000000-0000-4000-8000-000000000003';
      var X1 = 'y0000000-0000-4000-8000-000000000001';
      var CLI = 'k0000000-0000-4000-8000-000000000001';

      var base = { pais: 'Chile', activo: true, tipo_registro: 'cliente', imagen_url: null, form_usar_imagen: false, form_bg_color: '#0f5132',
        form_campos: null, limite_asistentes: null, limite_acreditacion: null, es_pago: false, precio: null, cobra: null,
        acreditacion_diaria: false, vip_activo: true, vip_con_limite: true, expositores_max_personas: 5, expositores_max_invitados: 10,
        expositoras_en_leadyx: true, empresa_id: EMP };
      var eventos = [
        Object.assign({}, base, { id: EV1, nombre: 'Expo Minería Andina 2026', lugar: 'Espacio Riesco', direccion: 'Av. El Salto 5000, Huechuraba',
          fecha: x.dia(0), fecha_fin: x.dia(1), hora_inicio: '09:00', hora_fin: '19:00', tematica: 'Minería, maquinaria y servicios',
          cliente_id: CLI, created_at: x.iso(-1), acreditacion_diaria: true }),
        Object.assign({}, base, { id: EV2, nombre: 'Seminario Logística 4.0', lugar: 'Hotel W', direccion: 'Isidora Goyenechea 3000, Las Condes',
          fecha: x.dia(9), fecha_fin: null, hora_inicio: '09:00', hora_fin: '14:00', tematica: 'Logística y última milla', cliente_id: null,
          created_at: x.iso(-12), es_pago: true, precio: 25000, cobra: 'productora', vip_activo: false }),
        Object.assign({}, base, { id: EV3, nombre: 'Gala Innovación Sur', lugar: 'Teatro del Lago', direccion: 'Av. Philippi 1000, Frutillar',
          fecha: x.dia(-20), fecha_fin: null, hora_inicio: '19:00', hora_fin: '23:30', tematica: 'Innovación y emprendimiento', cliente_id: null,
          created_at: x.iso(-60), vip_activo: false }),
      ];

      var nombres = ['Ignacio Fuentes', 'Francisca Herrera', 'Rodrigo Valenzuela', 'Paula Contreras', 'Sebastián Reyes', 'Catalina Morales',
        'Tomás Araya', 'María José Silva', 'Felipe Navarro', 'Josefa Castillo', 'Diego Espinoza', 'Antonia Vargas', 'Matías Rojas',
        'Constanza Pino', 'Benjamín Torres', 'Isidora Medina', 'Vicente Sepúlveda', 'Florencia Ruiz', 'Cristóbal Soto', 'Agustina León',
        'Joaquín Muñoz', 'Renata Gómez', 'Lucas Fernández', 'Emilia Carrasco', 'Martina Ortiz', 'Gabriel Bravo', 'Javiera Lillo',
        'Maximiliano Vidal', 'Trinidad Paredes', 'Alonso Figueroa', 'Amanda Cortés', 'Bastián Reyes', 'Rocío Medina', 'Simón Castro'];
      var empresas = ['Minera Los Bronces', 'Codelco', 'Komatsu Cummins', 'Antofagasta Minerals', 'Finning', 'SQM', 'Sandvik', 'Anglo American',
        'Metso', 'Teck', 'Escondida', 'Enaex'];
      var autores = [U.admin.id, U.usuario.id, U.usuario2.id, null];
      var registrados = nombres.map(function (n, i) {
        var ev = i < 24 ? EV1 : i < 30 ? EV2 : EV3;
        var deExpo = ev === EV1 && i >= 20;
        var acreditado = ev === EV3 || (ev === EV1 && i % 3 !== 0);
        var plano = n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(' ');
        return {
          id: 'r' + String(i + 1).padStart(7, '0') + '-0000-4000-8000-000000000000', evento_id: ev, nombre_completo: n,
          rut: (12 + i) + '.' + String(100 + i * 7).padStart(3, '0') + '.' + String(200 + i * 13).padStart(3, '0') + '-' + (i % 9),
          empresa: deExpo ? 'Invitado de TecnoSur Ltda.' : empresas[i % empresas.length], cargo: ['Gerente', 'Jefe de Compras', 'Ingeniero', 'Analista'][i % 4],
          telefono: '+569' + (61000000 + i * 271), email: plano[0] + '.' + plano[plano.length - 1] + '@demo.cl', patente: null,
          ingresado_por: deExpo ? (i % 2 ? U.encargado.id : U.expositor.id) : autores[i % 4], acreditado: acreditado,
          acreditado_at: acreditado ? x.iso(ev === EV3 ? -20 : 0, (9 + (i % 8)) + ':' + String((i * 11) % 60).padStart(2, '0')) : null,
          acreditado_por: acreditado ? autores[i % 3] : null, email_confirmacion_enviado: true, agradecimiento_enviado_at: ev === EV3 ? x.iso(-19) : null,
          created_at: x.iso(ev === EV3 ? -40 : -(i % 10) - 1, '11:00'), codigo: 'G' + String(4821 + i * 37).slice(-5),
          expositora_id: deExpo ? X1 : null, es_vip: deExpo, estado_pago: ev === EV2 ? (i % 2 ? 'pagado' : 'pendiente') : null,
          metodo_pago: ev === EV2 && i % 2 ? 'flow' : null, monto_pagado: ev === EV2 && i % 2 ? 25000 : null,
        };
      });
      if (esExpo) registrados = registrados.filter(function (r) { return r.expositora_id === X1; });

      var acreditaciones = registrados.filter(function (r) { return r.acreditado; }).map(function (r) {
        return { id: x.uuid(), registrado_id: r.id, evento_id: r.evento_id, dia: r.acreditado_at.slice(0, 10), acreditado_por: r.acreditado_por, created_at: r.acreditado_at };
      });
      var perfiles = Object.keys(U).map(function (k) { return { id: U[k].id, nombre_completo: nc(U[k]), email: U[k].email, cambiar_pass: false }; });

      var expositoras = [
        { id: X1, empresa: 'TecnoSur Ltda.', rut: '76.543.210-3', encargado_email: U.encargado.email, encargado_nombre: nc(U.encargado), encargado_sin_clave: false,
          personas: 2, max_personas: 5, invitados: 4, max_invitados: 10, origen: 'gatheryx', created_at: x.iso(-15) },
        { id: 'y0000000-0000-4000-8000-000000000002', empresa: 'Hidráulica Pacífico', rut: '77.123.456-7', encargado_email: 'contacto@hidraulicapacifico.cl',
          encargado_nombre: 'Lorena Fuentes', encargado_sin_clave: true, personas: 1, max_personas: 3, invitados: 0, max_invitados: 10, origen: 'gatheryx', created_at: x.iso(-6) },
        { id: 'y0000000-0000-4000-8000-000000000003', empresa: 'Seguridad Minera Norte', rut: '76.888.120-K', encargado_email: 'ventas@segminera.cl',
          encargado_nombre: 'Pablo Tapia', encargado_sin_clave: false, personas: 4, max_personas: 5, invitados: 7, max_invitados: 10, origen: 'gatheryx', created_at: x.iso(-9) },
      ];
      var participacion = esExpo ? [{
        expositora_id: X1, rol: rol === 'encargado' ? 'encargado' : 'usuario', empresa: 'TecnoSur Ltda.', organizador: 'Minera Andina Eventos',
        origen: 'gatheryx', gx_evento_id: EV1, lx_espejo_id: null, evento: 'Expo Minería Andina 2026', ultimo_dia: x.dia(4), vigente: true,
        max_personas: 5, personas: 2, max_invitados: 10, invitados: 4, es_pago: false,
      }] : [];

      var acceso = {
        autorizado: true, rol: ROL_CORE[rol], email: yo.email, nombre: yo.nombre, apellido: yo.apellido, nombre_completo: nc(yo),
        empresa: empresa, empresa_id: empresaId, logo_url: null, password_definida: true, clave_temporal: false,
        rol_app: rol === 'encargado' ? 'encargado_expositor' : rol === 'expositor' ? 'usuario_expositor' : ROL_CORE[rol],
        rol_nombre: ROL_NOMBRE[rol], permisos: PERMISOS[rol], plan: esExpo ? 'expositora' : 'productora',
        limites: { eventos: null, eventos_anio: null, subcuentas: true, expositoras: 10, usuarios: 10 },
      };
      var miembros = (esExpo ? [U.encargado, U.expositor] : [U.admin, U.usuario, U.usuario2]).map(function (u, i) {
        var k = Object.keys(U).filter(function (q) { return U[q] === u; })[0];
        return { usuario_id: u.id, id: u.id, email: u.email, nombre: u.nombre, apellido: u.apellido, nombre_completo: nc(u), estado: 'activo',
          rol_app: k === 'usuario2' ? 'user' : (ROL_CORE[k] || 'user'), rol_nombre: ROL_NOMBRE[k] || 'Usuario', rol: ROL_CORE[k] || 'user',
          clave_temporal: false, ultimo_acceso: x.iso(-i) };
      });

      return {
        usuario: { id: yo.id, email: yo.email, nombre: nc(yo) },
        tablas: {
          eventos: esExpo ? eventos.filter(function (e) { return e.id === EV1; }) : eventos,
          registrados: registrados, acreditaciones: acreditaciones, perfiles: perfiles,
          clientes: esExpo ? [] : [
            { id: CLI, empresa_id: EMP, nombre: 'Minera Andina Eventos', rut: '76.111.222-3', contacto: 'Claudia Ortega', email: 'claudia@mineraandina.cl', telefono: '+56 2 2345 6789', activo: true, created_at: x.iso(-90) },
            { id: 'k0000000-0000-4000-8000-000000000002', empresa_id: EMP, nombre: 'Cámara de Comercio del Sur', rut: '70.555.666-1', contacto: 'Rafael Godoy', email: 'rgodoy@camarasur.cl', telefono: '+56 63 222 1100', activo: true, created_at: x.iso(-70) },
          ],
          plantillas_correo: [
            { id: 'pc1', empresa_id: EMP, tipo: 'confirmacion', asunto: 'Tu entrada para {evento}', cuerpo: 'Hola {nombre},\n\nTu inscripción a {evento} está confirmada. Presenta este QR en la entrada.', activa: true, created_at: x.iso(-40) },
            { id: 'pc2', empresa_id: EMP, tipo: 'agradecimiento', asunto: 'Gracias por venir a {evento}', cuerpo: 'Hola {nombre},\n\nGracias por acompañarnos. Pronto te enviaremos las presentaciones.', activa: true, created_at: x.iso(-40) },
          ],
          ajustes: [{ id: 'aj1', empresa_id: empresaId, remitente: 'Eventos Cordillera', correo_respuesta: 'hola@eventoscordillera.cl' }],
          tipos_entrada: [
            { id: 'te1', evento_id: EV2, nombre: 'General', precio: 25000, cupo: 200, activo: true, orden: 1 },
            { id: 'te2', evento_id: EV2, nombre: 'Estudiante', precio: 12000, cupo: 50, activo: true, orden: 2 },
          ],
          codigos_descuento: [], compras: [], reembolsos: [], solicitudes_cobro: [], cuentas_cobro: [], datos_transferencia: [], imagenes: [],
        },
        rpc: {
          verificar_acceso_app: function () { return acceso; },
          mi_perfil: function () {
            return { id: yo.id, email: yo.email, nombre: yo.nombre, apellido: yo.apellido, nombre_completo: nc(yo), rol: ROL_CORE[rol],
              estado: 'activo', password_definida: true, empresa_id: empresaId, empresa: empresa, logo_url: null };
          },
          mis_participaciones: function () { return participacion; },
          soy_admin_de_app: function () { return rol === 'admin'; },
          version_disponible: function () { return { hay_actualizacion: false }; },
          notas_de_version: function () { return []; },
          historial_de_notas: function () { return []; },
          mi_plan: function () { return { codigo: acceso.plan, nombre: esExpo ? 'Expositora' : 'Productora 2', limites: acceso.limites }; },
          cupo_de_app: function () { return { usados: 3, tope: 10 }; },
          puedo_seguir: function () { return true; },
          equipo_de_app: function () { return miembros; },
          equipo_de_mi_empresa: function () { return miembros; },
          roles_de_app: function () {
            return [
              { id: 'r1', codigo: 'admin', nombre: 'Admin', descripcion: 'Todo en Gatheryx', orden: 1 },
              { id: 'r2', codigo: 'user', nombre: 'Usuario', descripcion: 'Registra y acredita', orden: 2 },
            ];
          },
          expositoras_de_evento: function (a) { return a.p_evento === EV1 ? expositoras : []; },
          personas_de_expositora: function () {
            return [
              { usuario_id: U.encargado.id, email: U.encargado.email, nombre_completo: nc(U.encargado), rol: 'encargado', sin_clave: false },
              { usuario_id: U.expositor.id, email: U.expositor.email, nombre_completo: nc(U.expositor), rol: 'usuario', sin_clave: false },
            ];
          },
          leadyx_de_expositoras: function () {
            return { interruptor: true, llega_a_leadyx: true, expositoras: { 'y0000000-0000-4000-8000-000000000001': true, 'y0000000-0000-4000-8000-000000000003': true } };
          },
          mi_cupo_vip: function () { return { con_limite: true, tope: 10, usados: 4 }; },
          expositor_filas_kpi: function () {
            return registrados.map(function (r) { return { id: r.id, created_at: r.created_at, ingresado_por: r.ingresado_por, acreditado: r.acreditado,
              empresa: r.empresa, email_confirmacion_enviado: true, acreditado_at: r.acreditado_at, acreditado_por: null }; });
          },
          expositor_buscar: function () { return []; },
          conexiones_de_mi_gatheryx: function () {
            return [{ id: 'cv1', empresa: 'Andes Industrial SpA', origen: 'misma_empresa', creado_en: x.iso(-20), eventos: 2 }];
          },
          invitaciones_de_mi_gatheryx: function () { return []; },
          llaves_de_integracion: function () { return []; },
        },
        funciones: {
          'alta-usuarios': function (b) {
            if (b.accion === 'expositora') return { ok: true, mensaje: 'Listo: ' + (b.nombre || 'la empresa') + ' es expositora (demo: no se envió correo).', correo_enviado: true };
            return { resultados: (b.personas || []).map(function (p) { return { email: p.email, estado: 'creado', mensaje: 'Demo: cuenta creada (sin correo).', correo_enviado: true }; }), agregados: (b.personas || []).length };
          },
          'asistente-app': function () { return { respuesta: 'Soy Jester, el asistente de Gatheryx. En esta demo no respondo de verdad, pero en la app te ayudo con cualquier duda.' }; },
          'enviar-qr': function () { return { ok: true, enviados: 1 }; },
          'correo-asistentes': function () { return { ok: true, enviados: 0, mensaje: 'Demo: no se envían correos.' }; },
        },
        rpcPorDefecto: function () { return null; },
      };
    },
  });
})();
