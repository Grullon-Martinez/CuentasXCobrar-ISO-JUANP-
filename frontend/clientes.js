// frontend/clientes.js

const ClientesModulo = {
  indiceEdicion: -1,

  html: `
    <div class="section-page container-fluid fade-in">
      <div class="section-stats" id="clientes-stats">
        <div class="section-stat">
          <div class="section-stat-icon primary"><i class="fas fa-users"></i></div>
          <div>
            <span class="section-stat-label">Total clientes</span>
            <span class="section-stat-value" id="clientes-stat-total">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon success"><i class="fas fa-user-check"></i></div>
          <div>
            <span class="section-stat-label">Activos</span>
            <span class="section-stat-value" id="clientes-stat-activos">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon danger"><i class="fas fa-user-times"></i></div>
          <div>
            <span class="section-stat-label">Inactivos</span>
            <span class="section-stat-value" id="clientes-stat-inactivos">0</span>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0" id="titulo-form">Registro de Nuevo Cliente</h5>
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
                <input type="text" id="cedula" class="form-control" placeholder="001-0000000-0" required>
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
                <i class="fas fa-save"></i> Guardar Cliente
              </button>
              <button type="button" id="btn-cancelar" onclick="ClientesModulo.cancelarEdicion()" class="btn btn-secondary" style="display: none;">
                Cancelar
              </button>
            </div>
            <div id="error-msg" class="alert alert-danger mt-3" style="display: none;" role="alert"></div>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header flex-header">
          <h5 class="mb-0 text-secondary">Base de datos de clientes</h5>
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="clientes-search" class="form-control" placeholder="Buscar por ID, nombre o cédula..." oninput="ClientesModulo.renderizarTabla()">
          </div>
        </div>
        <div class="card-body p-0">
          <p class="results-count" id="clientes-results-count" style="margin: 12px 20px 0;"></p>
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
  `,

  cargarVista: function () {
    document.getElementById("contenido").innerHTML = this.html;
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  getClientesFiltrados: function () {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const busqueda = (document.getElementById("clientes-search") || {}).value || "";
    const term = busqueda.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter(
      (c) =>
        (c.id && c.id.toLowerCase().includes(term)) ||
        (c.nombre && c.nombre.toLowerCase().includes(term)) ||
        (c.cedula && c.cedula.replace(/-/g, "").includes(term.replace(/-/g, "")))
    );
  },

  actualizarEstadisticas: function () {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const activos = clientes.filter((c) => c.estado === "Activo").length;
    const inactivos = clientes.length - activos;
    const totalEl = document.getElementById("clientes-stat-total");
    const activosEl = document.getElementById("clientes-stat-activos");
    const inactivosEl = document.getElementById("clientes-stat-inactivos");
    if (totalEl) totalEl.textContent = clientes.length;
    if (activosEl) activosEl.textContent = activos;
    if (inactivosEl) inactivosEl.textContent = inactivos;
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
      limite: document.getElementById("limiteCredito").value,
      estado: document.getElementById("estado").value
    };

    if (!this.validarCedula(datosFormulario.cedula)) {
      this.mostrarError("La cédula no es válida. Revise el formato o los números.");
      return;
    }

    let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const existeId = clientes.some((c, index) => c.id === datosFormulario.id && index !== this.indiceEdicion);
    if (existeId) {
      this.mostrarError("El Identificador (ID) ya existe. Use uno diferente.");
      return;
    }
    const existeCedula = clientes.some((c, index) => c.cedula === datosFormulario.cedula && index !== this.indiceEdicion);
    if (existeCedula) {
      this.mostrarError("Esta cédula ya pertenece a otro cliente.");
      return;
    }

    if (this.indiceEdicion === -1) {
      clientes.push(datosFormulario);
      alert("Cliente creado exitosamente.");
    } else {
      clientes[this.indiceEdicion] = datosFormulario;
      alert("Cliente actualizado exitosamente.");
      this.cancelarEdicion();
    }

    localStorage.setItem("clientes", JSON.stringify(clientes));
    if (this.indiceEdicion === -1) e.target.reset();
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  editar: function (index) {
    const clientes = this.getClientesFiltrados();
    const cliente = clientes[index];
    const clientesTodos = JSON.parse(localStorage.getItem("clientes")) || [];
    const indiceReal = clientesTodos.findIndex((c) => c.id === cliente.id && c.cedula === cliente.cedula);

    document.getElementById("identificador").value = cliente.id;
    document.getElementById("nombre").value = cliente.nombre;
    document.getElementById("cedula").value = cliente.cedula;
    document.getElementById("limiteCredito").value = cliente.limite;
    document.getElementById("estado").value = cliente.estado;

    this.indiceEdicion = indiceReal >= 0 ? indiceReal : index;
    document.getElementById("titulo-form").innerText = "Editando cliente: " + cliente.nombre;
    const btnGuardar = document.getElementById("btn-guardar");
    btnGuardar.innerHTML = "<i class=\"fas fa-save\"></i> Actualizar Cliente";
    btnGuardar.className = "btn btn-warning px-4 text-white";
    document.getElementById("btn-cancelar").style.display = "block";
  },

  cancelarEdicion: function () {
    this.indiceEdicion = -1;
    document.getElementById("titulo-form").innerText = "Registro de Nuevo Cliente";
    const btnGuardar = document.getElementById("btn-guardar");
    btnGuardar.innerHTML = "<i class=\"fas fa-save\"></i> Guardar Cliente";
    btnGuardar.className = "btn btn-success px-4";
    document.getElementById("btn-cancelar").style.display = "none";
    if (document.forms[0]) document.forms[0].reset();
    const err = document.getElementById("error-msg");
    if (err) err.style.display = "none";
  },

  eliminar: function (index) {
    if (!confirm("¿Está seguro de eliminar este cliente de forma permanente?")) return;
    const clientes = this.getClientesFiltrados();
    const cliente = clientes[index];
    let todos = JSON.parse(localStorage.getItem("clientes")) || [];
    const indiceReal = todos.findIndex((c) => c.id === cliente.id && c.cedula === cliente.cedula);
    if (indiceReal !== -1) todos.splice(indiceReal, 1);
    localStorage.setItem("clientes", JSON.stringify(todos));
    if (this.indiceEdicion === indiceReal) this.cancelarEdicion();
    this.indiceEdicion = -1;
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  renderizarTabla: function () {
    const tbody = document.getElementById("tabla-clientes-body");
    const countEl = document.getElementById("clientes-results-count");
    if (!tbody) return;

    const clientes = this.getClientesFiltrados();
    if (countEl) countEl.innerHTML = "Mostrando <strong>" + clientes.length + "</strong> cliente(s).";

    if (clientes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fas fa-users"></i><p>No hay clientes que coincidan con la búsqueda.</p></td></tr>';
      return;
    }

    tbody.innerHTML = "";
    clientes.forEach((c, index) => {
      const badgeClass = c.estado === "Activo" ? "bg-success" : "bg-danger";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="ps-4 fw-bold">${c.id}</td>
        <td>${c.nombre}</td>
        <td style="font-family: monospace;">${c.cedula}</td>
        <td>RD$ ${parseFloat(c.limite).toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td>
        <td><span class="badge ${badgeClass}">${c.estado}</span></td>
        <td class="text-center">
          <button onclick="ClientesModulo.editar(${index})" class="btn btn-sm btn-outline-primary me-2"><i class="fas fa-edit"></i> Editar</button>
          <button onclick="ClientesModulo.eliminar(${index})" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  mostrarError: function (mensaje) {
    const div = document.getElementById("error-msg");
    if (div) {
      div.innerText = mensaje;
      div.style.display = "block";
    }
  }
};
