importScripts("https://unpkg.com/dexie@3.2.4/dist/dexie.js");
importScripts("js/sw-db.js");
importScripts("js/sw-utils.js");

const CACHE ='cache-1';
const CACHE_DINAMICO ='dinamico-1';
const CACHE_INMUTABLE ='inmutable-1';

//declaración de constante para poner todos los archivos requeridos por el APP SHELL
const APP_SHELL = [
    '/',
    'index.html',
    'css/bootstrap.min.css',
    'css/londinium-theme.css',
    'css/styles.css',
    'css/icons.css',
    'css/googleapi.css',
    'js/app.js',
    'offline.html',
    'js/main.js',
    'js/funciones.js',
    'js/libs/plugins/mdtoast.min.js',
    'js/libs/plugins/mdtoast.min.css'
];

//declaración de constante que srive para especificar los archivos que se descargan de internet para mandarlos a la caché
const APP_SHELL_INMUTABLE = [
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://unpkg.com/dexie@3.2.4/dist/dexie.js'
]

//Indicamos que durante el proceso de intalación se 
//carguen los archivos del cache estatico
self.addEventListener('install', evento=>{
    /*Promesa que crea el proceso de creación del espacio 
    en cache y agrega los archivos necesarios para cargar nuestra
    aplicación*/
    const cacheEstatico = caches.open(CACHE)
        .then(cache=>{
            cache.addAll(APP_SHELL);
        });
    const cacheInmutable = caches.open(CACHE_INMUTABLE)
        .then(cache =>{
            cache.addAll(APP_SHELL_INMUTABLE);
        });

    //Indicamos que la instalación espere hasta que las promesas se cumplan
    evento.waitUntil(Promise.all([cacheEstatico, cacheInmutable]));
});


//Indicamos que durante el proceso de activación se borren los
//espacios de cache estatico de versiones pasadas
self.addEventListener('activate', evento =>{
    //antes de activar el sw, obten los nombres de los espacios de cache existentes
    const respuesta=caches.keys().then(keys =>{
        //verifica cada nombre de espacios de cache
        keys.forEach(key =>{
            //si el espacio no tiene el nombre actual del cache e incluye la palabra cache
            if(key !== CACHE && key.includes('cache')){
                //borralo, la condición de include cache evitará borrar el espacio dinamico o inmutable
                return caches.delete(key);
            }

            //si el espacio no tiene el nombre actual del cache e incluye la palabra dinamico
            if(key !== CACHE_DINAMICO && key.includes('dinamico')){
                //borralo, la condición de include cache evitará borrar el espacio dinamico o inmutable
                return caches.delete(key);
            }
        });
    });
    evento.waitUntil(respuesta);
});
//Atrapamos las peticiones y las procesamos con alguna estrategia de cache
self.addEventListener('fetch', evento =>{
    
    let respuesta;
    if(evento.request.url.includes('db') || evento.request.method === 'POST'){
        respuesta = manejoMensajes(CACHE_DINAMICO, evento.request);
    } else{
        //Estrategia 2 CACHE WITH NETWORK FALLBACK
        respuesta=caches.match(evento.request)
            .then(res=>{
                //si el archivo existe en cache retornalo
                if (res){
                    actualizaCacheStatico( CACHE, evento.request, APP_SHELL_INMUTABLE );
                    return res;
                } else{
                    //Procesamos la respuesta a la petición localizada en la web
                    return fetch(evento.request)
                        .then(resWeb=>{
                            //el archivo recuperado se almacena en resWeb
                            //se abre nuestro cache
                            return actualizaCacheDinamico( CACHE_DINAMICO, evento.request, resWeb );
                        });
                    }
            })
            .catch(err => {
                //si ocurre un error, en nuestro caso no hay conexión
                if(evento.request.headers.get('accept').includes('text/html')){
                    //si lo que se pide es un archivo html muestra nuestra página offline que esta en cache
                    return caches.match('offline.html');
                }
            });
    }

        evento.respondWith(respuesta);
});

// tareas asíncronas
self.addEventListener('sync', e => {

    console.log('SW: Sync');

    if ( e.tag === 'nuevo-articulo' ) {

        console.log("entró al sync");
        // postear a BD cuando hay conexión
        const respuesta = postearArticulos();
        
        e.waitUntil( respuesta );
    }
});