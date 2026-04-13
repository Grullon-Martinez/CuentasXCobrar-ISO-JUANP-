// frontend/consultas.js

const ConsultasModulo = {
  html: `
    <div class="report-card">
      <h3><i class="fas fa-search"></i> Consulta por criterios</h3>
      <p class="report-card-desc">
        Filtre transacciones por cliente, fecha, monto o documento. Genere reportes
        de antigüedad de saldos y movimientos por período, y expórtelos a PDF.
      </p>

      <div
        class="consulta-filtros"
        style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        "
      >
        <div>
          <label class="form-label">Tipo de Reporte</label>
          <select id="tipo-reporte" class="form-select">
            <option value="detalle">Transacciones por cliente / fecha</option>
            <option value="antiguedad">Antigüedad de saldos</option>
            <option value="periodo">Movimientos por período</option>
          </select>
        </div>

        <div>
          <label class="form-label">Cliente</label>
          <select id="filtro-cliente" class="form-select">
            <option value="">Todos los clientes</option>
          </select>
        </div>

        <div>
          <label class="form-label">Tipo de Movimiento</label>
          <select id="filtro-tipo-mov" class="form-select">
            <option value="">Todos</option>
            <option value="DB">DB - Débito</option>
            <option value="CR">CR - Crédito</option>
          </select>
        </div>

        <div>
          <label class="form-label">Tipo de Documento</label>
          <input
            type="text"
            id="filtro-tipo-doc"
            class="form-control"
            placeholder="FAC, NCF, REC..."
          />
        </div>

        <div>
          <label class="form-label">Fecha Desde</label>
          <input type="date" id="filtro-fecha-desde" class="form-control" />
        </div>

        <div>
          <label class="form-label">Fecha Hasta</label>
          <input type="date" id="filtro-fecha-hasta" class="form-control" />
        </div>

        <div>
          <label class="form-label">Monto Mínimo</label>
          <div class="input-group">
            <span class="input-group-text">RD$</span>
            <input
              type="number"
              id="filtro-monto-min"
              class="form-control"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label class="form-label">Monto Máximo</label>
          <div class="input-group">
            <span class="input-group-text">RD$</span>
            <input
              type="number"
              id="filtro-monto-max"
              class="form-control"
              placeholder="0.00"
              step="0.01"
            />
          </div>
        </div>
      </div>

      <div class="d-flex gap-2 mb-3" style="flex-wrap: wrap;">
        <button onclick="ConsultasModulo.buscar()" class="btn btn-primary">
          <i class="fas fa-search"></i> Buscar
        </button>
        <button
          onclick="ConsultasModulo.limpiarFiltros()"
          class="btn btn-outline-secondary"
        >
          <i class="fas fa-eraser"></i> Limpiar Filtros
        </button>
        <button
          onclick="ConsultasModulo.exportarPDF()"
          class="btn btn-danger"
        >
          <i class="fas fa-file-pdf"></i> Exportar PDF
        </button>
      </div>

      <div
        class="section-stats"
        id="consulta-resumen"
        style="display: none; margin-bottom: 16px;"
      >
        <div class="section-stat">
          <div class="section-stat-icon muted">
            <i class="fas fa-list"></i>
          </div>
          <div>
            <span class="section-stat-label">Resultados</span>
            <span class="section-stat-value" id="resumen-cantidad">0</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon primary">
            <i class="fas fa-arrow-up"></i>
          </div>
          <div>
            <span class="section-stat-label">Total Débitos</span>
            <span class="section-stat-value" id="resumen-debitos">RD$ 0.00</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon success">
            <i class="fas fa-arrow-down"></i>
          </div>
          <div>
            <span class="section-stat-label">Total Créditos</span>
            <span class="section-stat-value" id="resumen-creditos">RD$ 0.00</span>
          </div>
        </div>
        <div class="section-stat">
          <div class="section-stat-icon warning">
            <i class="fas fa-balance-scale"></i>
          </div>
          <div>
            <span class="section-stat-label">Balance Neto</span>
            <span class="section-stat-value" id="resumen-balance">RD$ 0.00</span>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table-compact">
          <thead id="tabla-consulta-head">
            <tr>
              <th>ID Trans.</th>
              <th>Movimiento</th>
              <th>Tipo Doc.</th>
              <th>No. Doc.</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th class="text-end">Monto</th>
            </tr>
          </thead>
          <tbody id="tabla-consulta-body">
            <tr>
              <td colspan="7">
                <div class="empty-state">
                  <i class="fas fa-binoculars"></i>
                  <p>Utilice los filtros y presione "Buscar" para ver resultados.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="results-count" id="consulta-results-count"></p>
    </div>
  `,

  ultimosResultados: [],
  ultimoTipoReporte: "detalle",

  // Acepta un id opcional; si no se pasa, usa "contenido"
  cargarVista: function (targetId) {
    const target = document.getElementById(targetId || "contenido");
    target.innerHTML = this.html;
    this.cargarClientesEnFiltro();
  },

  cargarClientesEnFiltro: function () {
    const select = document.getElementById("filtro-cliente");
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    select.innerHTML = `<option value="">Todos los clientes</option>`;
    clientes.forEach((c) => {
      select.innerHTML += `<option value="${c.id}">${c.id} - ${c.nombre}</option>`;
    });
  },

  buscar: function () {
    const tipoReporte = document.getElementById("tipo-reporte").value;
    this.ultimoTipoReporte = tipoReporte;

    const transacciones =
      JSON.parse(localStorage.getItem("transacciones")) || [];
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];

    const filtroCliente = document.getElementById("filtro-cliente").value;
    const filtroTipoMov = document.getElementById("filtro-tipo-mov").value;
    const filtroTipoDoc = document
      .getElementById("filtro-tipo-doc")
      .value.trim()
      .toUpperCase();
    const filtroFechaDesde =
      document.getElementById("filtro-fecha-desde").value;
    const filtroFechaHasta =
      document.getElementById("filtro-fecha-hasta").value;
    const filtroMontoMin =
      parseFloat(document.getElementById("filtro-monto-min").value) || 0;
    const filtroMontoMax =
      parseFloat(document.getElementById("filtro-monto-max").value) || 0;

    let resultadosFiltrados = transacciones.filter((t) => {
      if (filtroCliente && t.clienteId !== filtroCliente) return false;
      if (filtroTipoMov && t.tipoMovimiento !== filtroTipoMov) return false;
      if (
        filtroTipoDoc &&
        !(t.tipoDocumento || "").toUpperCase().includes(filtroTipoDoc)
      )
        return false;
      if (filtroFechaDesde && t.fecha < filtroFechaDesde) return false;
      if (filtroFechaHasta && t.fecha > filtroFechaHasta) return false;

      const monto = parseFloat(t.monto) || 0;
      if (filtroMontoMin > 0 && monto < filtroMontoMin) return false;
      if (filtroMontoMax > 0 && monto > filtroMontoMax) return false;

      return true;
    });

    if (tipoReporte === "detalle") {
      this.ultimosResultados = resultadosFiltrados;
      this.actualizarResumenDesdeTransacciones(resultadosFiltrados);
      this.renderizarDetalle(resultadosFiltrados, clientes);
      return;
    }

    if (tipoReporte === "antiguedad") {
      const resultadosAntiguedad = this.generarAntiguedadSaldos(
        resultadosFiltrados,
        clientes
      );
      this.ultimosResultados = resultadosAntiguedad;
      this.actualizarResumenDesdeAntiguedad(resultadosAntiguedad);
      this.renderizarAntiguedad(resultadosAntiguedad);
      return;
    }

    if (tipoReporte === "periodo") {
      const resultadosPeriodo =
        this.generarMovimientosPorPeriodo(resultadosFiltrados);
      this.ultimosResultados = resultadosPeriodo;
      this.actualizarResumenDesdePeriodos(resultadosPeriodo);
      this.renderizarPeriodos(resultadosPeriodo);
    }
  },

  actualizarResumenDesdeTransacciones: function (resultados) {
    let totalDebitos = 0;
    let totalCreditos = 0;

    resultados.forEach((t) => {
      const monto = parseFloat(t.monto) || 0;
      if (t.tipoMovimiento === "DB") totalDebitos += monto;
      if (t.tipoMovimiento === "CR") totalCreditos += monto;
    });

    const balance = totalDebitos - totalCreditos;
    this.pintarResumen(resultados.length, totalDebitos, totalCreditos, balance);
  },

  actualizarResumenDesdeAntiguedad: function (resultados) {
    let total = 0;
    resultados.forEach((r) => {
      total += parseFloat(r.total) || 0;
    });

    this.pintarResumen(resultados.length, total, 0, total);
  },

  actualizarResumenDesdePeriodos: function (resultados) {
    let totalDebitos = 0;
    let totalCreditos = 0;

    resultados.forEach((r) => {
      totalDebitos += parseFloat(r.debitos) || 0;
      totalCreditos += parseFloat(r.creditos) || 0;
    });

    const balance = totalDebitos - totalCreditos;
    this.pintarResumen(resultados.length, totalDebitos, totalCreditos, balance);
  },

  pintarResumen: function (cantidad, totalDebitos, totalCreditos, balance) {
    const resumenDiv = document.getElementById("consulta-resumen");
    resumenDiv.style.display = "grid";

    document.getElementById("resumen-cantidad").textContent = cantidad;
    document.getElementById("resumen-debitos").textContent =
      "RD$ " +
      totalDebitos.toLocaleString("es-DO", { minimumFractionDigits: 2 });
    document.getElementById("resumen-creditos").textContent =
      "RD$ " +
      totalCreditos.toLocaleString("es-DO", { minimumFractionDigits: 2 });

    const balanceEl = document.getElementById("resumen-balance");
    balanceEl.textContent =
      "RD$ " + balance.toLocaleString("es-DO", { minimumFractionDigits: 2 });

    const countEl = document.getElementById("consulta-results-count");
    if (countEl) {
      countEl.innerHTML =
        "Mostrando <strong>" +
        cantidad +
        "</strong> registro" +
        (cantidad !== 1 ? "s" : "") +
        ".";
    }
  },

  generarAntiguedadSaldos: function (transacciones, clientes) {
    const hoy = new Date();
    const mapa = {};

    transacciones.forEach((t) => {
      const cliente = clientes.find((c) => c.id === t.clienteId);
      const nombreCliente = cliente ? cliente.nombre : t.clienteId;
      const montoBase = parseFloat(t.monto) || 0;
      const monto = t.tipoMovimiento === "CR" ? -montoBase : montoBase;

      const fechaTx = new Date(t.fecha + "T00:00:00");
      const dias = Math.floor((hoy - fechaTx) / (1000 * 60 * 60 * 24));

      if (!mapa[t.clienteId]) {
        mapa[t.clienteId] = {
          clienteId: t.clienteId,
          cliente: nombreCliente,
          bucket0_30: 0,
          bucket31_60: 0,
          bucket61_90: 0,
          bucket91mas: 0,
          total: 0,
        };
      }

      if (dias <= 30) mapa[t.clienteId].bucket0_30 += monto;
      else if (dias <= 60) mapa[t.clienteId].bucket31_60 += monto;
      else if (dias <= 90) mapa[t.clienteId].bucket61_90 += monto;
      else mapa[t.clienteId].bucket91mas += monto;

      mapa[t.clienteId].total += monto;
    });

    return Object.values(mapa);
  },

  generarMovimientosPorPeriodo: function (transacciones) {
    const mapa = {};

    transacciones.forEach((t) => {
      const periodo = (t.fecha || "").slice(0, 7); // YYYY-MM
      if (!periodo) return;

      if (!mapa[periodo]) {
        mapa[periodo] = {
          periodo,
          cantidad: 0,
          debitos: 0,
          creditos: 0,
          neto: 0,
        };
      }

      const monto = parseFloat(t.monto) || 0;
      mapa[periodo].cantidad += 1;

      if (t.tipoMovimiento === "DB") {
        mapa[periodo].debitos += monto;
      } else if (t.tipoMovimiento === "CR") {
        mapa[periodo].creditos += monto;
      }

      mapa[periodo].neto = mapa[periodo].debitos - mapa[periodo].creditos;
    });

    return Object.values(mapa).sort((a, b) =>
      a.periodo.localeCompare(b.periodo)
    );
  },

  fmt: function (n) {
    return (parseFloat(n) || 0).toLocaleString("es-DO", {
      minimumFractionDigits: 2,
    });
  },

  renderizarDetalle: function (resultados, clientes) {
    const thead = document.getElementById("tabla-consulta-head");
    const tbody = document.getElementById("tabla-consulta-body");

    thead.innerHTML = `
      <tr>
        <th>ID Trans.</th>
        <th>Movimiento</th>
        <th>Tipo Doc.</th>
        <th>No. Doc.</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th class="text-end">Monto</th>
      </tr>
    `;

    tbody.innerHTML = "";

    if (resultados.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="fas fa-binoculars"></i>
              <p>No se encontraron transacciones con los criterios seleccionados.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    resultados.forEach((t) => {
      const cliente = clientes.find((c) => c.id === t.clienteId);
      const nombreCliente = cliente ? cliente.nombre : t.clienteId;
      const badgeClass =
        t.tipoMovimiento === "DB" ? "bg-primary" : "bg-success";

      tbody.innerHTML += `
        <tr>
          <td><strong>${t.id}</strong></td>
          <td><span class="badge ${badgeClass}">${t.tipoMovimiento}</span></td>
          <td>${t.tipoDocumento}</td>
          <td>${t.numeroDocumento}</td>
          <td>${t.fecha}</td>
          <td>${nombreCliente}</td>
          <td class="text-end fw-bold">RD$ ${this.fmt(t.monto)}</td>
        </tr>`;
    });
  },

  renderizarAntiguedad: function (resultados) {
    const thead = document.getElementById("tabla-consulta-head");
    const tbody = document.getElementById("tabla-consulta-body");

    thead.innerHTML = `
      <tr>
        <th>ID Cliente</th>
        <th>Cliente</th>
        <th class="text-end">0-30 días</th>
        <th class="text-end">31-60 días</th>
        <th class="text-end">61-90 días</th>
        <th class="text-end">91+ días</th>
        <th class="text-end">Total</th>
      </tr>
    `;

    tbody.innerHTML = "";

    if (resultados.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="empty-state">
              <i class="fas fa-exclamation-circle"></i>
              <p>No hay datos para generar antigüedad de saldos.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    resultados.forEach((r) => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${r.clienteId}</strong></td>
          <td>${r.cliente}</td>
          <td class="text-end">RD$ ${this.fmt(r.bucket0_30)}</td>
          <td class="text-end">RD$ ${this.fmt(r.bucket31_60)}</td>
          <td class="text-end">RD$ ${this.fmt(r.bucket61_90)}</td>
          <td class="text-end">RD$ ${this.fmt(r.bucket91mas)}</td>
          <td class="text-end fw-bold">RD$ ${this.fmt(r.total)}</td>
        </tr>
      `;
    });
  },

  renderizarPeriodos: function (resultados) {
    const thead = document.getElementById("tabla-consulta-head");
    const tbody = document.getElementById("tabla-consulta-body");

    thead.innerHTML = `
      <tr>
        <th>Período</th>
        <th class="text-end">Cantidad Mov.</th>
        <th class="text-end">Total Débitos</th>
        <th class="text-end">Total Créditos</th>
        <th class="text-end">Neto</th>
      </tr>
    `;

    tbody.innerHTML = "";

    if (resultados.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="empty-state">
              <i class="fas fa-exclamation-circle"></i>
              <p>No hay movimientos para el período seleccionado.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    resultados.forEach((r) => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${r.periodo}</strong></td>
          <td class="text-end">${r.cantidad}</td>
          <td class="text-end">RD$ ${this.fmt(r.debitos)}</td>
          <td class="text-end">RD$ ${this.fmt(r.creditos)}</td>
          <td class="text-end fw-bold">RD$ ${this.fmt(r.neto)}</td>
        </tr>
      `;
    });
  },

  limpiarFiltros: function () {
    document.getElementById("tipo-reporte").value = "detalle";
    document.getElementById("filtro-cliente").value = "";
    document.getElementById("filtro-tipo-mov").value = "";
    document.getElementById("filtro-tipo-doc").value = "";
    document.getElementById("filtro-fecha-desde").value = "";
    document.getElementById("filtro-fecha-hasta").value = "";
    document.getElementById("filtro-monto-min").value = "";
    document.getElementById("filtro-monto-max").value = "";

    document.getElementById("consulta-resumen").style.display = "none";

    const countEl = document.getElementById("consulta-results-count");
    if (countEl) countEl.innerHTML = "";

    document.getElementById("tabla-consulta-head").innerHTML = `
      <tr>
        <th>ID Trans.</th>
        <th>Movimiento</th>
        <th>Tipo Doc.</th>
        <th>No. Doc.</th>
        <th>Fecha</th>
        <th>Cliente</th>
        <th class="text-end">Monto</th>
      </tr>
    `;

    document.getElementById("tabla-consulta-body").innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <i class="fas fa-binoculars"></i>
            <p>Utilice los filtros y presione "Buscar" para ver resultados.</p>
          </div>
        </td>
      </tr>`;

    this.ultimosResultados = [];
    this.ultimoTipoReporte = "detalle";
  },

  exportarPDF: function () {
    if (this.ultimosResultados.length === 0) {
      alert("No hay resultados para exportar. Realice una búsqueda primero.");
      return;
    }

    // jsPDF se carga desde CDN como window.jspdf.jsPDF
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert(
        "No se pudo cargar la librería jsPDF. Verifique que esté incluida en index.html."
      );
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });

    const titulos = {
      detalle: "Transacciones por cliente / fecha",
      antiguedad: "Antigüedad de saldos",
      periodo: "Movimientos por período",
    };

    const titulo = titulos[this.ultimoTipoReporte] || "Consulta";
    const fechaReporte = new Date().toLocaleDateString("es-DO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Encabezado del PDF
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Cuentas por Cobrar", 40, 40);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(titulo, 40, 60);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Generado: " + fechaReporte, 40, 76);
    doc.setTextColor(0);

    let head = [];
    let body = [];

    if (this.ultimoTipoReporte === "detalle") {
      const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
      head = [
        [
          "ID",
          "Mov.",
          "Tipo Doc.",
          "No. Doc.",
          "Fecha",
          "Cliente",
          "Monto (RD$)",
        ],
      ];
      body = this.ultimosResultados.map((t) => {
        const cliente = clientes.find((c) => c.id === t.clienteId);
        const nombreCliente = cliente ? cliente.nombre : t.clienteId;
        return [
          t.id,
          t.tipoMovimiento,
          t.tipoDocumento,
          t.numeroDocumento,
          t.fecha,
          nombreCliente,
          this.fmt(t.monto),
        ];
      });
    }

    if (this.ultimoTipoReporte === "antiguedad") {
      head = [
        [
          "ID Cliente",
          "Cliente",
          "0-30 días",
          "31-60 días",
          "61-90 días",
          "91+ días",
          "Total",
        ],
      ];
      body = this.ultimosResultados.map((r) => [
        r.clienteId,
        r.cliente,
        this.fmt(r.bucket0_30),
        this.fmt(r.bucket31_60),
        this.fmt(r.bucket61_90),
        this.fmt(r.bucket91mas),
        this.fmt(r.total),
      ]);
    }

    if (this.ultimoTipoReporte === "periodo") {
      head = [
        ["Período", "Cant. Mov.", "Total Débitos", "Total Créditos", "Neto"],
      ];
      body = this.ultimosResultados.map((r) => [
        r.periodo,
        r.cantidad,
        this.fmt(r.debitos),
        this.fmt(r.creditos),
        this.fmt(r.neto),
      ]);
    }

    doc.autoTable({
      head: head,
      body: body,
      startY: 95,
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      margin: { left: 40, right: 40 },
    });

    // Pie de página con numeración
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(
        "Página " + i + " de " + totalPages,
        doc.internal.pageSize.getWidth() - 80,
        doc.internal.pageSize.getHeight() - 20
      );
    }

    doc.save(
      "consulta_" +
        this.ultimoTipoReporte +
        "_" +
        new Date().toISOString().slice(0, 10) +
        ".pdf"
    );
  },
};
