import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

//Connecting to Database 
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Travel_Tracker",
  password: "mpo58190",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

// let users = [
//   { id: 1, name: "Angela", color: "teal" },
//   { id: 2, name: "Jack", color: "powderblue" },
// ];

// query to databse to check the countries that you have been
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
  [currentUserId]);
  // console.log(result.rows)
  const countries = []
  result.rows.forEach((country) => {
    countries.push(country.country_code);
    console.log(countries)
  });
  return countries;
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId);
}

// direct the user to home page and displaying information
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const currentUser = await getCurrentUser();
  console.log(users)
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

app.post("/user", async (req, res) => {
  if (req.body["add"] === 'new'){
    res.render("new.ejs")
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }    
});

app.post("/new", async (req, res) => {
  const name = req.body['name']
  const color = req.body['color']
  await db.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;", [name, color]);

  const id = result.rows[0].id;
  currentUserId = id;
  
  res.redirect("/")
  
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
