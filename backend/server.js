const express = require("express");
const app = express();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const port = 3001;
const jwt_secret = "secret";
var cors = require("cors");
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "app",
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to database");
  db.query(
    "create table if not exists users (nid bigint not null primary key, name varchar(255) not null, email varchar(255), password varchar(255) not null, is_admin boolean default false, is_male boolean not null);",
    (err, result) => {
      if (err) throw err;
      console.log("Users Table Initialized");
      db.query(
        "create table if not exists requests (id bigint primary key auto_increment, sender_nid bigint not null , reciever_nid bigint not null , date datetime default now(), foreign key (sender_nid) references users(nid), foreign key (reciever_nid) references users(nid));",
        (err, result) => {
          if (err) throw err;
          console.log("Requests Table Initialized");

          db.query(
            "create table if not exists payments (request_id bigint, id int primary key auto_increment, date datetime default now(), status enum('pending','completed','canceled') default 'pending', amount int not null, reason varchar(500) not null, payment_link varchar(500) not null, paid_by bigint null, foreign key (request_id) references requests(id), foreign key (paid_by) references users(nid));",
            (err, result) => {
              if (err) throw err;
              console.log("Payments Table Initialized");
              db.query(
                "create table if not exists marriages (id bigint primary key auto_increment, husband bigint not null, wife bigint not null , date datetime DEFAULT now() , status enum('active','divorced','unapproved','rejected') default 'unapproved', approved_by bigint null,payment_id int not null, foreign key (payment_id) references payments(id), foreign key (husband) references users(nid), foreign key (wife) references users(nid), foreign key (approved_by) references users(nid));",
                (err, result) => {
                  if (err) throw err;
                  console.log("Marriages Table Initialized");
                  db.query(
                    "create table if not exists documents (marriage_id bigint not null, document varchar(1024) not null, foreign key (marriage_id) references marriages(id));",
                    (err, result) => {
                      if (err) throw err;
                      console.log("Documents Table Initialized");
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

app.post("/auth/register", (req, res) => {
  const name = req.body.name.toLowerCase();
  const email = req.body.email.toLowerCase();
  const nid = req.body.nid;
  var password = req.body.password;
  const isMale = req.body.isMale == "male";

  db.query(
    "select nid from users where nid = ? union select nid from users where name = ?",
    [nid, name],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).send("You have already registered.");
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        password = hash;
        console.log(nid, name, email, password, isMale);
        db.query(
          "insert into users (nid,name, email, password,is_male) values (?,?,?,?,?)",
          [nid, name, email, password, isMale],
          (err, result) => {
            if (err) throw err;
            const token = jwt.sign(
              {
                nid,
                name,
                email,
                isMale,
                isAdmin: false,
              },
              jwt_secret
            );
            res.status(200).send(token);
          }
        );
      });
    }
  );
});

app.post("/auth/login", (req, res) => {
  const nid = req.body.nid;
  const password = req.body.password;
  db.query("select * from users where nid = ?", [nid], (err, result) => {
    if (err) throw err;
    if (result.length === 0) {
      return res.status(400).send("User not found");
    }
    bcrypt.compare(password, result[0].password, (err, response) => {
      if (err) throw err;
      if (response) {
        const token = jwt.sign(
          {
            nid: result[0].nid,
            name: result[0].name,
            email: result[0].email,
            isMale: result[0].is_male,
            isAdmin: result[0].is_admin,
          },
          jwt_secret
        );
        return res.status(200).send(token);
      } else {
        return res.status(400).send("Wrong Password");
      }
    });
  });
});

app.get("/marry/user:nid", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const nid = req.params.nid.slice(1);
    db.query(
      "select nid,name from users where nid = ?",
      [nid],
      (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          return res.status(400).send("User not found");
        }
        return res.status(200).send(result[0]);
      }
    );
  });
});

app.post("/marry/request", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const sender = token.nid.toString();
    const reciever = req.body.reciever;

    db.query(
      "select nid,is_male from users where nid = ?",
      [reciever],
      (err, result) => {
        if (err) throw err;
        if (result[0].nid == sender) {
          return res.status(400).send("You cannot marry yourself");
        }
        if (result.length === 0) {
          return res.status(400).send("User not found");
        }
        if (result[0].is_male == token.isMale) {
          return res.status(400).send("No Gay Marriage");
        }
        var husband = sender;
        var wife = reciever;
        if (!token.isMale) {
          husband = reciever;
          wife = sender;
        }
        db.query(
          "select husband,wife from marriages where ((husband = ? or wife = ?) and (status = 'active' or status = 'unapproved'))",
          [husband, wife],
          (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              result.forEach((element) => {
                if (element.status === "active") {
                  return res
                    .status(400)
                    .send("Married person may not marry again");
                }
              });
            }
            db.query(
              "select sender_nid,reciever_nid from requests where (sender_nid = ? and reciever_nid = ?) or (sender_nid = ? and reciever_nid = ?)",
              [sender, reciever, reciever, sender],
              (err, result) => {
                if (err) throw err;
                if (result.length > 0) {
                  return res.status(400).send("Request already exists");
                }
                db.query(
                  "insert into requests (sender_nid,reciever_nid) values (?,?)",
                  [sender, reciever],
                  (err, result) => {
                    if (err) throw err;
                    res.status(200).send("Request Sent");
                  }
                );
              }
            );
          }
        );
      }
    );
  });
});

