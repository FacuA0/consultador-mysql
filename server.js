let mysql = require("mysql");
let process = require("process");
let fs = require("fs");
let http = require("http");

let options = {
    host: "localhost",
    user: "root",
    password: ""
}

let server = http.createServer((req, res) => {
    let url = new URL(req.url, "http://example.com");
    let ruta = url.pathname;
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
    else if (ruta.startsWith("/databases")) {
        if (ruta == "/databases/" || ruta == "/databases") {
            showDatabases(res);
        }
        else if (ruta.startsWith("/databases/")) {
            let database = ruta.slice(11);
            if (database.indexOf("/") != -1) 
                database = database.slice(0, database.indexOf("/"));

            showTablesInDatabase(res, database);
        }
        else {
            res.writeHead(404);
            res.end("Error: Forma incorrecta de acceder a /databases.");
        }
    }
    else {
        // Actúa como servidor web
        let documento = ruta;

        if (ruta == "/") {
            documento = "/principal.html";
        }

        documento = documento.slice(1);
        
        if (!fs.existsSync(documento) || !evaluarAcceso(documento)) {
            res.writeHead(404);
            res.end();
            return;
        }
        
        res.writeHead(200);
        res.end(fs.readFileSync(documento));
        
        function evaluarAcceso(ruta) {
            if (ruta == "server.js" ||
                ruta == "package.json" ||
                ruta == "package-lock.json" ||
                ruta.startsWith("node_modules")) return false;

            return true;
        }
        //res.writeHead(404);
        //res.end("Error: URL inválida.");
    }
    
});

server.listen(9040);

function queryDatabase(res, consulta, database) {
    let conexion;

    if (database != null) 
        conexion = mysql.createConnection(Object.assign({}, options, {database}));
    else 
        conexion = mysql.createConnection(options);

    conexion.connect();

    conexion.query(consulta, (error, results, fields) => {
        if (error) {
            let servidorActivo = error.code == "ECONNREFUSED" ? " - Puede que la base de datos no esté activada." : "";
            let resultado = {
                ok: false,
                error: error.toString() + servidorActivo
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


        if (results instanceof Array) {
            respuesta.registros = results.map(registro => {
                let valores = [];
                for (clave in registro) {
                    valores[campos.indexOf(clave)] = registro[clave];
                }
                return valores;
            });
        }
        else {
            respuesta.resultado = results;
        }
        
        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify(respuesta));
    });

    conexion.end();
}

/*
    FUNCIONES VIEJAS NO SOPORTADAS
*/
function showDatabases(res) {
    let conexion = mysql.createConnection(options);
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

            let field = row[fieldName];
            res.write("<tr><td><a href='/databases/" + field + "'>" + field + "</a></td></tr>");
        }
        res.write("</table>");

        res.end();
    });
    conexion.end();
}

function showTablesInDatabase(res, database) {
    let conexion = mysql.createConnection(Object.assign({}, options, {database}));
    conexion.connect();
    conexion.query("SHOW TABLES;", (error, results, fields) => {
        if (error) {
            console.log("Error while querying.");
            res.end("Error with query.");
            return;
        }

        res.write("<table border='1'><caption>Tables</caption><tr><th>Tables</th></tr>");
        for (row of results) {
            let fieldName;
            for (key in row) {
                fieldName = key;
            }

            res.write("<tr><td>" + row[fieldName] + "</td></tr>");
        }
        res.write("</table>");
        res.end();
    });
    conexion.end();
}