const inputNombre = document.querySelector('#nombre');
const inputApellido = document.querySelector('#apellido');
const inputEmail = document.querySelector('#email');
const inputCodigo = document.querySelector('#codigo');
const inputFecha = document.querySelector('#fecha');
const inputContrasenia = document.querySelector('#contrasenia');
const inputRecontrasenia = document.querySelector('#recontrasenia');

const button = document.querySelector('#enviar');

button.addEventListener('click', (e) => {
    const nombre = inputNombre.value;
    const apellido = inputApellido.value;
    const email = inputEmail.value;
    const codigo = inputCodigo.value;
    const fecha = inputFecha.value;
    const contrasenia = inputContrasenia.value;
    const recontrasenia = inputRecontrasenia.value

    fetch('/api/v1/docentes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nombre,
            apellido,
            email,
            codigo,
            fecha,
            contrasenia,
            recontrasenia,
        }),
    })
}) 