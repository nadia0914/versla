
/**
 * * Archivo que maneja todas las interacciones
 * * y funcionalidad con la base de datoss IndexedDB
 * @param {Nombr de la base de datos} nombrebd 
 * @param {nombre de la tabla} tabla 
 * @returns {Retorna la base de datos creada}
 */

const tiendbd = (nombrebd, tabla) => {
    //creando la base de datos

    const bd = new Dexie(nombrebd);
    bd.version(1).stores(tabla);
    bd.open();
    return bd;

}
 //función para insertar datos
/*const guardar = (tabla, datos) => {
    //llamar función para validar si datos no está vacío
    let flag = empty(datos);
    if (flag) {
        tabla.bulkAdd([datos]);
        console.log("inserción realizada en IndexedDB");
    } else {
        console.log("No puedes dejar campos vacíos");
    }
    return flag;
}*/

//función para eliminar todo el contenido de la bd
const eliminarTodo = (nombrebd, datos) => {
    nombrebd.delete();
    return tiendbd(nombrebd, datos);
}

//función eliminar un elemento
const eliminar = (tabla, datos) => {
    tabla.delete(datos);
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

// Consultando datos
const consultar = (tabla, funcion) => {
    let index = 0;
    let obj = {}
    tabla.count((cantidad) => {
        if(cantidad){
            tabla.each(producto => {
                producto = ordenarCampos(producto);
                funcion(producto, index++);
            })
        } else{
            funcion(0);
        }
    })
}

//definir orden de los campos
const ordenarCampos = producto => {
    let objProducto = {};
    objProducto = {
        id: producto.id,
        nombre: producto.nombre,
        costo: producto.precio,
        descripcion: producto.descripcion
    }
    return objProducto;
}

//creando etiquetas para agregar en la página 
const crearEtiqueta = ((etiqueta, agregarA, funcion) => {
    const etiquetaACrear = document.createElement(etiqueta);
    if(etiquetaACrear){
        agregarA.appendChild(etiquetaACrear);
    }
    if(funcion){
        funcion(etiquetaACrear);
    }
});


export { consultar, crearEtiqueta, eliminarTodo, eliminar }
export default tiendbd;