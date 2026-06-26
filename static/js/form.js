/**
 * form.js · Cronogramas INEB Domingo Juarros 2026
 * Cálculo automático de punteos en tiempo real.
 * Copyright® Machs
 */

// ── Contadores de aspectos por actividad ─────
const aspCount = {};

/**
 * Agrega una nueva fila de aspecto a la actividad indicada.
 * @param {number} actNum - Número de actividad (1-6)
 */
function agregarAspecto(actNum) {
  const container = document.getElementById(`aspectos-act-${actNum}`);
  if (!container) return;

  // Contar filas existentes para el nombre del campo
  const filas = container.querySelectorAll('.aspecto-row');
  const idx   = filas.length + 1;

  const row = document.createElement('div');
  row.className = 'aspecto-row';
  row.innerHTML = `
    <input type="text"
           name="act_${actNum}_asp_${idx}_nombre"
           placeholder="Nombre del aspecto"
           class="asp-nombre" />
    <input type="number"
           name="act_${actNum}_asp_${idx}_puntaje"
           placeholder="Pts"
           min="0" max="999"
           class="asp-puntaje"
           data-act="${actNum}" />
    <button type="button" class="btn-remove-asp" onclick="quitarAspecto(this)">✕</button>
  `;
  container.appendChild(row);

  // Escuchar eventos en el nuevo campo
  const input = row.querySelector('.asp-puntaje');
  input.addEventListener('input', () => recalcularActividad(actNum));
  input.focus();
}

/**
 * Elimina una fila de aspecto y recalcula.
 * @param {HTMLElement} btn - Botón "✕" dentro del .aspecto-row
 */
function quitarAspecto(btn) {
  const row    = btn.closest('.aspecto-row');
  const actNum = parseInt(row.querySelector('.asp-puntaje').dataset.act);
  row.remove();
  renombrarAspectos(actNum);
  recalcularActividad(actNum);
}

/**
 * Renombra los campos name de todos los aspectos de una actividad
 * para mantener la secuencia 1, 2, 3... correcta antes de enviar.
 */
function renombrarAspectos(actNum) {
  const container = document.getElementById(`aspectos-act-${actNum}`);
  if (!container) return;
  container.querySelectorAll('.aspecto-row').forEach((row, i) => {
    const idx    = i + 1;
    const nombre = row.querySelector('.asp-nombre');
    const pts    = row.querySelector('.asp-puntaje');
    if (nombre) nombre.name = `act_${actNum}_asp_${idx}_nombre`;
    if (pts)    pts.name    = `act_${actNum}_asp_${idx}_puntaje`;
  });
}

/**
 * Suma los puntajes de todos los aspectos de una actividad
 * y actualiza el indicador visual.
 */
function recalcularActividad(actNum) {
  const container = document.getElementById(`aspectos-act-${actNum}`);
  let suma = 0;
  if (container) {
    container.querySelectorAll('.asp-puntaje').forEach(inp => {
      suma += parseInt(inp.value || 0, 10);
    });
  }
  const el = document.getElementById(`total-act-${actNum}`);
  if (el) el.textContent = suma;
  recalcularTotalUnidad();
}

/**
 * Suma los totales de las 6 actividades y valida contra la meta.
 */
function recalcularTotalUnidad() {
  let total = 0;
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`total-act-${i}`);
    if (el) total += parseInt(el.textContent || 0, 10);
  }
  const elTotal = document.getElementById('total-unidad');
  if (elTotal) elTotal.textContent = total;
  validarPunteo(total);
}

/**
 * Cambia el color del badge según si total == meta.
 */
function validarPunteo(total) {
  const badge   = document.getElementById('badge-punteo');
  const metaEl  = document.getElementById('punteo_meta');
  if (!badge || !metaEl) return;
  const meta = parseInt(metaEl.value || 0, 10);

  badge.className = 'badge';
  if (total === meta && meta > 0) {
    badge.classList.add('badge-ok');
    badge.textContent = '✔ Punteo correcto';
  } else if (total === 0) {
    badge.classList.add('badge-neutral');
    badge.textContent = '—';
  } else {
    badge.classList.add('badge-err');
    badge.textContent = `⚠ ${total > meta ? total - meta + ' pts de más' : meta - total + ' pts faltantes'}`;
  }
}

// ── Inicialización al cargar la página ────────
document.addEventListener('DOMContentLoaded', () => {

  // Escuchar cambios en todos los puntajes existentes
  document.querySelectorAll('.asp-puntaje').forEach(inp => {
    const actNum = parseInt(inp.dataset.act);
    inp.addEventListener('input', () => recalcularActividad(actNum));
  });

  // Escuchar cambios en la meta
  const metaEl = document.getElementById('punteo_meta');
  if (metaEl) {
    metaEl.addEventListener('input', recalcularTotalUnidad);
  }

  // Calcular totales iniciales (útil al editar un cronograma existente)
  for (let i = 1; i <= 6; i++) {
    recalcularActividad(i);
  }
});
