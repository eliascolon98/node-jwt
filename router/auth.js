const router = require('express').Router();
const User = require('../models/User');
const Joi = require('@hapi/joi');
const bycryp = require('bcrypt');
const jwt = require('jsonwebtoken');

const schemaRegister = Joi.object({
    name: Joi.string().min(6).max(255).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})


const schemaLogin= Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required()
})

router.post('/login', async(req, res) =>{
    const {error} = schemaLogin.validate(req.body)
    // Validacion del usuario al loguear
    if(error) return res.status(400).json({error: error.details[0].message})
    
    const user = await User.findOne({email: req.body.email})
    if(!user) return res.status(400).json({error: true, mensaje: "Email NO registrado"})

    const passValidar = await bycryp.compare(req.body.password, user.password)
    if(!passValidar) return res.status(400).json({error: true, mensaje: "Credenciales invalidas"})

    const token = jwt.sign({
        name: user.name,
        id: user._id
    }, process.env.TOKEN_SECRET)

    res.header('auth-token', token).json({
        error: null,
        data: {token}
    })

})

router.post('/register', async (req, res) => {

    const {error} = schemaRegister.validate(req.body)
    // Validacion del usuario
    if(error){
         return res.status(400).json(
            {error: error.details[0].message}
        )
    }
    // Validacion si existe el usuario
    const existeEmail = await User.findOne({email: req.body.email})
    if(existeEmail) return res.status(400).json({error: true, mensaje: 'Email ya existe'})

    // Hash para encriptar contraseña
    const saltos = await bycryp.genSalt(10);
    const password = await bycryp.hash(req.body.password, saltos)

    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password
    });
    try {
        const userDB = await user.save();
        return res.json({
            error: null,
            data: userDB
        })
    } catch (error) {
        res.status(400).json(error)
    }
    
})

module.exports = router;