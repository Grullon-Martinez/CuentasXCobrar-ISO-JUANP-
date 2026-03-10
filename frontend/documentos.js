// frontend/documentos.js

const DocumentosModulo = {

    indiceEdicion: -1,

    html: `
        <div class="container-fluid fade-in" style="padding:20px;">
            <h2 class="text-dark mb-4 border-bottom pb-2">Tipos de Documentos</h2>

            <div class="card shadow-sm mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0" id="titulo-form-doc">Registrar Tipo de Documento</h5>
                </div>

                <div class="card-body">

                    <form onsubmit="DocumentosModulo.guardar(event)">

                        <div class="row">

                            <div class="col-md-3 mb-3">
                                <label class="form-label fw-bold">Identificador</label>
                                <input type="text" id="doc-id" class="form-control" placeholder="FAC" required>
                            </div>

                            <div class="col-md-4 mb-3">
                                <label class="form-label fw-bold">Descripción</label>
                                <input type="text" id="doc-descripcion" class="form-control" placeholder="Factura de Venta" required>
                            </div>

                            <div class="col-md-3 mb-3">
                                <label class="form-label fw-bold">Cuenta Contable</label>
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

                            <button type="submit" id="btn-guardar-doc" class="btn btn-success px-4">
                                Guardar
                            </button>

                            <button type="button" onclick="DocumentosModulo.cancelarEdicion()" 
                            id="btn-cancelar-doc" class="btn btn-secondary" style="display:none;">
                                Cancelar
                            </button>

                        </div>

                    </form>

                </div>
            </div>

            <div class="card shadow-sm">

                <div class="card-header bg-white">
                    <h5 class="mb-0 text-secondary">Lista de Tipos de Documento</h5>
                </div>

                <div class="card-body p-0">

                    <div class="table-responsive">

                        <table class="table table-striped table-hover mb-0 align-middle">

                            <thead class="table-light">
                                <tr>
                                    <th>ID</th>
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

    cargarVista: function() {
        document.getElementById("contenido").innerHTML = this.html
        this.renderizarTabla()
    },

    guardar: function(e) {

        e.preventDefault()

        const documento = {
            id: document.getElementById("doc-id").value.trim(),
            descripcion: document.getElementById("doc-descripcion").value.trim(),
            cuenta: document.getElementById("doc-cuenta").value.trim(),
            estado: document.getElementById("doc-estado").value
        }

        let documentos = JSON.parse(localStorage.getItem("documentos")) || []

        const existeId = documentos.some((d,i)=> d.id === documento.id && i !== this.indiceEdicion)

        if(existeId){
            alert("El identificador ya existe.")
            return
        }

        if(this.indiceEdicion === -1){

            documentos.push(documento)
            alert("Documento creado")

        } else {

            documentos[this.indiceEdicion] = documento
            alert("Documento actualizado")

            this.cancelarEdicion()

        }

        localStorage.setItem("documentos", JSON.stringify(documentos))

        e.target.reset()

        this.renderizarTabla()
    },

    editar: function(index){

        let documentos = JSON.parse(localStorage.getItem("documentos")) || []
        const d = documentos[index]

        document.getElementById("doc-id").value = d.id
        document.getElementById("doc-descripcion").value = d.descripcion
        document.getElementById("doc-cuenta").value = d.cuenta
        document.getElementById("doc-estado").value = d.estado

        this.indiceEdicion = index

        document.getElementById("titulo-form-doc").innerText = "Editando Documento"
        document.getElementById("btn-guardar-doc").innerText = "Actualizar"

        document.getElementById("btn-cancelar-doc").style.display = "block"
    },

    cancelarEdicion: function(){

        this.indiceEdicion = -1

        document.getElementById("titulo-form-doc").innerText = "Registrar Tipo de Documento"
        document.getElementById("btn-guardar-doc").innerText = "Guardar"

        document.getElementById("btn-cancelar-doc").style.display = "none"

        document.forms[0].reset()
    },

    eliminar: function(index){

        if(confirm("¿Eliminar documento?")){

            let documentos = JSON.parse(localStorage.getItem("documentos")) || []

            documentos.splice(index,1)

            localStorage.setItem("documentos", JSON.stringify(documentos))

            this.renderizarTabla()
        }
    },

    renderizarTabla: function(){

        const tbody = document.getElementById("tabla-documentos-body")

        let documentos = JSON.parse(localStorage.getItem("documentos")) || []

        tbody.innerHTML = ""

        if(documentos.length === 0){

            tbody.innerHTML = `
            <tr>
            <td colspan="5" class="text-center p-4 text-muted">
            No hay documentos registrados
            </td>
            </tr>`
            return
        }

        documentos.forEach((d,index)=>{

            const badge = d.estado === "Activo" ? "bg-success" : "bg-danger"

            tbody.innerHTML += `
            <tr>

            <td class="fw-bold">${d.id}</td>
            <td>${d.descripcion}</td>
            <td>${d.cuenta}</td>

            <td>
            <span class="badge ${badge}">
            ${d.estado}
            </span>
            </td>

            <td class="text-center">

            <button onclick="DocumentosModulo.editar(${index})"
            class="btn btn-sm btn-outline-primary me-2">
            ✏️
            </button>

            <button onclick="DocumentosModulo.eliminar(${index})"
            class="btn btn-sm btn-outline-danger">
            🗑️
            </button>

            </td>

            </tr>
            `
        })

    }

}