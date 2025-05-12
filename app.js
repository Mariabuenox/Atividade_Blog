const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");

const app = express(); // Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 3000; // Configura o TCP

const db = new sqlite3.Database("user.db")

db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)"
    )
})

app.use(
    session({
        secret: "senhaforte",
        resave: true,
        saveUninitialized: true,
    })
)

app.use('/static', express.static(__dirname + '/static'));

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true}));

app.get("/login", (req, res) => {
    res.render("pages/login", {titulo: "Login"});
    console.log("GET /");

});

app.get("/cadastro", (req, res) => {
    res.render("pages/cadastro", {titulo: "Cadastro"});
    console.log("GET /cadastro");

});

// app.post()


app.get("/", (req, res) => {
    console.log("GET /index");
    res.render("pages/index", {titulo: "Index"});
});

app.get("/sobre", (req, res) => {
    res.render("pages/sobre", {titulo: "Sobre"});
    console.log("GET /sobre");
});

app.get("/dashboard", (req, res) => {

    if(req.session.loggedin) {
       //listar todos os usuários
    const query = "SELECT * FROM users";
    db.all(query, [], (err, row) => {
        if(err) throw err;
        console.log(JSON.stringify(row));

        res.render("pages/dashboard", {titulo: "Tabela de usuário", dados: row});
    }) 
    } else{
        res.send("Usuário não logado")
    }
    

    // res.render("pages/dashboard", {titulo: "Dashboard"});
    console.log("GET /dashboard");

});


app.get("/logout", (req, res) =>{
    console.log("GET /logout");
    req.session.destroy(() =>{
        res.redirect("/")
    })
})

app.listen(PORT, () => {
    console.log(`Servidor sendo executado na porta ${PORT}`);
});
app.get("/static", (req, res) => {
    res.send(`Você está na página static!`);
    console.log("GET /static");
    console.log(__dirname + "\\static");
});

app.post("/cadastro", (req, res) => {
    console.log("/POST /cadastro");
    console.log(JSON.stringify(req.body));
    const { username, password } = req.body;

    const query = "SELECT * FROM users WHERE username=?"

    db.get(query, [username], (err, row) => {
        if (err) throw err;

        console.log("Query SELECT do cadastro:", JSON.stringify(row));
        if (row) {
            console.log(`Usuario: ${username} ja cadastrado.`);
            res.send("Usuario ja cadastrado");
        } else {
            const insert = "INSERT INTO users(username, password) VALUES (?,?)"
            db.get(insert, [username, password], (err, row) => {
                if (err) throw err;

                console.log(`Usuario: ${username}  cadastrado com sucesso.`)
                res.redirect("/login");
            })
        }

    })
})

app.post("/login", (req, res) => {
    console.log("/POST /login");
    console.log(JSON.stringify(req.body));
    const { username, password } = req.body;
    //res.render("./pages/dashboard");



    const query = "SELECT * FROM users WHERE username=? AND password=?"
    db.get(query, [username, password], (err, row) => {
        if (err) throw err;


        //1- Verificar se o usuario e a senha estao registrados nos no banco de dados;
        console.log(JSON.stringify(row));

        if (row) {
            //2- Se o usuario cadastra e a senha e valida executa o login;
            req.session.username = username;
            req.session.loggedin = true;
            res.redirect("/dashboard");
        }
        else {
            //3- Se nao, executa processo de negaçao de login.
            res.send("Usuario invalido");
        }


    })

})

