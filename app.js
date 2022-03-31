const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
require('dotenv').config()

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexion a la BD
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.xfjzo.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;
const option = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(uri,option)
.then(() => console.log('Base de datos conectada'))
.catch(e => console.log('error db:', e))


//Importar rutas
const authRoutes = require('./router/auth');
const validarToken = require('./router/validar-token');
const admin = require('./router/admin');

app.use('/api/user', authRoutes);
app.use('/api/admin', validarToken, admin)

app.get('/', (req, res) => {
    res.json({
        estado: true,
        mensaje: 'funciona!'
    })
});
 


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`servidor andando en: ${PORT}`)
})