/* =========================================================
   Mi Tutor — app.js
   Datos compartidos + utilidades (usados por las 3 páginas)
   ========================================================= */

/* ---------- Utilidades ---------- */
function mtSlug(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function mtFormatoCOP(valor) {
  return "$" + Math.round(valor).toLocaleString("es-CO");
}

function mtUid(prefijo) {
  return prefijo + "-" + Date.now().toString(36) + Math.floor(Math.random() * 1000);
}

function mtGet(clave, porDefecto) {
  try {
    const raw = localStorage.getItem(clave);
    return raw ? JSON.parse(raw) : porDefecto;
  } catch (e) {
    return porDefecto;
  }
}

function mtSet(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

function mtIniciales(nombre) {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

/* ---------- Áreas y asignaturas ---------- */
const MT_AREAS = {
  matematicas: {
    label: "Matemáticas",
    icono: "📐",
    color: "var(--math)",
    tint: "var(--math-tint)",
    asignaturas: [
      "Matemáticas Básicas", "Cálculo I", "Cálculo II", "Cálculo III",
      "Álgebra", "Álgebra Lineal", "Geometría", "Ecuaciones Diferenciales",
      "Estadística", "Probabilidad",
    ],
  },
  fisica: {
    label: "Física",
    icono: "⚡",
    color: "var(--physics)",
    tint: "var(--physics-tint)",
    asignaturas: [
      "Física I", "Física II", "Física III", "Mecánica",
      "Electricidad y Magnetismo", "Circuitos", "Termodinámica",
    ],
  },
  quimica: {
    label: "Química",
    icono: "🧪",
    color: "var(--chem)",
    tint: "var(--chem-tint)",
    asignaturas: [
      "Química General", "Química I", "Química II", "Química Orgánica",
      "Química Inorgánica", "Estequiometría", "Termodinámica Química",
    ],
  },
};

/* ---------- Necesidades ---------- */
const MT_NECESIDADES = [
  { id: "tutoria", icono: "📚", label: "Tutoría", desc: "Acompañamiento continuo en la asignatura." },
  { id: "parcial", icono: "📝", label: "Preparación para parcial", desc: "Repaso intensivo antes de tu evaluación." },
  { id: "taller", icono: "📄", label: "Ayuda con taller", desc: "Resolver dudas de un taller o guía puntual." },
  { id: "refuerzo", icono: "🔎", label: "Refuerzo de un tema específico", desc: "Profundizar en un tema que no te quedó claro." },
];

/* ---------- Temas por asignatura (ejemplos) ---------- */
const MT_TEMAS = {
  "calculo-i": ["Límites", "Derivadas", "Aplicaciones de derivadas", "Funciones", "Continuidad"],
  "calculo-ii": ["Integrales", "Aplicaciones de integrales", "Series", "Técnicas de integración"],
  "calculo-iii": ["Integrales múltiples", "Campos vectoriales", "Coordenadas polares"],
  "algebra": ["Ecuaciones lineales", "Factorización", "Sistemas de ecuaciones", "Polinomios"],
  "algebra-lineal": ["Matrices", "Determinantes", "Espacios vectoriales", "Transformaciones lineales"],
  "estadistica": ["Medidas de tendencia central", "Distribuciones", "Regresión lineal"],
  "fisica-i": ["Cinemática", "Leyes de Newton", "Trabajo y energía", "Movimiento circular"],
  "fisica-ii": ["Ondas", "Fluidos", "Óptica geométrica"],
  "electricidad-y-magnetismo": ["Campo eléctrico", "Ley de Coulomb", "Circuitos RC", "Inducción magnética"],
  "termodinamica": ["Leyes de la termodinámica", "Ciclos térmicos", "Entropía"],
  "quimica-general": ["Estructura atómica", "Tabla periódica", "Enlaces químicos", "Reacciones químicas"],
  "quimica-organica": ["Nomenclatura", "Hidrocarburos", "Grupos funcionales", "Reacciones orgánicas"],
  "estequiometria": ["Balanceo de ecuaciones", "Reactivo límite", "Rendimiento de reacción"],
};
const MT_TEMAS_DEFAULT = ["Conceptos básicos", "Ejercicios prácticos", "Aplicaciones", "Repaso general"];

function mtTemasDe(asignaturaSlug) {
  return MT_TEMAS[asignaturaSlug] || MT_TEMAS_DEFAULT;
}

/* ---------- Tutores (datos simulados) ---------- */
const MT_TUTORES = [
  {
    id: "t1", nombre: "Laura Gómez", area: "matematicas",
    asignaturas: ["matematicas-basicas", "calculo-i", "calculo-ii", "algebra"],
    calificacion: 4.9, tutorias: 32, precio: 18000, modalidad: "ambas",
    disponibilidad: ["Lun 3–6pm", "Mié 4–7pm", "Sáb 10am–1pm"],
    universidad: "Universidad Nacional",
    experiencia: "Monitora de Cálculo I y II durante 2 años. Ha acompañado a más de 30 estudiantes.",
    descripcion: "Me gusta explicar paso a paso y con ejemplos gráficos. Nada de fórmulas sin entender de dónde salen.",
  },
  {
    id: "t2", nombre: "Andrés Ríos", area: "matematicas",
    asignaturas: ["algebra-lineal", "geometria", "ecuaciones-diferenciales"],
    calificacion: 4.7, tutorias: 21, precio: 17000, modalidad: "ambas",
    disponibilidad: ["Mar 2–5pm", "Jue 5–8pm"],
    universidad: "Universidad de los Andes",
    experiencia: "Tutor particular desde hace 1.5 años, enfocado en álgebra lineal y ecuaciones diferenciales.",
    descripcion: "Convierto los ejercicios abstractos en problemas visuales, así se entienden mucho mejor.",
  },
  {
    id: "t3", nombre: "Camila Torres", area: "matematicas",
    asignaturas: ["estadistica", "probabilidad", "calculo-iii"],
    calificacion: 4.8, tutorias: 40, precio: 20000, modalidad: "presencial",
    disponibilidad: ["Lun 9am–12m", "Vie 3–6pm"],
    universidad: "Universidad Javeriana",
    experiencia: "Auxiliar docente de Estadística I. Le encanta preparar simulacros de parcial.",
    descripcion: "Trabajamos con datos reales para que la estadística deje de sentirse abstracta.",
  },
  {
    id: "t4", nombre: "Julián Peña", area: "fisica",
    asignaturas: ["fisica-i", "fisica-ii", "mecanica"],
    calificacion: 4.6, tutorias: 18, precio: 16000, modalidad: "virtual",
    disponibilidad: ["Mié 6–9pm", "Sáb 2–5pm"],
    universidad: "Universidad Nacional",
    experiencia: "1 año como tutor de Física I. Usa simulaciones interactivas en sus sesiones.",
    descripcion: "Física se aprende resolviendo, no memorizando. Practicamos muchos ejercicios juntos.",
  },
  {
    id: "t5", nombre: "Sofía Martínez", area: "fisica",
    asignaturas: ["electricidad-y-magnetismo", "circuitos", "fisica-iii"],
    calificacion: 4.9, tutorias: 27, precio: 19000, modalidad: "ambas",
    disponibilidad: ["Lun 4–7pm", "Jue 4–7pm"],
    universidad: "Universidad de los Andes",
    experiencia: "Ganadora de olimpiadas de física en el colegio, ahora tutora de electromagnetismo.",
    descripcion: "Explico los circuitos con analogías cotidianas antes de entrar a las fórmulas.",
  },
  {
    id: "t6", nombre: "Diego Herrera", area: "fisica",
    asignaturas: ["termodinamica", "fisica-i"],
    calificacion: 4.5, tutorias: 12, precio: 15000, modalidad: "virtual",
    disponibilidad: ["Mar 5–8pm"],
    universidad: "Universidad Distrital",
    experiencia: "Estudiante de Ingeniería Mecánica, tutor desde hace 8 meses.",
    descripcion: "Me enfoco en que entiendas el concepto físico antes de manipular la fórmula.",
  },
  {
    id: "t7", nombre: "Valentina Cruz", area: "quimica",
    asignaturas: ["quimica-general", "quimica-i", "estequiometria"],
    calificacion: 4.8, tutorias: 25, precio: 17000, modalidad: "ambas",
    disponibilidad: ["Lun 2–5pm", "Vie 10am–1pm"],
    universidad: "Universidad Javeriana",
    experiencia: "Monitora de laboratorio de Química General por 3 semestres.",
    descripcion: "Uso muchos ejemplos de la vida diaria para que la química deje de ser abstracta.",
  },
  {
    id: "t8", nombre: "Mateo Salazar", area: "quimica",
    asignaturas: ["quimica-organica", "quimica-inorganica", "quimica-ii"],
    calificacion: 4.7, tutorias: 19, precio: 18000, modalidad: "presencial",
    disponibilidad: ["Mié 3–6pm", "Sáb 9am–12m"],
    universidad: "Universidad Nacional",
    experiencia: "Tutor de química orgánica desde hace un año, enfocado en nomenclatura y mecanismos.",
    descripcion: "Dibujamos cada molécula juntos hasta que la estructura tenga sentido para ti.",
  },
];

function mtTutoresPorAsignatura(areaKey, asignaturaSlug) {
  const exactos = MT_TUTORES.filter(
    (t) => t.area === areaKey && t.asignaturas.includes(asignaturaSlug)
  );
  if (exactos.length) return exactos;
  return MT_TUTORES.filter((t) => t.area === areaKey);
}

function mtTutorPorId(id) {
  return MT_TUTORES.find((t) => t.id === id);
}

/* ---------- Comisión de la plataforma ---------- */
const MT_COMISION_PORCENTAJE = 0.1; // 10% de comisión para Mi Tutor

function mtCalcularPrecio(precioHora, duracionMin) {
  const subtotal = Math.round((precioHora * duracionMin) / 60);
  const comision = Math.round(subtotal * MT_COMISION_PORCENTAJE);
  return { subtotal, comision, total: subtotal + comision };
}

/* ---------- Reset de demo (usado en footers) ---------- */
function mtReiniciarDemo() {
  const confirmado = confirm(
    "Esto borrará las solicitudes, postulaciones y estados guardados en este navegador. ¿Continuar?"
  );
  if (!confirmado) return;
  [
    "mt_solicitudes",
    "mt_postulacion",
    "mt_solicitudes_tutor",
  ].forEach((k) => localStorage.removeItem(k));
  window.location.href = "index.html";
}

/* ---------- Año en footer ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-anio]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
  document.querySelectorAll("[data-reset-demo]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      mtReiniciarDemo();
    });
  });
});
