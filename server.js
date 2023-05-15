let mysql = require("mysql");
let process = require("process");

if (process.argv.length < 4) {
    console.error(new Error("Not enough arguments."));
    process.exit(1);
}

let options = {
    host: "localhost",
    user: "root",
    password: "",
    database: process.argv[2]
};

let connection = mysql.createConnection(options);

connection.connect(err => {
    if (err) console.error(err); 
    else console.log("Connection established!");
});

connection.query("SELECT * FROM " + process.argv[3] + " WHERE ", (error, results, fields) => {
    if (error) {
        console.error(error);
        return;
    }

    console.table(results);
});

connection.end();