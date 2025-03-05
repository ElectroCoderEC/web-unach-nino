const audioIntro = new Audio('../audio/efectos/palabrasFondo.mp3'); // Reemplaza con tu ruta local
const audioMicro = new Audio('../audio/efectos/letter.wav'); // Reemplaza con tu ruta local
const audioClose = new Audio('../audio/efectos/close.wav'); // Reemplaza con tu ruta local
const audioError = new Audio('../audio/efectos/error.wav'); // Reemplaza con tu ruta local
const audioBien = new Audio('../audio/efectos/treasure.wav'); // Reemplaza con tu ruta local
const audioCarrot = new Audio("../audio/efectos/carrot.wav"); // Asegúrate de que el archivo "click.mp3" esté en tu proyecto


var siriWave = new SiriWave({
    style: "ios9",
    container: document.getElementById("siri-container"),
    width: 250,
    height: 100,
    autostart: true,
    speed: 0.1,
    amplitude: 3

});



if (typeof audioIntro.loop == 'boolean') {
    audioIntro.loop = true;
}
else {
    audioIntro.addEventListener('ended', function () {
        this.currentTime = 0;
        this.play();
    }, false);
}
audioIntro.play();


function mostrarSVG(svgData) {
    const svgContainer = document.getElementById("svg-gramatica");
    if (svgData && svgData !== "undefined") {
        svgContainer.innerHTML = svgData; // Inserta el SVG generado
    } else {
        svgContainer.innerHTML = `
          <svg width="100%" height="100" xmlns="http://www.w3.org/2000/svg">
              <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="20" fill="gray">
                  Esperando...
              </text>
          </svg>`;
    }
}

let textoAnterior = ""; // Último texto detectado
let svgAnterior = ""; // Último gráfico SVG
let textoFormado = ""; // Oración formada con botones
let respuestaCorrecta = ""; // Respuesta de Vosk
let totalBotones = 0; // Número total de botones
let botonesPresionados = 0; // Contador de botones presionados


function escribirPocoAPoco(texto, elemento, delay) {
    elemento.textContent = ""; // Vaciar el contenido antes de escribir
    let i = 0;


    function escribir() {
        if (i < texto.length) {

            if (i == 0) {
                actualizarEstadoCírculo(true);
            }

            elemento.textContent += texto[i];
            setTimeout(escribir, delay);
            i++;



            if (i == texto.length) {
                actualizarEstadoCírculo(false);
            }
        }
    }

    escribir();
}

function actualizarTexto() {
    fetch("/actualizar_texto")
        .then((response) => response.json())
        .then((data) => {
            if (data.respuesta_vosk !== textoAnterior) {
                textoAnterior = data.respuesta_vosk;

                respuestaCorrecta = data.respuesta_vosk.trim(); // Guardar la respuesta correcta

                let respuestaElemento = document.getElementById("respuesta")
                escribirPocoAPoco(data.respuesta_vosk, respuestaElemento, 80); // 50ms de delay entre letras


                // Borrar el texto generado al inicio de una nueva oración de Vosk
                textoFormado = "";
                document.getElementById("oracion-formada").textContent = "";
                // Solo actualizar los botones cuando haya un nuevo texto de Vosk
                actualizarBotones(data.palabras_clave);
            }
        })
        .catch((error) =>
            console.error("Error al actualizar texto:", error)
        );

    fetch("/analisis_oracion")
        .then((response) => response.json())
        .then((data) => {
            if (
                data.svg_gramatica &&
                data.svg_gramatica !== "undefined" &&
                data.svg_gramatica !== svgAnterior
            ) {
                svgAnterior = data.svg_gramatica;
                mostrarSVG(data.svg_gramatica);
            } else if (
                !data.svg_gramatica ||
                data.svg_gramatica === "undefined"
            ) {
                document.getElementById("svg-gramatica").innerHTML =
                    "<p>Esperando...</p>";
            }
        })
        .catch((error) =>
            console.error("Error al actualizar gráfico:", error)
        );
}


