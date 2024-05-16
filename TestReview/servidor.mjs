import http from 'node:http'
import path from 'node:path'
import fsp from 'node:fs/promises'

const puerto = 3000

const diccionarioMime = {
    '.jpg':'image/jpeg;',
    '.jpeg':'image/jpeg;',
    '.htm':'text/html;charset=utf-8',
    '.html':'text/html;charset=utf-8',
    '.js':'application/javascript;charset=utf-8',
    '.json':'application/json;charset=utf-8',
    '.css':'text/css'
}

const contenido = {
    saludos: [
        "Buenos días",
        "Buenas tardes",
        "Buenas noches"
    ]
}

async function gestionarIndex(peticion, respuesta) {
    const ruta = path.join("publica", "index.html");
    try {
        const datos = await fsp.readFile(ruta);
        respuesta.statusCode = 200;
        respuesta.setHeader('Content-Type', 'text/html;charset=utf-8')
        respuesta.end(datos);
    } catch (error) {
        console.error(error);
        respuesta.statusCode = 500;
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.end("Error en el index");
    }
}

async function gestionarRecursos(peticion, respuesta) {
    const rutaRecursos = path.join("publica", peticion.url);
    try {
        const extencion = path.extname(rutaRecursos)
        const mime = diccionarioMime[extencion]
        const datos = await fsp.readFile(rutaRecursos);
        respuesta.statusCode = 200;
        respuesta.setHeader('Content-Type', mime)
        respuesta.end(datos);
    } catch (error) {
        console.log(error);
        respuesta.statusCode = 404;
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.end('Error en los recursos');
    }
}

async function escribirSaludo(peticion, respuesta) {
    const rutaArchivo = path.join("saludos", "saludos.json");
    try {
        const contenidoJSON = JSON.stringify(contenido)
        await fsp.writeFile(rutaArchivo, contenidoJSON);
        respuesta.statusCode = 200;
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.end("Datos escritos");
    } catch (error) {
        console.log(error);
        respuesta.statusCode = 404;
        respuesta.setHeader('Content-Type', 'text/plain;charset=utf-8')
        respuesta.end('Error en la escritura');
    }
}

const servidor = http.createServer(async (peticion, respuesta) => {
    if (peticion.method === "GET"){
        if (peticion.url === "/"){
            gestionarIndex(peticion, respuesta);
        } else if (peticion.url != "/") {
            gestionarRecursos(peticion, respuesta);
        }
    } else if (peticion.method === "POST"){
        if (peticion.url === "/escribir"){
            escribirSaludo(peticion, respuesta) 
        }
    } else {
        respuesta.end("Metodo no valido")
    }
});

servidor.listen(puerto, () => {
    console.log(`Servidor ejecutándose en http://localhost:${puerto}`);
});