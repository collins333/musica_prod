document.addEventListener("DOMContentLoaded", () => {
  const botones = document.querySelectorAll('.delete');
  
  botones.forEach((boton) => {
    boton.addEventListener('click', (e) => {
      const mensaje = boton.dataset.mensaje || '¿Estás seguro de querer eliminar este elemento?';

      const respuesta = confirm(mensaje);

      if(!respuesta) {
        e.preventDefault();
      }
    });
  });
});