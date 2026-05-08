const TZ = "America/Costa_Rica";

const SHEET_CALENDARIO = "Calendario";
const SHEET_ENVIADOS = "Enviados";

/*
  IMPORTANTE:
  No escribir BOT_TOKEN ni CHAT_ID directamente en el código.

  Deben configurarse en:
  Google Apps Script > Configuración del proyecto > Propiedades del script

  Variables requeridas:
  - BOT_TOKEN
  - CHAT_ID
*/

/*
  Calendario de ejemplo.
  Reemplazar por los nombres reales únicamente en el proyecto privado.
*/
const ORDEN_BASE = [
  "Persona 1",
  "Persona 2",
  "Persona 3",
  "Persona 4",
  "Persona 5",
  "Persona 6",
  "Persona 7",
  "Persona 8"
];

function crearCalendarioHasta2030() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_CALENDARIO);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_CALENDARIO);
  }

  sheet.clear();

  const filas = [];
  filas.push(["fecha", "nombre", "activo"]);

  let fecha = new Date(2026, 4, 1);
  const fechaFinal = new Date(2030, 11, 31);

  let indice = 0;

  while (fecha <= fechaFinal) {
    const fechaTexto = Utilities.formatDate(fecha, TZ, "yyyy-MM-dd");
    const nombre = ORDEN_BASE[indice % ORDEN_BASE.length];

    filas.push([fechaTexto, nombre, "SI"]);

    fecha.setDate(fecha.getDate() + 1);
    indice++;
  }

  sheet.getRange(1, 1, filas.length, 3).setValues(filas);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
}

function prepararHojaEnviados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_ENVIADOS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ENVIADOS);
  }

  sheet.clear();
  sheet.appendRow(["fecha", "nombre", "enviado_en"]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 3);
}

function enviarRecordatorioDeHoy() {
  const hoy = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd");

  enviarRecordatorioPorFecha(hoy, false);
}

function probarEnvio() {
  enviarRecordatorioPorFecha("2026-05-01", true);
}

function enviarRecordatorioPorFecha(fechaBuscada, forzarEnvio) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_CALENDARIO);

  if (!sheet) {
    return;
  }

  const datos = sheet.getDataRange().getValues();

  for (let i = 1; i < datos.length; i++) {
    const fecha = normalizarFecha(datos[i][0]);
    const nombre = String(datos[i][1] || "").trim();
    const activo = String(datos[i][2] || "").trim().toUpperCase();

    if (fecha !== fechaBuscada) {
      continue;
    }

    if (!fecha || !nombre || activo !== "SI") {
      return;
    }

    if (!forzarEnvio && yaFueEnviado(fecha)) {
      return;
    }

    const mensaje = construirMensaje(nombre);

    enviarTelegram(mensaje);
    registrarEnvio(fecha, nombre);

    return;
  }
}

function construirMensaje(nombre) {
  return `
📖 <b>Recordatorio bíblico diario</b>

Buenos días, grupo.

Hoy corresponde compartir la Palabra a:

<b>${escapeHtml(nombre)}</b>

${escapeHtml(nombre)}, hoy te toca compartir el mensaje bíblico con el grupo.

Puede ser:
• 1 o 2 versículos.
• Una reflexión breve.
• Audio con comentario personal.

Que sea de corazón y para edificación del grupo.

"Lámpara es a mis pies tu palabra,
y lumbrera a mi camino."
Salmo 119:105
`.trim();
}

function enviarTelegram(mensaje) {
  const props = PropertiesService.getScriptProperties();

  const token = props.getProperty("BOT_TOKEN");
  const chatId = props.getProperty("CHAT_ID");

  if (!token) {
    throw new Error("Falta BOT_TOKEN en Propiedades del script.");
  }

  if (!chatId) {
    throw new Error("Falta CHAT_ID en Propiedades del script.");
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text: mensaje,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const respuesta = UrlFetchApp.fetch(url, options);
  const codigo = respuesta.getResponseCode();
  const contenido = respuesta.getContentText();

  if (codigo < 200 || codigo >= 300) {
    throw new Error(contenido);
  }
}

function yaFueEnviado(fecha) {
  const sheet = obtenerSheetEnviados();
  const ultimaFila = sheet.getLastRow();

  if (ultimaFila < 2) {
    return false;
  }

  const fechas = sheet
    .getRange(2, 1, ultimaFila - 1, 1)
    .getValues()
    .flat()
    .map(normalizarFecha);

  return fechas.includes(fecha);
}

function registrarEnvio(fecha, nombre) {
  const sheet = obtenerSheetEnviados();
  const ahora = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");

  sheet.appendRow([fecha, nombre, ahora]);
}

function obtenerSheetEnviados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let sheet = ss.getSheetByName(SHEET_ENVIADOS);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_ENVIADOS);
    sheet.appendRow(["fecha", "nombre", "enviado_en"]);
  }

  return sheet;
}

function normalizarFecha(valor) {
  if (Object.prototype.toString.call(valor) === "[object Date]") {
    return Utilities.formatDate(valor, TZ, "yyyy-MM-dd");
  }

  return String(valor || "").trim().substring(0, 10);
}

function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
