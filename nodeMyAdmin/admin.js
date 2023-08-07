let baseDatos = null, tabla = null

window.onload = function() {
    rellenarDatos()
}

async function rellenarDatos() {
    let url = new URL(window.location)

    // Redirección a "ruta=/" en caso de no tener parámetro
    if (!url.searchParams.has("ruta") || url.searchParams.get("ruta") == "") {
        window.location = "?ruta=/"
    }

    // Obtener elementos HTML
    let error = document.querySelector("#error")
    let lista = document.querySelector("#elementos")
    let tabla = document.querySelector("#tabla")
    let textoRuta = document.querySelector("#ruta")

    // Obtener ruta
    let ruta = url.searchParams.get("ruta")
    let partes = ruta.split("/")

    // Redirección a "ruta=/" en caso de que el parámetro sea inválido 
    if (partes[0] != "" || partes.length < 2) {
        window.location = "?ruta=/"
    }

    // Armado de consulta SQL
    let consulta = "", baseDatos = "", ponerEnlaces = true
    if (ruta == "/") {
        consulta = "SHOW DATABASES;"
    }
    else if (partes.length == 2 || (partes.length == 3 && partes[2] == "")) { // "/ejemplo" o "/ejemplo/"
        baseDatos = partes[1]
        consulta = "SHOW TABLES;"
    }
    else {
        baseDatos = partes[1]
        consulta = "SELECT * FROM " + partes[2] + ";"
        ponerEnlaces = false
    }

    // Si quedó un segmento final incompleto (como en "/ejemplo/"), removerlo
    if (partes[partes.length - 1] == "") partes.pop()

    // Consultar datos
    let datos = {}
    try {
        let respuesta = await fetch("/query?sql=" + encodeURIComponent(consulta) + (baseDatos !== "" ? "&database=" + baseDatos : ""))
        datos = await respuesta.json()
    }
    catch (err) {
        console.error(err)
        error.innerHTML = "Hubo un error en la solicitud al servidor:<br><br>" + err.toString()
        error.style.display = "block"
    }

    // Algo no salió bien con la consulta
    if (!datos.ok) {
        error.innerHTML = "Hubo un error en la consulta SQL:<br><br>" + datos.error
        error.style.display = "block"
        return
    }

    textoRuta.textContent = ruta.replaceAll("/", " / ")
    
    if (ponerEnlaces) {
        for (let [campo] of datos.registros) {
            let li = document.createElement("li")
            li.innerHTML = "<a href=\"?ruta=" + partes.join("/") + "/" + campo + "\">" + campo + "</a>"
            lista.appendChild(li)
        }
        lista.style.display = "block";
    }
    else {
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
    
                if (ponerEnlaces) {
                    td.innerHTML = "<a href=\"?ruta=" + partes.join("/") + "/" + campo + "\">" + campo + "</a>"
                }
                else {
                    td.textContent = campo
                }
                tr.appendChild(td)
            }
            tabla.appendChild(tr)
        }
        tabla.style.display = "block";
    }
}