const express = require('express');
const app = express();
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const port = 3000;
const jwt_secret = "secret";



app.use(express.urlencoded({ extended: true }));


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


app.post('/auth/register', (req, res) => {
    const name = req.body.name.toLowerCase();
    const email = req.body.email;
    var password = req.body.password;


    db.query('select id from users where email = ? union select id from users where name = ?', [email,name], (err, result) => {
        if (err) throw err
        if (result.length > 0) {
            return res.status(400).send("User already exists")
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err
            password = hash
            console.log(name,email,password)
            db.query('insert into users (name, email, password) values (?,?,?)', [name, email, password], (err, result) => {
                if (err) throw err
                res.status(200).send("User Registered")
            })
        })
    })



})

app.post('/auth/login', (req, res) => {
    const name = req.body.name.toLowerCase();
    const password = req.body.password;
    db.query('select * from users where name = ?', [name], (err, result) => {
        if (err) throw err
        if (result.length === 0) {
            return res.status(400).send("User not found")
        }
        bcrypt.compare(password, result[0].password, (err, response) => {
            if (err) throw err
            if (response) {
                const token = jwt.sign({ id: result[0].id,name:name,email:result[0].email }, jwt_secret)
                return res.status(200).send(token)
            }
            else {
                return res.status(400).send("Wrong Password")
            }
        })
    })
})



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
);

