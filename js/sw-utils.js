/**
 * Archivo que sirve como auxiliar del service worker,
 * contiene funciones de apoyo
 */


//recibimos el nombre del espacio de c ache a limpiar y el número de archivos permitido
function limpiarCache(nombreCache, numeroItems){
    //abrimos el cache
    caches.open(nombreCache)
        .then(cache=>{
            //recuperamos el arreglo de archivos exixtentes en el espacio de cache
            return cache.keys()
                .then(keys=>{
                    //si el número de archivos supera el limite permitido
                    if (keys.length>numeroItems){
                        //eliminamos el más antigüo y repetimos el proceso
                        cache.delete(keys[0])
                            .then(limpiarCache(nombreCache, numeroItems));
                    }
                });
        });
}

// Cache with network update
function actualizaCacheStatico( staticCache, req, APP_SHELL_INMUTABLE ) {

    //Verificamos si el elemento solicitado se encuentra en caché
    if ( APP_SHELL_INMUTABLE.includes(req.url) ) {
        // Si existe entonces,
        // No hace falta actualizar el inmutable
        console.log('existe en inmutable', req.url );

    } else {
        // En caso de no existir el elemento en la caché se solicita 
        console.log('actualizando', req.url );
        return fetch( req ) // Hacemos una petición fetch del elemento
                .then( res => {
                    /**
                     * Al obtener la respuesta de la promesa obtenemos
                     * el elemento, el cual será registrado en el caché
                     * dinámico
                     */
                    return actualizaCacheDinamico( staticCache, req, res );
                });
    }
}

// Guardar  en el cache dinamico siempre y cuando la respuesta  sea OK
function actualizaCacheDinamico( dynamicCache, req, res ) {

    // validar si la respuesta obtenida es OK
    if ( res.ok ) {

        /**
         * Cuando la respuesta es satisfactoria (OK, 200)
         * se procede a realizar el procedimiento de registro
         * en la memoria caché, en este caso es en el espacio
         * determinado como caché dináico
         */
        return caches.open( dynamicCache ).then( cache => {

            cache.put( req, res.clone() );
            // retornamos la respuesta que contiene el elemento rgistrado en caché
            return res.clone();

        });

    } else {
        /**
         * En caso de que la respuesta no sea un OK
         * se retorna la respuesta pero sin registrarse
         * en la caché
         */
        return res;
    }
}

// Network with cache fallback / update
function manejoMensajes( cacheName, req ) {

    if(req.clone().method === 'POST'){
        if ( self.registration.sync ) {
            return req.clone().text().then( body =>{
    
                // console.log(body);
                const bodyObj = JSON.parse( body );
                return guardar( bd.productos, bodyObj );
    
            });
        } else {
            return fetch( req );
        }

    } else{
        return fetch(req).then(res => {
            if(res.ok){
                actualizaCacheDinamico(cacheName, req, res.clone());
                return res.clone();
            } else{
                return caches.match(req);
            }
        }).catch(err => {
            return caches.match(req);
        });
    }

}