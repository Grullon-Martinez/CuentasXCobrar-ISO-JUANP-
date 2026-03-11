const SECCIONES = {
  dashboard: { title: "Dashboard", subtitle: "Resumen general del sistema" },
  clientes: { title: "Clientes", subtitle: "Gestión de clientes y límites de crédito" },
  documentos: { title: "Tipos de Documento", subtitle: "Configuración de documentos" },
  transacciones: { title: "Transacciones", subtitle: "Registro y consulta de movimientos" },
  asientos: { title: "Asientos Contables", subtitle: "Libro diario y asientos" },
  consultas: { title: "Consultas", subtitle: "Reportes y búsquedas" }
};

function actualizarHeader(seccion) {
  const data = SECCIONES[seccion] || SECCIONES.dashboard;
  const titleEl = document.getElementById("header-title");
  const subtitleEl = document.getElementById("header-subtitle");
  if (titleEl) titleEl.textContent = data.title;
  if (subtitleEl) subtitleEl.textContent = data.subtitle;

  document.querySelectorAll(".nav-item").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-section") === seccion);
  });
}

function actualizarFechaHeader() {
  const el = document.getElementById("header-fecha");
  if (el) {
    const hoy = new Date();
    el.textContent = hoy.toLocaleDateString("es-DO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

function getDashboardData() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
  const documentos = JSON.parse(localStorage.getItem("documentos")) || [];
  const asientos = JSON.parse(localStorage.getItem("asientos")) || [];

  let totalDebitos = 0, totalCreditos = 0, balance = 0;
  transacciones.forEach((t) => {
    const monto = parseFloat(t.monto) || 0;
    if (t.tipoMovimiento === "DB") {
      totalDebitos += monto;
      balance += monto;
    } else if (t.tipoMovimiento === "CR") {
      totalCreditos += monto;
      balance -= monto;
    }
  });

  const activos = clientes.filter((c) => c.estado === "Activo").length;
  const docActivos = documentos.filter((d) => d.estado === "Activo").length;
  const asientosNuevos = asientos.filter((a) => a.estado === "Nuevo").length;
  const asientosAnulados = asientos.filter((a) => a.estado === "Anulado").length;

  const ultimasTransacciones = [...transacciones]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 10);

  return {
    clientes: clientes.length,
    clientesActivos: activos,
    transacciones: transacciones.length,
    documentos: documentos.length,
    documentosActivos: docActivos,
    asientos: asientos.length,
    asientosNuevos,
    asientosAnulados,
    balance,
    totalDebitos,
    totalCreditos,
    ultimasTransacciones,
    clientesLista: clientes
  };
}

function cargar(seccion) {
  const contenido = document.getElementById("contenido");
  actualizarHeader(seccion);

  if (seccion === "clientes") {
    ClientesModulo.cargarVista();
    return;
  }

  if (seccion === "documentos") {
    DocumentosModulo.cargarVista();
    return;
  }

  if (seccion === "transacciones") {
    TransaccionesModulo.cargarVista();
    return;
  }

  if (seccion === "asientos") {
    AsientosModulo.cargarVista();
    return;
  }

  if (seccion === "consultas") {
    cargarVistaConsultas();
    return;
  }

  if (seccion === "dashboard") {
    cargarVistaDashboard();
  }
}

function cargarVistaDashboard() {
  const data = getDashboardData();
  const contenido = document.getElementById("contenido");

  contenido.innerHTML = `
    <div class="dashboard-section section-page">
      <div class="dashboard-cards">
        <div class="stat-card stat-card-primary">
          <div class="stat-card-icon"><i class="fas fa-users"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Clientes</span>
            <span class="stat-card-value" id="dash-clientes">${data.clientes}</span>
            <span class="text-muted" style="font-size:0.8rem;">${data.clientesActivos} activos</span>
          </div>
        </div>
        <div class="stat-card stat-card-secondary">
          <div class="stat-card-icon"><i class="fas fa-exchange-alt"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Transacciones</span>
            <span class="stat-card-value" id="dash-transacciones">${data.transacciones}</span>
          </div>
        </div>
        <div class="stat-card stat-card-accent">
          <div class="stat-card-icon"><i class="fas fa-balance-scale"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Balance total</span>
            <span class="stat-card-value stat-card-currency" id="dash-balance">RD$ ${data.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
        <div class="stat-card stat-card-primary">
          <div class="stat-card-icon"><i class="fas fa-file-alt"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Tipos de documento</span>
            <span class="stat-card-value" id="dash-documentos">${data.documentos}</span>
            <span class="text-muted" style="font-size:0.8rem;">${data.documentosActivos} activos</span>
          </div>
        </div>
        <div class="stat-card stat-card-secondary">
          <div class="stat-card-icon"><i class="fas fa-book"></i></div>
          <div class="stat-card-body">
            <span class="stat-card-label">Asientos</span>
            <span class="stat-card-value" id="dash-asientos">${data.asientos}</span>
            <span class="text-muted" style="font-size:0.8rem;">${data.asientosNuevos} nuevos · ${data.asientosAnulados} anulados</span>
          </div>
        </div>
      </div>

      <div class="summary-block">
        <h3 class="summary-block-title">Resumen de movimientos</h3>
        <div class="summary-row">
          <div class="summary-item">
            <span class="summary-item-label">Total débitos (DB):</span>
            <span class="summary-item-value positive">RD$ ${data.totalDebitos.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Total créditos (CR):</span>
            <span class="summary-item-value negative">RD$ ${data.totalCreditos.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
          <div class="summary-item">
            <span class="summary-item-label">Balance:</span>
            <span class="summary-item-value ${data.balance >= 0 ? "positive" : "negative"}">RD$ ${data.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header flex-header">
          <h5 class="mb-0">Últimas transacciones</h5>
          <a href="#" onclick="cargar('transacciones'); return false;" class="btn btn-sm btn-outline-primary">Ver todas</a>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-compact mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Documento</th>
                  <th>Cliente</th>
                  <th class="text-end">Monto</th>
                </tr>
              </thead>
              <tbody id="dash-ultimas-body"></tbody>
            </table>
          </div>
          <div id="dash-ultimas-empty" class="empty-state" style="display:none;">
            <i class="fas fa-exchange-alt"></i>
            <p>No hay transacciones registradas.</p>
          </div>
        </div>
      </div>

      <div class="dashboard-welcome" style="margin-top:24px;">
        <div class="welcome-card">
          <i class="fas fa-info-circle welcome-icon"></i>
          <div>
            <h3>Bienvenido al Sistema de Cuentas por Cobrar</h3>
            <p>Desde el menú lateral puede gestionar clientes, tipos de documento, transacciones y asientos contables. Los indicadores de esta página se actualizan con la información almacenada en el sistema.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const tbody = document.getElementById("dash-ultimas-body");
  const empty = document.getElementById("dash-ultimas-empty");
  if (data.ultimasTransacciones.length === 0) {
    if (tbody) tbody.innerHTML = "";
    if (empty) empty.style.display = "block";
  } else {
    if (empty) empty.style.display = "none";
    const clientes = data.clientesLista;
    data.ultimasTransacciones.forEach((t) => {
      const cli = clientes.find((c) => c.id === t.clienteId);
      const nombreCliente = cli ? cli.nombre : t.clienteId;
      const isDb = t.tipoMovimiento === "DB";
      const signo = isDb ? "+" : "−";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${t.id}</strong></td>
        <td>${t.fecha}</td>
        <td><span class="badge ${isDb ? "bg-primary" : "bg-success"}">${t.tipoMovimiento}</span></td>
        <td>${t.tipoDocumento} ${t.numeroDocumento}</td>
        <td>${nombreCliente}</td>
        <td class="text-end">${signo} RD$ ${parseFloat(t.monto).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
      `;
      tbody.appendChild(tr);
    });
  }
}

