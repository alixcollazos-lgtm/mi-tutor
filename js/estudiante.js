/* =========================================================
   Mi Tutor — estudiante.js
   Flujo completo del estudiante, con navegación por historial
   y persistencia de solicitudes en localStorage.
   ========================================================= */

const ETIQUETAS_SECCION = {
  "sec-area": "Área",
  "sec-asignatura": "Asignatura",
  "sec-necesidad": "Necesidad",
  "sec-tema": "Tema",
  "sec-tutores": "Tutor",
  "sec-perfil": "Perfil",
  "sec-solicitud": "Solicitud",
  "sec-resumen": "Resumen",
  "sec-confirmacion": "Confirmación",
  "sec-mis-tutorias": "Mis tutorías",
};

let estado = {
  areaKey: null,
  asignaturaSlug: null,
  asignaturaLabel: null,
  necesidadId: null,
  necesidadLabel: null,
  tema: null,
  tutor: null,
  solicitud: null,
};

let historial = ["sec-area"];

function render(id) {
  document.querySelectorAll(".seccion").forEach((s) => s.classList.remove("activa"));
  const target = document.getElementById(id);
  target.classList.add("activa");

  switch (id) {
    case "sec-asignatura": pintarAsignaturas(); break;
    case "sec-necesidad": pintarNecesidades(); break;
    case "sec-tema": pintarTemas(); break;
    case "sec-tutores": pintarTutores(); break;
    case "sec-perfil": pintarPerfil(); break;
    case "sec-solicitud": prepararSolicitud(); break;
    case "sec-resumen": pintarResumen(); break;
    case "sec-confirmacion": pintarConfirmacion(); break;
    case "sec-mis-tutorias": pintarMisTutorias("todas"); break;
  }

  pintarStepper();
  document.getElementById("btn-atras").style.visibility =
    historial.length > 1 ? "visible" : "hidden";
  window.scrollTo({ top: document.querySelector(".flow-main").offsetTop - 90, behavior: "smooth" });
}

function irA(id) {
  historial.push(id);
  render(id);
}

function atras() {
  if (historial.length <= 1) return;
  historial.pop();
  render(historial[historial.length - 1]);
}

function pintarStepper() {
  const cont = document.getElementById("stepper");
  cont.innerHTML = "";
  historial.forEach((id, i) => {
    const span = document.createElement("span");
    span.className = "crumb" + (i === historial.length - 1 ? " current" : "");
    span.textContent = ETIQUETAS_SECCION[id] || id;
    cont.appendChild(span);
    if (i < historial.length - 1) {
      const sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = "›";
      cont.appendChild(sep);
    }
  });
}

/* ---------- Paso 1: Área ---------- */
function pintarAreas() {
  const cont = document.getElementById("lista-areas");
  cont.innerHTML = "";
  Object.entries(MT_AREAS).forEach(([key, area]) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "option-card area-" + (key === "matematicas" ? "math" : key === "fisica" ? "fisica" : "quimica");
    card.innerHTML = `<span class="icon">${area.icono}</span><h3>${area.label}</h3><p>${area.asignaturas.length} asignaturas disponibles</p>`;
    card.addEventListener("click", () => {
      estado.areaKey = key;
      estado.asignaturaSlug = null;
      irA("sec-asignatura");
    });
    cont.appendChild(card);
  });
}

/* ---------- Paso 2: Asignatura ---------- */
function pintarAsignaturas() {
  const area = MT_AREAS[estado.areaKey];
  document.getElementById("asignatura-titulo").textContent = `${area.icono} ${area.label}: elige la asignatura`;
  const cont = document.getElementById("lista-asignaturas");
  cont.innerHTML = "";
  area.asignaturas.forEach((nombre) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = nombre;
    chip.addEventListener("click", () => {
      estado.asignaturaSlug = mtSlug(nombre);
      estado.asignaturaLabel = nombre;
      irA("sec-necesidad");
    });
    cont.appendChild(chip);
  });
}

/* ---------- Paso 3: Necesidad ---------- */
function pintarNecesidades() {
  document.getElementById("necesidad-contexto").textContent =
    `Para ${estado.asignaturaLabel}, cuéntanos qué tipo de ayuda buscas.`;
  const cont = document.getElementById("lista-necesidades");
  cont.innerHTML = "";
  MT_NECESIDADES.forEach((n) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "option-card";
    card.innerHTML = `<span class="icon">${n.icono}</span><h3>${n.label}</h3><p>${n.desc}</p>`;
    card.addEventListener("click", () => {
      estado.necesidadId = n.id;
      estado.necesidadLabel = n.label;
      estado.tema = null;
      if (n.id === "refuerzo") {
        irA("sec-tema");
      } else {
        irA("sec-tutores");
      }
    });
    cont.appendChild(card);
  });
}

