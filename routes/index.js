const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = () => {
    router.get('/', homeController.mostrarTrabajos);

    // Crear Vacantes
    router.get('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.formularioNuevaVacante
    );

    router.post('/vacantes/nueva', 
        authController.verificarUsuario,
        vacantesController.validarVacante,        
        vacantesController.agregarVacante
    );

    // Mostrar Vacante (singular)
    router.get('/vacantes/:url', vacantesController.mostrarVacante);

    // Editar Vacante
    router.get('/vacantes/editar/:url', 
        authController.verificarUsuario,        
        vacantesController.formEditarVacante
    );
    
    router.post('/vacantes/editar/:url', 
        authController.verificarUsuario,
        vacantesController.editarVacante
    );

    // Eliminar Vacantes
    router.delete('/vacantes/eliminar/:id',
        vacantesController.eliminarVacante
    )

    // Crear cuentas
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta',
        usuariosController.validarRegistro,
        usuariosController.crearUsuario);

    //Autenticar Usuarios
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);
    // cerrar sesión
    router.get('/cerrar-sesion', 
        authController.verificarUsuario,
        authController.cerrarSesion
    );

    // Resetear password (emails)
    router.get('/reestablecer-password',
        authController.formReestablecerPassword
    )
    router.post('/reestablecer-password',
        authController.enviarToken
    )

    // Resetear Password ( Almacenar en la BD )
    router.get('/reestablecer-password/:token',
        authController.reestablecerPassword
    );
    router.post('/reestablecer-password/:token',
        authController.guardarPassword
    );


    // Panel de Administracion
    router.get('/administracion', 
        authController.verificarUsuario,        
        authController.mostrarPanel
    );

    // Editar Perfil
    router.get('/editar-perfil', 
        authController.verificarUsuario,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.verificarUsuario,
        // usuariosController.validarPerfil,
        usuariosController.subirImagen,
        usuariosController.editarPerfil
    );

    // Recibir Mensajes de Candidatos
    router.post('/vacantes/:url',
        vacantesController.subirArchivos,
        vacantesController.contactar
    );

    // Muestra los candidatos por vacantes
    router.get('/candidatos/:id', 
        authController.verificarUsuario,
        vacantesController.mostrarCandidatos
    )

    // Buscador de Vacantes
    router.post('/buscador' ,
        vacantesController.buscarVacante
    )

    return router;
}