const CONFIG = {
  url: "https://uibiwhkxlyxdfytvudbn.supabase.co",
  key: "sb_publishable_R-auhGcSmwSl-1U9WdGe3g_ZYm5BZEt",
};
const client = window.supabase.createClient(CONFIG.url, CONFIG.key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
const $ = (id) => document.getElementById(id);
let session = null,
  profile = null,
  sites = [],
  shifts = [],
  people = [],
  qrTimer = null,
  qrSeconds = 0,
  scannerStream = null,
  scannerFrame = null,
  markType = "entrada",
  biometric = null,
  faceStream = null,
  faceMode = "enroll",
  faceMarkType = "entrada",
  faceSamples = [],
  faceModelsReady = false,
  faceModelsPromise = null;
const siteName = (id) => sites.find((site) => site.codigo === id)?.nombre || id;
const dateIso = (date) => {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() - copy.getTimezoneOffset());
  return copy.toISOString().slice(0, 10);
};
const mondayOf = (value) => {
  const date = new Date(`${value || dateIso(new Date())}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date;
};
const schedulingMonday = () => {
  const today = new Date();
  const monday = mondayOf(dateIso(today));
  if (today.getDay() === 0) monday.setDate(monday.getDate() + 7);
  return monday;
};
const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};
const formatDate = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("es-PE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("es-PE", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";
const clear = (node) => {
  while (node?.firstChild) node.firstChild.remove();
};
function status(message, error = false) {
  $("attendanceStatus").textContent = message;
  $("attendanceStatus").style.color = error ? "#b42318" : "#607184";
}
function tardinessInfo(minutes, discount = null, state = "") {
  const late = Math.max(0, Number(minutes) || 0);
  const amount =
    discount === null || discount === undefined
      ? Math.min(late, 15)
      : Math.max(0, Number(discount) || 0);
  const nonWorking = state === "no_laborable_tardanza" || late > 15;
  return {
    late,
    amount,
    nonWorking,
    state: nonWorking ? "no_laborable_tardanza" : late > 0 ? "tardanza" : "laborable",
  };
}
const money = (value) => `S/${(Number(value) || 0).toFixed(2)}`;
function option(text, value) {
  const item = document.createElement("option");
  item.textContent = text;
  item.value = value;
  return item;
}
const globalRoles = [
  "encargado_ti",
  "jefe_operaciones",
  "coordinador_operaciones",
  "gdh",
];
function isGlobalRole() {
  return globalRoles.includes(profile?.rol);
}
function isManager() {
  return [
    "encargado_ti",
    "admin",
    "jefe_operaciones",
    "coordinador_operaciones",
    "gdh",
  ].includes(profile?.rol);
}
function canGenerateQr() {
  return isManager() || ["supervisor", "marcador"].includes(profile?.rol);
}
function allowedSites() {
  return isGlobalRole()
    ? sites
    : sites.filter((site) => site.codigo === profile?.sede);
}
function fillSiteSelect(select, preferred = "") {
  clear(select);
  allowedSites().forEach((site) =>
    select.appendChild(option(site.nombre, site.codigo)),
  );
  if ([...select.options].some((item) => item.value === preferred))
    select.value = preferred;
}

async function init() {
  const {
    data: { session: current },
  } = await client.auth.getSession();
  session = current;
  if (!session?.user) {
    location.replace("index.html");
    return;
  }
  const { data, error } = await client
    .from("profiles")
    .select("id,nombre,apellidos_nombres,dni,rol,sede,activo")
    .eq("id", session.user.id)
    .single();
  if (error || !data?.activo) {
    location.replace("index.html");
    return;
  }
  profile = data;
  const [siteResult, shiftResult] = await Promise.all([
    client
      .from("asistencia_sedes")
      .select("*")
      .eq("activa", true)
      .order("nombre"),
    client
      .from("asistencia_turnos")
      .select("*")
      .eq("activo", true)
      .order("hora_inicio"),
  ]);
  if (siteResult.error || shiftResult.error) {
    status("No se pudo cargar la configuracion de asistencia.", true);
    return;
  }
  sites = siteResult.data || [];
  shifts = shiftResult.data || [];
  $("attendanceUser").textContent =
    `${profile.apellidos_nombres || profile.nombre}${profile.dni ? ` - DNI ${profile.dni}` : ""} - ${profile.rol}`;
  $("attendanceApp").hidden = false;
  if (
    [
      "anfitrion",
      "tecnico",
      "supervisor",
      "fortaleza",
      "encargado_ti",
      "admin",
    ].includes(profile.rol)
  )
    $("workerPanel").hidden = false;
  const markerMode = profile.rol === "marcador";
  $("markerKioskPanel").hidden = !markerMode;
  $("biometricPanel").hidden = markerMode;
  $("faceOfficialActions").hidden = ![
    "anfitrion",
    "tecnico",
    "supervisor",
    "fortaleza",
    "encargado_ti",
    "admin",
  ].includes(profile.rol);
  $("faceTest").hidden = !isManager();
  if (profile.rol !== "marcador") await loadBiometric();
  if (canGenerateQr()) {
    ["qrSite", "scheduleSite", "summarySite"].forEach((id) =>
      fillSiteSelect($(id), isGlobalRole() ? "puruchuco" : profile.sede),
    );
    $("qrSite").disabled = !isGlobalRole();
    document
      .querySelectorAll('[data-attendance-tab="schedule"],[data-attendance-tab="summary"]')
      .forEach((button) => (button.hidden = !isManager()));
    if (isManager()) {
      $("adminPanel").hidden = false;
      $("scheduleWeek").value = dateIso(schedulingMonday());
      $("summaryMonth").value = dateIso(new Date()).slice(0, 7);
      await loadSchedule();
    }
    if (profile.rol === "supervisor") $("adminPanel").hidden = false;
  }
  const preloadFace = () => loadFaceModels().catch(() => {});
  if ("requestIdleCallback" in window)
    requestIdleCallback(preloadFace, { timeout: 1500 });
  else setTimeout(preloadFace, 500);
  status("Asistencia lista.");
}

async function loadWorker() {
  const start = mondayOf(),
    end = addDays(start, 6),
    today = dateIso(new Date());
  const [{ data: schedule, error }, { data: records }] = await Promise.all([
    client
      .from("asistencia_programacion")
      .select("id,sede,fecha,estado,asistencia_turnos(*)")
      .eq("user_id", session.user.id)
      .gte("fecha", dateIso(start))
      .lte("fecha", dateIso(end))
      .order("fecha"),
    client
      .from("asistencia_registros")
      .select("*")
      .eq("user_id", session.user.id)
      .gte("fecha_laboral", dateIso(start))
      .lte("fecha_laboral", dateIso(end)),
  ]);
  if (error) {
    status("No se pudo cargar tu programacion.", true);
    return;
  }
  const week = $("workerWeek");
  clear(week);
  const map = new Map((schedule || []).map((item) => [item.fecha, item]));
  const recordMap = new Map(
    (records || []).map((item) => [item.fecha_laboral, item]),
  );
  for (let i = 0; i < 7; i++) {
    const date = dateIso(addDays(start, i)),
      item = map.get(date),
      record = recordMap.get(date);
    const card = document.createElement("article");
    card.className = "week-item";
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    const penalty = record
      ? tardinessInfo(
          record.minutos_tardanza,
          record.descuento_tardanza,
          record.estado_jornada,
        )
      : null;
    if (penalty?.late) card.classList.add("late");
    if (penalty?.nonWorking) card.classList.add("non-working");
    title.textContent = formatDate(date);
    detail.textContent =
      item?.estado === "programado"
        ? `${item.asistencia_turnos?.nombre || "Turno"} - ${siteName(item.sede)}${record ? ` | Entrada ${formatDateTime(record.entrada_at)} | Salida ${formatDateTime(record.salida_at)}` : ""}`
        : item
          ? item.estado
          : "Sin programacion";
    card.append(title, detail);
    if (penalty?.late) {
      const penaltyText = document.createElement("span");
      penaltyText.className = "attendance-penalty";
      penaltyText.textContent = `Tardanza: ${penalty.late} min | Descuento: ${money(penalty.amount)}`;
      card.appendChild(penaltyText);
    }
    if (penalty?.nonWorking) {
      const nonWorking = document.createElement("span");
      nonWorking.className = "non-working-label";
      nonWorking.textContent = "Día no laborable por superar 15 minutos de tardanza";
      card.appendChild(nonWorking);
    }
    week.appendChild(card);
  }
  const todaySchedule = map.get(today);
  const todayRecord =
    recordMap.get(today) || (records || []).find((item) => !item.salida_at);
  const box = $("todayShift");
  clear(box);
  const strong = document.createElement("strong"),
    text = document.createElement("span");
  strong.textContent =
    todaySchedule?.estado === "programado"
      ? todaySchedule.asistencia_turnos?.nombre || "Turno programado"
      : "Sin turno programado hoy";
  text.textContent =
    todaySchedule?.estado === "programado"
      ? `${siteName(todaySchedule.sede)} | Refrigerio ${todaySchedule.asistencia_turnos?.refrigerio_minutos || 0} min${todaySchedule.asistencia_turnos?.es_nocturno ? " | Turno nocturno" : ""}`
      : "Solicita al administrador que programe tu semana.";
  box.append(strong, text);
  const canEnter = Boolean(
    todaySchedule &&
    todaySchedule.estado === "programado" &&
    !todayRecord?.entrada_at,
  );
  const todayPenalty = todayRecord
    ? tardinessInfo(
        todayRecord.minutos_tardanza,
        todayRecord.descuento_tardanza,
        todayRecord.estado_jornada,
      )
    : null;
  const canExit = Boolean(
    todayRecord?.entrada_at && !todayRecord?.salida_at && !todayPenalty?.nonWorking,
  );
  $("markEntry").disabled = !canEnter;
  $("markExit").disabled = !canExit;
  if ($("faceEntry")) $("faceEntry").disabled = !canEnter || !biometric;
  if ($("faceExit")) $("faceExit").disabled = !canExit || !biometric;
  const help = $("markHelp");
  help.className = "mark-help";
  if (!todaySchedule || todaySchedule.estado !== "programado") {
    help.textContent =
      "Marcacion bloqueada: el administrador debe asignarte un turno para hoy.";
    help.classList.add("warning");
  } else if (todayPenalty?.nonWorking) {
    help.textContent = `Jornada no laborable: ${todayPenalty.late} minutos de tardanza. Descuento aplicado: ${money(todayPenalty.amount)}.`;
    help.classList.add("warning");
  } else if (canEnter)
    help.textContent =
      "Turno programado. Pulsa Marcar entrada para abrir la camara y escanear el QR.";
  else if (canExit)
    help.textContent =
      "Entrada registrada. Pulsa Marcar salida al terminar tu jornada.";
  else
    help.textContent =
      "La entrada y salida de este turno ya fueron registradas.";
}

function switchTab(name) {
  document
    .querySelectorAll("[data-attendance-tab]")
    .forEach((button) =>
      button.setAttribute(
        "aria-selected",
        String(button.dataset.attendanceTab === name),
      ),
    );
  document
    .querySelectorAll("[data-attendance-view]")
    .forEach((view) => (view.hidden = view.dataset.attendanceView !== name));
}
async function generateQr() {
  const site = $("qrSite").value;
  if (!site) return;
  const { data, error } = await client.functions.invoke("attendance-qr", {
    body: { action: "generate", site },
  });
  if (error || data?.error) {
    status(data?.error || "No se pudo generar el QR.", true);
    return;
  }
  const container = $("qrCode");
  clear(container);
  new QRCode(container, {
    text: data.token,
    width: 280,
    height: 280,
    correctLevel: QRCode.CorrectLevel.M,
  });
  $("qrSiteName").textContent = data.site.nombre;
  $("qrTolerance").textContent = data.tolerance
    ? `Tolerancia de este celular: ${data.tolerance} minutos`
    : "Este celular no concede tolerancia";
  qrSeconds = 55;
  updateQrCountdown();
}
function updateQrCountdown() {
  $("qrCountdown").textContent = qrTimer
    ? `Renovacion en ${qrSeconds} s`
    : "QR detenido";
}
async function startQr() {
  stopQr();
  await generateQr();
  qrTimer = setInterval(async () => {
    qrSeconds -= 1;
    if (qrSeconds <= 0) await generateQr();
    else updateQrCountdown();
  }, 1000);
}
function stopQr() {
  if (qrTimer) clearInterval(qrTimer);
  qrTimer = null;
  qrSeconds = 0;
  updateQrCountdown();
}

async function loadSchedule() {
  const site = $("scheduleSite").value;
  if (!site) return;
  status("Cargando programacion...");
  const start = mondayOf($("scheduleWeek").value);
  $("scheduleWeek").value = dateIso(start);
  const end = addDays(start, 6);
  const [
    { data: staff, error: staffError },
    { data: scheduled, error: scheduleError },
  ] = await Promise.all([
    client.rpc("listar_personal_asistencia", { sede_arg: site }),
    client
      .from("asistencia_programacion")
      .select("*")
      .eq("sede", site)
      .gte("fecha", dateIso(start))
      .lte("fecha", dateIso(end)),
  ]);
  if (staffError || scheduleError) {
    status("No se pudo cargar la semana.", true);
    return;
  }
  people = staff || [];
  const map = new Map(
    (scheduled || []).map((item) => [`${item.user_id}:${item.fecha}`, item]),
  );
  const grid = $("scheduleGrid");
  clear(grid);
  people.forEach((person) => {
    const card = document.createElement("article");
    card.className = "schedule-person";
    const heading = document.createElement("h3");
    heading.textContent = `${person.nombre} - ${person.rol}`;
    const days = document.createElement("div");
    days.className = "schedule-days";
    for (let i = 0; i < 7; i++) {
      const date = dateIso(addDays(start, i)),
        saved = map.get(`${person.id}:${date}`);
      const label = document.createElement("label");
      label.className = "schedule-day";
      label.textContent = formatDate(date);
      const select = document.createElement("select");
      select.dataset.userId = person.id;
      select.dataset.date = date;
      select.append(
        option("Sin asignar", ""),
        option("Descanso", "descanso"),
        option("Libre", "libre"),
      );
      shifts.forEach((shift) =>
        select.append(option(shift.nombre, `turno:${shift.id}`)),
      );
      select.value =
        saved?.estado === "programado"
          ? `turno:${saved.turno_id}`
          : saved?.estado || "";
      label.appendChild(select);
      days.appendChild(label);
    }
    card.append(heading, days);
    grid.appendChild(card);
  });
  status(`Semana cargada: ${people.length} trabajadores.`);
}
async function saveSchedule() {
  const site = $("scheduleSite").value;
  const items = [
    ...document.querySelectorAll("#scheduleGrid select[data-user-id]"),
  ]
    .filter((select) => select.value)
    .map((select) => ({
      user_id: select.dataset.userId,
      sede: site,
      fecha: select.dataset.date,
      estado: select.value.startsWith("turno:") ? "programado" : select.value,
      turno_id: select.value.startsWith("turno:")
        ? select.value.split(":")[1]
        : null,
    }));
  if (!items.length) {
    status("Selecciona al menos un turno o descanso.", true);
    return;
  }
  const { data, error } = await client.rpc("guardar_programacion_asistencia", {
    items_arg: items,
  });
  if (error) {
    status(error.message || "No se pudo guardar la semana.", true);
    return;
  }
  status(`${data} asignaciones guardadas.`);
  await loadSchedule();
}

async function loadSummary() {
  const site = $("summarySite").value,
    month = $("summaryMonth").value;
  if (!site || !month) return;
  const start = `${month}-01`,
    endDate = new Date(`${start}T12:00:00`);
  endDate.setMonth(endDate.getMonth() + 1);
  const end = dateIso(endDate);
  const [
    { data: summary, error },
    { data: pending, error: pendingError },
    { data: staff },
    { data: records, error: recordsError },
  ] = await Promise.all([
    client.rpc("resumen_asistencia_mes", { sede_arg: site, mes_arg: month }),
    client
      .from("asistencia_registros")
      .select("*")
      .eq("sede", site)
      .gte("fecha_laboral", start)
      .lt("fecha_laboral", end)
      .eq("estado_extra", "pendiente")
      .order("fecha_laboral"),
    client.rpc("listar_personal_asistencia", { sede_arg: site }),
    client
      .from("asistencia_registros")
      .select(
        "user_id,minutos_tardanza,descuento_tardanza,estado_jornada,minutos_trabajados",
      )
      .eq("sede", site)
      .gte("fecha_laboral", start)
      .lt("fecha_laboral", end),
  ]);
  if (error || pendingError || recordsError) {
    status("No se pudo cargar el resumen mensual.", true);
    return;
  }
  const names = new Map((staff || []).map((item) => [item.id, item.nombre]));
  const penalties = new Map();
  (records || []).forEach((record) => {
    const penalty = tardinessInfo(
      record.minutos_tardanza,
      record.descuento_tardanza,
      record.estado_jornada,
    );
    const current = penalties.get(record.user_id) || {
      discount: 0,
      nonWorking: 0,
      workedMinutes: 0,
    };
    current.discount += penalty.amount;
    current.nonWorking += penalty.nonWorking ? 1 : 0;
    current.workedMinutes += penalty.nonWorking
      ? 0
      : Number(record.minutos_trabajados) || 0;
    penalties.set(record.user_id, current);
  });
  const list = $("monthlySummary");
  clear(list);
  (summary || []).forEach((item) => {
    const penalty = penalties.get(item.user_id) || {
      discount: 0,
      nonWorking: 0,
      workedMinutes: 0,
    };
    const card = document.createElement("article");
    card.className = "summary-item";
    if (penalty.discount) card.classList.add("has-discount");
    if (penalty.nonWorking) card.classList.add("non-working");
    const laborableDays = Number(item.dias_trabajados) || 0;
    card.innerHTML = `<strong>${escapeHtml(item.nombre)} - ${escapeHtml(item.rol)}</strong><span>${horasDesdeMinutos(penalty.workedMinutes)} h | ${laborableDays} días laborables | ${penalty.nonWorking} días no laborables | Tardanza ${item.minutos_tardanza} min | Descuento ${money(penalty.discount)} | Nocturnas ${item.horas_nocturnas} h | Extra 25%: ${item.horas_extra_25} h | Extra 35%: ${item.horas_extra_35} h</span>`;
    list.appendChild(card);
  });
  const extras = $("pendingExtras");
  clear(extras);
  if (!(pending || []).length) {
    extras.appendChild(emptyCard("No hay horas extra pendientes."));
  } else
    (pending || []).forEach((item) =>
      extras.appendChild(extraCard(item, names.get(item.user_id) || "Usuario")),
    );
  status("Resumen actualizado.");
}
function horasDesdeMinutos(minutos) {
  return Number(((Number(minutos) || 0) / 60).toFixed(2));
}
function textoFechaHoraExcel(valor) {
  return valor
    ? new Date(valor).toLocaleString("es-PE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : "";
}
function crearHojaAsistencia(
  libro,
  nombre,
  titulo,
  subtitulo,
  columnas,
  filas,
) {
  const hoja = libro.addWorksheet(nombre, {
    views: [{ state: "frozen", ySplit: 3 }],
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.5,
        bottom: 0.5,
        header: 0.2,
        footer: 0.2,
      },
    },
  });
  hoja.columns = columnas.map((column) => ({
    key: column.key,
    width: column.width || 16,
  }));
  const lastColumn = columnas.length;
  hoja.mergeCells(1, 1, 1, lastColumn);
  hoja.mergeCells(2, 1, 2, lastColumn);
  const titleCell = hoja.getCell(1, 1);
  titleCell.value = titulo;
  titleCell.font = { name: "Aptos Display", size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF17365D" } };
  hoja.getRow(1).height = 28;
  const subtitleCell = hoja.getCell(2, 1);
  subtitleCell.value = subtitulo;
  subtitleCell.font = { name: "Aptos", size: 10, bold: true, color: { argb: "FF7F3000" } };
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  subtitleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFE7D1" } };
  hoja.getRow(2).height = 21;

  const header = hoja.getRow(3);
  columnas.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    cell.value = column.header;
    cell.font = { name: "Aptos", size: 10, bold: true, color: { argb: "FF000000" } };
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
  });
  header.height = 34;

  filas.forEach((item, rowIndex) => {
    const row = hoja.addRow(columnas.map((column) => item[column.key] ?? ""));
    const penalty = tardinessInfo(item.late, item.discount, item.dayStatus);
    const fill = penalty.nonWorking
      ? "FFF4CCCC"
      : penalty.late
        ? "FFFFF2CC"
        : rowIndex % 2
          ? "FFF7F9FC"
          : "FFFFFFFF";
    row.height = 28;
    row.eachCell({ includeEmpty: true }, (cell, columnNumber) => {
      cell.font = { name: "Aptos", size: 9.5, color: { argb: "FF1F2937" } };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      if (columnas[columnNumber - 1]?.currency) cell.numFmt = '"S/" #,##0.00';
    });
  });

  const thinBorder = { style: "thin", color: { argb: "FF7F7F7F" } };
  hoja.eachRow((row, rowNumber) => {
    if (rowNumber < 3) return;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = { top: thinBorder, left: thinBorder, bottom: thinBorder, right: thinBorder };
    });
  });
  hoja.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: lastColumn } };
  return hoja;
}

async function exportarResumenAsistenciaExcel() {
  const site = $("summarySite").value,
    month = $("summaryMonth").value;
  if (!site || !month) {
    status("Selecciona la sede y el mes.", true);
    return;
  }
  if (!window.ExcelJS) {
    status(
      "No se pudo cargar el generador de Excel. Revisa la conexion.",
      true,
    );
    return;
  }
  status("Generando Excel mensual...");
  const start = `${month}-01`,
    endDate = new Date(`${start}T12:00:00`);
  endDate.setMonth(endDate.getMonth() + 1);
  const end = dateIso(endDate);
  const [
    { data: summary, error: summaryError },
    { data: records, error: recordsError },
    { data: staff, error: staffError },
  ] = await Promise.all([
    client.rpc("resumen_asistencia_mes", { sede_arg: site, mes_arg: month }),
    client
      .from("asistencia_registros")
      .select(
        "*,asistencia_programacion(fecha,estado,asistencia_turnos(nombre,hora_inicio,hora_fin,refrigerio_minutos,es_nocturno))",
      )
      .eq("sede", site)
      .gte("fecha_laboral", start)
      .lt("fecha_laboral", end)
      .order("fecha_laboral")
      .order("entrada_at"),
    client.rpc("listar_personal_asistencia", { sede_arg: site }),
  ]);
  if (summaryError || recordsError || staffError) {
    status("No se pudieron obtener todos los datos para el Excel.", true);
    return;
  }
  const profileIds = [...new Set((records || []).map((item) => item.user_id))];
  const { data: profileRows } = profileIds.length
    ? await client
        .from("profiles")
        .select("id,dni,nombre,apellidos_nombres,rol,sede")
        .in("id", profileIds)
    : { data: [] };
  const personal = new Map(
    (staff || []).map((item) => [item.id, { ...item, dni: "" }]),
  );
  (profileRows || []).forEach((item) =>
    personal.set(item.id, {
      ...personal.get(item.id),
      ...item,
      nombre: item.apellidos_nombres || item.nombre,
    }),
  );
  const extrasNocturnas = new Map();
  const penalidades = new Map();
  (records || []).forEach((item) => {
    const penalty = tardinessInfo(
      item.minutos_tardanza,
      item.descuento_tardanza,
      item.estado_jornada,
    );
    const penaltyTotal = penalidades.get(item.user_id) || {
      discount: 0,
      nonWorking: 0,
      workedMinutes: 0,
      realLate: 0,
      tolerance: 0,
    };
    penaltyTotal.discount += penalty.amount;
    penaltyTotal.nonWorking += penalty.nonWorking ? 1 : 0;
    penaltyTotal.workedMinutes += penalty.nonWorking
      ? 0
      : Number(item.minutos_trabajados) || 0;
    penaltyTotal.realLate += Number(item.minutos_retraso_real) || penalty.late;
    penaltyTotal.tolerance += Number(item.minutos_tolerancia) || 0;
    penalidades.set(item.user_id, penaltyTotal);
    const turno = item.asistencia_programacion?.asistencia_turnos;
    if (!turno?.es_nocturno) return;
    const actual = extrasNocturnas.get(item.user_id) || {
      total: 0,
      extra25: 0,
      extra35: 0,
    };
    actual.total += Number(item.horas_extra_aprobadas) || 0;
    actual.extra25 += Number(item.horas_extra_25) || 0;
    actual.extra35 += Number(item.horas_extra_35) || 0;
    extrasNocturnas.set(item.user_id, actual);
  });
  const resumenFilas = (summary || []).map((item) => {
    const nocturnas = extrasNocturnas.get(item.user_id) || {};
    const penalty = penalidades.get(item.user_id) || {
      discount: 0,
      nonWorking: 0,
      workedMinutes: 0,
    };
    const persona = personal.get(item.user_id) || {};
    return {
      dni: persona.dni || "",
      personal: item.nombre,
      rol: item.rol,
      sede: siteName(site),
      month,
      laborableDays: Number(item.dias_trabajados) || 0,
      nonWorkingDays: penalty.nonWorking,
      workedHours: horasDesdeMinutos(penalty.workedMinutes),
      realLate: penalty.realLate || Number(item.minutos_tardanza) || 0,
      tolerance: penalty.tolerance || 0,
      late: Number(item.minutos_tardanza) || 0,
      discount: penalty.discount,
      nightHours: Number(item.horas_nocturnas) || 0,
      extra25: Number(item.horas_extra_25) || 0,
      extra35: Number(item.horas_extra_35) || 0,
      nightExtra: nocturnas.total || 0,
      pendingExtra: Number(item.extras_pendientes) || 0,
      dayStatus: penalty.nonWorking ? "no_laborable_tardanza" : "laborable",
    };
  });
  const detalleFilas = (records || []).map((item) => {
    const persona = personal.get(item.user_id) || {},
      turno = item.asistencia_programacion?.asistencia_turnos || {},
      esNocturno = Boolean(turno.es_nocturno);
    const penalty = tardinessInfo(
      item.minutos_tardanza,
      item.descuento_tardanza,
      item.estado_jornada,
    );
    return {
      date: item.fecha_laboral,
      dni: persona.dni || "",
      personal: persona.nombre || "Usuario",
      role: persona.rol || "",
      site: siteName(item.sede),
      shift: turno.nombre || "",
      shiftType: esNocturno ? "Nocturno" : "Diurno",
      plannedEntry: turno.hora_inicio || "",
      plannedExit: turno.hora_fin || "",
      actualEntry: textoFechaHoraExcel(item.entrada_at),
      actualExit: penalty.nonWorking ? "Jornada no laborable" : textoFechaHoraExcel(item.salida_at),
      workedHours: penalty.nonWorking ? 0 : horasDesdeMinutos(item.minutos_trabajados),
      realLate: Number(item.minutos_retraso_real) || penalty.late,
      tolerance: Number(item.minutos_tolerancia) || 0,
      late: penalty.late,
      discount: penalty.amount,
      dayStatus: penalty.nonWorking
        ? "DÍA NO LABORABLE"
        : penalty.late
          ? "TARDANZA"
          : "LABORABLE",
      extraRequested: Number(item.horas_extra_solicitadas) || 0,
      extraApproved: Number(item.horas_extra_aprobadas) || 0,
      extra25: Number(item.horas_extra_25) || 0,
      extra35: Number(item.horas_extra_35) || 0,
      entryDistance: Number(item.distancia_entrada_m) || 0,
      exitDistance: Number(item.distancia_salida_m) || 0,
      observation: item.observacion_aprobacion || "",
    };
  });
  if (!resumenFilas.length && !detalleFilas.length) {
    status("No hay registros para exportar en el mes seleccionado.", true);
    return;
  }
  const libro = new ExcelJS.Workbook();
  libro.creator = "URBAPARK";
  libro.company = "URBAPARK";
  libro.subject = "Control mensual de asistencia";
  libro.title = `Asistencia ${siteName(site)} ${month}`;
  const resumenColumnas = [
    { header: "DNI", key: "dni", width: 13 },
    { header: "APELLIDOS Y NOMBRES", key: "personal", width: 34 },
    { header: "CARGO", key: "rol", width: 20 },
    { header: "CENTRO DE TRABAJO", key: "sede", width: 24 },
    { header: "MES", key: "month", width: 12 },
    { header: "DÍAS LABORABLES", key: "laborableDays", width: 16 },
    { header: "DÍAS NO LABORABLES", key: "nonWorkingDays", width: 18 },
    { header: "HORAS TRABAJADAS", key: "workedHours", width: 17 },
    { header: "RETRASO REAL (MIN)", key: "realLate", width: 17 },
    { header: "TOLERANCIA (MIN)", key: "tolerance", width: 16 },
    { header: "TARDANZA APLICADA (MIN)", key: "late", width: 19 },
    { header: "DESCUENTO", key: "discount", width: 15, currency: true },
    { header: "HORAS NOCTURNAS", key: "nightHours", width: 17 },
    { header: "EXTRA 25%", key: "extra25", width: 13 },
    { header: "EXTRA 35%", key: "extra35", width: 13 },
    { header: "EXTRAS PENDIENTES", key: "pendingExtra", width: 18 },
  ];
  const detalleColumnas = [
    { header: "FECHA", key: "date", width: 13 },
    { header: "DNI", key: "dni", width: 13 },
    { header: "APELLIDOS Y NOMBRES", key: "personal", width: 32 },
    { header: "CARGO", key: "role", width: 19 },
    { header: "SEDE", key: "site", width: 22 },
    { header: "TURNO", key: "shift", width: 20 },
    { header: "TIPO", key: "shiftType", width: 12 },
    { header: "ENTRADA PROGRAMADA", key: "plannedEntry", width: 18 },
    { header: "SALIDA PROGRAMADA", key: "plannedExit", width: 18 },
    { header: "INGRESO REAL", key: "actualEntry", width: 21 },
    { header: "SALIDA REAL", key: "actualExit", width: 21 },
    { header: "HORAS TRABAJADAS", key: "workedHours", width: 17 },
    { header: "RETRASO REAL (MIN)", key: "realLate", width: 17 },
    { header: "TOLERANCIA (MIN)", key: "tolerance", width: 16 },
    { header: "TARDANZA APLICADA (MIN)", key: "late", width: 19 },
    { header: "DESCUENTO", key: "discount", width: 14, currency: true },
    { header: "ESTADO DE JORNADA", key: "dayStatus", width: 22 },
    { header: "EXTRA SOLICITADA", key: "extraRequested", width: 17 },
    { header: "EXTRA APROBADA", key: "extraApproved", width: 17 },
    { header: "EXTRA 25%", key: "extra25", width: 13 },
    { header: "EXTRA 35%", key: "extra35", width: 13 },
    { header: "DISTANCIA INGRESO (M)", key: "entryDistance", width: 19 },
    { header: "DISTANCIA SALIDA (M)", key: "exitDistance", width: 19 },
    { header: "OBSERVACIÓN", key: "observation", width: 34 },
  ];
  crearHojaAsistencia(
    libro,
    "Resumen mensual",
    "CONTROL MENSUAL DE ASISTENCIA",
    `${siteName(site)} | ${month} | Admin/Supervisor: 10 min de tolerancia | Marcador/facial: 0 min`,
    resumenColumnas,
    resumenFilas,
  );
  crearHojaAsistencia(
    libro,
    "Detalle diario",
    "DETALLE DIARIO DE ASISTENCIA",
    `${siteName(site)} | ${month}`,
    detalleColumnas,
    detalleFilas,
  );
  const descuentos = detalleFilas
    .filter((item) => item.discount > 0)
    .map((item) => ({
      dni: item.dni,
      personal: item.personal,
      role: item.role,
      site: item.site,
      amount: item.discount,
      installments: 1,
      pendingInstallments: 0,
      concept: `Tardanza de ${item.late} minuto(s) - ${item.date}`,
      observation:
        item.dayStatus === "DÍA NO LABORABLE"
          ? "Superó 15 minutos. Día no laborable."
          : "Descuento de S/1 por minuto de tardanza.",
      late: item.late,
      discount: item.discount,
      dayStatus: item.dayStatus,
    }));
  crearHojaAsistencia(
    libro,
    "Descuentos tardanza",
    "FORMATO DE DESCUENTOS",
    `${siteName(site)} | ${month}`,
    [
      { header: "DNI", key: "dni", width: 13 },
      { header: "APELLIDOS Y NOMBRES", key: "personal", width: 35 },
      { header: "CARGO", key: "role", width: 20 },
      { header: "CENTRO DE TRABAJO", key: "site", width: 24 },
      { header: "IMPORTE TOTAL", key: "amount", width: 16, currency: true },
      { header: "N° CUOTAS", key: "installments", width: 12 },
      { header: "N° CUOTAS PENDIENTES", key: "pendingInstallments", width: 20 },
      { header: "CONCEPTO DEL DESCUENTO A REALIZAR", key: "concept", width: 38 },
      { header: "OBSERVACIONES", key: "observation", width: 38 },
    ],
    descuentos,
  );
  const nombreSede = siteName(site)
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  const buffer = await libro.xlsx.writeBuffer();
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  link.download = `Asistencia-${nombreSede}-${month}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  status("Excel mensual generado.");
}

function emptyCard(text) {
  const card = document.createElement("article");
  card.className = "summary-item";
  card.textContent = text;
  return card;
}
function extraCard(item, name) {
  const card = document.createElement("article");
  card.className = "summary-item pending";
  const title = document.createElement("strong"),
    detail = document.createElement("span"),
    actions = document.createElement("div"),
    input = document.createElement("input"),
    approve = document.createElement("button"),
    reject = document.createElement("button");
  title.textContent = `${name} - ${item.fecha_laboral}`;
  detail.textContent = `Solicita ${item.horas_extra_solicitadas} hora(s) completa(s). Salida: ${formatDateTime(item.salida_at)}`;
  actions.className = "extra-actions";
  input.type = "number";
  input.min = "0";
  input.max = String(item.horas_extra_solicitadas);
  input.value = String(item.horas_extra_solicitadas);
  approve.textContent = "Aprobar";
  approve.dataset.approveExtra = item.id;
  reject.textContent = "Rechazar";
  reject.className = "secondary";
  reject.dataset.rejectExtra = item.id;
  actions.append(input, approve, reject);
  card.append(title, detail, actions);
  return card;
}
async function approveExtra(button, hours) {
  const { error } = await client.rpc("aprobar_horas_extra_asistencia", {
    registro_arg: button.dataset.approveExtra || button.dataset.rejectExtra,
    horas_arg: hours,
    observacion_arg: hours
      ? "Aprobado desde control mensual"
      : "Rechazado desde control mensual",
  });
  if (error) {
    status(error.message, true);
    return;
  }
  await loadSummary();
}

function openScanner(type) {
  markType = type;
  $("scannerModal").hidden = false;
  $("scannerStatus").textContent = "Iniciando camara...";
  navigator.mediaDevices
    .getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    })
    .then((stream) => {
      scannerStream = stream;
      $("scannerVideo").srcObject = stream;
      $("scannerVideo").play();
      scanFrame();
    })
    .catch(() => {
      $("scannerStatus").textContent =
        "No se pudo abrir la camara. Revisa el permiso.";
    });
}
function closeScanner() {
  if (scannerFrame) cancelAnimationFrame(scannerFrame);
  scannerFrame = null;
  if (scannerStream) scannerStream.getTracks().forEach((track) => track.stop());
  scannerStream = null;
  $("scannerModal").hidden = true;
}
function scanFrame() {
  const video = $("scannerVideo"),
    canvas = $("scannerCanvas");
  if (video.readyState >= 2) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0);
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = window.jsQR?.(image.data, image.width, image.height);
    if (code?.data?.startsWith("URBAPARK_ATTENDANCE:")) {
      closeScanner();
      markAttendance(code.data);
      return;
    }
  }
  scannerFrame = requestAnimationFrame(scanFrame);
}
function currentPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      maximumAge: 15000,
      timeout: 12000,
    }),
  );
}
async function markAttendance(token) {
  status("Validando ubicacion y hora oficial...");
  try {
    const position = await currentPosition();
    const { data, error } = await client.functions.invoke("attendance-qr", {
      body: {
        action: "mark",
        type: markType,
        token,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    });
    if (error || data?.error) {
      status(data?.error || "No se pudo registrar la marcacion.", true);
      return;
    }
    const penalty = tardinessInfo(
      data.lateMinutes,
      data.discountAmount,
      data.dayStatus,
    );
    status(
      markType === "entrada" && penalty.nonWorking
        ? `Entrada registrada con ${penalty.late} minutos de tardanza. Descuento ${money(penalty.amount)} y jornada no laborable.`
        : markType === "entrada" && penalty.late
          ? `Entrada registrada con ${penalty.late} minutos de tardanza. Descuento ${money(penalty.amount)}.`
          : markType === "entrada" && Number(data.realLateMinutes) > 0 && Number(data.toleranceMinutes) > 0
            ? `Entrada registrada. Retraso real: ${data.realLateMinutes} min, dentro de la tolerancia de ${data.toleranceMinutes} min.`
          : `${markType === "entrada" ? "Entrada" : "Salida"} registrada. Distancia a sede: ${data.distance} m.`,
      penalty.nonWorking,
    );
    await loadWorker();
  } catch (error) {
    status(error?.message || "No se pudo obtener una ubicacion precisa.", true);
  }
}

async function loadBiometric() {
  const { data, error } = await client
    .from("asistencia_biometria")
    .select("user_id,updated_at,activa")
    .eq("user_id", session.user.id)
    .maybeSingle();
  biometric = !error && data?.activa ? data : null;
  const badge = $("biometricBadge");
  badge.textContent = biometric ? "Rostro registrado" : "Sin registrar";
  badge.classList.toggle("ready", Boolean(biometric));
  $("deleteFace").hidden = !biometric;
  $("enrollFace").textContent = biometric
    ? "Volver a registrar mi rostro"
    : "Registrar mi rostro";
  $("faceTest").disabled = !biometric;
  if (!$("faceOfficialActions").hidden) {
    $("faceHelp").textContent = biometric
      ? "Puedes marcar con rostro o continuar usando el QR como respaldo."
      : "Primero registra tu rostro para habilitar la marcacion facial.";
    await loadWorker();
  } else
    $("faceHelp").textContent = biometric
      ? "Tu rostro esta listo. Usa el boton de prueba para validar este celular."
      : "Registra tu rostro y enviaremos una marcacion de prueba sin afectar el reporte laboral.";
}
async function loadFaceModels() {
  if (faceModelsReady) return;
  if (faceModelsPromise) return faceModelsPromise;
  if (!window.faceapi)
    throw new Error("No se pudo cargar el reconocimiento facial.");
  $("faceModalStatus").textContent = "Preparando reconocimiento facial...";
  const base = "./assets/face-models";
  faceModelsPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(base),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri(base),
    faceapi.nets.faceRecognitionNet.loadFromUri(base),
  ])
    .then(() => {
      faceModelsReady = true;
    })
    .finally(() => {
      faceModelsPromise = null;
    });
  return faceModelsPromise;
}
async function openFace(mode, type = "entrada") {
  faceMode = mode;
  faceMarkType = type;
  faceSamples = [];
  $("faceModal").hidden = false;
  $("faceConsentRow").hidden = mode !== "enroll";
  $("faceConsent").checked = false;
  $("faceModalTitle").textContent =
    mode === "enroll"
      ? "Registrar mi rostro"
      : mode === "test"
        ? "Prueba de marcacion facial"
        : mode === "kiosk"
          ? "Marcación facial de sede"
        : `${type === "entrada" ? "Entrada" : "Salida"} con rostro`;
  $("captureFace").textContent =
    mode === "enroll" ? "Capturar muestra 1 de 3" : "Verificar y marcar";
  $("faceModalStatus").textContent = "Preparando camara...";
  try {
    await loadFaceModels();
    faceStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 480 },
        height: { ideal: 640 },
      },
      audio: false,
    });
    $("faceVideo").srcObject = faceStream;
    await $("faceVideo").play();
    $("faceModalStatus").textContent =
      "Mira de frente, sin gorra ni lentes oscuros, y mantente dentro del marco.";
  } catch (error) {
    $("faceModalStatus").textContent =
      error?.message || "No se pudo abrir la camara. Revisa el permiso.";
  }
}
function closeFace() {
  if (faceStream) faceStream.getTracks().forEach((track) => track.stop());
  faceStream = null;
  $("faceVideo").srcObject = null;
  $("faceModal").hidden = true;
  $("faceModal").querySelector(".face-card").classList.remove("busy");
}
async function readFaceDescriptor() {
  const results = await faceapi
    .detectAllFaces(
      $("faceVideo"),
      new faceapi.TinyFaceDetectorOptions({
        inputSize: 192,
        scoreThreshold: 0.58,
      }),
    )
    .withFaceLandmarks(true)
    .withFaceDescriptors();
  if (!results.length)
    throw new Error(
      "No se detecto un rostro. Acercate y mejora la iluminacion.",
    );
  if (results.length > 1)
    throw new Error("Debe aparecer una sola persona en la camara.");
  return Array.from(results[0].descriptor);
}
function averageFaceSamples(samples) {
  const average = new Array(128).fill(0);
  samples.forEach((sample) =>
    sample.forEach(
      (value, index) => (average[index] += value / samples.length),
    ),
  );
  const norm =
    Math.sqrt(average.reduce((sum, value) => sum + value * value, 0)) || 1;
  return average.map((value) => Number((value / norm).toFixed(8)));
}
async function facialFunctionError(error, data, fallback) {
  if (data?.error) return data.error;
  try {
    if (error?.context?.clone) {
      const payload = await error.context.clone().json();
      if (payload?.error) return payload.error;
    }
  } catch {}
  return error?.message || fallback;
}
async function captureFace() {
  const card = $("faceModal").querySelector(".face-card");
  if (card.classList.contains("busy")) return;
  if (faceMode === "enroll" && !$("faceConsent").checked) {
    $("faceModalStatus").textContent = "Marca la autorizacion para continuar.";
    return;
  }
  card.classList.add("busy");
  try {
    const captured =
      faceMode === "enroll"
        ? [await readFaceDescriptor(), null]
        : await Promise.all([readFaceDescriptor(), currentPosition()]);
    const [descriptor, position] = captured;
    if (faceMode === "enroll") {
      faceSamples.push(descriptor);
      if (faceSamples.length < 3) {
        $("faceModalStatus").textContent =
          `Muestra ${faceSamples.length} correcta. Mueve ligeramente el rostro y toma la siguiente.`;
        $("captureFace").textContent =
          `Capturar muestra ${faceSamples.length + 1} de 3`;
        return;
      }
      const { error } = await client
        .from("asistencia_biometria")
        .upsert(
          {
            user_id: session.user.id,
            descriptor: averageFaceSamples(faceSamples),
            modelo: "face-api-0.22.2",
            consentimiento_at: new Date().toISOString(),
            activa: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      if (error) throw error;
      closeFace();
      status("Rostro registrado correctamente.");
      await loadBiometric();
      return;
    }
    $("faceModalStatus").textContent = "Validando identidad y hora oficial...";
    const action = faceMode === "test"
      ? "face-test"
      : faceMode === "kiosk"
        ? "kiosk-face-mark"
        : "face-mark";
    const { data, error } = await client.functions.invoke("attendance-qr", {
      body: {
        action,
        type: faceMarkType,
        descriptor,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      },
    });
    if (error || data?.error)
      throw new Error(
        await facialFunctionError(
          error,
          data,
          "No se pudo completar la marcacion facial.",
        ),
      );
    closeFace();
    if (faceMode === "test")
      status(
        `Prueba facial aprobada en ${data.site}. Coincidencia correcta y distancia a sede: ${data.distance} m.`,
      );
    else if (faceMode === "kiosk") {
      const penalty = tardinessInfo(
        data.lateMinutes,
        data.discountAmount,
        data.dayStatus,
      );
      const message = `${data.personName}: ${data.type === "entrada" ? "entrada" : "salida"} registrada${penalty.late ? ` con ${penalty.late} min de tardanza` : ""}.`;
      $("kioskFaceResult").textContent = message;
      status(message, penalty.nonWorking);
    } else {
      const penalty = tardinessInfo(
        data.lateMinutes,
        data.discountAmount,
        data.dayStatus,
      );
      status(
        faceMarkType === "entrada" && penalty.nonWorking
          ? `Entrada facial registrada con ${penalty.late} minutos de tardanza. Descuento ${money(penalty.amount)} y jornada no laborable.`
          : faceMarkType === "entrada" && penalty.late
            ? `Entrada facial registrada con ${penalty.late} minutos de tardanza. Descuento ${money(penalty.amount)}.`
            : `${faceMarkType === "entrada" ? "Entrada" : "Salida"} facial registrada. Distancia a sede: ${data.distance} m.`,
        penalty.nonWorking,
      );
      await loadWorker();
    }
  } catch (error) {
    const message = error?.message || "No se pudo validar el rostro.";
    $("faceModalStatus").textContent = message;
    if (faceMode === "kiosk") $("kioskFaceResult").textContent = message;
    status(`Marcacion facial no completada: ${message}`, true);
  } finally {
    card.classList.remove("busy");
  }
}
async function deleteBiometric() {
  if (
    !confirm(
      "¿Eliminar tu registro facial? La marcacion por QR seguira disponible.",
    )
  )
    return;
  const { error } = await client
    .from("asistencia_biometria")
    .delete()
    .eq("user_id", session.user.id);
  if (error) {
    status(error.message, true);
    return;
  }
  status("Registro facial eliminado.");
  await loadBiometric();
}
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

document.querySelector(".admin-tabs")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-attendance-tab]");
  if (button) switchTab(button.dataset.attendanceTab);
});
$("refreshWorker")?.addEventListener("click", loadWorker);
$("markEntry")?.addEventListener("click", () => openScanner("entrada"));
$("markExit")?.addEventListener("click", () => openScanner("salida"));
$("closeScanner")?.addEventListener("click", closeScanner);
$("enrollFace")?.addEventListener("click", () => openFace("enroll"));
$("deleteFace")?.addEventListener("click", deleteBiometric);
$("faceEntry")?.addEventListener("click", () => openFace("mark", "entrada"));
$("faceExit")?.addEventListener("click", () => openFace("mark", "salida"));
$("faceTest")?.addEventListener("click", () => openFace("test"));
$("kioskFaceMark")?.addEventListener("click", () => openFace("kiosk"));
$("enableQrFallback")?.addEventListener("click", async () => {
  $("adminPanel").hidden = false;
  $("disableQrFallback").hidden = false;
  await startQr();
  $("adminPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("disableQrFallback")?.addEventListener("click", () => {
  stopQr();
  $("adminPanel").hidden = true;
  $("disableQrFallback").hidden = true;
  $("markerKioskPanel").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("captureFace")?.addEventListener("click", captureFace);
$("closeFace")?.addEventListener("click", closeFace);
$("startQr")?.addEventListener("click", startQr);
$("stopQr")?.addEventListener("click", stopQr);
$("qrSite")?.addEventListener("change", () => {
  if (qrTimer) generateQr();
});
$("loadSchedule")?.addEventListener("click", loadSchedule);
$("saveSchedule")?.addEventListener("click", saveSchedule);
$("loadSummary")?.addEventListener("click", loadSummary);
$("exportSummaryExcel")?.addEventListener(
  "click",
  exportarResumenAsistenciaExcel,
);
$("pendingExtras")?.addEventListener("click", (event) => {
  const approve = event.target.closest("[data-approve-extra]"),
    reject = event.target.closest("[data-reject-extra]");
  if (approve) {
    const value = Number(
      approve.closest(".extra-actions").querySelector("input").value,
    );
    approveExtra(approve, value);
  } else if (reject) approveExtra(reject, 0);
});
window.addEventListener("pagehide", () => {
  stopQr();
  closeScanner();
  closeFace();
});
init();