/* ---------- Paso 4: Tema (solo refuerzo) ---------- */
function pintarTemas() {
  document.getElementById("tema-contexto").textContent =
    `${estado.asignaturaLabel} · elige el tema que quieres reforzar.`;
  const cont = document.getElementById("lista-temas");
  cont.innerHTML = "";
  mtTemasDe(estado.asignaturaSlug).forEach((tema) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = tema;
    chip.addEventListener("click", () => {
      estado.tema = tema;
      irA("sec-tutores");
    });
    cont.appendChild(chip);
  });
  document.getElementById("tema-otro").value = "";
}

document.getElementById("btn-tema-otro").addEventListener("click", () => {
  const valor = document.getElementById("tema-otro").value.trim();
  if (!valor) {
    document.getElementById("tema-otro").focus();
    return;
  }
  estado.tema = valor;
  irA("sec-tutores");
});

/* ---------- Paso 5: Tutores ---------- */
const MODALIDAD_LABEL = { virtual: "Virtual", presencial: "Presencial", ambas: "Virtual o presencial" };

function pintarTutores() {
  document.getElementById("tutores-contexto").textContent =
    `Tutores disponibles para ${estado.asignaturaLabel}.`;
  const tutores = mtTutoresPorAsignatura(estado.areaKey, estado.asignaturaSlug);
  const cont = document.getElementById("lista-tutores");
  cont.innerHTML = "";

  if (!tutores.length) {
    cont.innerHTML = `<div class="empty-state">Aún no hay tutores disponibles para esta asignatura. Intenta con otra asignatura del área.</div>`;
    return;
  }

  tutores.forEach((t) => {
    const card = document.createElement("div");
    card.className = "tutor-card";
    card.innerHTML = `
      <div class="avatar" style="background:${MT_AREAS[t.area].color}">${mtIniciales(t.nombre)}</div>
      <div class="tutor-info">
        <h3>${t.nombre}</h3>
        <div class="tutor-meta">${t.asignaturas.includes(estado.asignaturaSlug) ? estado.asignaturaLabel : MT_AREAS[t.area].label} · ${t.universidad}</div>
        <div class="tutor-stats">
          <span class="badge badge-rating">⭐ ${t.calificacion}</span>
          <span><strong>${t.tutorias}</strong> tutorías realizadas</span>
          <span>${MODALIDAD_LABEL[t.modalidad]}</span>
        </div>
        <div class="tutor-footer">
          <span class="tutor-price">${mtFormatoCOP(t.precio)} / hora</span>
          <span class="badge badge-dispo">🟢 Disponible</span>
        </div>
      </div>
    `;
    const btnWrap = document.createElement("div");
    btnWrap.style.cssText = "align-self:center;";
    const btn = document.createElement("button");
    btn.className = "btn btn-ghost";
    btn.textContent = "Ver perfil";
    btn.addEventListener("click", () => {
      estado.tutor = t;
      irA("sec-perfil");
    });
    btnWrap.appendChild(btn);
    card.appendChild(btnWrap);
    cont.appendChild(card);
  });
}

/* ---------- Paso 6: Perfil ---------- */
function pintarPerfil() {
  const t = estado.tutor;
  document.getElementById("perfil-avatar").style.background = MT_AREAS[t.area].color;
  document.getElementById("perfil-avatar").textContent = mtIniciales(t.nombre);
  document.getElementById("perfil-nombre").textContent = t.nombre;
  document.getElementById("perfil-universidad").textContent = t.universidad;
  document.getElementById("perfil-rating").textContent = `⭐ ${t.calificacion}`;
  document.getElementById("perfil-descripcion").textContent = t.descripcion;
  document.getElementById("perfil-materias").textContent = t.asignaturas
    .map((s) => MT_AREAS[t.area].asignaturas.find((a) => mtSlug(a) === s) || s)
    .join(", ");
  document.getElementById("perfil-experiencia").textContent = t.experiencia;
  document.getElementById("perfil-tutorias").textContent = t.tutorias + " tutorías";
  document.getElementById("perfil-precio").textContent = mtFormatoCOP(t.precio) + " / hora";
  document.getElementById("perfil-modalidad").textContent = MODALIDAD_LABEL[t.modalidad];
  document.getElementById("perfil-horarios").textContent = t.disponibilidad.join(" · ");
}

document.getElementById("btn-volver-lista").addEventListener("click", atras);
document.getElementById("btn-solicitar").addEventListener("click", () => irA("sec-solicitud"));

