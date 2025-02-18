module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones) => {
        const skills = ['HTML5', 'CSS3', 'CSSGrid', 'Flexbox', 'JavaScript', 'jQuery', 'Node', 'Angular', 'VueJS', 'ReactJS', 'React Hooks', 'Redux', 'Apollo', 'GraphQL', 'TypeScript', 'PHP', 'Laravel', 'Symfony', 'Python', 'Django', 'ORM', 'Sequelize', 'Mongoose', 'SQL', 'MVC', 'SASS', 'WordPress'];
        let html = '';
        skills.forEach(skill => {
            html += `
                <li ${seleccionadas.includes(skill) ? "class='activo'" : null}>${skill}</li>
            `;
        })

        return opciones.fn().html = html;
    },
    tipoContrato: (seleccionado, opciones) => {
        return opciones.fn(this).replace(
            new RegExp(` value="${seleccionado}"`), '$& selected="selected"'
        )
    },
    mostrarAlertas: (errores = {}, alertas) => {
        console.log("Errores recibidos:", errores);
    
        const categorias = Object.keys(errores);
        console.log("Categorías detectadas:", categorias);
    
        let html = '';
        if (categorias.length) {
            categorias.forEach(categoria => {
                console.log(`Procesando categoría: ${categoria}`);
                console.log("Tipo de errores[categoria]:", typeof errores[categoria]);
                console.log("Contenido de errores[categoria]:", errores[categoria]);
    
                // Aseguramos que sea un array
                const listaErrores = Array.isArray(errores[categoria]) ? errores[categoria] : [errores[categoria]];
                
                listaErrores.forEach(error => {
                    html += `<div class="${categoria} alerta">
                        ${error}
                    </div>`;
                });
            });
        }
    
        return alertas.fn().html = html;
    }
    

}