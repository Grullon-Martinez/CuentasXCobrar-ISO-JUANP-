const TransaccionesModulo = {
  indiceEdicion: -1,

  html: `
      <div class="container-fluid fade-in" style="padding: 20px;">
        <h2 class="text-dark mb-4 border-bottom pb-2">Gestión de Transacciones</h2>
  
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0" id="titulo-form-transaccion">Registro de Nueva Transacción</h5>
          </div>
          <div class="card-body">
            <form onsubmit="TransaccionesModulo.guardar(event)">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Identificador de Transacción</label>
                  <input type="text" id="transId" class="form-control" placeholder="TRX-001" required>
                </div>
  
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Tipo de Movimiento</label>
                  <select id="tipoMovimiento" class="form-select" required>
                    <option value="">Seleccione</option>
                    <option value="DB">DB - Débito</option>
                    <option value="CR">CR - Crédito</option>
                  </select>
                </div>
  
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Identificador Tipo Documento</label>
                  <input type="text" id="tipoDocumento" class="form-control" placeholder="FAC, NCF, REC" required>
                </div>
              </div>
  
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Número de Documento</label>
                  <input type="text" id="numeroDocumento" class="form-control" placeholder="DOC-0001" required>
                </div>
  
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Fecha</label>
                  <input type="date" id="fecha" class="form-control" required>
                </div>
  
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Identificador del Cliente</label>
                  <select id="clienteId" class="form-select" required>
                    <option value="">Seleccione un cliente</option>
                  </select>
                </div>
              </div>
  
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bold">Monto</label>
                  <div class="input-group">
                    <span class="input-group-text">RD$</span>
                    <input type="number" id="monto" class="form-control" step="0.01" min="0.01" required>
                  </div>
                </div>
              </div>
  
              <div class="d-flex gap-2 mt-3">
                <button type="submit" id="btn-guardar-transaccion" class="btn btn-success px-4">
                  Guardar Transacción
                </button>
                <button type="button" id="btn-cancelar-transaccion" onclick="TransaccionesModulo.cancelarEdicion()" class="btn btn-secondary" style="display:none;">
                  Cancelar
                </button>
              </div>
  
              <div id="error-msg-transaccion" class="alert alert-danger mt-3" style="display:none;"></div>
            </form>
          </div>
        </div>
  
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0 text-secondary">Listado de Transacciones</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-striped table-hover mb-0 align-middle">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">ID</th>
                    <th>Mov.</th>
                    <th>Tipo Doc.</th>
                    <th>No. Doc.</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Monto</th>
                    <th class="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody id="tabla-transacciones-body"></tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `,

  cargarVista: function () {
    this.cargarEstilosBootstrap();
    document.getElementById("contenido").innerHTML = this.html;
    this.cargarClientesEnSelect();
    this.renderizarTabla();
  },

  cargarEstilosBootstrap: function () {
    if (!document.getElementById("bootstrap-css")) {
      const link = document.createElement("link");
      link.id = "bootstrap-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
      document.head.appendChild(link);
    }
  },

  cargarClientesEnSelect: function () {
    const select = document.getElementById("clienteId");
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    select.innerHTML = `<option value="">Seleccione un cliente</option>`;

    clientes.forEach((cliente) => {
      select.innerHTML += `<option value="${cliente.id}">${cliente.id} - ${cliente.nombre}</option>`;
    });
  },

  mostrarError: function (mensaje) {
    const div = document.getElementById("error-msg-transaccion");
    div.style.display = "block";
    div.innerText = mensaje;
  },

  guardar: function (e) {
    e.preventDefault();

    const msgDiv = document.getElementById("error-msg-transaccion");
    msgDiv.style.display = "none";
    msgDiv.innerText = "";

    const transaccion = {
      id: document.getElementById("transId").value.trim(),
      tipoMovimiento: document.getElementById("tipoMovimiento").value,
      tipoDocumento: document.getElementById("tipoDocumento").value.trim(),
      numeroDocumento: document.getElementById("numeroDocumento").value.trim(),
      fecha: document.getElementById("fecha").value,
      clienteId: document.getElementById("clienteId").value,
      monto: document.getElementById("monto").value,
    };

    let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

    const existeId = transacciones.some(
      (t, index) => t.id === transaccion.id && index !== this.indiceEdicion
    );
    if (existeId) {
      this.mostrarError("El identificador de transacción ya existe.");
      return;
    }

    if (
      !transaccion.tipoMovimiento ||
      !["DB", "CR"].includes(transaccion.tipoMovimiento)
    ) {
      this.mostrarError("El tipo de movimiento debe ser DB o CR.");
      return;
    }

    if (!transaccion.clienteId) {
      this.mostrarError("Debe seleccionar un cliente.");
      return;
    }

    if (parseFloat(transaccion.monto) <= 0) {
      this.mostrarError("El monto debe ser mayor que cero.");
      return;
    }

    if (this.indiceEdicion === -1) {
      transacciones.push(transaccion);
      alert("Transacción creada exitosamente");
    } else {
      transacciones[this.indiceEdicion] = transaccion;
      alert("Transacción actualizada exitosamente");
      this.cancelarEdicion();
    }

    localStorage.setItem("transacciones", JSON.stringify(transacciones));

    if (this.indiceEdicion === -1) {
      e.target.reset();
    }

    this.cargarClientesEnSelect();
    this.renderizarTabla();
    actualizarDashboard();
  },

  editar: function (index) {
    let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];
    const t = transacciones[index];

    document.getElementById("transId").value = t.id;
    document.getElementById("tipoMovimiento").value = t.tipoMovimiento;
    document.getElementById("tipoDocumento").value = t.tipoDocumento;
    document.getElementById("numeroDocumento").value = t.numeroDocumento;
    document.getElementById("fecha").value = t.fecha;
    document.getElementById("clienteId").value = t.clienteId;
    document.getElementById("monto").value = t.monto;

    this.indiceEdicion = index;

    document.getElementById("titulo-form-transaccion").innerText =
      "Editando Transacción: " + t.id;
    const btn = document.getElementById("btn-guardar-transaccion");
    btn.innerText = "Actualizar Transacción";
    btn.className = "btn btn-warning px-4 text-white";
    document.getElementById("btn-cancelar-transaccion").style.display = "block";
  },

  cancelarEdicion: function () {
    this.indiceEdicion = -1;
    document.getElementById("titulo-form-transaccion").innerText =
      "Registro de Nueva Transacción";

    const btn = document.getElementById("btn-guardar-transaccion");
    btn.innerText = "Guardar Transacción";
    btn.className = "btn btn-success px-4";

    document.getElementById("btn-cancelar-transaccion").style.display = "none";
    document.forms[0].reset();
    document.getElementById("error-msg-transaccion").style.display = "none";
    this.cargarClientesEnSelect();
  },

  eliminar: function (index) {
    if (confirm("¿Está seguro de eliminar esta transacción?")) {
      let transacciones =
        JSON.parse(localStorage.getItem("transacciones")) || [];
      transacciones.splice(index, 1);
      localStorage.setItem("transacciones", JSON.stringify(transacciones));
      this.renderizarTabla();
      actualizarDashboard();

      if (this.indiceEdicion === index) {
        this.cancelarEdicion();
      }
    }
  },

  renderizarTabla: function () {
    const tbody = document.getElementById("tabla-transacciones-body");
    if (!tbody) return;

    const transacciones =
      JSON.parse(localStorage.getItem("transacciones")) || [];
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    tbody.innerHTML = "";

    if (transacciones.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center p-4 text-muted">No hay transacciones registradas.</td></tr>`;
      return;
    }

    transacciones.forEach((t, index) => {
      const cliente = clientes.find((c) => c.id === t.clienteId);
      const nombreCliente = cliente ? cliente.nombre : t.clienteId;
      const badgeClass =
        t.tipoMovimiento === "DB" ? "bg-primary" : "bg-success";

      tbody.innerHTML += `
          <tr>
            <td class="ps-4 fw-bold">${t.id}</td>
            <td><span class="badge ${badgeClass}">${
        t.tipoMovimiento
      }</span></td>
            <td>${t.tipoDocumento}</td>
            <td>${t.numeroDocumento}</td>
            <td>${t.fecha}</td>
            <td>${nombreCliente}</td>
            <td>RD$ ${parseFloat(t.monto).toLocaleString("es-DO", {
              minimumFractionDigits: 2,
            })}</td>
            <td class="text-center">
              <button onclick="TransaccionesModulo.editar(${index})" class="btn btn-sm btn-outline-primary me-2">
                ✏️ Editar
              </button>
              <button onclick="TransaccionesModulo.eliminar(${index})" class="btn btn-sm btn-outline-danger">
                🗑️ Eliminar
              </button>
            </td>
          </tr>
        `;
    });
  },
};