/* ---------- Paso 7: Solicitud ---------- */
function prepararSolicitud() {
  const t = estado.tutor;
  document.getElementById("solicitud-tutor-nombre").textContent = t.nombre;

  const selectModalidad = document.getElementById("sol-modalidad");
  selectModalidad.innerHTML = "";
  const opciones = t.modalidad === "ambas" ? ["virtual", "presencial"] : [t.modalidad];
  opciones.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = MODALIDAD_LABEL[m];
    selectModalidad.appendChild(opt);
  });

  const inputTema = document.getElementById("sol-tema");
  if (!inputTema.dataset.tocado) {
    inputTema.value = estado.tema || estado.asignaturaLabel;
  }

  const inputFecha = document.getElementById("sol-fecha");
  if (!inputFecha.value) {
    const manana = new Date();
    manana.setDate(manana.getDate() + 3);
    inputFecha.value = manana.toISOString().slice(0, 10);
    inputFecha.min = new Date().toISOString().slice(0, 10);
  }
  if (!document.getElementById("sol-hora").value) {
    document.getElementById("sol-hora").value = "16:00";
  }
}

document.getElementById("sol-tema").addEventListener("input", (e) => {
  e.target.dataset.tocado = "1";
});

document.getElementById("form-solicitud").addEventListener("submit", (e) => {
  e.preventDefault();
  const duracion = parseInt(document.getElementById("sol-duracion").value, 10);
  const precioCalc = mtCalcularPrecio(estado.tutor.precio, duracion);

  estado.solicitud = {
    fecha: document.getElementById("sol-fecha").value,
    hora: document.getElementById("sol-hora").value,
    duracion,
    modalidad: document.getElementById("sol-modalidad").value,
    tema: document.getElementById("sol-tema").value.trim(),
    descripcion: document.getElementById("sol-descripcion").value.trim(),
    subtotal: precioCalc.subtotal,
    comision: precioCalc.comision,
    total: precioCalc.total,
  };
  irA("sec-resumen");
});

