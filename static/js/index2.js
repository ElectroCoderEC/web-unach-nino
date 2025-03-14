const audioError = new Audio('audio/efectos/error.wav'); // Reemplaza con tu ruta local
const audioItem = new Audio("audio/efectos/item.wav"); // Asegúrate de que el archivo "click.mp3" esté en tu proyecto
const audioIntro = new Audio('audio/efectos/observatory.mp3'); // Reemplaza con tu ruta local
const audioClose = new Audio('../audio/efectos/close.wav'); // Reemplaza con tu ruta local
const audioBorrar = new Audio('../audio/efectos/letter.wav'); // Reemplaza con tu ruta local
const audioClick = new Audio('../audio/efectos/campana.mp3'); // Reemplaza con tu ruta local
const audioCursor = new Audio('../audio/efectos/cursor_menu.wav'); // Reemplaza con tu ruta local
const audioDesplazar = new Audio('../audio/efectos/cursor.wav'); // Reemplaza con tu ruta local
const audioMicro = new Audio('../audio/efectos/letter.wav'); // Reemplaza con tu ruta local
const audioCarrot = new Audio("../audio/efectos/carrot.wav"); // Asegúrate de que el archivo "click.mp3" esté en tu proyecto
const audioBien = new Audio('../audio/efectos/treasure.wav'); // Reemplaza con tu ruta local


var tipoCategoria = "";

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



document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.querySelector('.sidebar');

    const scrollUpButton = document.getElementById('scrollUpButton');
    const scrollDownButton = document.getElementById('scrollDownButton');

    // Función para verificar si hay scroll y mostrar/ocultar los botones
    function checkScroll() {
        if (sidebar.scrollHeight > sidebar.clientHeight) {
            // Hay scroll, mostrar los botones
            scrollUpButton.style.display = 'block';
            scrollDownButton.style.display = 'block';
        } else {
            // No hay scroll, ocultar los botones
            scrollUpButton.style.display = 'none';
            scrollDownButton.style.display = 'none';
        }
    }

    // Desplazar hacia arriba
    scrollUpButton.addEventListener('click', function () {
        sidebar.scrollBy({ top: -100, behavior: 'smooth' }); // Ajusta el valor de desplazamiento
        audioDesplazar.currentTime = 0; // Reinicia el audio al inicio
        audioDesplazar.play()
    });

    // Desplazar hacia abajo
    scrollDownButton.addEventListener('click', function () {
        sidebar.scrollBy({ top: 100, behavior: 'smooth' }); // Ajusta el valor de desplazamiento
        audioDesplazar.currentTime = 0; // Reinicia el audio al inicio
        audioDesplazar.play()
    });

    // Verificar el scroll al cargar la página y cuando cambie el tamaño de la ventana
    checkScroll();
    window.addEventListener('resize', checkScroll);
});


const textarea = document.getElementById("oracion-formada");
const bloqueOracion = document.getElementById("bloqueOracion");


document.addEventListener("DOMContentLoaded", function () {
    const categorias = document.querySelectorAll(".sidebar button");
    const container = document.querySelector(".button-container");
    const speakButton = document.querySelector(".action-buttons button");




    // 📌 Delegación de eventos para los botones de palabras
    container.addEventListener("click", function (event) {

        document.getElementById("bloqueOracion2").innerHTML = "";
        document.getElementById("bloqueOracion2").classList.add("remover");
        document.getElementById("frase").classList.add("invisible");


        if (event.target.tagName === "BUTTON") { // Verifica si el clic fue en un botón
            if (textarea.textContent == "-> Texto aquí... <-") {
                textarea.textContent = "";
            }

            const word = event.target.textContent.trim();
            agregarPalabra(event.target, word, textarea);

            document.getElementById("bloqueBorrar").classList.remove("invisible");
            document.getElementById("bloqueHablar").classList.remove("invisible");
            bloqueOracion.classList.remove("invisible");
        }
    });


    // Inicializar el atributo data-usado en cada botón
    categorias.forEach(boton => {
        boton.dataset.usado = "false"; // Inicializar como no usado
    });

    categorias.forEach(boton => {
        boton.addEventListener("click", function (event) {

            document.getElementById("bloqueOracion2").innerHTML = "";
            document.getElementById("bloqueOracion2").classList.add("remover");
            document.getElementById("frase").classList.add("invisible");

            // document.getElementById("bloqueOracion").classList.remove("invisible");

            const tipoCategoria = this.value;

            // Cambiar la imagen de fondo del botón clickeado
            cambiarImagenBoton(this);

            // Restablecer la imagen de fondo de los demás botones
            categorias.forEach(otroBoton => {
                if (otroBoton !== this) {
                    resetearImagenBoton(otroBoton);
                }
            });

            // Llamar a la función para consultar datos
            fcnConsultar(tipoCategoria, container);
        });
    });


    speakButton.addEventListener("click", function () {

        audioClick.currentTime = 0; // Reinicia el audio al inicio
        audioClick.play()

        const text = textarea.textContent.trim();
        if (text) {
            fetch(`/reproducir_audio?texto=${encodeURIComponent(text)}`)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Estado:", data.status);
                    if (data.status === "finalizado") {
                        textarea.textContent = "-> Texto aquí... <-"; // Borra el texto cuando el audio termina
                        console.log("Texto borrado.");
                        resetBotones();
                    }
                })
                .catch((error) => console.error("Error:", error));
        } else {
            alert("El texto está vacío.");
        }
    });
    // Verificar el scroll al cargar la página y cuando cambie el tamaño de la ventana
});




