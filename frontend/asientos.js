// frontend/asientos.js

const AsientosModulo = {
    indiceEdicion: -1,

    html: `
        <div class="container-fluid fade-in" style="padding: 20px;">
            <h2 class="text-dark mb-4 border-bottom pb-2">Gestión de Asientos Contables</h2>
            
            <div class="card shadow-sm mb-4">
                <div class="card-header bg-dark text-white">
                    <h5 class="mb-0" id="titulo-form-asiento">Registro de Movimiento Contable</h5>
                </div>
                <div class="card-body">
                    <form onsubmit="AsientosModulo.guardar(event)">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label fw-bold">Descripción del Asiento</label>
                                <input type="text" id="asiento-desc" class="form-control" placeholder="Ej: Venta de Boletos - Evento X" required>
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
                                <label class="form-label fw-bold">Cuenta Contable</label>
                                <input type="text" id="asiento-cuenta" class="form-control" placeholder="Ej: 110501" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label fw-bold">Tipo Movimiento</label>
                                <select id="asiento-tipo" class="form-select">
                                    <option value="DB">DB - Débito</option>
                                    <option value="CR">CR - Crédito</option>
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label fw-bold">Monto</label>
                                <input type="number" id="asiento-monto" class="form-control" step="0.01" required>
                            </div>
                            <div class="col-md-3 mb-3">
                                <label class="form-label fw-bold">Fecha</label>
                                <input type="date" id="asiento-fecha" class="form-control" required>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button type="submit" id="btn-asiento-guardar" class="btn btn-primary px-4">Registrar Asiento</button>
                            <button type="button" id="btn-asiento-cancelar" onclick="AsientosModulo.cancelarEdicion()" class="btn btn-secondary" style="display: none;">Cancelar</button>
                        </div>
                    </form>
                </div>
            </div>

            <div class="card shadow-sm">
                <div class="card-header bg-white d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Historial de Asientos</h5>
                    <div class="d-flex gap-2">
                        <input type="date" id="filtro-desde" class="form-control form-control-sm">
                        <input type="date" id="filtro-hasta" class="form-control form-control-sm">
                        <button onclick="AsientosModulo.renderizarTabla()" class="btn btn-sm btn-outline-secondary">Filtrar</button>
                    </div>
                </div>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Descripción</th>
                                    <th>Cliente</th>
                                    <th>Cuenta</th>
                                    <th>Tipo</th>
                                    <th>Monto</th>
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

    cargarVista: function() {
        document.getElementById("contenido").innerHTML = this.html;
        this.cargarClientes();
        this.renderizarTabla();
    },

    cargarClientes: function() {
        const select = document.getElementById("asiento-cliente");
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        select.innerHTML = '<option value="">Seleccione un cliente</option>';
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    },

    guardar: function(e) {
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
        this.renderizarTabla();
        e.target.reset();
    },

    anular: function(index) {
        if (confirm("¿Seguro que desea anular este asiento?")) {
            let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
            asientos[index].estado = "Anulado";
            localStorage.setItem("asientos", JSON.stringify(asientos));
            this.renderizarTabla();
        }
    },

    renderizarTabla: function() {
        const tbody = document.getElementById("tabla-asientos-body");
        let asientos = JSON.parse(localStorage.getItem("asientos")) || [];
        const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        
        tbody.innerHTML = "";
        asientos.forEach((a, index) => {
            const cli = clientes.find(c => c.id === a.clienteId);
            const badge = a.estado === 'Nuevo' ? 'bg-info' : 'bg-danger';
            
            tbody.innerHTML += `
                <tr>
                    <td>${a.fecha}</td>
                    <td>${a.descripcion}</td>
                    <td>${cli ? cli.nombre : 'N/A'}</td>
                    <td><code>${a.cuentaContable}</code></td>
                    <td><span class="badge ${a.tipoMovimiento === 'DB' ? 'bg-primary' : 'bg-success'}">${a.tipoMovimiento}</span></td>
                    <td>RD$ ${parseFloat(a.monto).toLocaleString()}</td>
                    <td><span class="badge ${badge}">${a.estado}</span></td>
                    <td class="text-center">
                        <button onclick="AsientosModulo.anular(${index})" class="btn btn-sm btn-outline-danger" ${a.estado === 'Anulado' ? 'disabled' : ''}>Anular</button>
                    </td>
                </tr>
            `;
        });
    }
};