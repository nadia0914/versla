//Indicamos el nombre de la base de datos "Tienda", la tabla "productos"
//y sus atributos ++id(autoincremental), nombre, precio y descripción.

//import { consultar } from "./funciones";


//creando la base de datos

const bd = new Dexie("Tienda");
bd.version(1).stores({ productos: `++id,nombre, precio,descripcion` });
bd.open();

 //función para insertar datos
const guardar = (tabla, datos) => {
    //llamar función para validar si datos no está vacío
    let flag = empty(datos);
    if (flag) {
        return tabla.bulkAdd([datos]).then(result => {
            self.registration.sync.register('nuevo-articulo');
            const newResp = {ok: true, offline: true};
            console.log("inserción realizada en IndexedDB");
            console.log('Mensaje guardado para posterior posteo');
            return new Response(JSON.stringify(newResp));
        })
    } else {
        console.log("No puedes dejar campos vacíos");
    }
    return flag;
}

//función para validar que no estén vacíos los datos
const empty = object  => {
    let flag = false;
    for(const value in object){
        if(object[value] != "" && object.hasOwnProperty(value)){
            flag = true;
        }else{
            flag = false;
        }
    }
    return flag;
}

// Postear artículos
function postearArticulos() {

    const posteos = [];

    return bd.productos.count((cantidad) => {
        if(cantidad){
            return bd.productos.each(producto => {
                const fetchProm = fetch('db', {
                    method: 'POST',
                    headers: {
                        'Content-Type' : 'application/json'
                    },
                    body: JSON.stringify(producto)
                }).then((result => {
                    console.log("Artículo eliminado ", producto.nombre);
                    return bd.productos.delete(producto.id);
                }).catch(Error, e => {
                    console.error ("Error: " + e.message);
                }));
                posteos.push(fetchProm);
            });
            return Promise.all(posteos);
        }
    });
}