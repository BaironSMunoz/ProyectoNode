Guia para la ejecución y subida de cambios al repositorio: 

1. Configuración Inicial
Si acabas de clonar el proyecto o hay cambios nuevos:

Ejecuta estos comandos en la terminal de Bash:
- cd backend
- npm install

2. Levantar el Servidor
node src/index.js
El servidor corre en: http://localhost:3000

3. Workflow para subir Endpoints
Para mantener el orden en la rama develop, sigue estos pasos:

Asegúrate de estar al día:

Bash
git checkout develop
git pull origin develop
Agrega tu código en index.js.

Sube tus cambios:

Bash
git add .
git commit -m "feat: agregar endpoint de [nombre_tarea]"
git push origin develop