// 📌 Función que actualiza los botones dinámicos cuando cambian
function resetBotones() {
    const buttons = document.querySelectorAll(".button-container button");

    buttons.forEach((button) => {
        button.dataset.usado = "false"; // Reinicia el estado
        button.classList.remove("boton-desactivado"); // Quita clases antiguas
        button.classList.add("btn-breath"); // Añade clases nuevas
    });

    document.getElementById("bloqueBorrar").classList.add("invisible");
    document.getElementById("bloqueHablar").classList.add("invisible");
}


// Función para agregar palabra y manejar botones
function agregarPalabra(boton, word, textarea) {
    console.log(word);

    // Evitar que el mismo botón se use más de una vez
    if (boton.dataset.usado === "true") {
        audioError.currentTime = 0;
        audioError.play();
    } else {
        boton.dataset.usado = "true";
        boton.classList.add("boton-desactivado"); // Añadir estilo de botón desactivado
        boton.classList.remove("btn-breath"); // Añadir estilo de botón desactivado

        audioItem.currentTime = 0;
        audioItem.play();

        // Crear el span para la palabra
        const nuevaPalabra = document.createElement("span");
        nuevaPalabra.textContent = word;

        // Aplicar la animación de explosión
        nuevaPalabra.classList.add("btn-explosion");
        fcnIncrementarContador(nuevaPalabra.textContent.toLowerCase());

        // Añadir la palabra al div
        if (textarea.textContent.length > 0) {
            textarea.appendChild(document.createTextNode(" ")); // Espacio entre palabras
            textarea.appendChild(nuevaPalabra);
        } else {
            textarea.appendChild(nuevaPalabra);
        }
    }
}


// Función para cambiar la imagen de fondo del botón
function cambiarImagenBoton(boton) {
    if (boton.dataset.usado === "false") {
        boton.style.background = "url('../images/btnCategoria2-activo.png') no-repeat center center";
        boton.style.backgroundSize = "100% 100%"; // Añadir background-size
        boton.dataset.usado = "true"; // Marcar como usado
    } else {
        boton.style.background = "url('../images/btnCategoria2.png') no-repeat center center";
        boton.style.backgroundSize = "100% 100%"; // Añadir background-size
        boton.dataset.usado = "false"; // Marcar como no usado
    }
}

// Función para restablecer la imagen de fondo del botón
function resetearImagenBoton(boton) {
    boton.style.background = "url('../images/btnCategoria2.png') no-repeat center center";
    boton.style.backgroundSize = "100% 100%"; // Añadir background-size
    boton.dataset.usado = "false"; // Marcar como no usado
}

