/* =========================================================
   Mi Tutor — tutor.js
   Flujo de postulación, evaluación simulada y panel del tutor.
   ========================================================= */

const PASOS_EVALUACION = [
  { titulo: "Registro de información", desc: "Recibimos los datos de tu postulación." },
  { titulo: "Validación académica", desc: "Verificamos tu universidad, programa y semestre." },
  { titulo: "Evaluación de conocimientos", desc: "Revisamos tu dominio de las materias postuladas." },
  { titulo: "Revisión de la postulación", desc: "Un miembro del equipo revisa tu perfil completo." },
  { titulo: "Aprobado como tutor", desc: "¡Listo! Ya puedes recibir solicitudes de estudiantes." },
];

function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach((s) => s.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
  window.scrollTo({ top: document.querySelector(".flow-main").offsetTop - 40, behavior: "smooth" });
}

/* ---------- Checkboxes de materias (formulario de postulación) ---------- */
function pintarMateriasCheckbox() {
  const cont = document.getElementById("materias-checkbox");
  cont.innerHTML = "";
  Object.entries(MT_AREAS).forEach(([key, area]) => {
    area.asignaturas.forEach((nombre) => {
      const id = "mat-" + mtSlug(nombre);
      const row = document.createElement("label");
      row.className = "checkbox-row";
      row.innerHTML = `<input type="checkbox" id="${id}" value="${key}|${nombre}" /> ${area.icono} ${nombre}`;
      cont.appendChild(row);
    });
  });
}

/* ---------- Envío del formulario de postulación ---------- */
document.getElementById("form-postulacion").addEventListener("submit", (e) => {
  e.preventDefault();

  const materias = Array.from(document.querySelectorAll("#materias-checkbox input:checked")).map((el) => {
    const [area, nombre] = el.value.split("|");
    return { area, nombre };
  });

  if (!materias.length) {
    alert("Selecciona al menos una materia que domines.");
    return;
  }

  const modalidad = document.getElementById("p-modalidad").value;
  const disponibilidad = document.getElementById("p-disponibilidad").value.trim();

  const postulacion = {
    id: mtUid("post"),
    nombre: document.getElementById("p-nombre").value.trim(),
    correo: document.getElementById("p-correo").value.trim(),
    universidad: document.getElementById("p-universidad").value.trim(),
    programa: document.getElementById("p-programa").value.trim(),
    semestre: document.getElementById("p-semestre").value,
    nivel: document.getElementById("p-nivel").value,
    materias,
    disponibilidad,
    modalidad,
    experiencia: document.getElementById("p-experiencia").value.trim(),
    motivacion: document.getElementById("p-motivacion").value.trim(),
    pasoActual: 0,
    aprobado: false,
    precio: 15000,
    creada: new Date().toISOString(),
  };

  mtSet("mt_postulacion", postulacion);
  irAEvaluacion();
});

/* ---------- Pantalla de evaluación (simulada) ---------- */
function pintarEvaluacion() {
  const p = mtGet("mt_postulacion", null);
  if (!p) return;
  const cont = document.getElementById("lista-eval-steps");
  cont.innerHTML = "";

  PASOS_EVALUACION.forEach((paso, i) => {
    const li = document.createElement("li");
    li.className = i < p.pasoActual ? "done" : i === p.pasoActual ? "actual" : "";
    const dotContent = i < p.pasoActual ? "✓" : (i + 1);
    li.innerHTML = `
      <span class="dot">${dotContent}</span>
      <div>
        <h4>${paso.titulo}</h4>
        <p>${paso.desc}</p>
      </div>
    `;
    cont.appendChild(li);
  });

  const btnAvanzar = document.getElementById("btn-avanzar-evaluacion");
  const btnPanel = document.getElementById("btn-ir-panel");

  if (p.pasoActual >= PASOS_EVALUACION.length - 1) {
    btnAvanzar.style.display = "none";
    btnPanel.style.display = "inline-flex";
  } else {
    btnAvanzar.style.display = "inline-flex";
    btnPanel.style.display = "none";
  }
}

function irAEvaluacion() {
  pintarEvaluacion();
  mostrarSeccion("sec-evaluacion");
}

document.getElementById("btn-avanzar-evaluacion").addEventListener("click", () => {
  const p = mtGet("mt_postulacion", null);
  if (!p) return;
  p.pasoActual = Math.min(p.pasoActual + 1, PASOS_EVALUACION.length - 1);
  if (p.pasoActual === PASOS_EVALUACION.length - 1) {
    p.aprobado = true;
  }
  mtSet("mt_postulacion", p);
  pintarEvaluacion();
});

document.getElementById("btn-ir-panel").addEventListener("click", irAPanel);
document.getElementById("nav-mi-panel").addEventListener("click", irAPanel);

