let database = "";

let inputCampo = document.getElementById("campo");
let infoDatabase = document.getElementById("info-database");
let divResultado = document.getElementById("resultado");
let resMensaje = document.getElementById("mensaje");
let resTabla = document.getElementById("tabla");

function consultar() {  
    let consulta = inputCampo.value;

    // Establecer base de datos operativa.
    if (consulta.toUpperCase().startsWith("USE ") && consulta.endsWith(";")) {
        database = consulta.toLowerCase().slice(4, -1);
        let htmlDatabase;

        if (database != "") htmlDatabase = "<b>" + database + "</b>";
        else htmlDatabase = "&lt;ninguna&gt;";

        infoDatabase.innerHTML = "Base de datos: " + htmlDatabase;
        return;
    }

    resTabla.innerHTML = "";
    resMensaje.style.display = "none";

    // Dirección de consulta. Si hay base de datos seleccionada, incluirla aparte.
    let direccion = "/query?sql=" + consulta + (database != "" ? "&database=" + database : "");

    fetch(direccion)
    .then(res => res.json())
    .then(json => {
        if (!json.ok) {
            mostrarMensaje("Error de consulta: " + json.error, true);
            return;
        }

        if (json.resultado) {
            let res = json.resultado;
            mostrarMensaje(`¡Operación exitosa! ${res.message}<br><br>Filas afectadas: ${res.affectedRows}<br>Estado del servidor DB: ${res.serverStatus}<br>Advertencias: ${res.warningCount}`);
        }
        else {
            rellenarTabla(json.campos, json.registros);
        }
    })
    .catch(err => {
        mostrarMensaje("Error de conexión: " + err.toString(), true);
    });
}

function rellenarTabla(campos, registros) {
    let cabecera = document.createElement("tr");
    for (campo of campos) {
        let th = document.createElement("th");
        th.textContent = campo;
        cabecera.appendChild(th);
    }
    resTabla.appendChild(cabecera);
    
    for (fila of registros) {
        let tr = document.createElement("tr");
        for (valor of fila) {
            let td = document.createElement("td");
            td.textContent = valor;
            tr.appendChild(td);
        }
        resTabla.appendChild(tr);
    }
}

function mostrarMensaje(mensaje, error) {
    resMensaje.innerHTML = mensaje;
    resMensaje.className = error ? "error" : "";
    resMensaje.style.display = "block";
}