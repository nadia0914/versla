//Atrapamos las peticiones fech que llegan a nuestro sitio
self.addEventListener('fetch', evento =>{
//Mensaje de texto que enviaremos si no hay conexión a internet
const respuestaOffLine = new Response("Este sitio requiere conexión a internet.");
/*Atrapamos en respuesta el resultado de las peticiones fetch realizadas por la
página
actualmente el nuestra aplicación se encuentra en modo online por lo que para
poder
visualizarla es necesario tener internet.
Si no tenemos internet, las respuestas a las peticiones no se procesan y por lo
tanto
entraría al catch el cual retorna el mensaje contenido en respuestaOffline*/
const respuesta = fetch(evento.request)
.catch(()=> respuestaOffLine);
//Retornamos la respuesta a las peticiones fetch.
evento.respondWith(respuesta);
});