function actualizarBotones(palabrasClave) {
    const botonesContainer = document.getElementById("botones-palabras");
    botonesContainer.innerHTML = ""; // Limpiar botones previos

    detenerAudio();

    // Reiniciar el estado solo cuando se actualizan los botones
    textoFormado = "";
    botonesPresionados = 0;
    totalBotones = palabrasClave.length;

    palabrasClave.forEach((palabra, index) => {
        setTimeout(() => {
            const boton = document.createElement("button");
            boton.textContent = palabra;
            boton.dataset.usado = "false"; // Control para saber si ya fue usado
            boton.classList.add("btn-explosion1"); // Agregar clase de explosión

            boton.onclick = () => {
                agregarPalabra(boton, palabra);
            };

            // Aplicar estilos
            boton.style.cssText = `
                background-color: #28a745; /* Verde */
                color: white;
                border: none;
                border-radius: 10px;
                padding: 10px 10px;
                margin: 5px;
                font-size: 16px;
                cursor: pointer;
                transition: transform 0.2s ease, box-shadow 0.3s ease;
                opacity: 0;
                transform: scale(0.5);
                border: 5px solid #8b5e3b; /* Borde marrón simulando la madera */

                font-size: 18px;
                font-weight: bold;
  
  
            `;

            // Agregar efecto hover
            boton.onmouseover = () => {
                boton.style.transform = "scale(1.2)";
                boton.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
            };
            boton.onmouseleave = () => {
                boton.style.transform = "scale(1)";
                boton.style.boxShadow = "none";
            };

            botonesContainer.appendChild(boton);

            // Activar animación de aparición
            setTimeout(() => {
                boton.style.opacity = "1";
                boton.style.transform = "scale(1)";
            }, 50);
        }, index * 500); // Cada botón aparece con un retraso progresivo
    });
}



// Función para agregar palabra y manejar botones
function agregarPalabra(boton, palabra) {
    // Evitar que el mismo botón se use más de una vez
    if (boton.dataset.usado === "true") {

        audioError.play()

    }

    else {

        audioCarrot.play();

        // Marcar el botón como usado
        boton.dataset.usado = "true";
        // boton.disabled = true; // Desactivar el botón
        boton.classList.add("boton-desactivado"); // Añadir estilo de botón desactivado

        // Agregar la palabra al texto generado
        textoFormado += (textoFormado ? " " : "") + palabra;
        botonesPresionados++; // Aumentar el contador de botones presionados

        // Actualizar el texto generado en la pantalla
        document.getElementById("oracion-formada").textContent = textoFormado;

        // Verificar si todos los botones han sido presionados
        if (botonesPresionados === totalBotones) {
            // Verificar el texto solo cuando todos los botones hayan sido presionados
            setTimeout(verificarOracion, 100); // Esperar medio segundo antes de verificar
        }

    }


}

// Función para verificar si la oración generada es correcta
function verificarOracion() {
    // Verificar si la oración generada es correcta
    if (textoFormado.trim() === respuestaCorrecta) {

        audioBien.currentTime = 0; // Reinicia el audio al inicio
        audioBien.play()

        // alert("✅ ¡Oración correcta!");

        Swal.fire({
            title: "¡La oración es correcta!",

            icon: "success",


        });



    } else {

        audioError.currentTime = 0; // Reinicia el audio al inicio
        audioError.play()

        // alert("❌ Oración incorrecta. Inténtalo de nuevo.");
        reiniciarIntento(); // Reiniciar los botones y el texto

        Swal.fire({
            title: 'La oración es incorrecta. Inténtalo de nuevo.',

            icon: 'error',
            confirmButtonText: 'OK',
            position: 'center',
        })





    }
}

// Función para reiniciar el intento
function reiniciarIntento() {
    textoFormado = ""; // Vaciar la oración generada
    botonesPresionados = 0; // Reiniciar el contador de botones
    document.getElementById("oracion-formada").textContent = "..."; // Restablecer la visualización

    // Reactivar los botones y restablecer su estado
    document
        .querySelectorAll("#botones-palabras button")
        .forEach((boton) => {
            boton.disabled = false;
            boton.classList.remove("boton-desactivado"); // Eliminar estilo de botón desactivado
            boton.dataset.usado = "false"; // Resetear el estado de 'usado'
        });
}

