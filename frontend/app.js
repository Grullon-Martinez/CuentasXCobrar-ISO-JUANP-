function cargar(seccion) {
  const contenido = document.getElementById("contenido");

  if (seccion === "clientes") {
    ClientesModulo.cargarVista();
  }

  if (seccion === "documentos") {
    DocumentosModulo.cargarVista();
  }

  if (seccion === "transacciones") {
    TransaccionesModulo.cargarVista();
  }

  if (seccion === "asientos") {
    AsientosModulo.cargarVista();
  }

  if (seccion === "consultas") {
    contenido.innerHTML = "<h2>Consultas</h2>";
  }

  if (seccion === "dashboard") {
    contenido.innerHTML = `
      <div class="cards">

        <div class="dashboard-card">
          <h3>Clientes</h3>
          <p id="dash-clientes">0</p>
        </div>

        <div class="dashboard-card">
          <h3>Transacciones</h3>
          <p id="dash-transacciones">0</p>
        </div>

        <div class="dashboard-card">
          <h3>Balance</h3>
          <p id="dash-balance">$0</p>
        </div>

      </div>
    `;

    actualizarDashboard();
  }
}

function actualizarDashboard() {
  const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
  const transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

  let balance = 0;

  transacciones.forEach((t) => {
    const monto = parseFloat(t.monto) || 0;

    if (t.tipoMovimiento === "DB") {
      balance += monto;
    } else if (t.tipoMovimiento === "CR") {
      balance -= monto;
    }
  });

  const c = document.getElementById("dash-clientes");
  const t = document.getElementById("dash-transacciones");
  const b = document.getElementById("dash-balance");

  if (c) c.textContent = clientes.length;
  if (t) t.textContent = transacciones.length;
  if (b) {
    b.textContent =
      "RD$ " + balance.toLocaleString("es-DO", { minimumFractionDigits: 2 });
  }
}
