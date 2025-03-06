
$(document).ready(function () {

    const audioIntro = new Audio('../audio/efectos/intro2.mp3'); // Reemplaza con tu ruta local
    audioIntro.volume = 0.5; // Volumen al 50%
    const audioCampana = new Audio('../audio/efectos/campana.mp3'); // Reemplaza con tu ruta local

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

    document.getElementById("btnInicio").addEventListener("click", function () {

        audioIntro.pause();  // Pausa el audio
        audioIntro.currentTime = 0; // Reinicia el audio al inicio
        const fadeOutDiv = document.getElementById("fadeOut");

        // Activamos la transición de desvanecimiento a blanco
        fadeOutDiv.style.opacity = "1";

        // Espera 1 segundo (1000ms) antes de redirigir
        setTimeout(function () {
            audioCampana.currentTime = 0; // Reinicia el audio si ya se ha tocado
            audioCampana.play();
        }, 50);
        // Espera 1 segundo (1000ms) antes de redirigir
        setTimeout(function () {
            window.location.href = "/principal";
        }, 1500);
    });


});

