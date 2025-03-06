document.addEventListener('DOMContentLoaded', function () {
    const audioFamily = new Audio('../audio/efectos/family.mp3'); // Reemplaza con tu ruta local

    // Restaurar el estado del audio
    restoreAudioState(audioFamily);

    // Configurar el loop del audio
    if (typeof audioFamily.loop == 'boolean') {
        audioFamily.loop = true;
    } else {
        audioFamily.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
    }

    // Reproducir el audio la primera vez que se carga la página
    const isFirstLoad = !sessionStorage.getItem('audioFamilyCurrentTime');
    if (isFirstLoad) {
        audioFamily.play(); // Reproducir el audio por primera vez
    }

    // Guardar el estado del audio antes de cambiar de página
    window.addEventListener('beforeunload', function () {
        saveAudioState(audioFamily);
    });
});

// Guardar el estado del audio
function saveAudioState(audio) {
    sessionStorage.setItem('audioFamilyCurrentTime', audio.currentTime);
    sessionStorage.setItem('audioFamilyIsPlaying', !audio.paused);
}

// Restaurar el estado del audio
function restoreAudioState(audio) {
    const savedTime = sessionStorage.getItem('audioFamilyCurrentTime');
    const isPlaying = sessionStorage.getItem('audioFamilyIsPlaying') === 'true';

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime); // Restaurar el tiempo
    }

    if (isPlaying) {
        audio.play(); // Continuar reproducción si estaba reproduciéndose
    }
}


