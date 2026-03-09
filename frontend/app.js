function cargar(seccion){

    const contenido = document.getElementById("contenido");

    if(seccion === "dashboard"){
        contenido.innerHTML = "<h1>Dashboard</h1><p>Resumen del sistema</p>";
    }

    if(seccion === "clientes"){
        contenido.innerHTML = "<h1>Gestión de Clientes</h1>";
    }

    if(seccion === "documentos"){
        contenido.innerHTML = "<h1>Tipos de Documentos</h1>";
    }

    if(seccion === "transacciones"){
        contenido.innerHTML = "<h1>Transacciones</h1>";
    }

    if(seccion === "asientos"){
        contenido.innerHTML = "<h1>Asientos Contables</h1>";
    }

    if(seccion === "consultas"){
        contenido.innerHTML = "<h1>Consultas</h1>";
    }

}