function cargarVistaConsultas() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

  const balancePorCliente = clientes.map((c) => {
    let balance = 0;
    transacciones.filter((t) => t.clienteId === c.id).forEach((t) => {
      const monto = parseFloat(t.monto) || 0;
      if (t.tipoMovimiento === "DB") balance += monto;
      else balance -= monto;
    });
    return { id: c.id, nombre: c.nombre, balance };
  }).filter((b) => b.balance !== 0 || true);

  const contenido = document.getElementById("contenido");
  contenido.innerHTML = `
    <div class="section-page">
      <div class="report-card">
        <h3><i class="fas fa-user-clock"></i> Balance por cliente</h3>
        <p class="report-card-desc">Saldo actual de cuentas por cobrar por cada cliente.</p>
        <div class="table-responsive">
          <table class="table table-compact">
            <thead>
              <tr>
                <th>ID Cliente</th>
                <th>Nombre</th>
                <th class="text-end">Balance (RD$)</th>
              </tr>
            </thead>
            <tbody id="consultas-balance-body"></tbody>
          </table>
        </div>
        <p class="results-count" id="consultas-balance-count"></p>
      </div>

      <div class="report-card">
        <h3><i class="fas fa-chart-bar"></i> Resumen general</h3>
        <p class="report-card-desc">Totales del sistema para reportes.</p>
        <div class="section-stats" id="consultas-resumen-stats"></div>
      </div>

      <div class="welcome-card">
        <i class="fas fa-search welcome-icon"></i>
        <div>
          <h3>Consultas y reportes</h3>
          <p>Utilice la tabla "Balance por cliente" para revisar los saldos actuales. En futuras versiones se incorporarán reportes de antigüedad de saldos y movimientos por período exportables.</p>
        </div>
      </div>
    </div>
  `;

  const tbody = document.getElementById("consultas-balance-body");
  const countEl = document.getElementById("consultas-balance-count");
  balancePorCliente.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.nombre}</td>
      <td class="text-end">RD$ ${item.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
    `;
    tbody.appendChild(tr);
  });
  if (countEl) countEl.innerHTML = `Mostrando <strong>${balancePorCliente.length}</strong> clientes.`;

  const resumen = document.getElementById("consultas-resumen-stats");
  if (resumen) {
    let totalBalance = 0;
    balancePorCliente.forEach((b) => { totalBalance += b.balance; });
    resumen.innerHTML = `
      <div class="section-stat">
        <div class="section-stat-icon primary"><i class="fas fa-users"></i></div>
        <div>
          <span class="section-stat-label">Clientes</span>
          <span class="section-stat-value">${clientes.length}</span>
        </div>
      </div>
      <div class="section-stat">
        <div class="section-stat-icon muted"><i class="fas fa-exchange-alt"></i></div>
        <div>
          <span class="section-stat-label">Transacciones</span>
          <span class="section-stat-value">${transacciones.length}</span>
        </div>
      </div>
      <div class="section-stat">
        <div class="section-stat-icon ${totalBalance >= 0 ? "success" : "danger"}"><i class="fas fa-balance-scale"></i></div>
        <div>
          <span class="section-stat-label">Balance total</span>
          <span class="section-stat-value">RD$ ${totalBalance.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>
    `;
  }
}

function actualizarDashboard() {
  const data = getDashboardData();
  const c = document.getElementById("dash-clientes");
  const t = document.getElementById("dash-transacciones");
  const b = document.getElementById("dash-balance");
  if (c) c.textContent = data.clientes;
  if (t) t.textContent = data.transacciones;
  if (b) b.textContent = "RD$ " + data.balance.toLocaleString("es-DO", { minimumFractionDigits: 2 });
}

document.addEventListener("DOMContentLoaded", function () {
  actualizarFechaHeader();
  cargar("dashboard");
});