// Inicializar el total de botones
// Esto debe configurarse dependiendo del número total de botones
totalBotones = document.querySelectorAll(
    "#botones-palabras button"
).length;


function actualizarEstadoCírculo(enReproduccion) {
    //console.log("Estado recibido:", enReproduccion); // <-- Debug aquí
    const circle = document.getElementById("circle");
    if (enReproduccion) {
        console.log("Mostrando círculo");
        circle.classList.remove("invisible");



    } else {
        console.log("Ocultando círculo");
        circle.classList.add("invisible");

        const img1 = document.getElementById("img1");
        const img2 = document.getElementById("img2");
        img1.classList.remove("invisible");
        img2.classList.remove("invisible");

    }
}

// Llamar periódicamente a la API para verificar el estado del audio
// Función para enviar la solicitud al servidor y activar el procesamiento del audio
function activarAudio() {

    audioMicro.currentTime = 0;
    audioMicro.play();

    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    img1.classList.add("invisible");
    img2.classList.add("invisible");



    $.ajax({
        url: '/activar_audio',
        method: 'POST',
        contentType: 'application/json',
        data: '',
        success: function (data) {
            if (data.status === "activo") {
                // Ocultar el botón de Hablar y mostrar el botón de Detener
                document.getElementById("start_audio").style.display = "none";
                document.getElementById("stop_audio").style.display =
                    "inline-block";

                document.getElementById("txtEstado").textContent = "Click para Detener"


            }
        }
    });



}



document.getElementById("btnAtras").addEventListener("click", function () {

    audioClose.currentTime = 0; // Reinicia el audio al inicio
    audioClose.play()
    // Espera 1 segundo (1000ms) antes de redirigir
    setTimeout(function () {
        window.location.href = "/principal";
    }, 500);
});


// Función para detener la grabación de audio
function detenerAudio() {

    audioMicro.currentTime = 0;
    audioMicro.play();

    document.getElementById("txtEstado").textContent = "Click para Hablar"


    fetch("/detener_audio", {
        method: "POST",
    })
        .then((response) => response.json())
        .then((data) => {


            // Mostrar de nuevo el botón de Hablar y ocultar el de Detener
            document.getElementById("start_audio").style.display =
                "inline-block";
            document.getElementById("stop_audio").style.display = "none";
        })
        .catch((error) =>
            console.error("Error al detener el audio:", error)
        );
}




// Conectar al servidor Socket.IO
const socket = io.connect('http://' + document.domain + ':' + location.port);
// Escuchar los mensajes del servidor
socket.on('variables', function (data) {
    // Separar datos del mensaje

    if (data.respuesta_vosk !== textoAnterior) {

        textoAnterior = data.respuesta_vosk;
        console.log(textoAnterior);

        let respuestaElemento = document.getElementById("respuesta")
        escribirPocoAPoco(textoAnterior, respuestaElemento, 100); // 50ms de delay entre letras

        respuestaCorrecta = data.respuesta_vosk.trim(); // Guardar la respuesta correcta
        // Borrar el texto generado al inicio de una nueva oración de Vosk
        textoFormado = "";
        document.getElementById("oracion-formada").textContent = "...";
        // Solo actualizar los botones cuando haya un nuevo texto de Vosk
        actualizarBotones(data.palabras_clave);
    }


    if (
        data.svg_gramatica &&
        data.svg_gramatica !== "undefined" &&
        data.svg_gramatica !== svgAnterior
    ) {
        svgAnterior = data.svg_gramatica;
        mostrarSVG(data.svg_gramatica);
    } else if (
        !data.svg_gramatica ||
        data.svg_gramatica === "undefined"
    ) {
        document.getElementById("svg-gramatica").innerHTML =
            "<p>Esperando...</p>";
    }

});

