// frontend/clientes.js

const ClientesModulo = {
    // Variable para controlar si estamos editando (-1 = Creando, >=0 = Editando)
    indiceEdicion: -1,

    // 1. HTML CON ESTRUCTURA BOOTSTRAP (GRID Y ESPACIADO)
    html: `
        <div class="container-fluid fade-in" style="padding: 20px;">
            <h2 class="text-dark mb-4 border-bottom pb-2">Gestión de Clientes</h2>
            
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
                            <tbody id="tabla-clientes-body">
                                </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,

    // 2. INICIALIZACIÓN (INCLUYE CARGA DE BOOTSTRAP AUTOMÁTICA)
    cargarVista: function() {
        this.cargarEstilosBootstrap(); // Inyecta CSS para que se vea bonito
        document.getElementById("contenido").innerHTML = this.html;
        this.renderizarTabla();
    },

    cargarEstilosBootstrap: function() {
        if (!document.getElementById("bootstrap-css")) {
            const link = document.createElement("link");
            link.id = "bootstrap-css";
            link.rel = "stylesheet";
            link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css";
            document.head.appendChild(link);
        }
    },

    // 3. VALIDACIÓN MATEMÁTICA DE CÉDULA
    validarCedula: function(cedula) {
        let c = cedula.replace(/-/g, '').replace(/\s/g, '');
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
        let calc = res === 0 ? 0 : (10 - res);
        return calc === dig;
    },

    // 4. LÓGICA PRINCIPAL (CREAR Y ACTUALIZAR)
    guardar: function(e) {
        e.preventDefault();
        const msgDiv = document.getElementById("error-msg");
        msgDiv.style.display = "none";
        msgDiv.innerText = "";

        // Capturar valores
        const idInput = document.getElementById("identificador").value.trim();
        const cedulaInput = document.getElementById("cedula").value;
        const cedulaLimpia = cedulaInput.replace(/-/g, '').replace(/\s/g, ''); // Limpiar cédula

        const datosFormulario = {
            id: idInput,
            nombre: document.getElementById("nombre").value.trim(),
            cedula: cedulaLimpia,
            limite: document.getElementById("limiteCredito").value,
            estado: document.getElementById("estado").value
        };

        // --- VALIDACIONES ---

        // 1. Validar formato Cédula
        if (!this.validarCedula(datosFormulario.cedula)) {
            this.mostrarError("❌ La cédula no es válida. Revise el formato o los números.");
            return;
        }

        let clientes = JSON.parse(localStorage.getItem("clientes")) || [];

        // 2. Validar ID Único
        // Buscamos si existe algun cliente con el mismo ID, EXCLUYENDO al que estamos editando
        const existeId = clientes.some((c, index) => c.id === datosFormulario.id && index !== this.indiceEdicion);
        if (existeId) {
            this.mostrarError("⚠️ El Identificador (ID) ya existe. Use uno diferente.");
            return;
        }

        // 3. Validar Cédula Única
        const existeCedula = clientes.some((c, index) => c.cedula === datosFormulario.cedula && index !== this.indiceEdicion);
        if (existeCedula) {
            this.mostrarError("⚠️ Esta cédula ya pertenece a otro cliente.");
            return;
        }

        // --- GUARDADO ---

        if (this.indiceEdicion === -1) {
            // MODO CREAR
            clientes.push(datosFormulario);
            alert("✅ Cliente Creado Exitosamente");
        } else {
            // MODO EDITAR (ACTUALIZAR)
            clientes[this.indiceEdicion] = datosFormulario;
            alert("✅ Cliente Actualizado Exitosamente");
            this.cancelarEdicion(); // Resetea el modo edición
        }

        localStorage.setItem("clientes", JSON.stringify(clientes));
        
        if (this.indiceEdicion === -1) e.target.reset(); // Solo limpia si estamos creando
        this.renderizarTabla();
    },

    // 5. PREPARAR FORMULARIO PARA EDITAR
    editar: function(index) {
        let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        const cliente = clientes[index];

        // Rellenar formulario
        document.getElementById("identificador").value = cliente.id;
        document.getElementById("nombre").value = cliente.nombre;
        document.getElementById("cedula").value = cliente.cedula;
        document.getElementById("limiteCredito").value = cliente.limite;
        document.getElementById("estado").value = cliente.estado;

        // Cambiar estado a "Editando"
        this.indiceEdicion = index;
        
        // Cambiar interfaz
        document.getElementById("titulo-form").innerText = "Editando Cliente: " + cliente.nombre;
        const btnGuardar = document.getElementById("btn-guardar");
        btnGuardar.innerText = "Actualizar Cliente";
        btnGuardar.className = "btn btn-warning px-4 text-white"; // Color amarillo para editar
        document.getElementById("btn-cancelar").style.display = "block"; // Mostrar botón cancelar
    },

    // 6. CANCELAR EDICIÓN
    cancelarEdicion: function() {
        this.indiceEdicion = -1;
        document.getElementById("titulo-form").innerText = "Registro de Nuevo Cliente";
        
        const btnGuardar = document.getElementById("btn-guardar");
        btnGuardar.innerText = "Guardar Cliente";
        btnGuardar.className = "btn btn-success px-4";
        
        document.getElementById("btn-cancelar").style.display = "none";
        document.forms[0].reset();
        document.getElementById("error-msg").style.display = "none";
    },

    // 7. ELIMINAR
    eliminar: function(index) {
        if (confirm("¿Está seguro de eliminar este registro permanentemente?")) {
            let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
            clientes.splice(index, 1);
            localStorage.setItem("clientes", JSON.stringify(clientes));
            this.renderizarTabla();
            
            // Si eliminamos el que estábamos editando, cancelamos la edición
            if (this.indiceEdicion === index) {
                this.cancelarEdicion();
            }
        }
    },

    // 8. RENDERIZAR TABLA
    renderizarTabla: function() {
        const tbody = document.getElementById("tabla-clientes-body");
        if (!tbody) return;

        let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
        tbody.innerHTML = "";

        if (clientes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4 text-muted">No hay clientes registrados.</td></tr>`;
            return;
        }

        clientes.forEach((c, index) => {
            const badgeClass = c.estado === 'Activo' ? 'bg-success' : 'bg-danger';
            
            tbody.innerHTML += `
                <tr>
                    <td class="ps-4 fw-bold">${c.id}</td>
                    <td>${c.nombre}</td>
                    <td style="font-family: monospace; font-size: 1.1em;">${c.cedula}</td>
                    <td>RD$ ${parseFloat(c.limite).toLocaleString('es-DO', {minimumFractionDigits: 2})}</td>
                    <td><span class="badge ${badgeClass}">${c.estado}</span></td>
                    <td class="text-center">
                        <button onclick="ClientesModulo.editar(${index})" class="btn btn-sm btn-outline-primary me-2">
                            ✏️ Editar
                        </button>
                        <button onclick="ClientesModulo.eliminar(${index})" class="btn btn-sm btn-outline-danger">
                            🗑️ Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });
    },

    mostrarError: function(mensaje) {
        const div = document.getElementById("error-msg");
        div.innerText = mensaje;
        div.style.display = "block";
    }
};