/* ---------- Paso 8: Resumen ---------- */
function formatoFechaLarga(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

function pintarResumen() {
  const t = estado.tutor, s = estado.solicitud;
  document.getElementById("resumen-card").innerHTML = `
    <div class="summary-row"><span class="k">Tutor</span><span class="v">${t.nombre}</span></div>
    <div class="summary-row"><span class="k">Asignatura</span><span class="v">${estado.asignaturaLabel}</span></div>
    <div class="summary-row"><span class="k">Tema</span><span class="v">${s.tema}</span></div>
    <div class="summary-row"><span class="k">Fecha</span><span class="v">${formatoFechaLarga(s.fecha)}</span></div>
    <div class="summary-row"><span class="k">Hora</span><span class="v">${s.hora}</span></div>
    <div class="summary-row"><span class="k">Duración</span><span class="v">${s.duracion} min</span></div>
    <div class="summary-row"><span class="k">Modalidad</span><span class="v">${MODALIDAD_LABEL[s.modalidad]}</span></div>
    <div class="summary-row"><span class="k">Precio tutor</span><span class="v">${mtFormatoCOP(s.subtotal)}</span></div>
    <div class="summary-row"><span class="k">Comisión Mi Tutor</span><span class="v">${mtFormatoCOP(s.comision)}</span></div>
    <div class="summary-row"><span class="k">Total</span><span class="v summary-total">${mtFormatoCOP(s.total)}</span></div>
  `;
}

document.getElementById("btn-editar-solicitud").addEventListener("click", atras);

document.getElementById("btn-confirmar-solicitud").addEventListener("click", () => {
  const t = estado.tutor, s = estado.solicitud;
  const registro = {
    id: mtUid("sol"),
    tutorId: t.nombre,
    tutorNombre: t.nombre,
    asignatura: estado.asignaturaLabel,
    tema: s.tema,
    fecha: s.fecha,
    hora: s.hora,
    duracion: s.duracion,
    modalidad: s.modalidad,
    descripcion: s.descripcion,
    subtotal: s.subtotal,
    comision: s.comision,
    total: s.total,
    estado: "pendiente",
    creada: new Date().toISOString(),
  };
  const lista = mtGet("mt_solicitudes", []);
  lista.unshift(registro);
  mtSet("mt_solicitudes", lista);
  estado.ultimaSolicitud = registro;
  irA("sec-confirmacion");
});

/* ---------- Paso 9: Confirmación ---------- */
function pintarConfirmacion() {
  const r = estado.ultimaSolicitud;
  document.getElementById("confirmacion-card").innerHTML = `
    <div class="summary-row"><span class="k">Tutor</span><span class="v">${r.tutorNombre}</span></div>
    <div class="summary-row"><span class="k">Fecha</span><span class="v">${formatoFechaLarga(r.fecha)}, ${r.hora}</span></div>
    <div class="summary-row"><span class="k">Asignatura</span><span class="v">${r.asignatura}</span></div>
    <div class="summary-row"><span class="k">Modalidad</span><span class="v">${MODALIDAD_LABEL[r.modalidad]}</span></div>
    <div class="summary-row"><span class="k">Precio</span><span class="v">${mtFormatoCOP(r.total)}</span></div>
    <div class="summary-row"><span class="k">Estado</span><span class="v">🟡 Pendiente</span></div>
  `;
}

document.getElementById("btn-ver-mis-tutorias").addEventListener("click", () => irA("sec-mis-tutorias"));
document.getElementById("nav-mis-tutorias").addEventListener("click", () => irA("sec-mis-tutorias"));

/* ---------- Paso 10: Mis tutorías ---------- */
const ESTADO_BADGE = {
  pendiente: { icono: "🟡", clase: "badge-pendiente", label: "Pendiente" },
  confirmada: { icono: "🟢", clase: "badge-confirmada", label: "Confirmada" },
  finalizada: { icono: "⚪", clase: "badge-finalizada", label: "Finalizada" },
  cancelada: { icono: "🔴", clase: "badge-cancelada", label: "Cancelada" },
};

function pintarMisTutorias(filtro) {
  const lista = mtGet("mt_solicitudes", []);
  const filtradas = filtro === "todas" ? lista : lista.filter((r) => r.estado === filtro);
  const cont = document.getElementById("lista-mis-tutorias");
  cont.innerHTML = "";

  if (!filtradas.length) {
    cont.innerHTML = `<div class="empty-state">No tienes tutorías ${filtro === "todas" ? "registradas todavía" : "en este estado"}. Cuando solicites una tutoría aparecerá aquí.</div>`;
    return;
  }

  filtradas.forEach((r) => {
    const badge = ESTADO_BADGE[r.estado];
    const item = document.createElement("div");
    item.className = "tutoria-item";
    item.innerHTML = `
      <div class="info">
        <h4>${r.tutorNombre} · ${r.asignatura}</h4>
        <p>${r.tema} — ${formatoFechaLarga(r.fecha)}, ${r.hora} · ${MODALIDAD_LABEL[r.modalidad]} · ${mtFormatoCOP(r.total)}</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="badge ${badge.clase}">${badge.icono} ${badge.label}</span>
      </div>
    `;
    // Controles de demostración para avanzar el estado manualmente
    if (r.estado === "pendiente" || r.estado === "confirmada") {
      const acciones = document.createElement("div");
      acciones.style.cssText = "display:flex;gap:8px;";
      if (r.estado === "pendiente") {
        const btnConfirmar = document.createElement("button");
        btnConfirmar.className = "btn btn-ghost btn-sm";
        btnConfirmar.textContent = "Simular: tutor confirmó";
        btnConfirmar.addEventListener("click", () => cambiarEstadoSolicitud(r.id, "confirmada"));
        acciones.appendChild(btnConfirmar);
      }
      if (r.estado === "confirmada") {
        const btnFinalizar = document.createElement("button");
        btnFinalizar.className = "btn btn-ghost btn-sm";
        btnFinalizar.textContent = "Simular: tutoría finalizada";
        btnFinalizar.addEventListener("click", () => cambiarEstadoSolicitud(r.id, "finalizada"));
        acciones.appendChild(btnFinalizar);
      }
      item.appendChild(acciones);
    }
    cont.appendChild(item);
  });
}

function cambiarEstadoSolicitud(id, nuevoEstado) {
  const lista = mtGet("mt_solicitudes", []);
  const idx = lista.findIndex((r) => r.id === id);
  if (idx >= 0) {
    lista[idx].estado = nuevoEstado;
    mtSet("mt_solicitudes", lista);
  }
  const filtroActivo = document.querySelector(".tab-btn.activo").dataset.estado;
  pintarMisTutorias(filtroActivo);
}

document.getElementById("tabs-tutorias").addEventListener("click", (e) => {
  const btn = e.target.closest(".tab-btn");
  if (!btn) return;
  document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("activo"));
  btn.classList.add("activo");
  pintarMisTutorias(btn.dataset.estado);
});

/* ---------- Navegación general ---------- */
document.getElementById("btn-atras").addEventListener("click", atras);

/* ---------- Inicio ---------- */
pintarAreas();
render("sec-area");
