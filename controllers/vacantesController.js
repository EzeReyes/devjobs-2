const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const shortid = require('shortid');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

exports.formularioNuevaVacante = (req, res) => {
    res.render('nueva-vacante', {
        nombrePagina: 'Nueva Vacante',
        tagline: 'Llena el formulario y publica tu vacante',
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    });
}

// Agrega las vacantes a la base de datos
exports.agregarVacante = async (req, res) => {    
    const vacante = new Vacante(req.body);

    // Usuario autor de la vacante
    vacante.autor = req.user._id;

    // Crear arreglo de habilidades (skills);
    vacante.skills = req.body.skills.split(',');

    // // almacenarlo en la base de datos
    const nuevaVacante = await vacante.save();

    // // redireccionar
    res.redirect(`/vacantes/${nuevaVacante.url}`);
}

// muestra una Vacante
exports.mostrarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url : req.params.url }).lean().populate('autor');
    // Si no hay resultado
    if(!vacante) return next();

    res.render('vacante', {
        vacante,
        nombrePagina: vacante.titulo,
        barra: true
    })

}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url }).lean();

        if(!vacante) return next;
        
        res.render('editar-vacante', {
            vacante,
            nombrePagina: `Editar - ${vacante.titulo}`,
            cerrarSesion: true,
            nombre: req.user.nombre,
            imagen: req.user.imagen
        })
}

exports.editarVacante = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url: req.params.url},
        vacanteActualizada, {
            new: true,
            runValidators: true
        });

        res.redirect(`/vacantes/${vacante.url}`);
}

// Validar y sanitizar los campos de las nuevas Vacantes
exports.validarVacante = [
    // sanitizar campos
    body('titulo')
    .escape()  // Escapa caracteres especiales (evita XSS)
    .notEmpty().withMessage('Agrega un Titulo a la Vacante'),
    body('empresa')
    .escape()  // Escapa caracteres especiales (evita XSS)
    .notEmpty().withMessage('Agrega una Empresa'),
    body('ubicacion')
    .escape()  // Escapa caracteres especiales (evita XSS)
    .notEmpty().withMessage('Agrega una Ubicación'),
    body('salario')
    .escape(),  // Escapa caracteres especiales (evita XSS)
    body('contrato')
    .escape()  // Escapa caracteres especiales (evita XSS)
    .notEmpty().withMessage('Agrega el tipo de Contrato'),
    body('skills')
    .escape()  // Escapa caracteres especiales (evita XSS)
    .notEmpty().withMessage('Agrega al menos una habilidad'),

    (req, res, next) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            req.flash('error', errores.array().map(error => error.msg));

            return res.render('nueva-vacante', {
                nombrePagina: 'Nueva Vacante',
                tagline: 'Llena el formulario y publica tu vacante',
                cerrarSesion: true,
                nombre: req.user.nombre,
                mensajes: req.flash()
            });
        }
        next(); // Solo se ejecuta si no hay errores
    }
]

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);

    if(verificarAutor(vacante, req.user)) {
        // Todo bien, si es el usuario, eliminar
        await Vacante.findByIdAndDelete(id);
        res.status(200).send('Vacante Eliminada Correctamente');
    } else {
        // no permitido
        res.status(403).send('Error');
    }

}

const verificarAutor = (vacante = {}, usuario = {}) => {
    if(!vacante.autor === usuario._id) {
        return false
    }
    return true;
}

// Subir archivos en PDF
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'documentos', // Carpeta en Cloudinary
        resource_type: 'raw', // Para archivos PDF y otros documentos
        public_id: (req, file) => file.originalname.split('.')[0] // Usa el nombre original
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 } // Límite de 100KB
}).single('cv');

// Subir archivos en PDF
exports.subirCV = (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'El archivo es muy grande. Máximo 100KB.');
                } else {
                    req.flash('error', error.message);
                }
            } else {
                req.flash('error', error.message);
            }
            return res.redirect(req.get("Referrer") || "/");
        }
        next(); // Continuar con el siguiente middleware si no hay errores
    });
};


// exports.subirCV = async (req, res, next) => {
//     upload(req, res, function(error) {
//             if(error) {
//                 if(error instanceof multer.MulterError) {
//                     if(error.code === 'LIMIT_FILE_SIZE') {
//                         req.flash('error', 'El archivo es muy grande. Máximo 100kb ');
//                     } else {
//                         req.flash('error', error.message);
//                     }
//                 } else {
//                     req.flash('error', error.message);
//                 }
//                 res.location(req.get("Referrer") || "/");
//                 return;
//             } else {
//                 return next();
//             }
//         });
// }

// Opciones de multer
// const configuracionMulter = {
//     limits: {fileSize : 100000 },
//     storage: fileStorage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             cb(null, __dirname+'../../public/uploads/cv');
//         },
//         filename: (req, file, cb) => {
//             const extension = file.mimetype.split('/') [1];
//             cb(null, `${shortid.generate()}.${extension}`);
//         }
//     }),
//     fileFilter(req, file, cb) {
//         if(file.mimetype === 'application/pdf') {
//             // el callback se ejecuta como true o false : true cuando la imagen se acepta
//             cb(null, true);
//         } else {
//             cb(new Error('Formato no válido'), false);
//         }
//     },
// }


// const upload = multer(configuracionMulter).single('cv');

// Almacenar los candidatos en la base de datos
exports.contactar = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url : req.params.url });

    // sino existe la vacante
    if(!vacante) return next();

    // todo bien, construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email: req.body.email,
        cv: req.file.path
    }

    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidato);
    await vacante.save();

    // mensaje y redirección
    req.flash('correcto', 'Se envió tu Curriculum Correctamente');
    res.redirect('/');
}


// Mostrar Candidatos
exports.mostrarCandidatos = async (req, res, next) => {
    const vacante = await Vacante.findById(req.params.id).lean();
    if(vacante.autor != req.user._id.toString()) {
        return next();
    } 
    if(!vacante) return next();
    
    res.render('candidatos', {
        nombrePagina: `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen,
        candidatos: vacante.candidatos
    })
}

// Buscador de Vacantes
exports.buscarVacante = async (req, res) => {
    const vacantes = await Vacante.find({
        $text: {
            $search : req.body.q
        },
    }).lean();

    // Mostrar las Vacantes
    res.render('home', {
        nombrePagina: `Resultados para la búsqueda : ${req.body.q}`,
        barra: true,
        vacantes
    })

}