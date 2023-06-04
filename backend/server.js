const express = require('express');
const app = express();
const mysql = require('mysql');
const port = 3000;


const db = mysql.createConnection({
    host: 'localhost',
    user:"root",
    password:"password",
    database:'app'
})

db.connect((err) => {
    if (err) throw err
    console.log('Connected to database')
    db.query('show tables like "users"', (err, result) => {
        if (err) throw err
        if (result.length === 0) {
            console.log("Users Table was now found. Creating...")
            db.query('create table users (id int primary key auto_increment, name varchar(255), email varchar(255), password varchar(255))', (err, result) => {
                if (err) throw err
                console.log('Users Table Created')
            })
        }
    })
}
);


app.get('/', (req, res) => {
    res.send('Hello World!')
    }
);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
);

