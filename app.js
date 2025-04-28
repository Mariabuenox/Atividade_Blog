const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");

const app = express(); // Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 3000; // Configura o TCP

app.use('/static', express.static(__dirname + '/static'));

app.set('view engine', 'ejs');

app.get("/login", (req, res) => {
    res.render("pages/login");
    console.log("GET /");

});

app.get("/cadastro", (req, res) => {
    res.render("pages/cadastro");
    console.log("GET /cadastro");

});


app.get("/", (req, res) => {
    res.render("pages/index");
    console.log("GET /index");
});

app.get("/sobre", (req, res) => {
    res.render("pages/sobre");
    console.log("GET /index");
});

app.get("/dashboard", (req, res) => {
    res.render("pages/dashboard");
    console.log("GET /");

});

app.listen(PORT, () => {
    console.log(`Servidor sendo executado na porta ${PORT}`);
});
app.get("/static", (req, res) => {
    res.send(`Você está na página static!`);
    console.log("GET /static");
    console.log(__dirname + "\\static");
});
