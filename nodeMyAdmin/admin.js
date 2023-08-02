let baseDatos = null, tabla = null

window.onload = function() {
    rellenarTabla()
}

async function rellenarTabla() {
    let url = new URL(window.location)

    if (!url.searchParams.has("ruta") || url.searchParams.get("ruta") == "") {
        window.location = "?ruta=/"
    }
    
    let ruta = url.searchParams.get("ruta")
    let partes = ruta.split("/")

    if (partes[0] != "" || partes.length < 2) {
        window.location = "?ruta=/"
    }

    let consulta = "", baseDatos = ""
    if (ruta == "/") {
        consulta = "SHOW DATABASES"
    }
    else if (partes.length == 2 || (partes.length == 3 && partes[2] == "")) { // "/ejemplo" o "/ejemplo/"
        baseDatos = partes[1]
        consulta = "SHOW TABLES";
    }
    else {
        baseDatos = partes[1]
        consulta = "SELECT * FROM " + partes[2]
    }
    
    let respuesta = await fetch("/query?sql=" + encodeURIComponent(consulta) + (baseDatos !== "" ? "&database=" + baseDatos : ""))
    let datos = await respuesta.json()

    let tabla = document.querySelector("#tabla")
    let error = document.querySelector("#error")
    let textoRuta = document.querySelector("#ruta")

    if (!datos.ok) {
        error.innerHTML = "Hubo un error en la consulta:<br><br>" + datos.error
        return
    }

    textoRuta.textContent = ruta

    // Cabecera de tabla
    let tr = document.createElement("tr");
    for (let campo of datos.campos) {
        let th = document.createElement("th");
        th.innerHTML = campo
        tr.appendChild(th)
    }
    tabla.appendChild(tr)

    // Cuerpo de tabla
    for (let fila of datos.registros) {
        let tr = document.createElement("tr");
        for (let campo of fila) {
            let td = document.createElement("td");
            td.innerHTML = campo
            tr.appendChild(td)
        }
        tabla.appendChild(tr)
    }
}