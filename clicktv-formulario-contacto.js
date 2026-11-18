/* CLICK TV STREAMING · Formulario de contacto internacional · 18/11/2026
   - Buscador de países (lupa) que filtra la lista.
   - Región dinámica: provincias y cantones en Ecuador; estados, departamentos o regiones en otros países.
   - Prefijo telefónico automático: el cliente escribe solo su número local.
   - Suscripción opcional a promociones por correo (desmarcada por defecto). */
(() => {
  'use strict';

  const ECUADOR = {
    'Azuay': ['Cuenca', 'Camilo Ponce Enríquez', 'Chordeleg', 'El Pan', 'Girón', 'Guachapala', 'Gualaceo', 'Nabón', 'Oña', 'Paute', 'Pucará', 'San Fernando', 'Santa Isabel', 'Sevilla de Oro', 'Sígsig'],
    'Bolívar': ['Guaranda', 'Caluma', 'Chillanes', 'Chimbo', 'Echeandía', 'Las Naves', 'San Miguel'],
    'Cañar': ['Azogues', 'Biblián', 'Cañar', 'Déleg', 'El Tambo', 'La Troncal', 'Suscal'],
    'Carchi': ['Tulcán', 'Bolívar', 'Espejo', 'Mira', 'Montúfar', 'San Pedro de Huaca'],
    'Chimborazo': ['Riobamba', 'Alausí', 'Chambo', 'Chunchi', 'Colta', 'Cumandá', 'Guamote', 'Guano', 'Pallatanga', 'Penipe'],
    'Cotopaxi': ['Latacunga', 'La Maná', 'Pangua', 'Pujilí', 'Salcedo', 'Saquisilí', 'Sigchos'],
    'El Oro': ['Machala', 'Arenillas', 'Atahualpa', 'Balsas', 'Chilla', 'El Guabo', 'Huaquillas', 'Las Lajas', 'Marcabelí', 'Pasaje', 'Piñas', 'Portovelo', 'Santa Rosa', 'Zaruma'],
    'Esmeraldas': ['Esmeraldas', 'Atacames', 'Eloy Alfaro', 'Muisne', 'Quinindé', 'Rioverde', 'San Lorenzo'],
    'Galápagos': ['San Cristóbal', 'Isabela', 'Santa Cruz'],
    'Guayas': ['Guayaquil', 'Alfredo Baquerizo Moreno', 'Balao', 'Balzar', 'Colimes', 'Coronel Marcelino Maridueña', 'Daule', 'Durán', 'El Empalme', 'El Triunfo', 'General Antonio Elizalde', 'Isidro Ayora', 'Lomas de Sargentillo', 'Milagro', 'Naranjal', 'Naranjito', 'Nobol', 'Palestina', 'Pedro Carbo', 'Playas', 'Salitre', 'Samborondón', 'San Jacinto de Yaguachi', 'Santa Lucía', 'Simón Bolívar'],
    'Imbabura': ['Ibarra', 'Antonio Ante', 'Cotacachi', 'Otavalo', 'Pimampiro', 'San Miguel de Urcuquí'],
    'Loja': ['Loja', 'Calvas', 'Catamayo', 'Celica', 'Chaguarpamba', 'Espíndola', 'Gonzanamá', 'Macará', 'Olmedo', 'Paltas', 'Pindal', 'Puyango', 'Quilanga', 'Saraguro', 'Sozoranga', 'Zapotillo'],
    'Los Ríos': ['Babahoyo', 'Baba', 'Buena Fe', 'Mocache', 'Montalvo', 'Palenque', 'Puebloviejo', 'Quevedo', 'Quinsaloma', 'Urdaneta', 'Valencia', 'Ventanas', 'Vinces'],
    'Manabí': ['Portoviejo', 'Bolívar', 'Chone', 'El Carmen', 'Flavio Alfaro', 'Jama', 'Jaramijó', 'Jipijapa', 'Junín', 'Manta', 'Montecristi', 'Olmedo', 'Paján', 'Pedernales', 'Pichincha', 'Puerto López', 'Rocafuerte', 'San Vicente', 'Santa Ana', 'Sucre', 'Tosagua', 'Veinticuatro de Mayo'],
    'Morona Santiago': ['Morona', 'Gualaquiza', 'Huamboya', 'Limón Indanza', 'Logroño', 'Pablo Sexto', 'Palora', 'San Juan Bosco', 'Santiago', 'Sucúa', 'Taisha', 'Tiwintza'],
    'Napo': ['Tena', 'Archidona', 'Carlos Julio Arosemena Tola', 'El Chaco', 'Quijos'],
    'Orellana': ['Francisco de Orellana', 'Aguarico', 'La Joya de los Sachas', 'Loreto'],
    'Pastaza': ['Pastaza', 'Arajuno', 'Mera', 'Santa Clara'],
    'Pichincha': ['Quito', 'Cayambe', 'Mejía', 'Pedro Moncayo', 'Pedro Vicente Maldonado', 'Puerto Quito', 'Rumiñahui', 'San Miguel de los Bancos'],
    'Santa Elena': ['Santa Elena', 'La Libertad', 'Salinas'],
    'Santo Domingo de los Tsáchilas': ['Santo Domingo', 'La Concordia'],
    'Sucumbíos': ['Lago Agrio', 'Cascales', 'Cuyabeno', 'Gonzalo Pizarro', 'Putumayo', 'Shushufindi', 'Sucumbíos'],
    'Tungurahua': ['Ambato', 'Baños de Agua Santa', 'Cevallos', 'Mocha', 'Patate', 'Pelileo', 'Píllaro', 'Quero', 'Tisaleo'],
    'Zamora Chinchipe': ['Zamora', 'Centinela del Cóndor', 'Chinchipe', 'El Pangui', 'Nangaritza', 'Palanda', 'Paquisha', 'Yacuambi', 'Yantzaza']
  };

  // nombre, prefijo, etiqueta de la región y su lista (vacía = texto libre).
  const PAISES = [
    { nombre: 'Ecuador', prefijo: '+593', region: 'Provincia', regiones: Object.keys(ECUADOR) },
    { nombre: 'Argentina', prefijo: '+54', region: 'Provincia', regiones: ['Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'] },
    { nombre: 'Bolivia', prefijo: '+591', region: 'Departamento', regiones: ['Beni', 'Chuquisaca', 'Cochabamba', 'La Paz', 'Oruro', 'Pando', 'Potosí', 'Santa Cruz', 'Tarija'] },
    { nombre: 'Brasil', prefijo: '+55', region: 'Estado', regiones: [] },
    { nombre: 'Canadá', prefijo: '+1', region: 'Provincia', regiones: [] },
    { nombre: 'Chile', prefijo: '+56', region: 'Región', regiones: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo', 'Valparaíso', 'Metropolitana de Santiago', "O'Higgins", 'Maule', 'Ñuble', 'Biobío', 'La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'] },
    { nombre: 'Colombia', prefijo: '+57', region: 'Departamento', regiones: ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'] },
    { nombre: 'Costa Rica', prefijo: '+506', region: 'Provincia', regiones: [] },
    { nombre: 'El Salvador', prefijo: '+503', region: 'Departamento', regiones: [] },
    { nombre: 'España', prefijo: '+34', region: 'Comunidad autónoma', regiones: ['Andalucía', 'Aragón', 'Asturias', 'Islas Baleares', 'Canarias', 'Cantabria', 'Castilla-La Mancha', 'Castilla y León', 'Cataluña', 'Comunidad Valenciana', 'Extremadura', 'Galicia', 'La Rioja', 'Comunidad de Madrid', 'Región de Murcia', 'Navarra', 'País Vasco', 'Ceuta', 'Melilla'] },
    { nombre: 'Estados Unidos', prefijo: '+1', region: 'Estado', regiones: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Distrito de Columbia', 'Florida', 'Georgia', 'Hawái', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Luisiana', 'Maine', 'Maryland', 'Massachusetts', 'Míchigan', 'Minnesota', 'Misisipi', 'Misuri', 'Montana', 'Nebraska', 'Nevada', 'Nueva Jersey', 'Nueva York', 'Nuevo Hampshire', 'Nuevo México', 'Carolina del Norte', 'Carolina del Sur', 'Dakota del Norte', 'Dakota del Sur', 'Ohio', 'Oklahoma', 'Oregón', 'Pensilvania', 'Rhode Island', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Virginia Occidental', 'Washington', 'Wisconsin', 'Wyoming'] },
    { nombre: 'Guatemala', prefijo: '+502', region: 'Departamento', regiones: [] },
    { nombre: 'Honduras', prefijo: '+504', region: 'Departamento', regiones: [] },
    { nombre: 'Italia', prefijo: '+39', region: 'Región', regiones: [] },
    { nombre: 'México', prefijo: '+52', region: 'Estado', regiones: ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'] },
    { nombre: 'Nicaragua', prefijo: '+505', region: 'Departamento', regiones: [] },
    { nombre: 'Panamá', prefijo: '+507', region: 'Provincia', regiones: [] },
    { nombre: 'Paraguay', prefijo: '+595', region: 'Departamento', regiones: [] },
    { nombre: 'Perú', prefijo: '+51', region: 'Región', regiones: ['Amazonas', 'Áncash', 'Apurímac', 'Arequipa', 'Ayacucho', 'Cajamarca', 'Callao', 'Cusco', 'Huancavelica', 'Huánuco', 'Ica', 'Junín', 'La Libertad', 'Lambayeque', 'Lima', 'Loreto', 'Madre de Dios', 'Moquegua', 'Pasco', 'Piura', 'Puno', 'San Martín', 'Tacna', 'Tumbes', 'Ucayali'] },
    { nombre: 'República Dominicana', prefijo: '+1', region: 'Provincia', regiones: [] },
    { nombre: 'Uruguay', prefijo: '+598', region: 'Departamento', regiones: [] },
    { nombre: 'Venezuela', prefijo: '+58', region: 'Estado', regiones: ['Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas', 'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital', 'Falcón', 'Guárico', 'La Guaira', 'Lara', 'Mérida', 'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre', 'Táchira', 'Trujillo', 'Yaracuy', 'Zulia'] },
    { nombre: 'Otro país', prefijo: '', region: 'Estado / provincia / región', regiones: [] }
  ];

  const normalizar = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  const buscarPais = (nombre) => PAISES.find((p) => p.nombre === nombre) || null;
  const filtrarPaises = (consulta) => {
    const q = normalizar(consulta);
    return q ? PAISES.filter((p) => normalizar(p.nombre).includes(q) || p.prefijo.replace('+', '') === q.replace('+', '')) : PAISES.slice();
  };

  // Número internacional: prefijo + número local sin ceros iniciales ni signos (0991234567 → +593 991234567).
  function telefonoCompleto(prefijo, local) {
    const digitos = String(local || '').replace(/\D/g, '');
    if (!digitos) return '';
    if (!prefijo) return `+${digitos}`;
    const sinPrefijo = digitos.startsWith(prefijo.slice(1)) && digitos.length > 9 ? digitos.slice(prefijo.length - 1) : digitos;
    return `${prefijo} ${sinPrefijo.replace(/^0+/, '')}`;
  }

  const telefonoValido = (local) => {
    const n = String(local || '').replace(/\D/g, '').length;
    return n >= 6 && n <= 14;
  };

  window.ctvFormularioContacto = { PAISES, ECUADOR, filtrarPaises, buscarPais, telefonoCompleto, telefonoValido, normalizar };
  if (typeof document === 'undefined' || !document.addEventListener) return;

  function iniciar() {
    const select = document.getElementById('contacto-pais');
    if (!select) return;
    const buscador = document.getElementById('contacto-pais-buscar');
    const etiquetaRegion = document.getElementById('contacto-region-etiqueta');
    const selectRegion = document.getElementById('contacto-region');
    const textoRegion = document.getElementById('contacto-region-texto');
    const campoCanton = document.getElementById('contacto-canton-campo');
    const canton = document.getElementById('contacto-canton');
    const cantones = document.getElementById('contacto-cantones');
    const prefijo = document.getElementById('contacto-prefijo');
    const telefono = document.getElementById('contacto-telefono');
    const suscripcion = document.getElementById('contacto-suscripcion');
    const campoEmail = document.getElementById('contacto-email-campo');
    const email = document.getElementById('contacto-email');

    const opcion = (valor, texto) => { const o = document.createElement('option'); o.value = valor; o.textContent = texto; return o; };

    function pintarPaises(lista) {
      const actual = select.value;
      select.replaceChildren(opcion('', lista.length ? 'Seleccionar país' : 'Sin coincidencias'));
      lista.forEach((p) => select.append(opcion(p.nombre, p.prefijo ? `${p.nombre} (${p.prefijo})` : p.nombre)));
      if (lista.some((p) => p.nombre === actual)) select.value = actual;
    }

    function aplicarPais() {
      const pais = buscarPais(select.value);
      prefijo.textContent = pais?.prefijo || '+';
      telefono.placeholder = pais?.nombre === 'Ecuador' ? 'Tu número local, ej. 0991234567' : 'Tu número local, sin el código del país';
      etiquetaRegion.textContent = pais ? pais.region : 'Provincia / estado';
      const conLista = !!pais?.regiones.length;
      selectRegion.hidden = !conLista;
      textoRegion.hidden = conLista;
      selectRegion.required = conLista;
      if (conLista) {
        selectRegion.replaceChildren(opcion('', `Elige ${pais.region.toLowerCase()}`), ...pais.regiones.map((r) => opcion(r, r)));
      } else {
        textoRegion.value = '';
      }
      aplicarRegion();
    }

    function aplicarRegion() {
      const esEcuador = select.value === 'Ecuador';
      campoCanton.hidden = !esEcuador;
      const lista = esEcuador ? (ECUADOR[selectRegion.value] || []) : [];
      cantones.replaceChildren(...lista.map((c) => opcion(c, '')));
      canton.placeholder = lista[0] ? `Ej: ${lista[0]}` : 'Ej: Quito';
      if (canton.value && !lista.includes(canton.value)) canton.value = '';
    }

    buscador?.addEventListener('input', () => {
      const lista = filtrarPaises(buscador.value);
      pintarPaises(lista);
      if (lista.length === 1 && select.value !== lista[0].nombre) { select.value = lista[0].nombre; aplicarPais(); }
    });
    select.addEventListener('change', aplicarPais);
    selectRegion.addEventListener('change', aplicarRegion);
    suscripcion?.addEventListener('change', () => {
      campoEmail.hidden = !suscripcion.checked;
      email.required = suscripcion.checked;
      if (suscripcion.checked) email.focus({ preventScroll: true });
    });
    select.closest('form')?.addEventListener('reset', () => setTimeout(() => {
      if (buscador) buscador.value = '';
      pintarPaises(PAISES);
      select.value = 'Ecuador';
      campoEmail.hidden = true;
      email.required = false;
      aplicarPais();
    }));

    pintarPaises(PAISES);
    select.value = 'Ecuador';
    aplicarPais();
  }

  // Datos listos para el mensaje de WhatsApp (los usa enviarContactoInternacional en script.js).
  window.ctvFormularioContacto.leer = function () {
    const valor = (id) => document.getElementById(id)?.value.trim() || '';
    const pais = valor('contacto-pais');
    const datosPais = buscarPais(pais);
    const region = datosPais?.regiones.length ? valor('contacto-region') : valor('contacto-region-texto');
    const local = valor('contacto-telefono');
    const suscrito = !!document.getElementById('contacto-suscripcion')?.checked;
    return {
      nombre: valor('contacto-nombre'), pais, region, canton: pais === 'Ecuador' ? valor('contacto-canton') : '',
      telefono: telefonoCompleto(datosPais?.prefijo || '', local), telefonoValido: telefonoValido(local),
      suscrito, email: suscrito ? valor('contacto-email') : '', mensaje: valor('contacto-mensaje')
    };
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  else iniciar();
})();
