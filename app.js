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

db.serialize(() => {
    db.run(
        "CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, id_users INTEGER, titulo TEXT, conteudo TEXT, data_criacao TEXT)"
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
    res.render("pages/login", {titulo: "Login", req: req});
    console.log("GET /");

});

app.get("/cadastro", (req, res) => {
    res.render("pages/cadastro", {titulo: "Cadastro", req: req});
    console.log("GET /cadastro");

});




app.get("/", (req, res) => {
    console.log("GET /index");
    res.render("pages/index", {titulo: "Index", req: req});
});

app.get("/sobre", (req, res) => {
    res.render("pages/sobre", {titulo: "Sobre", req: req});
    console.log("GET /sobre");
});

app.get("/unauthorized", (req, res) => {
    res.render("pages/unauthorized", {titulo: "Unauthorized", req: req});
    console.log("GET /unauthorized");
});

app.get("/ja-cadastrado", (req, res) => {
    res.render("pages/ja-cadastrado", {titulo: "ja-cadastrado", req: req});
    console.log("GET /ja-cadastrado");
});

app.get("/login-invalido", (req, res) => {
    res.render("pages/login-invalido", {titulo: "login-invalido", req: req});
    console.log("GET /login-invalido");
});

app.get("/sucesso", (req, res) => {
    res.render("pages/sucesso", {titulo: "sucesso", req: req});
    console.log("GET /sucesso");
});

app.get("/dashboard", (req, res) => {

    if(req.session.loggedin) {
       //listar todos os usuários
    const query = "SELECT * FROM users";
    db.all(query, [], (err, row) => {
        if(err) throw err;
        console.log(JSON.stringify(row));

        res.render("pages/dashboard", {titulo: "Tabela de usuário", dados: row, req: req});
    }) 
    } else{
        res.redirect("/unauthorized");
    }
    

   
    console.log("GET /dashboard");

});



app.get("/deleteC/:id", (req, res) => {
    if (req.session.loggedin) {
        const idUsuario = req.params.id;

        const query = "DELETE FROM users WHERE id = ?";
        db.get(query, [idUsuario], (err, row) => {
            if (err) {
                console.error("Erro ao deletar usuário:", err.message);
                res.send("Erro ao deletar usuário.");
            } else {
                console.log(`Usuário com ID ${idUsuario} deletado.`);
                res.redirect("/dashboard")
            }

        });
    } else {
        res.redirect("/unauthorized");
    }
    
});


app.get("/post_create", (req, res) => {

    if(req.session.loggedin) {

        res.render("pages/post_create", {titulo: "post_create", req: req});
        //Pegar dados da postagem: UserID, Título Postagem, Conteúdo da Postagem, Data da Postagem

        //SELECT * FROM users WHERE username=?

        // res.send("Criação de postagem... Em construção...")

    } else{
        res.redirect("/unauthorized");
    }
    
    console.log("GET /post_create");

});

app.post("/post_create", (req, res) => {

    if(req.session.loggedin) {

      console.log("POST /post_create");
      const {titulo, conteudo} = req.body;
      console.log("Username: ", req.session.username, "id_username: ", req.session.id_username);

      const data = new Date();
      const data_criacao = data.toLocaleDateString();
      console.log("Data de criação: ");

      const query = "INSERT INTO posts (id_users, titulo, conteudo, data_criacao) VALUES (?, ?, ?, ?)";

      db.get(query, [req.session.id_username, titulo, conteudo, data_criacao], (err) => {
        if(err) throw err;
        res.send('Post criado');
      })
      
    }else{
     res.redirect("/unauthorized");
    }
   


})

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

app.get("/posts-tabela", (req, res) => {
console.log("GET /posts-tabela")
    //if(req.session.loggedin) {
       //listar todos os usuários
    const query = "SELECT * FROM posts";
    db.all(query, [], (err, row) => {
        if(err) throw err;
        console.log(JSON.stringify(row));
        res.render("pages/posts-tabela", {titulo: "Tabela de posts", dados: row, req: req});
    }) 
    //} else{
        //res.redirect("/unauthorized");
    //}
    


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
            res.redirect("/ja-cadastrado");
        } else {
            const insert = "INSERT INTO users(username, password) VALUES (?,?)"
            db.get(insert, [username, password], (err, row) => {
                if (err) throw err;

                console.log(`Usuario: ${username}  cadastrado com sucesso.`)
                res.redirect("/sucesso");
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
            console.log(`SELECT da tabela users`);
            //2- Se o usuario cadastra e a senha e valida executa o login;
            req.session.username = username;
            req.session.loggedin = true;
            req.session.id_username = row.id;
            res.redirect("/dashboard"); 
        }
        else {
            //3- Se nao, executa processo de negaçao de login.
            res.redirect("/login-invalido");
        }


    })

})

app.use('/{*erro}', (req, res) => {
    // Envia uma resposta de erro 404
    res.status(404).render('pages/erro404', {titulo:"Erro 404", req: req});
}); 

