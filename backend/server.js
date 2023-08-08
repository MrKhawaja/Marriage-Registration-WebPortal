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
        "create table if not exists marriages (id bigint primary key auto_increment, husband bigint not null, wife bigint not null , date datetime DEFAULT now() , status enum('active','divorced','unapproved','rejected') default 'unapproved', approved_by bigint null, foreign key (husband) references users(nid), foreign key (wife) references users(nid), foreign key (approved_by) references users(nid));",
        (err, result) => {
          if (err) throw err;
          console.log("Marriages Table Initialized");

          db.query(
            "create table if not exists requests (sender_nid bigint not null , reciever_nid bigint not null , date datetime default now(), primary key(sender_nid,reciever_nid), foreign key (sender_nid) references users(nid), foreign key (reciever_nid) references users(nid));",
            (err, result) => {
              if (err) throw err;
              console.log("Requests Table Initialized");
              db.query(
                "create table if not exists payments (marriage_id bigint, id int primary key auto_increment, date datetime default now(), status enum('pending','completed','canceled') default 'pending', amount int not null, reason varchar(500) not null, payment_link varchar(500) not null, foreign key (marriage_id) references marriages(id));",
                (err, result) => {
                  if (err) throw err;
                  console.log("Payments Table Initialized");
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
  const isMale = req.body.isMale == "true";

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
    const nid = req.params.nid;
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
        if (result.length === 0) {
          return res.status(400).send("User not found");
        }
        if (result[0].is_male == token.isMale) {
          return res.status(400).send("No Gay Marriage");
        }
        if (result[0].nid == sender) {
          return res.status(400).send("You cannot marry yourself");
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

app.get("/marry/requests", (req, res) => {
  const token = req.header("token");

  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const nid = token.nid.toString();
    db.query(
      "select requests.sender_nid,requests.reciever_nid,requests.date,users.name from requests inner join users on requests.sender_nid = users.nid where requests.reciever_nid = ? order by date desc",
      [nid],
      (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
      }
    );
  });
});

app.post("/marry/accept", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const nid = token.nid.toString();
    const sender = req.body.sender;
    db.query(
      "select sender_nid,reciever_nid from requests where sender_nid = ? and reciever_nid = ?",
      [sender, nid],
      (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          return res.status(400).send("Request not found");
        }
        var husband = sender;
        var wife = reciever;
        if (!token.isMale) {
          husband = reciever;
          wife = sender;
        }
        db.query(
          "insert into marriages (husband,wife,status) values (?,?,?)",
          [husband, wife, "unapproved"],
          (err, result) => {
            if (err) throw err;
            db.query(
              "delete from requests where sender_nid = ? and reciever_nid = ?",
              [sender, nid],
              (err, result) => {
                if (err) throw err;
                res.status(200).send("Request Accepted");
              }
            );
          }
        );
      }
    );
  });
});

app.get("/marry/requests/:nid", (req, res) => {
  const token = req.header("token");

  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    const nid = req.params.toString();
    db.query(
      "select sender_nid,reciever_nid from requests where sender_nid = ? and reciever_nid = ?",
      [nid, token.nid.toString()],
      (err, result) => {
        if (err) throw err;
        if (result.length === 0) {
          return res.status(400).send("Request not found");
        }
        db.query(
          "select nid,name,email from users where nid = ?",
          [nid],
          (err, result) => {
            if (err) throw err;
            res.status(200).send(result[0]);
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
          const link =
            "https://developer.bka.sh/reference/createpaymentusingpost";
          db.query(
            "insert into payments (marriage_id,amount,reason,payment_link) values (?,?,?,?)",
            [id, 10000, "Marriage Registration Fee", link],
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
    const nid = token.nid.toString();
    if (token.isMale) {
      db.query(
        "select marriages.id,marriages.husband,marriages.wife,marriages.status,users1.name,payments.id as husband_name,users2.name as wife_name from marriages inner join users as users1 on marriages.husband = users1.nid inner join users as users2 on marriages.wife = users2.nid inner join payments.marriage_id = marriages.id where marriages.husband = ?",
        [nid],
        (err, result) => {
          if (err) throw err;
          res.status(200).send(result);
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

app.get("/marriages:id/payments", (req, res) => {
  const token = req.header("token");
  jwt.verify(token, jwt_secret, (err, token) => {
    if (err) return res.status(403).send("Invalid Token");
    if (!token.isMale) return res.status(400).send("Only Husband can pay");
    const nid = token.nid.toString();
    const id = req.params.id;
    db.query(
      "select payments.id,payments.date, payments.marriage_id, payments.status, payments.amount, payments.reason,payments.payment_link from marriages inner join payments on payments.marriage_id = ? where husband = ?",
      [id, nid],
      (err, result) => {
        if (err) throw err;
        res.status(200).send(result);
      }
    );
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
