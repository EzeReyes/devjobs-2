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
        const categorias = Object.keys(errores); // <-- Cambia categoria por categorias (plural)
        
        let html = '';
        if (categorias.length) {
            categorias.forEach(categoria => { // <-- Itera sobre cada categoría
                errores[categoria].forEach(error => { // <-- Ahora sí accedes correctamente
                    html += `<div class="${categoria} alerta">
                        ${error}
                    </div>`;
                });
            });
        }
    
        return alertas.fn().html = html;
    }

}