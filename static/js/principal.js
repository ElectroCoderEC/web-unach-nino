$(document).ready(function () {

    document.getElementById("btn1").addEventListener("click", function (event) {
        event.preventDefault(); // Evita la redirección instantánea
        audioIntro.pause();  // Pausa el audio
        audioIntro.currentTime = 0; // Reinicia el audio al inicio
        // Espera 1 segundo (1000ms) antes de redirigir
        setTimeout(function () {
            audioClick.currentTime = 0;
            audioClick.play();
        }, 50);
        // Agrega la animación a todo el cuerpo
        document.body.classList.add("animar-salida");

        // Espera a que termine la animación antes de redirigir
        setTimeout(() => {
            window.location.href = "/index"; // Cambia la URL de destino
        }, 1000); // Tiempo en ms (1s debe coincidir con la animación CSS)
    });


    document.getElementById("btn2").addEventListener("click", function (event) {
        event.preventDefault(); // Evita la redirección instantánea
        audioIntro.pause();  // Pausa el audio
        audioIntro.currentTime = 0; // Reinicia el audio al inicio
        // Espera 1 segundo (1000ms) antes de redirigir
        setTimeout(function () {
            audioClick.currentTime = 0;
            audioClick.play();
        }, 50);
        // Agrega la animación a todo el cuerpo
        document.body.classList.add("animar-salida");

        // Espera a que termine la animación antes de redirigir
        setTimeout(() => {
            window.location.href = "/pagina3"; // Cambia la URL de destino
        }, 1000); // Tiempo en ms (1s debe coincidir con la animación CSS)
    });

    // Espera 1 segundo (1000ms) antes de redirigir
    setTimeout(function () {

        document.getElementById("btn1").classList.remove("btn-explosion1");
        document.getElementById("btn2").classList.remove("btn-explosion2");
        //  document.getElementById("btn3").classList.remove("btn-explosion3");

        document.getElementById("btn1").classList.add("btn-salto");
        document.getElementById("btn2").classList.add("btn-salto");
        //  document.getElementById("btn3").classList.add("btn-salto");
    }, 2000);


    const audioClick = new Audio('../audio/efectos/campana.mp3'); // Reemplaza con tu ruta local
    const audioIntro = new Audio('../audio/efectos/galaxy.mp3'); // Reemplaza con tu ruta local

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

});
