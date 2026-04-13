// frontend/documentos.js

const DocumentosModulo = {
  indiceEdicion: -1,

  html: `
    <div class="section-page container-fluid fade-in">
      <div class="section-stats" id="documentos-stats">
        <div class="section-stat">
          <div class="section-stat-icon primary"><i class="fas fa-file-alt"></i></div>
          <div>
            <span class="section-stat-label">Total documentos</span>
            <span class="section-stat-value" id="doc-stat-total">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon success"><i class="fas fa-check-circle"></i></div>
          <div>
            <span class="section-stat-label">Activos</span>
            <span class="section-stat-value" id="doc-stat-activos">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon danger"><i class="fas fa-times-circle"></i></div>
          <div>
            <span class="section-stat-label">Inactivos</span>
            <span class="section-stat-value" id="doc-stat-inactivos">0</span>
          </div>
        </div>
      </div>

      <div class="card shadow-sm mb-4">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0" id="titulo-form-doc">Registrar tipo de documento</h5>
        </div>
        <div class="card-body">
          <form onsubmit="DocumentosModulo.guardar(event)">
            <div class="row">
              <div class="col-md-3 mb-3">
                <label class="form-label fw-bold">Identificador</label>
                <input type="text" id="doc-id" class="form-control" placeholder="FAC, NCF, REC" required>
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label fw-bold">Descripción</label>
                <input type="text" id="doc-descripcion" class="form-control" placeholder="Factura de venta" required>
              </div>
              <div class="col-md-3 mb-3">
                <label class="form-label fw-bold">Cuenta contable</label>
                <input type="text" id="doc-cuenta" class="form-control" placeholder="110101" required>
              </div>
              <div class="col-md-2 mb-3">
                <label class="form-label fw-bold">Estado</label>
                <select id="doc-estado" class="form-select">
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
            <div class="d-flex gap-2 mt-3">
              <button type="submit" id="btn-guardar-doc" class="btn btn-success px-4"><i class="fas fa-save"></i> Guardar</button>
              <button type="button" onclick="DocumentosModulo.cancelarEdicion()" id="btn-cancelar-doc" class="btn btn-secondary" style="display:none;">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header flex-header">
          <h5 class="mb-0 text-secondary">Lista de tipos de documento</h5>
          <div class="search-input-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="documentos-search" class="form-control" placeholder="Buscar por ID, descripción o cuenta..." oninput="DocumentosModulo.renderizarTabla()">
          </div>
        </div>
        <div class="card-body p-0">
          <p class="results-count" id="documentos-results-count" style="margin: 12px 20px 0;"></p>
          <div class="table-responsive">
            <table class="table table-striped table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr>
                  <th class="ps-4">ID</th>
                  <th>Descripción</th>
                  <th>Cuenta</th>
                  <th>Estado</th>
                  <th class="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody id="tabla-documentos-body"></tbody>
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

  getDocumentosFiltrados: function () {
    const documentos = JSON.parse(localStorage.getItem("documentos")) || [];
    const busqueda = (document.getElementById("documentos-search") || {}).value || "";
    const term = busqueda.trim().toLowerCase();
    if (!term) return documentos;
    return documentos.filter(
      (d) =>
        (d.id && d.id.toLowerCase().includes(term)) ||
        (d.descripcion && d.descripcion.toLowerCase().includes(term)) ||
        (d.cuenta && d.cuenta.includes(term))
    );
  },

  actualizarEstadisticas: function () {
    const documentos = JSON.parse(localStorage.getItem("documentos")) || [];
    const activos = documentos.filter((d) => d.estado === "Activo").length;
    const inactivos = documentos.length - activos;
    const totalEl = document.getElementById("doc-stat-total");
    const activosEl = document.getElementById("doc-stat-activos");
    const inactivosEl = document.getElementById("doc-stat-inactivos");
    if (totalEl) totalEl.textContent = documentos.length;
    if (activosEl) activosEl.textContent = activos;
    if (inactivosEl) inactivosEl.textContent = inactivos;
  },

  guardar: function (e) {
    e.preventDefault();
    const documento = {
      id: document.getElementById("doc-id").value.trim(),
      descripcion: document.getElementById("doc-descripcion").value.trim(),
      cuenta: document.getElementById("doc-cuenta").value.trim(),
      estado: document.getElementById("doc-estado").value
    };

    let documentos = JSON.parse(localStorage.getItem("documentos")) || [];
    const existeId = documentos.some((d, i) => d.id === documento.id && i !== this.indiceEdicion);
    if (existeId) {
      alert("El identificador ya existe.");
      return;
    }

    if (this.indiceEdicion === -1) {
      documentos.push(documento);
      alert("Documento creado correctamente.");
    } else {
      documentos[this.indiceEdicion] = documento;
      alert("Documento actualizado correctamente.");
      this.cancelarEdicion();
    }

    localStorage.setItem("documentos", JSON.stringify(documentos));
    e.target.reset();
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  editar: function (index) {
    const documentos = this.getDocumentosFiltrados();
    const d = documentos[index];
    const todos = JSON.parse(localStorage.getItem("documentos")) || [];
    const indiceReal = todos.findIndex((x) => x.id === d.id);

    document.getElementById("doc-id").value = d.id;
    document.getElementById("doc-descripcion").value = d.descripcion;
    document.getElementById("doc-cuenta").value = d.cuenta;
    document.getElementById("doc-estado").value = d.estado;

    this.indiceEdicion = indiceReal >= 0 ? indiceReal : index;
    document.getElementById("titulo-form-doc").innerText = "Editando documento: " + d.id;
    document.getElementById("btn-guardar-doc").innerHTML = "<i class=\"fas fa-save\"></i> Actualizar";
    document.getElementById("btn-cancelar-doc").style.display = "block";
  },

  cancelarEdicion: function () {
    this.indiceEdicion = -1;
    document.getElementById("titulo-form-doc").innerText = "Registrar tipo de documento";
    document.getElementById("btn-guardar-doc").innerHTML = "<i class=\"fas fa-save\"></i> Guardar";
    document.getElementById("btn-cancelar-doc").style.display = "none";
    if (document.forms[0]) document.forms[0].reset();
  },

  eliminar: function (index) {
    if (!confirm("¿Eliminar este tipo de documento?")) return;
    const documentos = this.getDocumentosFiltrados();
    const d = documentos[index];
    let todos = JSON.parse(localStorage.getItem("documentos")) || [];
    const indiceReal = todos.findIndex((x) => x.id === d.id);
    if (indiceReal !== -1) todos.splice(indiceReal, 1);
    localStorage.setItem("documentos", JSON.stringify(todos));
    this.indiceEdicion = -1;
    this.actualizarEstadisticas();
    this.renderizarTabla();
  },

  renderizarTabla: function () {
    const tbody = document.getElementById("tabla-documentos-body");
    const countEl = document.getElementById("documentos-results-count");
    if (!tbody) return;

    const documentos = this.getDocumentosFiltrados();
    if (countEl) countEl.innerHTML = "Mostrando <strong>" + documentos.length + "</strong> documento(s).";

    if (documentos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="fas fa-file-alt"></i><p>No hay documentos que coincidan con la búsqueda.</p></td></tr>';
      return;
    }

    tbody.innerHTML = "";
    documentos.forEach((d, index) => {
      const badge = d.estado === "Activo" ? "bg-success" : "bg-danger";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="ps-4 fw-bold">${d.id}</td>
        <td>${d.descripcion}</td>
        <td><code>${d.cuenta}</code></td>
        <td><span class="badge ${badge}">${d.estado}</span></td>
        <td class="text-center">
          <button onclick="DocumentosModulo.editar(${index})" class="btn btn-sm btn-outline-primary me-2"><i class="fas fa-edit"></i></button>
          <button onclick="DocumentosModulo.eliminar(${index})" class="btn btn-sm btn-outline-danger"><i class="fas fa-trash-alt"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
};
