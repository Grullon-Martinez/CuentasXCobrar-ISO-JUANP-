// frontend/asientos.js

const AsientosModulo = {
  indiceEdicion: -1,

  html: `
    <div class="section-page container-fluid fade-in">
      <div class="section-stats" id="asientos-stats">
        <div class="section-stat">
          <div class="section-stat-icon primary"><i class="fas fa-book"></i></div>
          <div>
            <span class="section-stat-label">Total asientos</span>
            <span class="section-stat-value" id="asiento-stat-total">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon success"><i class="fas fa-check"></i></div>
          <div>
            <span class="section-stat-label">Nuevos</span>
            <span class="section-stat-value" id="asiento-stat-nuevos">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon danger"><i class="fas fa-ban"></i></div>
          <div>
            <span class="section-stat-label">Anulados</span>
            <span class="section-stat-value" id="asiento-stat-anulados">0</span>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-header bg-dark text-white">
          <h5 class="mb-0" id="titulo-form-asiento">Registro de movimiento contable</h5>
        </div>
        <div class="card-body">
          <form onsubmit="AsientosModulo.guardar(event)">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Descripción del asiento</label>
                <input type="text" id="asiento-desc" class="form-control" placeholder="Ej: Venta de boletos - Evento X" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bold">Cliente</label>
                <select id="asiento-cliente" class="form-select" required>
                  <option value="">Seleccione un cliente</option>
                </select>
              </div>
            </div>
            <div class="row">
              <div class="col-md-3 mb-3">
                <label class="form-label fw-bold">Cuenta contable</label>
                <input type="text" id="asiento-cuenta" class="form-control" placeholder="Ej: 110501" required>
              </div>
              <div class="col-md-3 mb-3">
                <label class="form-label fw-bold">Tipo movimiento</label>
                <select id="asiento-tipo" class="form-select">
                  <option value="DB">DB - Débito</option>
                  <option value="CR">CR - Crédito</option>
                </select>
              </div>
              <div class="col-md-3 mb-3">
                <label class="form-label fw-bold">Monto</label>
                <div class="input-group">
                  <span class="input-group-text">RD$</span>
                  <input type="number" id="asiento-monto" class="form-control" step="0.01" required>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <label class="form-label fw-bold">Fecha</label>
                <input type="date" id="asiento-fecha" class="form-control" required>
              </div>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button type="submit" id="btn-asiento-guardar" class="btn btn-primary px-4"><i class="fas fa-save"></i> Registrar asiento</button>
              <button type="button" id="btn-asiento-cancelar" onclick="AsientosModulo.cancelarEdicion()" class="btn btn-secondary" style="display: none;">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header flex-header">
          <h5 class="mb-0 text-secondary">Historial de asientos</h5>
          <div class="section-toolbar">
            <input type="date" id="filtro-desde" class="form-control form-control-sm" placeholder="Desde">
            <input type="date" id="filtro-hasta" class="form-control form-control-sm" placeholder="Hasta">
            <button type="button" onclick="AsientosModulo.renderizarTabla()" class="btn btn-sm btn-outline-secondary"><i class="fas fa-filter"></i> Filtrar</button>
          </div>
        </div>
        <div class="card-body p-0">
          <p class="results-count" id="asientos-results-count" style="margin: 12px 20px 0;"></p>
          <div class="table-responsive">
            <table class="table table-striped table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Cliente</th>
                  <th>Cuenta</th>
                  <th>Tipo</th>
                  <th class="text-end">Monto</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody id="tabla-asientos-body"></tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,

  cargarVista: function () {
    document.getElementById("contenido").innerHTML = this.html;
    this.cargarClientes();
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  cargarClientes: function () {
    const select = document.getElementById("asiento-cliente");
    if (!select) return;
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    select.innerHTML = "<option value=\"\">Seleccione un cliente</option>";
    clientes.forEach((c) => {
      select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
    });
  },

  getAsientosFiltrados: function () {
    let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
    const desde = document.getElementById("filtro-desde")?.value || "";
    const hasta = document.getElementById("filtro-hasta")?.value || "";
    if (desde) asientos = asientos.filter((a) => a.fecha >= desde);
    if (hasta) asientos = asientos.filter((a) => a.fecha <= hasta);
    return asientos;
  },

  actualizarEstadisticas: function () {
    const asientos = JSON.parse(localStorage.getItem("asientos")) || [];
    const nuevos = asientos.filter((a) => a.estado === "Nuevo").length;
    const anulados = asientos.filter((a) => a.estado === "Anulado").length;
    const totalEl = document.getElementById("asiento-stat-total");
    const nuevosEl = document.getElementById("asiento-stat-nuevos");
    const anuladosEl = document.getElementById("asiento-stat-anulados");
    if (totalEl) totalEl.textContent = asientos.length;
    if (nuevosEl) nuevosEl.textContent = nuevos;
    if (anuladosEl) anuladosEl.textContent = anulados;
  },

  guardar: function (e) {
    e.preventDefault();
    let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
    const datos = {
      id: this.indiceEdicion === -1 ? Date.now() : asientos[this.indiceEdicion].id,
      descripcion: document.getElementById("asiento-desc").value,
      clienteId: document.getElementById("asiento-cliente").value,
      cuentaContable: document.getElementById("asiento-cuenta").value,
      tipoMovimiento: document.getElementById("asiento-tipo").value,
      monto: document.getElementById("asiento-monto").value,
      fecha: document.getElementById("asiento-fecha").value,
      estado: "Nuevo"
    };

    if (this.indiceEdicion === -1) {
      asientos.push(datos);
    } else {
      asientos[this.indiceEdicion] = datos;
      this.cancelarEdicion();
    }

    localStorage.setItem("asientos", JSON.stringify(asientos));
    this.actualizarEstadisticas();
    this.renderizarTabla();
    e.target.reset();
  },

  cancelarEdicion: function () {
    this.indiceEdicion = -1;
    const btn = document.getElementById("btn-asiento-guardar");
    if (btn) {
      btn.innerHTML = "<i class=\"fas fa-save\"></i> Registrar asiento";
      btn.className = "btn btn-primary px-4";
    }
    document.getElementById("btn-asiento-cancelar").style.display = "none";
    if (document.forms[0]) document.forms[0].reset();
  },

  anular: function (index) {
    if (!confirm("¿Está seguro de anular este asiento?")) return;
    const asientosFiltrados = this.getAsientosFiltrados();
    const asiento = asientosFiltrados[index];
    let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
    const indiceReal = asientos.findIndex((a) => a.id === asiento.id);
    if (indiceReal !== -1) {
      asientos[indiceReal].estado = "Anulado";
      localStorage.setItem("asientos", JSON.stringify(asientos));
    }
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  renderizarTabla: function () {
    const tbody = document.getElementById("tabla-asientos-body");
    const countEl = document.getElementById("asientos-results-count");
    if (!tbody) return;

    const asientos = this.getAsientosFiltrados();
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    if (countEl) countEl.innerHTML = "Mostrando <strong>" + asientos.length + "</strong> asiento(s).";

    if (asientos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fas fa-book"></i><p>No hay asientos que coincidan con los filtros.</p></td></tr>';
      return;
    }

    tbody.innerHTML = "";
    asientos.forEach((a, index) => {
      const cli = clientes.find((c) => c.id === a.clienteId);
      const badge = a.estado === "Nuevo" ? "bg-info" : "bg-danger";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.fecha}</td>
        <td>${a.descripcion}</td>
        <td>${cli ? cli.nombre : "N/A"}</td>
        <td><code>${a.cuentaContable}</code></td>
        <td><span class="badge ${a.tipoMovimiento === "DB" ? "bg-primary" : "bg-success"}">${a.tipoMovimiento}</span></td>
        <td class="text-end">RD$ ${parseFloat(a.monto).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
        <td><span class="badge ${badge}">${a.estado}</span></td>
        <td class="text-center">
          <button onclick="AsientosModulo.anular(${index})" class="btn btn-sm btn-outline-danger" ${a.estado === "Anulado" ? "disabled" : ""}><i class="fas fa-ban"></i> Anular</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
};
