function cargar(seccion){

const contenido = document.getElementById("main")

if(seccion === "clientes"){
contenido.innerHTML = "<h2>Gestión de Clientes</h2>"
}

if(seccion === "documentos"){
contenido.innerHTML = "<h2>Tipos de Documento</h2>"
}

if(seccion === "transacciones"){
contenido.innerHTML = "<h2>Transacciones</h2>"
}

if(seccion === "asientos"){
contenido.innerHTML = "<h2>Asientos Contables</h2>"
}

if(seccion === "consultas"){
contenido.innerHTML = "<h2>Consultas</h2>"
}

if(seccion === "dashboard"){
contenido.innerHTML = `
<div class="cards">

<div class="card">
<h3>Clientes</h3>
<p>0</p>
</div>

<div class="card">
<h3>Transacciones</h3>
<p>0</p>
</div>

<div class="card">
<h3>Balance</h3>
<p>$0</p>
</div>

</div>
`
}

}