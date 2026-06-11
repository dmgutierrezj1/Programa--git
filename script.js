// 1. Variables globales
let citas = [];
const botonNuevaCita = document.querySelector('header button');
const inpBuscar = document.querySelector('header input[type="search"]');
const selectFiltro = document.querySelector('.filtros select');
const vistaCitaGrid = document.querySelector('.cita-grid');

// 2. Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarCitas();
  renderizarCitas(citas);

  // Botón "Nueva Cita" (en el prototipo, abre una alerta/modal)
  botonNuevaCita.addEventListener('click', () => {
    nuevaCita();
  }); 

  // Búsqueda por texto (input)
  if (inpBuscar) {
    inpBuscar.addEventListener('input', filtrarPorTexto);
    inpBuscar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        filtrarPorTexto();
      }
    });
  }

  // Filtro por servicio (select)
  if (selectFiltro) {
    selectFiltro.addEventListener('change', filtrarPorServicio);
  }

  // Botones de vista "Hoy / Semana / Mes"
  const botonesVista = document.querySelectorAll('.filtros button');
  botonesVista.forEach((btn) => {
    btn.addEventListener('click', () => {
      const texto = btn.textContent.toLowerCase();
      if (texto.includes('hoy')) {
        filtrarPorVista('hoy');
      } else if (texto.includes('semana')) {
        filtrarPorVista('semana');
      } else if (texto.includes('mes')) {
        filtrarPorVista('mes');
      }
    });
  });
});

// 3. Renderizar citas en el grid
function renderizarCitas(listaCitas) {
  vistaCitaGrid.innerHTML = '';

  if (listaCitas.length === 0) {
    vistaCitaGrid.innerHTML = '<p>No hay citas agendadas.</p>';
    return;
  }

  listaCitas.forEach((cita) => {
    const article = document.createElement('article');
    article.classList.add('cita');
    if (cita.servicio === 'manicure') {
      article.classList.add('manicure');
    } else if (cita.servicio === 'estilista') {
      article.classList.add('estilista');
    } else if (cita.servicio === 'colorista') {
      article.classList.add('colorista');
    }

    article.setAttribute('tabindex', '0');

    // Sacar horas en formato legible (ej: 08:00 - 09:00)
    const fechaStr = new Date(cita.fecha).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota',
    });

    const duracionMin = 50; // ejemplo de duración 50min para mostrar rango
    const fechaFin = new Date(cita.fecha);
    fechaFin.setMinutes(fechaFin.getMinutes() + duracionMin);
    const fechaFinStr = fechaFin.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const horaText = `${fechaStr} - ${fechaFinStr}`;

    article.innerHTML = `
      <div class="cita-header">
        <span class="servicio-ico">${getIconoServicio(cita.servicio)}</span>
        <strong>${cita.servicio.charAt(0).toUpperCase() + cita.servicio.slice(1)}</strong>
        <span class="hora">${horaText}</span>
      </div>
      <div class="cita-detalles">
        <span>${cita.cliente}</span>
        <span>Empleado: ${cita.empleado}</span>
      </div>
      <div class="cita-actions">
        <button class="btn-editar" data-id="${cita.id}" aria-label="Editar cita ${cita.servicio} de ${cita.cliente}">Editar</button>
        <button class="btn-eliminar" data-id="${cita.id}" aria-label="Cancelar cita ${cita.servicio} de ${cita.cliente}">Cancelar</button>
      </div>
    `;

    // Añadir eventos de clic y teclado
    const btnEditar = article.querySelector('.btn-editar');
    const btnEliminar = article.querySelector('.btn-eliminar');

    btnEditar.addEventListener('click', (e) => {
      const id = Number(e.target.getAttribute('data-id'));
      editarCita(id);
    });

    btnEliminar.addEventListener('click', (e) => {
      const id = Number(e.target.getAttribute('data-id'));
      cancelarCita(id);
    });

    article.addEventListener('click', () => {
      btnEditar.focus();
    });

    article.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        btnEditar.focus();
      }
    });

    vistaCitaGrid.appendChild(article);
  });
}

// 4. Función para icono de servicio
function getIconoServicio(servicio) {
  switch (servicio) {
    case 'manicure':  return '💅';
    case 'estilista': return '✂';
    case 'colorista': return '🎨';
    default:          return '?';
  }
}

// 5. Filtro por texto (buscador)
function filtrarPorTexto() {
  const texto = (inpBuscar.value || '').trim().toLowerCase();
  const listaFiltrada = texto
    ? citas.filter(cita =>
        cita.cliente.toLowerCase().includes(texto) ||
        cita.servicio.toLowerCase().includes(texto) ||
        cita.empleado.toLowerCase().includes(texto)
    )
    : citas;
  renderizarCitas(listaFiltrada);
}

// 6. Filtro por servicio (select)
function filtrarPorServicio() {
  const servicio = selectFiltro.value;

  if (!servicio || servicio === 'Todos') {
    renderizarCitas(citas);
  } else {
    const servicioLower = servicio.toLowerCase();
    const listaFiltrada = citas.filter(cita =>
      cita.servicio.toLowerCase() === servicioLower
    );
    renderizarCitas(listaFiltrada);
  }
}

