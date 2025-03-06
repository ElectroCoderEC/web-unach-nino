$(document).ready(function () {

    const audioClose = new Audio('../audio/efectos/close.wav'); // Reemplaza con tu ruta local
    const audioError = new Audio('../audio/efectos/error_voz.mp3'); // Reemplaza con tu ruta local
    const audioSelect = new Audio('../audio/efectos/select.wav'); // Reemplaza con tu ruta local
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
    $('#addUserModal').on('show.bs.modal', function () {
        console.log("El modal se ha abierto");
        audioSelect.currentTime = 0;
        audioSelect.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se abra
    });

    // Detectar cuando el modal se cierra
    $('#addUserModal').on('hide.bs.modal', function () {
        console.log("El modal se ha cerrado");
        audioClose.currentTime = 0;
        audioClose.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se cierre
    });


    // Detectar cuando el modal se abre
    $('#editWordModal').on('show.bs.modal', function () {
        audioSelect.currentTime = 0;
        audioSelect.play();
        // Aquí puedes realizar acciones adicionales cuando el modal se abra
    });

    // Detectar cuando el modal se abre
    $('#editWordModal').on('hide.bs.modal', function () {
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
    $('#usersTable').on('click', '.edit-word', function () {

        let idpalabra = $(this).attr("idPalabra");
        let idcategoria = $(this).attr("idCategoria");
        let categoria = $(this).attr("categoria");

        $.ajax({
            url: '/get_word',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ idpalabra: idpalabra, idcategoria: idcategoria, categoria: categoria }),
            success: function (response) {

                $("#id").val(response.info['ID_Palabra']);

                $("#editarPalabra").val(response.info['Palabra']);

                $("#editarCategoria").val(response.idcategoria);

                $("#editarContador").val(response.info['Contador']);

                $("#idCategoria").val(response.idcategoria);

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




    document.getElementById('palabraEditForm').addEventListener('submit', function (event) {

        event.preventDefault();

        $('#editWordModal').modal('hide'); // Cierra el modal

        var formData = new FormData(this);

        fetch('/submitEdit', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status) {

                    Swal.fire({
                        title: 'GENIAL!',
                        text: '¡La palabra ha sido modificada correctamente!',
                        icon: 'success',


                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.href = "/tabla"; // Redirigir a la lista de usuarios
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
    $('#usersTable').on('click', '.delete-word', function () {

        let idpalabra = $(this).attr("idPalabra");

        if (confirm(`¿Estás seguro de eliminar esta palabra"?`)) {
            $.ajax({
                url: "/eliminar_palabra",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ idpalabra: idpalabra }),
                success: function (response) {
                    if (response.status) {
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



    document.getElementById('palabraForm').addEventListener('submit', function (event) {

        event.preventDefault();

        $('#addUserModal').modal('hide'); // Cierra el modal

        var formData = new FormData(this);

        fetch('/guardar', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {

                if (data.status === 'success') {


                    Swal.fire({
                        title: 'GENIAL!',
                        text: '¡La palabra se guardó correctamente!',
                        icon: 'success',


                    }).then((result) => {
                        if (result.isConfirmed) {

                            window.location.href = "/tabla"; // Redirigir a la lista de usuarios
                        }
                    });
                } else {

                    audioError.currentTime = 0; // Reinicia el sonido
                    audioError.play(); // Reproduce el sonido


                    Swal.fire({
                        title: 'ERROR',
                        text: 'La palabra ya esta registrada! ',
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






