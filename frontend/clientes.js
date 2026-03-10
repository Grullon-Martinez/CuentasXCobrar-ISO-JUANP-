// frontend/clientes.js

const ClientesModulo = {
  // Controla edición desde el modal
  indiceEdicionModal: -1,

  abrirModalEditar: function (index) {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const cliente = clientes[index];

    this.indiceEdicionModal = index;

    document.getElementById("editClienteId").value = cliente.id || "";
    document.getElementById("editNombreCliente").value = cliente.nombre || "";
    document.getElementById("editCedulaCliente").value = cliente.cedula || "";
    document.getElementById("editLimiteCliente").value =
      cliente.limite ?? cliente.limiteCredito ?? "";
    document.getElementById("editEstadoCliente").value =
      cliente.estado || "Activo";

    const errorModal = document.getElementById("error-msg-modal-cliente");
    if (errorModal) {
      errorModal.style.display = "none";
      errorModal.innerText = "";
    }

    const modal = new bootstrap.Modal(
      document.getElementById("modalEditarCliente")
    );
    modal.show();
  },

  guardarEdicionModal: function () {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    if (this.indiceEdicionModal === -1) return;

    const clienteActualizado = {
      id: document.getElementById("editClienteId").value.trim(),
      nombre: document.getElementById("editNombreCliente").value.trim(),
      cedula: document
        .getElementById("editCedulaCliente")
        .value.trim()
        .replace(/-/g, "")
        .replace(/\s/g, ""),
      limite:
        parseFloat(document.getElementById("editLimiteCliente").value) || 0,
      estado: document.getElementById("editEstadoCliente").value,
    };

    if (!this.validarCedula(clienteActualizado.cedula)) {
      this.mostrarErrorModal("La cédula ingresada no es válida.");
      return;
    }

    const cedulaDuplicada = clientes.some(
      (c, index) =>
        c.cedula === clienteActualizado.cedula &&
        index !== this.indiceEdicionModal
    );

    if (cedulaDuplicada) {
      this.mostrarErrorModal("Esta cédula ya pertenece a otro cliente.");
      return;
    }

    const errorModal = document.getElementById("error-msg-modal-cliente");
    if (errorModal) {
      errorModal.style.display = "none";
      errorModal.innerText = "";
    }

    clientes[this.indiceEdicionModal] = clienteActualizado;

    localStorage.setItem("clientes", JSON.stringify(clientes));

    this.renderizarTabla();
    actualizarDashboard();

    const modalEl = document.getElementById("modalEditarCliente");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();

    this.indiceEdicionModal = -1;

    alert("Cliente actualizado correctamente");
  },

  html: `
        <div class="container-fluid fade-in" style="padding: 20px;">
          <h2 class="text-dark mb-4 border-bottom pb-2">Gestión de Clientes</h2>
          
          <div class="card shadow-sm mb-4">
            <div class="card-header header-sistema text-white">
              <h5 class="mb-0">Registrar nuevo cliente</h5>
            </div>
            <div class="card-body">
              <form onsubmit="ClientesModulo.guardar(event)">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Identificador (ID)</label>
                    <input type="text" id="identificador" class="form-control" placeholder="Ej: CLI-001" required>
                    <small class="text-muted">Debe ser único.</small>
                  </div>
    
                  <div class="col-md-6 mb-3">
                    <label class="form-label fw-bold">Nombre Completo</label>
                    <input type="text" id="nombre" class="form-control" placeholder="Ej: Juan Pérez" required>
                  </div>
                </div>
    
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Cédula</label>
                    <input type="text" id="cedula" class="form-control" placeholder="00100000000" required>
                    <small class="text-muted">Sin guiones o con guiones.</small>
                  </div>
    
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Límite de Crédito</label>
                    <div class="input-group">
                      <span class="input-group-text">RD$</span>
                      <input type="number" id="limiteCredito" class="form-control" placeholder="0.00" required>
                    </div>
                  </div>
    
                  <div class="col-md-4 mb-3">
                    <label class="form-label fw-bold">Estado</label>
                    <select id="estado" class="form-select">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </div>
    
                <div class="d-flex gap-2 mt-3">
                  <button type="submit" id="btn-guardar" class="btn btn-success px-4">
                    Guardar Cliente
                  </button>
                </div>
    
                <div id="error-msg" class="alert alert-danger mt-3" style="display:none;" role="alert"></div>
              </form>
            </div>
          </div>
    
          <div class="card shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0 text-secondary">Base de Datos de Clientes</h5>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-striped table-hover mb-0 align-middle">
                  <thead class="table-light">
                    <tr>
                      <th class="ps-4">ID</th>
                      <th>Nombre</th>
                      <th>Cédula</th>
                      <th>Límite</th>
                      <th>Estado</th>
                      <th class="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="tabla-clientes-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Modal Editar Cliente -->
        <div class="modal fade" id="modalEditarCliente" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header header-sistema text-white">
                <h5 class="modal-title">Editar Cliente</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
    
              <div class="modal-body">
                <form id="formEditarCliente">
                  <div class="mb-3">
                    <label class="form-label">ID Cliente</label>
                    <input type="text" id="editClienteId" class="form-control" readonly>
                  </div>
    
                  <div class="mb-3">
                    <label class="form-label">Nombre</label>
                    <input type="text" id="editNombreCliente" class="form-control">
                  </div>
    
                  <div class="mb-3">
                    <label class="form-label">Cédula</label>
                    <input type="text" id="editCedulaCliente" class="form-control">
                  </div>
    
                  <div class="mb-3">
                    <label class="form-label">Límite de Crédito</label>
                    <input type="number" id="editLimiteCliente" class="form-control">
                  </div>
    
                  <div class="mb-3">
                    <label class="form-label">Estado</label>
                    <select id="editEstadoCliente" class="form-select">
                      <option value="Activo">Activo</option>
                      <option value="Inactivo">Inactivo</option>
                    </select>
                  </div>
                </form>
  
                <div id="error-msg-modal-cliente" class="alert alert-danger mt-3" style="display:none;"></div>
              </div>
    
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button class="btn btn-sistema" onclick="ClientesModulo.guardarEdicionModal()">Guardar cambios</button>
              </div>
            </div>
          </div>
        </div>
      `,

  cargarVista: function () {
    this.cargarEstilosBootstrap();
    document.getElementById("contenido").innerHTML = this.html;
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

  validarCedula: function (cedula) {
    let c = cedula.replace(/-/g, "").replace(/\s/g, "");
    if (c.length !== 11 || isNaN(c)) return false;

    let suma = 0;
    const peso = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

    for (let i = 0; i < 10; i++) {
      let n = parseInt(c.charAt(i));
      let v = n * peso[i];

      if (v >= 10) {
        let s = v.toString();
        v = parseInt(s.charAt(0)) + parseInt(s.charAt(1));
      }

      suma += v;
    }

    let dig = parseInt(c.charAt(10));
    let res = suma % 10;
    let calc = res === 0 ? 0 : 10 - res;

    return calc === dig;
  },

  guardar: function (e) {
    e.preventDefault();

    const msgDiv = document.getElementById("error-msg");
    msgDiv.style.display = "none";
    msgDiv.innerText = "";

    const idInput = document.getElementById("identificador").value.trim();
    const cedulaInput = document.getElementById("cedula").value;
    const cedulaLimpia = cedulaInput.replace(/-/g, "").replace(/\s/g, "");

    const datosFormulario = {
      id: idInput,
      nombre: document.getElementById("nombre").value.trim(),
      cedula: cedulaLimpia,
      limite: parseFloat(document.getElementById("limiteCredito").value) || 0,
      estado: document.getElementById("estado").value,
    };

    if (!this.validarCedula(datosFormulario.cedula)) {
      this.mostrarError(
        "La cédula no es válida. Revise el formato o los números."
      );
      return;
    }

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    const existeId = clientes.some((c) => c.id === datosFormulario.id);
    if (existeId) {
      this.mostrarError("El Identificador (ID) ya existe. Use uno diferente.");
      return;
    }

    const existeCedula = clientes.some(
      (c) => c.cedula === datosFormulario.cedula
    );
    if (existeCedula) {
      this.mostrarError("Esta cédula ya pertenece a otro cliente.");
      return;
    }

    clientes.push(datosFormulario);
    localStorage.setItem("clientes", JSON.stringify(clientes));

    alert("Cliente creado exitosamente");
    e.target.reset();

    this.renderizarTabla();
    actualizarDashboard();
  },

  eliminar: function (index) {
    if (confirm("¿Está seguro de eliminar este registro permanentemente?")) {
      let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
      clientes.splice(index, 1);
      localStorage.setItem("clientes", JSON.stringify(clientes));
      this.renderizarTabla();
      actualizarDashboard();
    }
  },

  renderizarTabla: function () {
    const tbody = document.getElementById("tabla-clientes-body");
    if (!tbody) return;

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    tbody.innerHTML = "";

    if (clientes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-muted">No hay clientes registrados.</td></tr>`;
      return;
    }

    clientes.forEach((c, index) => {
      const badgeClass = c.estado === "Activo" ? "bg-success" : "bg-danger";
      const limiteSeguro = parseFloat(c.limite ?? c.limiteCredito ?? 0) || 0;

      tbody.innerHTML += `
            <tr>
              <td class="ps-4 fw-bold">${c.id}</td>
              <td>${c.nombre}</td>
              <td style="font-family: monospace; font-size: 1.1em;">${
                c.cedula
              }</td>
              <td>RD$ ${limiteSeguro.toLocaleString("es-DO", {
                minimumFractionDigits: 2,
              })}</td>
              <td><span class="badge ${badgeClass}">${c.estado}</span></td>
              <td class="text-center">
                <button onclick="ClientesModulo.abrirModalEditar(${index})" class="btn btn-sm btn-outline-primary me-2">
                  Editar
                </button>
                <button onclick="ClientesModulo.eliminar(${index})" class="btn btn-sm btn-outline-danger">
                  Eliminar
                </button>
              </td>
            </tr>
          `;
    });
  },

  mostrarError: function (mensaje) {
    const div = document.getElementById("error-msg");
    div.innerText = mensaje;
    div.style.display = "block";
  },

  mostrarErrorModal: function (mensaje) {
    const div = document.getElementById("error-msg-modal-cliente");
    if (!div) return;
    div.innerText = mensaje;
    div.style.display = "block";
  },
};
