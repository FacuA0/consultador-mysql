let mysql = require("mysql");
let process = require("process");
let express = require("express");

let app = express();

let options = {
    host: "localhost",
    user: "root",
    password: ""
}

app.get("/", (req, res) => {
    let connection = mysql.createConnection(options);
    connection.connect();
    connection.query("SHOW DATABASES;", (error, results, fields) => {
        if (error) {
            console.log("Error while querying.");
            res.send("Error with query.");
            return;
        }

        let response = "<table><caption>Databases</caption><th>Databases</th>";
        for (row of results) {
            let fieldName;
            for (key in row) {
                fieldName = key;
            }

            response += "<tr><td>" + row[fieldName] + "</td></tr>";
        }
        response += "</table>";

        res.send(response);
    });
    connection.end();
});

app.listen(9040);