/* ---------- Panel del tutor ---------- */
function semillaSolicitudesTutor() {
  const existentes = mtGet("mt_solicitudes_tutor", null);
  if (existentes) return existentes;
  const semilla = [
    {
      id: "sol-tutor-001", numero: "001", estudiante: "Carlos", materia: "Cálculo I",
      tema: "Derivadas", fecha: "2026-09-12", hora: "3:00 PM", modalidad: "virtual",
      estado: "pendiente",
    },
    {
      id: "sol-tutor-002", numero: "002", estudiante: "Mariana", materia: "Física I",
      tema: "Leyes de Newton", fecha: "2026-09-13", hora: "5:00 PM", modalidad: "presencial",
      estado: "pendiente",
    },
    {
      id: "sol-tutor-003", numero: "003", estudiante: "Felipe", materia: "Química General",
      tema: "Estequiometría", fecha: "2026-09-10", hora: "10:00 AM", modalidad: "virtual",
      estado: "confirmada",
    },
  ];
  mtSet("mt_solicitudes_tutor", semilla);
  return semilla;
}

function irAPanel() {
  const p = mtGet("mt_postulacion", null);
  if (!p || !p.aprobado) return;

  document.getElementById("nav-mi-panel").style.display = "inline-flex";

  document.getElementById("panel-perfil-resumen").innerHTML =
    `<strong>${p.nombre}</strong><br>${p.universidad}<br><br>` +
    `<strong>Materias:</strong> ${p.materias.map((m) => m.nombre).join(", ")}`;

  document.getElementById("panel-precio").value = p.precio || 15000;
  document.getElementById("panel-modalidad").value = p.modalidad || "virtual";
  document.getElementById("panel-disponibilidad").value = p.disponibilidad || "";

  pintarSolicitudesTutor();
  mostrarSeccion("sec-panel");
}

document.getElementById("btn-guardar-perfil").addEventListener("click", () => {
  const p = mtGet("mt_postulacion", null);
  if (!p) return;
  p.precio = parseInt(document.getElementById("panel-precio").value, 10) || 15000;
  p.modalidad = document.getElementById("panel-modalidad").value;
  p.disponibilidad = document.getElementById("panel-disponibilidad").value.trim();
  mtSet("mt_postulacion", p);
  const boton = document.getElementById("btn-guardar-perfil");
  const original = boton.textContent;
  boton.textContent = "Guardado ✓";
  setTimeout(() => (boton.textContent = original), 1400);
});

const ESTADO_BADGE_TUTOR = {
  pendiente: { icono: "🟡", clase: "badge-pendiente", label: "Pendiente" },
  confirmada: { icono: "🟢", clase: "badge-confirmada", label: "Confirmada" },
  cancelada: { icono: "🔴", clase: "badge-cancelada", label: "Rechazada" },
};

function pintarSolicitudesTutor() {
  const solicitudes = semillaSolicitudesTutor();
  const cont = document.getElementById("lista-solicitudes-tutor");
  cont.innerHTML = "";

  if (!solicitudes.length) {
    cont.innerHTML = `<div class="empty-state">Todavía no tienes solicitudes de estudiantes.</div>`;
    return;
  }

  solicitudes.forEach((s) => {
    const badge = ESTADO_BADGE_TUTOR[s.estado];
    const item = document.createElement("div");
    item.className = "tutoria-item";
    item.innerHTML = `
      <div class="info">
        <h4>Solicitud #${s.numero} — ${s.estudiante}</h4>
        <p>${s.materia} · ${s.tema} · ${formatoFechaCortaTutor(s.fecha)}, ${s.hora} · ${s.modalidad === "virtual" ? "Virtual" : "Presencial"}</p>
      </div>
    `;
    const derecha = document.createElement("div");
    derecha.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;";

    if (s.estado === "pendiente") {
      const btnAceptar = document.createElement("button");
      btnAceptar.className = "btn btn-primary btn-sm";
      btnAceptar.textContent = "Aceptar";
      btnAceptar.addEventListener("click", () => cambiarEstadoTutor(s.id, "confirmada"));

      const btnRechazar = document.createElement("button");
      btnRechazar.className = "btn btn-danger btn-sm";
      btnRechazar.textContent = "Rechazar";
      btnRechazar.addEventListener("click", () => cambiarEstadoTutor(s.id, "cancelada"));

      derecha.appendChild(btnAceptar);
      derecha.appendChild(btnRechazar);
    } else {
      const span = document.createElement("span");
      span.className = "badge " + badge.clase;
      span.textContent = `${badge.icono} ${badge.label}`;
      derecha.appendChild(span);
    }

    item.appendChild(derecha);
    cont.appendChild(item);
  });
}

function formatoFechaCortaTutor(fechaISO) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", { day: "numeric", month: "long" });
}

function cambiarEstadoTutor(id, nuevoEstado) {
  const solicitudes = mtGet("mt_solicitudes_tutor", []);
  const idx = solicitudes.findIndex((s) => s.id === id);
  if (idx >= 0) {
    solicitudes[idx].estado = nuevoEstado;
    mtSet("mt_solicitudes_tutor", solicitudes);
  }
  pintarSolicitudesTutor();
}

/* ---------- Botón inicial y estado al cargar la página ---------- */
document.getElementById("btn-postularme").addEventListener("click", () => mostrarSeccion("sec-postulacion"));

(function init() {
  pintarMateriasCheckbox();
  const p = mtGet("mt_postulacion", null);
  if (!p) {
    mostrarSeccion("sec-intro");
    return;
  }
  if (p.aprobado) {
    irAPanel();
  } else {
    irAEvaluacion();
  }
})();