app.get("/marry/requests/recieved", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const nid = token.nid;
    db.query(
      "select requests.id,requests.sender_nid,requests.reciever_nid,requests.date,users.name as sender_name,payments.status as payment_status,payments.id as payment_id from requests inner join users on requests.sender_nid = users.nid left join payments on payments.request_id = requests.id where requests.reciever_nid = ? order by date desc;",
      [nid],
      (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
      }
    );
  });
});

app.post("/payments/pay", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    const paymentId = req.body.paymentId;
    const requestId = req.body.id;
    if (err) return res.status(403).send("Invalid Token");
    db.query(
      "select requests.id,requests.sender_nid,requests.reciever_nid,payments.id as payment_id, payments.status from payments inner join requests on requests.id = ? where payments.id = ?",
      [requestId, paymentId],
      (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          return res.status(400).send("Payment not found");
        }
        if (result[0].status === "completed") {
          return res.status(400).send("Payment already completed");
        }
        if (result[0].status === "canceled") {
          return res.status(400).send("Payment canceled");
        }
        if (result[0].status === "pending") {
          db.query(
            "update payments set status = 'completed', paid_by = ? where id = ?",
            [token.nid, paymentId],
            (err, resu) => {
              if (err) throw err;
              db.query(
                "insert into marriages (husband, wife, payment_id) values (?,?,?)",
                [result[0].sender_nid, result[0].reciever_nid, paymentId],
                (err, result) => {
                  if (err) throw err;
                  res.status(200).send("Payment Completed");
                }
              );
            }
          );
        }
      }
    );
  });
});

app.post("/marry/accept", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const reciever_nid = token.nid;
    const request_id = req.body.id;
    db.query(
      "select id from requests where id = ? and reciever_nid = ?",
      [request_id, reciever_nid],
      (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          return res.status(400).send("Request not found");
        }

        db.query(
          "insert into payments (request_id, amount, reason, payment_link) values (?,?,?,?);",
          [request_id, 5000, "Marriage Registration Fee", "link"],
          (err, result) => {
            if (err) throw err;
            res.status(200).send("Request Accepted");
          }
        );
      }
    );
  });
});

app.get("/admin/approve", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    if (!token.isAdmin) return res.status(403).send("Not Admin");
    db.query(
      "select id,husband,wife from marriages where status = 'unapproved'",
      (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
      }
    );
  });
});

app.post("/admin/approve:id", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    if (!token.isAdmin) return res.status(403).send("Not Admin");
    const id = req.params.id;
    db.query("select * from marriages where id = ?", [id], (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        return res.status(400).send("Marriage not found");
      }

      db.query(
        "update marriages set status = 'active' where id = ?",
        [id],
        (err, result) => {
          if (err) throw err;
          db.query(
            "delete from requests where (sender_nid = ? and reciever_nid = ?) or (reciever_nid = ? and sender_nid = ?)",
            [
              result[0].husband,
              result[0].wife,
              result[0].husband,
              result[0].wife,
            ],
            (err, result) => {
              if (err) throw err;
              res.status(200).send("Approved");
            }
          );
        }
      );
    });
  });
});

app.post("/admin/reject:id", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    if (!token.isAdmin) return res.status(403).send("Not Admin");
    const id = req.params.id;
    db.query("select * from marriages where id = ?", [id], (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        return res.status(400).send("Marriage not found");
      }

      db.query(
        "update marriages set status = 'rejected' where id = ?",
        [id],
        (err, result) => {
          if (err) throw err;
          res.status(200).send("Marriage Rejected");
        }
      );
    });
  });
});

app.post("/admin/divorce:id", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    if (!token.isAdmin) return res.status(403).send("Not Admin");
    const id = req.params.id;
    db.query("select * from marriages where id = ?", [id], (err, result) => {
      if (err) throw err;
      if (result.length === 0) {
        return res.status(400).send("Marriage not found");
      }
      db.query(
        'update marriages set status = "divorced" where id = ?',
        [id],
        (err, result) => {
          if (err) throw err;
          res.status(200).send("Divorced");
        }
      );
    });
  });
});

app.get("/admin/marriages", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    if (!token.isAdmin) return res.status(403).send("Not Admin");
    db.query(
      "select marriages.id,marriages.husband,marriages.wife,marriages.status,users1.name as husband_name,users2.name as wife_name from marriages inner join users as users1 on marriages.husband = users1.nid inner join users as users2 on marriages.wife = users2.nid",
      (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
      }
    );
  });
});

app.get("/marriages", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const nid = token.nid;
    if (token.isMale) {
      db.query(
        "select marriages.id,marriages.husband,marriages.wife,marriages.status,users1.name as husband_name,users2.name as wife_name from marriages inner join users as users1 on marriages.husband = users1.nid inner join users as users2 on marriages.wife = users2.nid where marriages.husband = ?",
        [nid],
        (err, result) => {
          if (err) throw err;
          res.status(200).send(result);
          console.log(result);
        }
      );
    } else {
      db.query(
        "select marriages.id,marriages.husband,marriages.wife,marriages.status,users1.name as husband_name,users2.name as wife_name from marriages inner join users as users1 on marriages.husband = users1.nid inner join users as users2 on marriages.wife = users2.nid where marriages.wife = ?",
        [nid],
        (err, result) => {
          if (err) throw err;
          res.status(200).send(result);
        }
      );
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
