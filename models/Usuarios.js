const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
    email:{
        type: String,
        unique:true,
        lowercase: true,
        trim: true
    },
    nombre: {
        type: String,
        required: true
    },
    password: {
        type: String,
        require: true,
        trim: true
    }, 
    token: String,
    expira : Date,
    imagen: String
});

// Metodo para hashear los passwords;
usuarioSchema.pre('save', async function(next) {
    // si el password ya está hasheado no hacemos nada
    if(!this.isModified('password')) {
        return next(); //deten la ejecución
    }

    // Sino está hasheado
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});
// Envia alerta cuando un usuario ya está registrado
usuarioSchema.post('save', function(error, doc, next) {
    if(error.code === 11000 ) {
        next('Ese correo ya está Registrado');
    } else {
        next(error);
    }
})

// Autenticar Usuarios
usuarioSchema.methods = {
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password)
    }
}

module.exports = mongoose.model('Usuarios', usuarioSchema);