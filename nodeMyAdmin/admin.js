let baseDatos = null, tabla = null

window.onload = function() {
    rellenarDatos()
}

async function rellenarDatos() {
    let url = new URL(window.location)

    // Redirección a "ruta=/" en caso de no tener parámetro
    if (!url.searchParams.has("ruta")) {
        window.location = "?ruta=/"
    }

    // Obtener elementos HTML
    let error = document.querySelector("#error")
    let lista = document.querySelector("#elementos")
    let textoRuta = document.querySelector("#ruta")
    tabla = document.querySelector("#tabla")

    // Obtener ruta
    let ruta = url.searchParams.get("ruta")
    
    // Redirección a "ruta=/" en caso de que el parámetro sea inválido (no comienze o no tenga un slash) 
    if (!ruta.startsWith("/")) {
        window.location = "?ruta=/"
    }
    
    // Dividir en partes y quitar los elementos vacíos
    let partes = ruta.split("/")
    partes.shift()
    if (partes[partes.length - 1] == "") partes.pop()

    if (partes.length > 2) {
        window.location = "?ruta=/" + partes.slice(0, 2).join("/")
    }

    textoRuta.textContent = ruta.replaceAll("/", " / ")
    
    // Armado de consulta SQL
    let consulta = "", baseDatos = "", ponerEnlaces = true
    if (ruta == "/") {
        consulta = "SHOW DATABASES;"
    }
    else if (partes.length == 1) { // "/ejemplo" o "/ejemplo/"
        baseDatos = partes[0]
        consulta = "SHOW TABLES;"
    }
    else {
        baseDatos = partes[0]
        consulta = "SELECT * FROM " + partes[1] + ";"
        ponerEnlaces = false
    }

    // Consultar datos
    let datos = {}
    try {
        let respuesta = await fetch("/query?sql=" + encodeURIComponent(consulta) + (baseDatos !== "" ? "&database=" + baseDatos : ""))
        datos = await respuesta.json()
    }
    catch (err) {
        mostrarError(err, "Hubo un error en la solicitud al servidor:")
        return
    }

    // Algo no salió bien con la consulta
    if (!datos.ok) {
        mostrarError(datos.error, "Hubo un error en la consulta SQL:")
        return
    }
    
    if (ponerEnlaces) {
        for (let [campo] of datos.registros) {
            let li = document.createElement("li")

            let enlace
            if (partes.length == 0)
                enlace = "<a href=\"?ruta=/" + campo + "\">" + campo + "</a>"
            else 
                enlace = "<a href=\"?ruta=/" + partes[0] + "/" + campo + "\">" + campo + "</a>"
            li.innerHTML = enlace

            lista.appendChild(li)
        }
        lista.style.display = "table";
    }
    else {
        rellenarTabla(datos)
    }
}

function rellenarTabla(datos) {
    // Cabecera de tabla
    let tr = document.createElement("tr")
    for (let campo of datos.campos) {
        let th = document.createElement("th")
        th.innerHTML = campo
        tr.appendChild(th)
    }
    tabla.appendChild(tr)
    
    // Cuerpo de tabla
    for (let fila of datos.registros) {
        let tr = document.createElement("tr")
        for (let campo of fila) {
            let td = document.createElement("td")
            td.textContent = campo
            tr.appendChild(td)
        }
        tabla.appendChild(tr)
    }
    tabla.style.display = "block";
}

function mostrarError(error, texto) {
    console.error(error)
    error.innerHTML = texto + "<br><br>" + error
    error.style.display = block
}