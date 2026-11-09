/* ============================================================
   API: llamadas al servidor PHP con mensajes de error claros.
   Antes, cualquier fallo mostraba "No se pudo conectar con el servidor".
   Ahora se distingue: archivo abierto sin servidor, ruta 404,
   error de PHP/MySQL y servidor apagado.
   Uso: const datos = await llamarAPI('../php/login.php', { method: 'POST', body: formData });
   ============================================================ */
(function () {
  function limpiar(texto) {
    return String(texto).replace(/<[^>]*>/g, ' ').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 220);
  }

  window.llamarAPI = async function (url, opciones) {
    if (location.protocol === 'file:') {
      throw new Error('Abriste la página con doble clic (file://), y así PHP no funciona. ' +
        'Ábrela desde tu servidor local, por ejemplo http://localhost/BackendVTV-main/html/login.html');
    }

    let resp;
    try {
      resp = await fetch(url, opciones);
    } catch (e) {
      throw new Error('El servidor no responde. Revisa que Apache y MySQL estén encendidos (XAMPP/WAMP).');
    }

    const texto = await resp.text();

    if (resp.status === 404) {
      throw new Error('No se encontró ' + url.split('?')[0] + ' en el servidor (error 404). ' +
        'La carpeta php/ debe estar junto a html/ y debes entrar por http://localhost/...');
    }

    try {
      return JSON.parse(texto);
    } catch (e) {
      console.error('Respuesta no válida de ' + url + ' (HTTP ' + resp.status + '):\n' + texto);
      const detalle = limpiar(texto);
      throw new Error(detalle
        ? 'PHP devolvió un error en vez de datos: ' + detalle
        : 'El servidor devolvió una respuesta vacía (HTTP ' + resp.status + ').');
    }
  };
})();