$(document).ready(function () {

    const audioClose = new Audio('../audio/efectos/close.wav'); // Reemplaza con tu ruta local
    const audioError = new Audio('../audio/efectos/error_voz.mp3'); // Reemplaza con tu ruta local
    const audioSelect = new Audio('../audio/efectos/select.wav'); // Reemplaza con tu ruta local
    const audioAdd = new Audio('../audio/efectos/addCategoria.wav'); // Reemplaza con tu ruta local
    const audioEdit = new Audio('../audio/efectos/editCategoria.wav'); // Reemplaza con tu ruta local
    const audioBorrar = new Audio('../audio/efectos/letter.wav'); // Reemplaza con tu ruta local
    const audioDesplazar = new Audio('../audio/efectos/cursor.wav'); // Reemplaza con tu ruta local



    // Initialize DataTable
    const table = $('#usersTable').DataTable({
        pageLength: 10,  // Set pagination to 10 rows
        lengthChange: false,  // Disable changing number of rows
        language: {
            // Spanish translations for DataTables
            sProcessing: "Procesando...",
            sLengthMenu: "Mostrar _MENU_ registros",
            sZeroRecords: "No se encontraron resultados",
            sEmptyTable: "Ningún dato disponible en esta tabla",
            sInfo: "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
            sInfoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
            sInfoFiltered: "(filtrado de un total de _MAX_ registros)",
            sInfoPostFix: "",
            sSearch: "Buscar:",
            sUrl: "",
            sInfoThousands: ",",
            sLoadingRecords: "Cargando...",
            oPaginate: {
                sFirst: "Primero",
                sLast: "Último",
                sNext: "Siguiente",
                sPrevious: "Anterior"
            },
            oAria: {
                sSortAscending: ": Activar para ordenar la columna de manera ascendente",
                sSortDescending: ": Activar para ordenar la columna de manera descendente"
            }
        }
    });



    // Detectar cuando el modal se abre
    $('#addModal').on('show.bs.modal', function () {
        console.log("El modal se ha abierto");
        audioSelect.currentTime = 0;
        audioSelect.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se abra
    });

    // Detectar cuando el modal se cierra
    $('#addModal').on('hide.bs.modal', function () {
        console.log("El modal se ha cerrado");
        audioClose.currentTime = 0;
        audioClose.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se cierre
    });


    // Detectar cuando el modal se abre
    $('#editModal').on('show.bs.modal', function () {
        audioSelect.currentTime = 0;
        audioSelect.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se abra
    });

    // Detectar cuando el modal se abre
    $('#editModal').on('hide.bs.modal', function () {
        audioClose.currentTime = 0;
        audioClose.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se abra
    });


    // Edit User Button Handler
    $('#btnAtras').on('click', function () {
        audioClose.currentTime = 0; // Reinicia el audio al inicio
        audioClose.play()
        // Espera 1 segundo (1000ms) antes de redirigir
        setTimeout(function () {
            window.location.href = "/principal";
        }, 500);
    });



    // Edit User Button Handler
    $('#usersTable').on('click', '.edit-Categoria', function () {

        let idCategoria = $(this).attr("idCategoria");

        $.ajax({
            url: '/get_categoria',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ id: idCategoria }),
            success: function (response) {
                $("#editarCategoria").val(response.info['Categoria']);
                $("#id").val(response.info['ID_Categoria']);
            },
            error: function (xhr, status, error) {
                Swal.fire(
                    'Error',
                    'Hubo un problema al solicitar la información',
                    'error'
                );
            }
        });
    });




    document.getElementById('categoriaEditForm').addEventListener('submit', function (event) {
        event.preventDefault();
        $('#editModal').modal('hide'); // Cierra el modal

        var formData = new FormData(this);
        fetch('/submitEditCategoria', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {

                    audioEdit.currentTime = 0
                    audioEdit.volume = 0.5
                    audioEdit.play();

                    Swal.fire({
                        title: 'LISTO!',
                        text: '¡La palabra ha sido modificada correctamente!',
                        icon: 'success',


                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "/categoria"; // Redirigir a la lista de usuarios
                        }
                    });
                } else {
                    audioError.currentTime = 0; // Reinicia el sonido
                    audioError.play(); // Reproduce el sonido


                    Swal.fire({
                        title: 'Error!',
                        text: 'Ocurrió un error al editarr los datos: ' + data.message,
                        icon: 'error',

                    });
                }
            })
            .catch(error => {

                audioError.currentTime = 0; // Reinicia el sonido
                audioError.play(); // Reproduce el sonido
                Swal.fire({
                    title: 'Error!',
                    text: 'Ocurrió un error inesperado al editar.',
                    icon: 'error',

                });
            });
    });





    // Delete User Button Handler
    $('#usersTable').on('click', '.delete-Categoria', function () {
        let idcategoria = $(this).attr("idCategoria");

        audioDesplazar.currentTime = 0;
        audioDesplazar.play();

        if (confirm(`¿Estás seguro de eliminar la categoría y todas las palabras asociados a ella"?`)) {
            $.ajax({
                url: "/eliminar_categoria",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ idcategoria: idcategoria }),
                success: function (response) {
                    if (response.status) {

                        audioBorrar.currentTime = 0
                        audioBorrar.play()
                        alert("Palabra eliminada correctamente");
                        location.reload(); // Recargar la página para reflejar cambios
                    } else {
                        alert("Error al eliminar la palabra: " + response.error);
                    }
                },
                error: function () {
                    alert("Error en la solicitud al servidor");
                }
            });
        }
    });



    document.getElementById('categoriaForm').addEventListener('submit', function (event) {

        event.preventDefault();


        $('#addModal').modal('hide'); // Cierra el modal

        var formData = new FormData(this);

        fetch('/registrar_categoria', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {

                if (data.success === true) {

                    audioAdd.currentTime = 0
                    audioAdd.volume = 0.5
                    audioAdd.play();


                    Swal.fire({
                        title: 'EXCELENTE!',
                        text: data.message,
                        icon: 'success',


                    }).then((result) => {
                        if (result.isConfirmed) {

                            window.location.href = "/categoria"; // Redirigir a la lista de usuarios
                        }
                    });
                } else {

                    audioError.currentTime = 0; // Reinicia el sonido
                    audioError.play(); // Reproduce el sonido


                    Swal.fire({
                        title: 'ERROR',
                        text: data.message,
                        icon: 'error',

                    });
                }
            })
            .catch(error => {

                audioError.currentTime = 0; // Reinicia el sonido
                audioError.play(); // Reproduce el sonido


                Swal.fire({
                    title: 'Error!',
                    text: 'Ocurrió un error inesperado al registrar',
                    icon: 'error',


                });
            });
    });





    // Sidebar Toggle
    const $sidebar = $('#sidebarMenu');
    const $mainContent = $('.main-content');
    const $sidebarToggle = $('#sidebarToggle');

    var toogleSide = false;

    $sidebarToggle.on('click', function () {

        toogleSide = false;
        $sidebar.toggleClass('show');



    });

    // Handle window resize
    function handleResponsiveness() {
        if ($(window).width() >= 768) {
            // Desktop: ensure sidebar is visible
            $sidebar.removeClass('show');
        } else {
            // Mobile: reset sidebar
            $sidebar.removeClass('show');
        }
    }

    // Check responsiveness on load and resize
    handleResponsiveness();
    $(window).resize(handleResponsiveness);


});






