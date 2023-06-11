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
    db.query('create table if not exists users (nid bigint primary key, name varchar(255), email varchar(255), password varchar(255))', (err, result) => {
        if (err) throw err
        console.log('Users Table Initialized')
    })
    db.query("create table if not exists marriages (nid1 bigint, nid2 bigint, date date, primary key(nid1,nid2), status enum('active','divorced'))", (err, result) => {
        if (err) throw err
        console.log('Marriages Table Initialized')
    })

    db.query("create table if not exists requests (sender_nid bigint, reciever_nid bigint, date date, primary key(sender_nid,reciever_nid))", (err, result) => {
        if (err) throw err
        console.log('Requests Table Initialized')
    })

})


app.post('/auth/register', (req, res) => {
    const name = req.body.name.toLowerCase();
    const email = req.body.email.toLowerCase();
    const nid = req.body.nid;
    var password = req.body.password;

    db.query('select nid from users where nid = ? union select nid from users where name = ?', [nid,name], (err, result) => {
        if (err) throw err
        if (result.length > 0) {
            return res.status(400).send("You have already registered.")
        }

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err
            password = hash
            console.log(nid,name,email,password)
            db.query('insert into users (nid,name, email, password) values (?,?,?,?)', [nid,name, email, password], (err, result) => {
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
                const token = jwt.sign({ nid: result[0].nid,name:name,email:result[0].email }, jwt_secret)
                return res.status(200).send(token)
            }
            else {
                return res.status(400).send("Wrong Password")
            }
        })
    })
})





app.post('/marry/request', (req, res) => {
    const token = req.header('token')
    jwt.verify(token, jwt_secret, (err, token) => {
        if (err) return res.status(403).send("Invalid Token");
        const sender = token.nid.toString();
        const reciever = req.body.reciever;
        console.log(sender,reciever)
        db.query("select nid from users where nid = ?", [reciever], (err, result) => {
            if (err) throw err
            if (result.length === 0) {
                return res.status(400).send("User not found")
            }
            db.query("select nid1,nid2 from marriages where nid1 = ? or nid2 = ?", [sender,sender], (err, result) => {
                if (err) throw err
                if (result.length > 0) {
                    result.forEach(element => {
                        if (element.status === 'active') {
                            return res.status(400).send("You are already married")
                        }
                    });
                }
                db.query("select sender_nid,reciever_nid from requests where (sender_nid = ? and reciever_nid = ?) or (sender_nid = ? and reciever_nid = ?)", [sender,reciever,reciever,sender], (err, result) => {
                    if (err) throw err
                    if (result.length > 0) {
                        return res.status(400).send("Request already existd")
                    }
                    db.query("insert into requests (sender_nid,reciever_nid,date) values (?,?,?)", [sender,reciever,new Date()], (err, result) => {
                        if (err) throw err
                        res.status(200).send("Request Sent")
                    })
                })
            })
        })
    })
})







app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    }
);