function fcnBorrar() {

    audioBorrar.currentTime = 0; // Reinicia el audio al inicio
    audioBorrar.play()

    const buttons = document.querySelectorAll(".button-container button");

    textarea.textContent = "-> Texto aquí... <-"; // Borra el texto cuando el audio termina
    console.log("Texto borrado.");

    buttons.forEach((button) => {
        button.dataset.usado = "false"; // Control para saber si ya fue usado

        button.classList.remove("boton-desactivado"); // Añadir estilo de botón desactivado
        button.classList.add("btn-breath"); // Añadir estilo de botón desactivado
    });

    document.getElementById("bloqueBorrar").classList.add("invisible");
    document.getElementById("bloqueHablar").classList.add("invisible");

}


function fcnAtras() {
    audioClose.currentTime = 0; // Reinicia el audio al inicio
    audioClose.play()
    // Espera 1 segundo (1000ms) antes de redirigir
    setTimeout(function () {
        window.location.href = "/principal";
    }, 500);
}






function fcnIncrementarContador(palabra) {
    $.ajax({
        url: "/incrementar_contador", // Ruta que incrementa el contador
        type: "POST",
        data: JSON.stringify({
            palabra: palabra,
        }),
        contentType: "application/json",
        success: function (response) {
            console.log(response.message);

        },
        error: function (error) {
            console.error("Error al actualizar el contador", error);
        }
    });
}


function fcnConsultar(strCategoria, container) {


    const scrollUpButton2 = document.getElementById('scrollUpButton-Palabras');
    const scrollDownButton2 = document.getElementById('scrollDownButton-Palabras');


    // Desplazar hacia arriba
    scrollUpButton2.addEventListener('click', function () {
        container.scrollBy({ top: -100, behavior: 'smooth' }); // Ajusta el valor de desplazamiento
        audioDesplazar.currentTime = 0; // Reinicia el audio al inicio
        audioDesplazar.play()
    });

    // Desplazar hacia abajo
    scrollDownButton2.addEventListener('click', function () {
        container.scrollBy({ top: 100, behavior: 'smooth' }); // Ajusta el valor de desplazamiento
        audioDesplazar.currentTime = 0; // Reinicia el audio al inicio
        audioDesplazar.play()
    });



    // Función para verificar si hay scroll y mostrar/ocultar los botones
    function checkScroll() {
        if (container.scrollHeight > container.clientHeight) {
            // Hay scroll, mostrar los botones
            scrollUpButton2.style.display = 'block';
            scrollDownButton2.style.display = 'block';
        } else {
            // No hay scroll, ocultar los botones
            scrollUpButton2.style.display = 'none';
            scrollDownButton2.style.display = 'none';
        }

        // Asegurar que el scroll esté en la parte superior
        container.scrollTop = 0;
    }


    audioCursor.currentTime = 0;
    audioCursor.play();


    document.getElementById("cajaInicial").classList.add("remover");
    textarea.textContent = "-> Texto aquí... <-"; // Borra el texto cuando el audio termina
    resetBotones();

    $.ajax({
        url: "/consultar?id_categoria=" + encodeURIComponent(strCategoria),
        type: "GET",
        success: function (response) {
            var container = $(".button-container");
            container.empty(); // Limpiar el contenido anterior

            if (response.data.length > 0) {
                response.data.forEach(function (palabra, index) {
                    var button = $("<button>")
                        .addClass("boton-activado btn-breath")
                        .attr("id", "btn-" + (index + 1))
                        .text(palabra.Palabra)
                        .css("color", "#5A4423");
                    container.append(button);
                });

                checkScroll()

            } else {
                container.append("<p>No hay palabras para mostrar.</p>");
            }
        }
    });
}




function activarAudio() {

    //  resetBotones();

    audioIntro.volume = 0.0;
    audioMicro.currentTime = 0;
    audioMicro.play();

    document.getElementById("frase").classList.remove("invisible");


    textoAnterior = "";


    $.ajax({
        url: '/activar_audio',
        method: 'POST',
        contentType: 'application/json',
        data: '',
        success: function (data) {
            if (data.status === "activo") {
                // Ocultar el botón de Hablar y mostrar el botón de Detener
                document.getElementById("start_IA").style.display = "none";
                document.getElementById("stop_IA").style.display =
                    "inline-block";

                console.log(data.status)

                // Limpiar completamente el contenedor de botones
                document.getElementById("bloqueOracion2").innerHTML = `
                    <div class="col-12">
                        <div class="mi-boton2" id="oracion-formada2">- Texto aquí... -</div>
                    </div>
                `;

                document.getElementById("oracion-formada2").textContent = "- Texto aquí... -"; // Restablecer la visualización

                // document.getElementById("oracion-formada").textContent = "";

                // document.getElementById("bloqueOracion2").classList.remove("remover");
                // document.getElementById("bloqueOracion2").classList.add("mostrar");

                document.getElementById("bloqueOracion2").innerHTML = "";
                document.getElementById("bloqueOracion2").classList.remove("remover");
                document.getElementById("bloqueOracion").classList.add("invisible");


            }
        }
    });



}