// 7. Botón “Nueva Cita” (modal/prototipo)
function nuevaCita() {
  const texto = prompt(`
    Nueva Cita - Código Agenda
    Formato: cliente, servicio, empleado, fecha
    Ejemplo: Ana, manicure, Camila, 2026-05-15T10:00
  `);

  if (!texto) {
    return;
  }

  const partes = texto.split(',').map((p) => p.trim());
  if (partes.length < 4) {
    alert('Por favor, usa el formato: cliente, servicio, empleado, fecha');
    return;
  }

  const [cliente, servicio, empleado, fechaStr] = partes;

  const validServices = ['manicure', 'estilista', 'colorista'];
  if (!validServices.includes(servicio)) {
    alert('Servicio no válido. Usa manicure, estilista o colorista.');
    return;
  }

  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) {
    alert('Fecha no válida, usa formato ISO: YYYY-MM-DDThh:mm');
    return;
  }

  const ahora = new Date();
  if (fecha < ahora) {
    alert('No puedes agendar citas en el pasado.');
    return;
  }

  citas.push({
    id: Date.now(),
    cliente,
    servicio,
    empleado,
    fecha: fecha.toISOString(),
  });

  renderizarCitas(citas);
  guardarCitas();
}

// 8. Editar una cita
function editarCita(id) {
  const cita = citas.find(c => c.id === id);
  if (!cita) {
    return;
  }

  const texto = prompt(`
    Editar Cita
    Formato: cliente, servicio, empleado, fecha
    Actual: ${cita.cliente}, ${cita.servicio}, ${cita.empleado}, ${cita.fecha}
  `);

  if (!texto) {
    return;
  }

  const partes = texto.split(',').map((p) => p.trim());
  if (partes.length < 4) {
    alert('Por favor, usa el formato: cliente, servicio, empleado, fecha');
    return;
  }

  const [cliente, servicio, empleado, fechaStr] = partes;

  const validServices = ['manicure', 'estilista', 'colorista'];
  if (!validServices.includes(servicio)) {
    alert('Servicio no válido. Usa manicure, estilista o colorista.');
    return;
  }

  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) {
    alert('Fecha no válida, usa formato ISO: YYYY-MM-DDThh:mm');
    return;
  }

  const ahora = new Date();
  if (fecha < ahora) {
    alert('No puedes editar citas moviéndolas al pasado.');
    return;
  }

  // Actualizar cita
  cita.cliente = cliente;
  cita.servicio = servicio;
  cita.empleado = empleado;
  cita.fecha = fecha.toISOString();

  renderizarCitas(citas);
  guardarCitas();
}

// 9. Cancelar (borrar) una cita
function cancelarCita(id) {
  if (!confirm('¿Seguro quieres cancelar esta cita?')) {
    return;
  }

  citas = citas.filter(cita => cita.id !== id);
  renderizarCitas(citas);
  guardarCitas();
}

// 10. Filtro por vista (Hoy / Semana / Mes)
function filtrarPorVista(tipoVista) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const listaFiltrada = citas.filter(cita => {
    const fechaCita = new Date(cita.fecha);
    fechaCita.setHours(0, 0, 0, 0);

    switch (tipoVista) {
      case 'hoy':
        return fechaCita.getTime() === hoy.getTime();
      case 'semana':
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - hoy.getDay());
        const finSemana = new Date(hoy);
        finSemana.setDate(hoy.getDate() + (6 - hoy.getDay()));
        return fechaCita >= inicioSemana && fechaCita <= finSemana;
      case 'mes':
        return (
          fechaCita.getFullYear() === hoy.getFullYear() &&
          fechaCita.getMonth() === hoy.getMonth()
        );
      default:
        return true;
    }
  });

  renderizarCitas(listaFiltrada);
}

// 11. Persistencia en localStorage (sin base de datos)
function guardarCitas() {
  try {
    localStorage.setItem('codigo-agenda-citas', JSON.stringify(citas));
  } catch (e) {
    console.warn('No se pudo guardar en localStorage.');
  }
}

function cargarCitas() {
  try {
    const data = localStorage.getItem('codigo-agenda-citas');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        citas = parsed;
      }
    }
  } catch (e) {
    console.warn('No se pudo leer citas de localStorage.');
  }

  // Ejemplo de citas iniciales si no hay nada guardado
  if (citas.length === 0) {
    citas = [
      {
        id: 1001,
        cliente: 'Juliana Jiménez',
        servicio: 'manicure',
        empleado: 'Camila Torres',
        fecha: '2026-04-29T08:00:00Z',
      },
      {
        id: 1002,
        cliente: 'Miguel León',
        servicio: 'estilista',
        empleado: 'Jorge Lozano',
        fecha: '2026-04-29T10:30:00Z',
      },
      {
        id: 1003,
        cliente: 'María José Gómez',
        servicio: 'colorista',
        empleado: 'Daniel Tobón',
        fecha: '2026-04-29T14:00:00Z',
      },
    ];
  }
}