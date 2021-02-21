var mysql = require('mysql');
var cors = require('cors');
var express = require('express');
var app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

const connection = mysql.createConnection({
    host: "127.0.0.1",
    user: "vivek",
    password: "Cre@tive28",
    database: "vivek"
});

function createDatabase() {
    connection.connect(function (err) {
        if (err) throw err;
        connection.query("CREATE DATABASE IF NOT EXISTS vivek", function (err, result) {
            if (err) throw err;
            console.log("Database created");
            createTable(connection);
        });
    });
}

function createTable() {
    const sql = "CREATE TABLE IF NOT EXISTS phoneContact ( id INT AUTO_INCREMENT PRIMARY KEY,contactName VARCHAR(255), email VARCHAR(255) NOT NULL, UNIQUE (email) )";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });

    const sql = "CREATE TABLE IF NOT EXISTS user ( id INT AUTO_INCREMENT PRIMARY KEY,name varchar(255),password VARCHAR(255), username VARCHAR(255) NOT NULL, UNIQUE (username) )";
    connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });
}

app.get('/searchcontacts/:pageNumber/:pageSize/:searchText', function (req, res) {

    const token = req.headers['token']
    const q = checkIdisValidOrNot(token);
    if (q == false) {
        res.status(403);
        res.end('Not a valid user');
    }

    const start = ((req.params.pageNumber - 1) * req.params.pageSize) + 1;
    const end = req.params.pageNumber * req.params.pageSize;
    let query = `contactName LIKE '%${req.params.searchText}%' OR email LIKE '%${req.params.searchText}%'`;
    const q1 = "select * from(select ROW_NUMBER() OVER(ORDER BY contactName) as row_num, t.contactName, t.email, t.id from (select * from vivek.phonecontact WHERE " + query + ") as t) as x WHERE row_num BETWEEN " + start + " AND " + end;


    connection.query(q1, function (err, result) {
        res.end(JSON.stringify(result))


    });
});

app.get('/getcontacts/:pageNumber/:pageSize', function (req, res) {
    const token = req.headers['token']
    const q = checkIdisValidOrNot(token);
    if (q==false) {
        res.status(403);
        res.end('Not a valid user');
    }

    const start = ((req.params.pageNumber - 1) * req.params.pageSize) + 1;

    const end = req.params.pageNumber * req.params.pageSize;
    let query = `select * from (SELECT ROW_NUMBER() OVER ( ORDER BY contactName) as row_num, id, contactName, email FROM vivek.phoneContact as t) as f
                WHERE row_num BETWEEN ${start} AND ${end}`;


    connection.query(query, function (err, result) {


        res.end(JSON.stringify(result))
    });
});

app.delete('/deletecontact/:id', function (req, res) {

    const token = req.headers['token']
    const q = checkIdisValidOrNot(token);
    if (q==false) {
        res.status(403);
        res.end('Not a valid user');
    }
    const query = "DELETE FROM phoneContact WHERE id =" + req.params.id;
    console.log(query);
    connection.query(query, function (err, result) {
        res.end('Record has been deleted');
    });
});

app.post('/addcontact', function (req, res) {

    const token = req.headers['token']
    const q = checkIdisValidOrNot(token);
    if (q==false) {
        res.status(403);
        res.end('Not a valid user');
    }

    const query = "INSERT INTO phoneContact(contactName, email) VALUES('" + req.body.contactName + "', '" + req.body.email + "')"
    console.log(query);
    connection.query(query, function (err, result) {
        res.end('Record has been added');
    });
});

app.put('/updatecontact', function (req, res) {
    const token = req.headers['token']
    const q = checkIdisValidOrNot(token);
    if (q==false) {
        res.status(403);
        res.end('Not a valid user');
    }

    const query = updateRecord(req.body);
    console.log(query);
    connection.query(query, function (err, result) {
        res.end('Record has been UPDATED');
    });
});

function updateRecord(obj) {
    const name = obj.contactName, email = obj.em;
    let query = '';
    if (name) {
        query += `contactName =  '${name}'`;
    }
    if (email) {
        query += `, email = '${email}'`;
    }
    const sql = "UPDATE phoneContact SET " + query + " WHERE id = " + value.id;
    return sql;
}

app.post('/login', function (req, res) {
    const query = "SELECT Name,Id from User Where username=" + req.body.username + " AND password=" + req.body.password + ""
    console.log(query);
    connection.query(query, function (err, result) {
        if (result) {
            const token = result.id;
            res.end(token);
        } else {
            res.end('user not available');
        }
    });
});

function checkIdisValidOrNot(id) {
    console.log(id)
    if (!id) {
        return false;
    }

    // validation of id
    const query = "SELECT * from user Where id=" + id;
    console.log(query);
    connection.query(query, function (err, result) {
        console.log(err);
        if (result) {
            console.log("valid Id");
            return true;
        } else {
            console.log("Invalid Id");
            return false;
        }
    });
}

app.listen(8081, function () {
    console.log('Server Active on port: ', 8081);
});