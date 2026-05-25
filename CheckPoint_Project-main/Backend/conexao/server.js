const express = require('express');
const path = require('path');
const session = require('express-session');

// Conecta ao MongoDB Atlas
require('./conexao'); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importação dos Controllers (Ajuste o caminho se você renomear a pasta)
const UserController = require('../LinkSQL/Controllers/userController'); 
const EventController = require('../LinkSQL/Controllers/eventController');
const GastosController = require('../LinkSQL/Controllers/gastosController');

function protegerRota(req, res, next) {
    if (!req.session.usuarioLogado) {
        return res.status(403).json({ ok: false, msg: "Usuário não está logado" });
    }
    next();
}

app.use(session({
    secret: 'chave-secreta-do-checkpoint',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } 
}));

// Caminho absoluto para a pasta public (considerando que server.js está em /conexao)
const publicPath = path.join(__dirname, "../../public");
app.use(express.static(publicPath));

// Rota Raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
});

// --- ROTAS ---
app.post('/users/cadastro', UserController.cadastrar);
app.post('/users/login', UserController.login);
app.post('/users/recuperar', UserController.recuperar);
app.post('/users/verificar', UserController.verificar);
app.post('/users/editar_perfil', protegerRota, UserController.editar_perfil);
app.post('/users/saldo', protegerRota, UserController.saldo);
app.get('/users/sessao', (req, res) => {
    res.json(req.session.usuarioLogado ? { logado: true, usuario: req.session.usuarioLogado } : { logado: false });
});
app.get('/users/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index.html');
});

app.post("/events/criar", protegerRota, EventController.criar);
app.post("/events/excluir", protegerRota, EventController.excluir);
app.get("/events", protegerRota, EventController.listarEventos);
app.get("/events/quantidade", protegerRota, EventController.quantidade);
app.get("/events/:id", protegerRota, EventController.buscarEvento);

app.post('/gastos/novo', protegerRota, GastosController.novoGasto);
app.get('/gastos/listar', protegerRota, GastosController.listar);
app.post('/gastos/deletar', protegerRota, GastosController.deletar);
app.post('/gastos/editar', protegerRota, GastosController.editar);

app.set('port', 4000);
module.exports = app;