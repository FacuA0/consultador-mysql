let mysql = require("mysql");
let process = require("process");
let fs = require("fs");
let http = require("http");

let opciones = {
    host: "localhost",
    user: "root",
    password: ""
}

let server = http.createServer((req, res) => {
    let url = new URL(req.url, "http://example.com");
    let ruta = url.pathname;

    // API de consultas
    if (ruta == "/query") {
        let consulta = url.searchParams.get("sql");
        if (consulta == null) {
            res.writeHead(400);
            res.end("Error: Se debe especificar una consulta.");
            return;
        }

        let database = url.searchParams.get("database");

        queryDatabase(res, consulta, database);
    }

    // Prueba inicial - Genera HTML para mostrar bases de datos y tablas de forma visual
    else if (ruta.startsWith("/databases")) {
        if (ruta == "/databases/" || ruta == "/databases") {
            mostrarDatabases(res);
        }
        else if (ruta.startsWith("/databases/")) {
            let database = ruta.slice(11);
            if (database.indexOf("/") != -1) 
                database = database.slice(0, database.indexOf("/"));

            mostrarTablasEnBase(res, database);
        }
        else {
            res.writeHead(404);
            res.end("Error: Forma incorrecta de acceder a /databases.");
        }
    }

    // Actúa como servidor web en rutas concretas
    else {
        let documento;

        if (ruta == "/nodeMyAdmin" || ruta == "/nodeMyAdmin/") {
            documento = "nodeMyAdmin/admin.html";
        }
        else if (ruta.startsWith("/nodeMyAdmin/")) {
            documento = ruta.slice(1);
        }
        else if (ruta == "/") {
            documento = "principal/principal.html";
        }
        else {
            documento = "principal" + ruta;
        }
        
        if (!fs.existsSync(documento)) {
            res.writeHead(404);
            res.end();
            return;
        }
        
        let contenido = fs.readFileSync(documento);
        res.writeHead(200);
        res.end(contenido);
        //res.writeHead(404);
        //res.end("Error: URL inválida.");
    }
    
});

server.listen(9040, function () {
    console.log("Escuchando en el puerto 9040.")
});

function queryDatabase(res, consulta, database) {
    let conexion;

    if (database != null) 
        conexion = mysql.createConnection(Object.assign({}, opciones, {database}));
    else 
        conexion = mysql.createConnection(opciones);

    conexion.connect();

    conexion.query(consulta, (error, resultados, fields) => {
        if (error) {
            let baseActiva = error.code == "ECONNREFUSED" ? " - Puede que la base de datos no esté activada." : "";
            let resultado = {
                ok: false,
                error: error.toString() + baseActiva
            };

            res.writeHead(400, {"Content-Type": "application/json"});
            res.end(JSON.stringify(resultado));
            return;
        }
        
        let campos = fields ? fields.map(campo => campo.name) : [];

        let respuesta = {
            ok: true,
            campos
        };


        if (resultados instanceof Array) {
            respuesta.registros = resultados.map(registro => {
                let valores = [];
                for (clave in registro) {
                    valores[campos.indexOf(clave)] = registro[clave];
                }
                return valores;
            });
        }
        else {
            respuesta.resultado = resultados;
        }
        
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(respuesta));
    });

    conexion.end();
}

/*
    PRUEBAS INICIALES
*/
function mostrarDatabases(res) {
    let conexion = mysql.createConnection(opciones);
    conexion.connect();
    conexion.query("SHOW DATABASES;", (error, results, fields) => {
        if (error) {
            console.log("Error while querying.");
            res.end("Error with query.");
            return;
        }

        res.write("<table border='1'><caption>Databases</caption><tr><th>Databases</th></tr>");
        for (row of results) {
            let fieldName;
            for (key in row) {
                fieldName = key;
            }

            let database = row[fieldName];
            res.write("<tr><td><a href='/databases/" + database + "'>" + database + "</a></td></tr>");
        }
        res.write("</table>");

        res.end();
    });
    conexion.end();
}

function mostrarTablasEnBase(res, database) {
    let conexion = mysql.createConnection(Object.assign({}, opciones, {database}));
    conexion.connect();
    conexion.query("SHOW TABLES;", (error, resultados, fields) => {
        if (error) {
            console.log("Error while querying.");
            res.end("Error with query.");
            return;
        }

        res.write("<table border='1'><caption>Tables</caption><tr><th>Tables</th></tr>");
        for (row of resultados) {
            let nombreCampo;
            for (key in row) {
                nombreCampo = key;
            }

            res.write("<tr><td>" + row[nombreCampo] + "</td></tr>");
        }
        res.write("</table>");
        res.end();
    });
    conexion.end();
}