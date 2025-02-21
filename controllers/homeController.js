const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');

exports.mostrarTrabajos = async (req, res, next) => {
    try {
        const vacantes = await Vacante.find().lean(); 
        
        if (!vacantes) return next();

        res.render('home', {
            nombrePagina: 'devJobs',
            tagline: 'Encuentra y Publica trabajos para desarrolladores web',
            barra: true,
            boton: true,
            nombre: req.user ? req.user.nombre : null,
            cerrarSesion: req.user ? true : false,
            iniciarSesion: req.user ? false : true, 
            vacantes
        });
    } catch (error) {
        console.error(error);
        return next();
    }
};
