let mysql = require("mysql");
let process = require("process");
let http = require("http");


let options = {
    host: "localhost",
    user: "root",
    password: ""
}

let server = http.createServer((req, res) => {

    if (req.url == "/") {
        showDatabases(res);
    }
    else {
        showTablesInDatabase(res, req.url.slice(1));
    }
    
});

server.listen(9040);

function showDatabases(res) {
    let connection = mysql.createConnection(options);
    connection.connect();
    connection.query("SHOW DATABASES;", (error, results, fields) => {
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
            res.write("<tr><td><a href='./" + field + "'>" + field + "</a></td></tr>");
        }
        res.write("</table>");

        res.end();
    });
    connection.end();
}

function showTablesInDatabase(res, database) {
    let connection = mysql.createConnection(Object.assign({}, options, {database}));
    connection.connect();
    connection.query("SHOW TABLES;", (error, results, fields) => {
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
    connection.end();
}