const audioError = new Audio('audio/efectos/error.wav'); // Reemplaza con tu ruta local
const audioItem = new Audio("audio/efectos/item.wav"); // Asegúrate de que el archivo "click.mp3" esté en tu proyecto
const audioIntro = new Audio('audio/efectos/observatory.mp3'); // Reemplaza con tu ruta local
const audioClose = new Audio('../audio/efectos/close.wav'); // Reemplaza con tu ruta local
const audioBorrar = new Audio('../audio/efectos/letter.wav'); // Reemplaza con tu ruta local
const audioClick = new Audio('../audio/efectos/campana.mp3'); // Reemplaza con tu ruta local
const audioCursor = new Audio('../audio/efectos/cursor_menu.wav'); // Reemplaza con tu ruta local
const audioDesplazar = new Audio('../audio/efectos/cursor.wav'); // Reemplaza con tu ruta local

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


document.addEventListener("DOMContentLoaded", function () {
    const categorias = document.querySelectorAll(".sidebar button");
    const container = document.querySelector(".button-container");
    const textarea = document.getElementById("oracion-formada");
    const speakButton = document.querySelector(".action-buttons button");

    // 📌 Delegación de eventos para los botones de palabras
    container.addEventListener("click", function (event) {
        if (event.target.tagName === "BUTTON") { // Verifica si el clic fue en un botón
            if (textarea.textContent == "-> Texto aquí... <-") {
                textarea.textContent = "";
            }

            const word = event.target.textContent.trim();
            agregarPalabra(event.target, word, textarea);

            document.getElementById("bloqueBorrar").classList.remove("invisible");
            document.getElementById("bloqueHablar").classList.remove("invisible");
            document.getElementById("bloqueOracion").classList.remove("invisible");
        }
    });


    // Inicializar el atributo data-usado en cada botón
    categorias.forEach(boton => {
        boton.dataset.usado = "false"; // Inicializar como no usado
    });

    categorias.forEach(boton => {
        boton.addEventListener("click", function (event) {
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
    const textarea = document.getElementById("oracion-formada");

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
        buttonContainer.scrollTop = 0;
    }


    audioCursor.currentTime = 0;
    audioCursor.play();


    document.getElementById("cajaInicial").classList.add("remover");
    const textarea = document.getElementById("oracion-formada");
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

