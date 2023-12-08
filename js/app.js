//obtenemos la url del servidor
var url = window.location.href;

//definimos que nuestro sw.js se encuentra en el repositorio
var ubicacionSw = '/sw.js';

if (navigator.serviceWorker) {
    /*Para que nuestro proyecto siga funcionando en localhost 
    como en el servidor realizaremos una validación si la url 
    contiene localhost la ruta es la local del proyecto, de lo contrario
    es la ruta de nuestro repositorio*/
    if (url.includes('localhost')) {
        ubicacionSw = '/sw.js';
    }
    navigator.serviceWorker.register(ubicacionSw);
}

if (navigator.storage && navigator.storage.estimate) {
    const quotas = navigator.storage.estimate()
        .then(quota =>{
            // quota.usage -> Número de bytes usados.
            // quota.quota -> Número máximo de bytes disponibles.
            const percentageUsed = (quota.usage / quota.quota) * 100;
            console.log('Haz usado '+percentageUsed+' de almacenaminto disponible.');
            const remaining = quota.quota - quota.usage;
            console.log('Puedes escribir hasta '+remaining+' más.');
        }).catch(err =>{
            console.log(err);
        });  
}else{
    console.log("No soporta la API de StorageManager");
}

// Función para verificar si estamos en línea o no
function isOnline(){
    //Evaluamos si tenemos conexión
    if(navigator.onLine){
        console.log('online');
        mdtoast('Online.', 
        { 
            interaction: false,
            interactionTimeout: 1500,
            actionText: 'OK!',
            type: mdtoast.SUCCESS 
        });
    }else{
        //En caso de perder o no estar en línea
        console.log('offline');
        
        mdtoast('Offline.', {
            interaction: true,
            actionText: 'OK',
            type: mdtoast.WARNING
        });
    }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);
isOnline();