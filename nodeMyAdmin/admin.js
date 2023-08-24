var ruta = "", partes = []
var tabla, error, lista, textoTitulo, textoRuta, botonCrear

window.onload = function() {
    // Obtener elementos HTML
    tabla = document.querySelector("#tabla")
    error = document.querySelector("#error")
    lista = document.querySelector("#elementos")
    textoTitulo = document.querySelector("#titulo")
    textoRuta = document.querySelector("#ruta")
    botonCrear = document.querySelector("#crear")
    
    botonCrear.style.display = "none"

    rellenarDatos()
}

async function rellenarDatos() {
    let url = new URL(window.location)

    // Redirección a "ruta=/" en caso de no tener parámetro
    if (!url.searchParams.has("ruta")) {
        window.location = "?ruta=/"
    }

    // Obtener ruta
    ruta = url.searchParams.get("ruta")
    
    // Redirección a "ruta=/" en caso de que el parámetro sea inválido (no comienze o no tenga un slash) 
    if (!ruta.startsWith("/")) {
        window.location = "?ruta=/"
    }
    
    // Dividir en partes y quitar los elementos vacíos
    partes = ruta.split("/")
    partes.shift()
    if (partes[partes.length - 1] == "") partes.pop()

    if (partes.length > 2) {
        window.location = "?ruta=/" + partes.slice(0, 2).join("/")
    }

    textoRuta.textContent = ruta.replaceAll("/", " / ")
    
    // Armado de consulta SQL
    let consulta = "", baseDatos = "", tabla = "", datosTabla = true
    if (ruta == "/") {
        consulta = "SHOW DATABASES;"
    }
    else if (partes.length == 1) { // "/ejemplo" o "/ejemplo/"
        baseDatos = partes[0]
        consulta = "SHOW TABLES;"
    }
    else {
        baseDatos = partes[0]
        tabla = partes[1]
        consulta = "SELECT * FROM " + tabla + ";"
        datosTabla = false
    }

    // Consultar datos
    let datos = {}
    try {
        let respuesta = await fetch("/query?sql=" + encodeURIComponent(consulta) + (baseDatos !== "" ? "&database=" + baseDatos : ""))
        datos = await respuesta.json()
    }
    catch (err) {
        mostrarError(err.toString(), "Hubo un error en la solicitud al servidor:")
        return
    }

    // Algo no salió bien con la consulta
    if (!datos.ok) {
        mostrarError(datos.error, "Hubo un error en la consulta SQL:")
        return
    }
    
    if (datosTabla) {
        if (partes.length == 0) {
            textoTitulo.innerHTML = "Bases de datos"
            botonCrear.innerHTML = "Crear base de datos"
        }
        else {
            textoTitulo.innerHTML = "Tablas en " + baseDatos
            botonCrear.innerHTML = "Crear tabla"
        }

        for (let [campo] of datos.registros) {
            let li = document.createElement("li")

            if (partes.length == 0)
                li.innerHTML = "<a href=\"?ruta=/" + campo + "\">" + campo + "</a> <a style=\"float: right;\" onclick=\"mostrarDialogoBorrar('" + campo + "')\">[eliminar]</a>"
            else 
                li.innerHTML = "<a href=\"?ruta=/" + baseDatos + "/" + campo + "\">" + campo + "</a>"

            lista.appendChild(li)
        }
        lista.style.display = "table";
        botonCrear.style.display = "block";
    }
    else {
        textoTitulo.innerHTML = "Tabla " + tabla
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

function mostrarError(err, texto) {
    console.error(err)
    error.innerHTML = texto + "<br><br>" + err
    error.style.display = "block"
}

async function mostrarDialogoCrear() {
    // document.querySelector("#dialogo-fondo").style.display = "block"

    // Sólo crear bases de datos; ignorar tablas
    if (partes.length != 0) return

    let nombre = prompt("Nombre de la base de datos:")

    // El usuario canceló la acción o el nombre es inválido
    if (nombre == null || nombre == "") return
    
    try {
        let respuesta = await fetch("/query?sql=CREATE DATABASE " + nombre + ";")
        let datos = await respuesta.json()

        if (datos.ok) {
            alert("Base de datos creada.")
            window.location = window.location
        }
        else {
            mostrarError(datos.error, "Error al crear la base de datos:")
            alert("No se pudo crear la base de datos.")
        }
    }
    catch (err) {
        mostrarError(err.toString(), "Hubo un error al hacer la consulta de creación:")
        return
    }
}

async function mostrarDialogoBorrar(baseDatos) {
    // Sólo borrar bases de datos; ignorar tablas
    if (partes.length != 0) return

    // Confirmar que el usuario quiera borrar la base de datos
    let confirmar = confirm("¿Estás seguro de que deseas eliminar la base de datos?")
    if (!confirmar) return

    try {
        let respuesta = await fetch("/query?sql=DROP DATABASE " + baseDatos + ";")
        let datos = await respuesta.json()

        if (datos.ok) {
            alert("Base de datos eliminada exitosamente.")
            window.location = window.location
        }
        else {
            mostrarError(datos.error, "Error al eliminar la base de datos:")
            alert("No se pudo eliminar la base de datos.")
        }
    }
    catch (err) {
        mostrarError(err.toString(), "Hubo un error al hacer la consulta de borrado:")
        return
    }
}

function crear() {

}