// Función para detener la grabación de audio
function detenerAudio() {

    audioIntro.volume = 1;

    audioMicro.currentTime = 0;
    audioMicro.play();



    fetch("/detener_audio", {
        method: "POST",
    })
        .then((response) => response.json())
        .then((data) => {
            // Mostrar de nuevo el botón de Hablar y ocultar el de Detener
            document.getElementById("start_IA").style.display =
                "inline-block";
            document.getElementById("stop_IA").style.display = "none";
        })
        .catch((error) =>
            console.error("Error al detener el audio:", error)
        );
}


let textoAnterior = ""; // Último texto detectado
let svgAnterior = ""; // Último gráfico SVG
let textoFormado = ""; // Oración formada con botones
let respuestaCorrecta = ""; // Respuesta de Vosk
let totalBotones = 0; // Número total de botones
let botonesPresionados = 0; // Contador de botones presionados

// Conectar al servidor Socket.IO
const socket = io.connect('http://' + document.domain + ':' + location.port);
// Escuchar los mensajes del servidor
socket.on('variables', function (data) {
    // Separar datos del mensaje

    if (data.respuesta_vosk !== textoAnterior) {

        textoAnterior = data.respuesta_vosk;
        console.log("OLLAMA: ", textoAnterior);

        respuestaCorrecta = data.respuesta_vosk.trim(); // Guardar la respuesta correcta
        // Solo actualizar los botones cuando haya un nuevo texto de Vosk
        actualizarBotones(data.palabras_clave);

        console.log("PALABRAS CLAVE: ", data.palabras_clave);
    }

});



function actualizarBotones(palabrasClave) {

    const botonesContainer2 = document.getElementById("bloqueOracion2")
    botonesContainer2.innerHTML = ""; // Limpiar botones previos

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
                agregarPalabra2(boton, palabra);
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

            botonesContainer2.appendChild(boton);

            // Activar animación de aparición
            setTimeout(() => {
                boton.style.opacity = "1";
                boton.style.transform = "scale(1)";
            }, 50);
        }, index * 500); // Cada botón aparece con un retraso progresivo
    });
}




// Función para agregar palabra y manejar botones
function agregarPalabra2(boton, palabra) {
    // Evitar que el mismo botón se use más de una vez
    if (boton.dataset.usado === "true") {

        audioError.play()

    }

    else {

        audioCarrot.play();

        // Marcar el botón como usado
        boton.dataset.usado = "true";
        // boton.disabled = true; // Desactivar el botón
        boton.classList.add("boton-desactivado2"); // Añadir estilo de botón desactivado

        // Agregar la palabra al texto generado
        textoFormado += (textoFormado ? " " : "") + palabra;
        botonesPresionados++; // Aumentar el contador de botones presionados

        // Actualizar el texto generado en la pantalla
        document.getElementById("frase").textContent = textoFormado;

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
            confirmButtonText: "OK",
        }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                document.getElementById("frase").textContent = "..."; // Restablecer la visualización
                document.getElementById("frase").classList.add("invisible");
                //document.getElementById("bloqueOracion").classList.add("invisible");
                textoAnterior = "";

                resetBotones();

                document.getElementById("bloqueOracion2").innerHTML = "";
                document.getElementById("bloqueOracion2").classList.add("remover");
                document.getElementById("bloqueOracion").classList.remove("invisible");


            }
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
    document.getElementById("frase").textContent = "..."; // Restablecer la visualización

    // Reactivar los botones y restablecer su estado
    document
        .querySelectorAll("#bloqueOracion2 button")
        .forEach((boton) => {
            boton.disabled = false;
            boton.classList.remove("boton-desactivado2"); // Eliminar estilo de botón desactivado
            boton.dataset.usado = "false"; // Resetear el estado de 'usado'
        });
}

