const express = require("express");
const session = require("express-session");
const sqlite3 = require("sqlite3");

const app = express(); // Armazena as chamadas e propriedades da biblioteca EXPRESS

const PORT = 8000;

app.use('/static', express.static(__dirname + '/static'));

app.set('view engine', 'ejs');

app.get("/index", (req, res) => {
    console.log("GET /")
    res.render("index");
});

app.get("/sobre", (req, res) => {
    res.render("sobre");
    console.log("GET /sobre")
});
app.get("/dashboard", (req, res) => {
    res.send(`Você está na página Dashboard!`);
    console.log("GET /dashboard")
});
app.listen(PORT, () => {
    console.log(`Servidor sendo executado na porta ${PORT}`);
});
app.get("/static", (req, res) => {
    res.send(`Você está na página static!`);
    console.log("GET /static");
    console.log(__dirname + "\\static");
});
