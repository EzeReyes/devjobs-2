const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const Usuarios = require("../models/Usuarios");
const multer = require('multer');
const shortid = require('shortid');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar multer con Cloudinary
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'perfiles', // Carpeta en Cloudinary
        format: async (req, file) => file.mimetype.split('/')[1], // Formato de imagen
        public_id: () => shortid.generate(), // Nombre único para cada archivo
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100000 }, // Límite de 100 KB
    fileFilter(req, file, cb) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Formato no válido'), false);
        }
    },
}).single('imagen');

// Middleware para subir la imagen
exports.subirImagen = (req, res, next) => {
    upload(req, res, (error) => {
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        next();
    });
};



// exports.subirImagen = (req, res, next) => {
//     upload(req, res, function(error) {
//         if(error) {
//             if(error instanceof multer.MulterError) {
//                 if(error.code === 'LIMIT_FILE_SIZE') {
//                     req.flash('error', 'El archivo es muy grande. Máximo 100kb ');
//                 } else {
//                     req.flash('error', error.message);
//                 }
//             } else {
//                 req.flash('error', error.message);
//             }
//             res.redirect('/administracion');
//             return;
//         } else {
//             return next();
//         }
//     });
// }


// // Opciones de multer
// const configuracionMulter = {
//     limits: {fileSize : 100000 },
//     storage: fileStorage = multer.diskStorage({
//         destination: (req, file, cb) => {
//             cb(null, __dirname+'../../public/uploads/perfiles');
//         },
//         filename: (req, file, cb) => {
//             const extension = file.mimetype.split('/') [1];
//             cb(null, `${shortid.generate()}.${extension}`);
//         }
//     }),
//     fileFilter(req, file, cb) {
//         if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//             // el callback se ejecuta como true o false : true cuando la imagen se acepta
//             cb(null, true);
//         } else {
//             cb(new Error('Formato no válido'), false);
//         }
//     },
// }

// const upload = multer(configuracionMulter).single('imagen');

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear tu cuenta'
    })
}


exports.validarRegistro = [
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().withMessage('Agrega un correo válido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),

    (req, res, next) => {
        const errores = validationResult(req);

        if (!errores.isEmpty()) { // Verifica si hay errores
            req.flash('error', errores.array().map(error => error.msg));

            return res.render('crear-cuenta', {
                nombrePagina: 'Crea tu cuenta en devJobs',
                tagline: 'Comienza a publicar tus vacantes gratis, solo debes crear tu cuenta',
                mensajes: req.flash('error') // Corregido: especificamos 'error' para obtener los mensajes
            });
        }

        next(); // Si no hay errores, continúa al siguiente middleware
    }
];



exports.crearUsuario = async (req, res, next) => {
    // crear Usuario
    const usuario = new Usuarios(req.body);

    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');
    } catch (error) {
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }

}

// formulario para iniciar sesión
exports.formIniciarSesion = (req, res ) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar Sesión devJobs'
    })
}


// Form editar el Perfil
exports.formEditarPerfil = (req, res) => {
    res.render('editar-perfil', {
        nombrePagina: 'Edita tu perfil',
        usuario: req.user?.toObject ? req.user.toObject() : req.user,
        cerrarSesion: true,
        nombre: req.user.nombre,
        imagen: req.user.imagen
    })
}

// Guardar cambios editar perfil
exports.editarPerfil = async (req, res) => {
    const usuario = await Usuarios.findById(req.user._id);

    usuario.nombre = req.body.nombre;
    usuario.email= req.body.email;
    if(req.body.password) {
        usuario.password = req.body.password;
    }


    if (req.file) {
        usuario.imagen = req.file.path; // La imagen ahora será una URL de Cloudinary
    }
    
    await usuario.save();

    req.flash('correcto', 'Cambios Guardados Correctamente')

    res.redirect('/administracion');

}

// Sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = [
    // sanitizar campos
        body('nombre')
        .escape()  // Escapa caracteres especiales (evita XSS)
        .notEmpty().withMessage('El Nombre no puede ir vacio'),
        body('email')
        .escape()  // Escapa caracteres especiales (evita XSS)
        .notEmpty().withMessage('El correo no puede ir vacio'),
        body('password')
        .escape(),  // Escapa caracteres especiales (evita XSS)

    (req, res, next) => {
        const errores = validationResult(req);
            if (!errores.isEmpty()) {
                req.flash('error', errores.array().map(error => error.msg));

                return res.render('editar-perfil', {
                    nombrePagina: 'Edita tu perfil',
                    usuario: req.user?.toObject ? req.user.toObject() : req.user,
                    cerrarSesion: true,
                    nombre: req.user.nombre,
                    imagen: req.user.imagen,
                    mensajes: req.flash()
                });
            }
            next(); // Solo se ejecuta si no hay errores
        }
]