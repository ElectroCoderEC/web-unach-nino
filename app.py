from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO, emit
import vosk
import pyaudio
import json
import stanza
import ollama
from gtts import gTTS
from datetime import datetime
import pygame
import os
import threading
import time
from flask import Flask, render_template, redirect
from flask import Flask, render_template, request, redirect, session
import random

import pandas as pd

# Ruta para guardar la última fecha de ejecución y las palabras generadas
fecha_ultima_ejecucion_path = "ultima_ejecucion.txt"
palabras_guardadas_path = "palabras_guardadas.txt"

# Ruta para el archivo de palabras
palabras_file_path = "palabras.txt"

# Verifica si el archivo de última ejecución existe
if os.path.exists(fecha_ultima_ejecucion_path):
    with open(fecha_ultima_ejecucion_path, "r") as f:
        ultima_ejecucion = f.read().strip()  # Lee la última fecha de ejecución
else:
    ultima_ejecucion = ""

# Obtiene la fecha actual
fecha_actual = datetime.now().strftime("%Y-%m-%d")

# Define palabras_random fuera del bloque condicional
palabras_random = []
oracion_desordenada = []
# Si la fecha actual es diferente a la última ejecución, se ejecuta el código

palabras_random1 = []


def palabrass_random(archivo):
    with open(archivo, "r", encoding="utf-8") as file:
        palabras = file.read().strip().split("\n")

    palabras = [palabra.strip() for palabra in palabras if palabra.strip()]

    if not palabras:
        return None, []  # Retorna valores vacíos si el archivo está vacío

    palabra_boton = palabras[0]  # Primera palabra
    primeras_10 = palabras[1:11] if len(palabras) > 1 else []
    palabras_restantes = palabras[11:] if len(palabras) > 11 else []
    palabras_random_extra = random.sample(
        palabras_restantes, min(10, len(palabras_restantes))
    )

    palabras_r = primeras_10 + palabras_random_extra
    return palabra_boton, palabras_r  # Retorna una tupla


if fecha_actual != ultima_ejecucion:
    print(f"Ejecutando por primera vez hoy: {fecha_actual}")

    # Cargar palabras desde el archivo
    with open("palabras.txt", "r", encoding="utf-8") as file:
        palabras = file.read().strip().split("\n")  # Leer líneas del archivo

    # Eliminar palabras vacías y limpiar espacios
    palabras = [palabra.strip() for palabra in palabras if palabra.strip()]

    # Seleccionar siempre las primeras 10 palabras
    primeras_10 = palabras[:10]

    # Seleccionar 10 palabras aleatorias de las restantes (sin repetir las primeras 10)
    if len(palabras) > 10:
        palabras_restantes = palabras[10:]  # Omitimos las primeras 10
        palabras_random_extra = random.sample(
            palabras_restantes, min(10, len(palabras_restantes))
        )
    else:
        palabras_random_extra = []  # Si hay menos de 10 palabras en total, no hay extra

    # Combinar ambas listas para obtener las 20 palabras finales
    palabras_finales = primeras_10 + palabras_random_extra
    palabras_random = palabras_finales
    print(f"Palabras seleccionadas: {palabras_finales}")

    # Crear directorio para los audios
    os.makedirs("static/audio", exist_ok=True)

    # Generar los audios usando gTTS
    for palabra in palabras_finales:
        audio_path = f"static/audio/{palabra}.mp3"
        tts = gTTS(text=palabra, lang="es")
        tts.save(audio_path)
        print(f"Audio guardado: {audio_path}")

    # Guardar las palabras seleccionadas en un archivo
    with open(palabras_guardadas_path, "w", encoding="utf-8") as f:
        f.write(", ".join(palabras_finales))

    # Actualizar la fecha de la última ejecución
    with open(fecha_ultima_ejecucion_path, "w") as f:
        f.write(fecha_actual)

else:
    print(f"Ya se ejecutó hoy: {fecha_actual}, no se generarán los audios nuevamente.")

    # Leer las palabras guardadas de la ejecución anterior
    if os.path.exists(palabras_guardadas_path):
        with open(palabras_guardadas_path, "r", encoding="utf-8") as f:
            palabras_guardadas = f.read().strip().split(", ")
        # Limitar a 20 palabras si hay más de 20
        palabras_finales = palabras_guardadas[:20]
        palabras_random = palabras_finales
        print(f"Las palabras seleccionadas hoy son: {palabras_finales}")
    else:
        print("No se encontraron palabras guardadas.")
# Inicializar Stanza
# Cargar el modelo de Stanza para español

palabra_boton2, palabras_random1 = palabrass_random("palabras2.txt")
palabra_boton3, palabras_random1 = palabrass_random("palabras3.txt")
palabra_boton4, palabras_random1 = palabrass_random("palabras4.txt")
palabra_boton1, palabras_random1 = palabrass_random("palabras1.txt")
palabra_boton5, palabras_random1 = palabrass_random("palabras5.txt")


print(palabra_boton1, palabra_boton2, palabra_boton3, palabra_boton4)


nlp = stanza.Pipeline(
    "es", processors="tokenize,pos"
)  # Solo necesitas tokenización y POS tagging


palabras_botones = [
    palabra_boton1,
    palabra_boton2,
    palabra_boton3,
    palabra_boton4,
    palabra_boton5,
]

# Variable global para la página activa
pagina_actual = None  # Inicializamos la variable para controlar la página actual
# Variables que almacenan los textos
texto_reconocido = ""
respuesta_vosk = ""
# Variable global para almacenar el último texto reconocido
last_text_reconocido = ""
# Variable global para almacenar el último SVG generado
last_svg = ""
una = False


EXCEL_FILE = "palabras_categorias.xlsx"

# app = Flask(__name__)

app = Flask(
    __name__,
    static_url_path="",
    static_folder="static",
    template_folder="templates",
)
app.secret_key = "asd"  # Para gestionar sesiones


socketio = SocketIO(app)

# Diccionario para traducir etiquetas POS
POS_TRANSLATIONS = {
    "ADJ": "Adjetivo",
    "ADP": "Adposición",
    "ADV": "Adverbio",
    "AUX": "Verbo aux",
    "CONJ": "Conjunción",
    "CCONJ": "CC",  # Conjunción de coordinación
    "DET": "Determinate",
    "INTJ": "Interjección",
    "NOUN": "Sustantivo",
    "NUM": "Número",
    "PART": "Partícula",
    "PRON": "Pronombre",
    "PROPN": "Nombre propio",
    "PUNCT": "Signo P",  # Signo de puntuación
    "SCONJ": "CS",  # Conjunción subordinante
    "SYM": "Símbolo",
    "VERB": "Verbo",
    "X": "Otros",
}

# Cargar modelo de Spacy para español
# nlp = spacy.load("es_core_news_lg") #es_core_news_lg, es_dep_news_trf
# python -m spacy download es_core_news_md
# python -m spacy download es_core_news_lg

audio_en_reproduccion = False

# Variables globales para inicialización
pygame_initialized = False
vosk_initialized = False
model_path = (
    "vosk-model-small-es-0.42"  # Asegúrate de tener este modelo en tu directorio
)
audio = pyaudio.PyAudio()
stream_audio = None
rec = None
texto_reconocido = "Esperando..."
respuesta_vosk = ""
en_proceso = False
# Variable global para habilitar o deshabilitar la captura de audio
audio_activado = False
analisis = []
etiquetas = []
palabras_clave = []


# Función para inicializar pygame solo una vez
def inicializar_pygame():
    global pygame_initialized
    if not pygame_initialized:
        pygame.mixer.init()  # Inicializa pygame mixer solo una vez
        pygame_initialized = True


# Función para inicializar Vosk solo una vez
def inicializar_vosk():
    global vosk_initialized, rec
    # if not vosk_initialized:
    model = vosk.Model(model_path)
    rec = vosk.KaldiRecognizer(model, 16000)
    vosk_initialized = True


def inicializar_mic():
    global stream_audio, pagina_actual
    if stream_audio is None:
        try:
            stream_audio = audio.open(
                format=pyaudio.paInt16,
                channels=1,
                rate=16000,
                input=True,
                frames_per_buffer=8000,
            )
            stream_audio.start_stream()
        except Exception as e:
            print(f"Error al inicializar el micrófono: {e}")
            stream_audio = None


def generar_mensaje(texto_usuario):
    global pagina_actual
    if pagina_actual != "index":
        return ""  # No generar mensajes si no estamos en index
    return f"genera una respuesta corta, simple, con sentido, máximo 6 palabras, para el siguiente texto: {texto_usuario}"


def responder_con_voz(respuesta):
    global respuesta_vosk, en_proceso, audio_en_reproduccion, pagina_actual, una
    if pagina_actual != "index" or en_proceso:
        return
    en_proceso = True
    una = False
    respuesta_vosk = respuesta
    print(f"Respuesta de Ollama: {respuesta}")

    tts = gTTS(respuesta, lang="es", slow=False)
    tts.save("respuesta.mp3")

    if not pygame.mixer.get_init():
        pygame.mixer.init()

    pygame.mixer.music.load("respuesta.mp3")
    audio_en_reproduccion = True
    pygame.mixer.music.play()

    # Monitoriza la página activa mientras se reproduce el audio
    while pygame.mixer.music.get_busy():
        if pagina_actual != "index":
            pygame.mixer.music.stop()  # Detén el audio si se cambia de página
            break
        pygame.time.Clock().tick(100)

    pygame.mixer.music.stop()
    pygame.mixer.quit()
    audio_en_reproduccion = False
    en_proceso = False


def desordenar_oracion(respuesta):
    """Toma una oración y devuelve una lista con las palabras en orden aleatorio."""
    palabras = respuesta.split()  # Separar en palabras
    random.shuffle(palabras)  # Mezclar aleatoriamente
    return palabras  # Retorna lista desordenada


# Función para manejar el reconocimiento de voz y actualización del HTML
def procesar_audio():
    global texto_reconocido, pagina_actual, audio_activado, analisis, etiquetas, palabras_clave, oracion_desordenada, texto_reconocido, respuesta_vosk, analisis, etiquetas, oracion_desordenada, audio_en_reproduccion, last_svg
    last_processed = time.time()  # Marca el tiempo de la última vez que se procesó
    while True:
        if pagina_actual != "index" or stream_audio is None or not audio_activado:
            time.sleep(
                0.1
            )  # Pausa breve si no estamos en la página index o el micrófono no está listo
            continue

        else:
            try:

                data = stream_audio.read(8000, exception_on_overflow=False)
                if rec.AcceptWaveform(data):
                    print("audio")
                    result = json.loads(rec.Result())
                    text = result.get("text", "").strip()
                    etiquetas = analizar_texto_con_stanza(texto_reconocido)

                    # Convertir la primera palabra a mayúscula
                    if text:
                        text = (
                            text[0].upper() + text[1:]
                            if len(text) > 1
                            else text.upper()
                        )
                    print(f"Texto con primera palabra en mayúscula: {text}")
                    # Verificar que no se haya procesado el mismo texto en menos de 2 segundos
                    if text and time.time() - last_processed > 1:
                        print(f"\nTexto reconocido: {text}")
                        texto_reconocido = text  # Actualizar texto reconocido
                        last_processed = (
                            time.time()
                        )  # Actualizar el tiempo de la última vez procesada

                        # Procesar texto con Stanza
                        doc = nlp(text)  # Procesa el texto con Stanza
                        tokens = [word.text for word in doc.iter_words()]

                        # Asignar etiquetas POS
                        tags = []
                        for word in doc.iter_words():
                            tags.append(
                                (
                                    word.text,
                                    POS_TRANSLATIONS.get(word.upos, "Desconocido"),
                                )
                            )

                        print(f"Palabras tokenizadas: {tokens}")
                        print(f"Etiquetas gramaticales: {tags}")
                        analisis_o()
                        # Usar el modelo Ollama para corregir la gramática y la puntuación
                        try:

                            # Solicitar corrección del texto
                            # corrected_text = corregir_gramatica(text)
                            # texto_reconocido = corrected_text  # Aquí actualizas con el texto corregido
                            # print(f"Texto corregido: {corrected_text}")

                            # Usar el texto corregido para generar la respuesta
                            mensaje_usuario = generar_mensaje(texto_reconocido)

                            # Mensaje para el modelo Ollama
                            messages = [{"role": "user", "content": mensaje_usuario}]

                            # Usar un modelo disponible, como 'llama3.2-vision:11b'  llama3.2:1b deepseek-r1:1.5b  deepseek-r1:7b  llama3.1:8b
                            ollama_stream = ollama.chat(
                                model="llama3.2:latest", messages=messages, stream=True
                            )

                            # Procesar la respuesta en streaming
                            respuesta = ""
                            for chunk in ollama_stream:
                                respuesta += chunk["message"]["content"]

                            # Procesar texto con Stanza
                            doc = nlp(respuesta)  # Procesa el texto con Stanza
                            tokens = [word.text for word in doc.iter_words()]

                            # Asignar etiquetas POS
                            tags = []
                            for word in doc.iter_words():
                                tags.append(
                                    (
                                        word.text,
                                        POS_TRANSLATIONS.get(word.upos, "Desconocido"),
                                    )
                                )

                            print(f"Palabras tokenizadas r: {tokens}")
                            print(f"Etiquetas gramaticales r: {tags}")

                            # Llamar a la función que reproduce la respuesta con voz
                            texto_combinado = respuesta

                            socketio.emit(
                                "variables",
                                {
                                    "texto_reconocido": texto_reconocido,
                                    "respuesta_vosk": respuesta_vosk,
                                    "etiquetas": etiquetas,
                                    "palabras_clave": oracion_desordenada,
                                    "enReproduccion": audio_en_reproduccion,
                                    "svg_gramatica": last_svg,
                                },
                            )

                            analisisp = analizar_texto_con_stanza(texto_combinado)
                            oracion_desordenada = desordenar_oracion(texto_combinado)
                            print(oracion_desordenada)
                            # Conjunto para eliminar duplicados y lista para palabras clave
                            palabras_usadas = set()
                            palabras_clave = []

                            # Filtrar sustantivos y verbos únicos
                            for item in analisisp:
                                if (
                                    item["etiqueta"] in {"Sustantivo", "Verbo"}
                                    and item["palabra"] not in palabras_usadas
                                ):
                                    palabras_clave.append(item["palabra"])
                                    palabras_usadas.add(
                                        item["palabra"]
                                    )  # Añadir palabra al conjunto
                                if (
                                    len(palabras_clave) >= 5
                                ):  # Limitar a 5 palabras únicas
                                    break

                            print("Palabras clave seleccionadas:", palabras_clave)

                            socketio.emit(
                                "variables",
                                {
                                    "texto_reconocido": texto_reconocido,
                                    "respuesta_vosk": respuesta,
                                    "etiquetas": etiquetas,
                                    "palabras_clave": oracion_desordenada,
                                    "enReproduccion": audio_en_reproduccion,
                                    "svg_gramatica": last_svg,
                                },
                            )

                            responder_con_voz(respuesta)

                        except Exception as e:
                            print(f"Error al generar la respuesta: {e}")
                    else:
                        print(".", end="")

            except Exception as e:
                print(f"Error al procesar audio: {e}")


@app.before_request
def forzar_portada():
    # Verifica si ya ha pasado por la portada utilizando la sesión
    if "visited" not in session:
        # Redirige solo si no se ha visitado la portada
        if request.endpoint not in ["portada", "static"]:
            return redirect("/")


@app.route("/")
def portada():
    # Marca la sesión para indicar que se ha visitado la portada
    session["visited"] = True
    # Aquí puedes ajustar el contador o cualquier otra lógica necesaria
    return render_template("portada.html", countdown=8)


@app.route("/principal")
def principal():
    # Aquí agregas la lógica para tu página principal
    global pagina_actual, audio_activado, texto_reconocido, respuesta_vosk, last_svg, last_text_reconocido, palabras_clave, oracion_desordenada
    texto_reconocido = ""
    respuesta_vosk = ""
    # Variable global para almacenar el último texto reconocido
    last_text_reconocido = ""
    # Variable global para almacenar el último SVG generado
    last_svg = ""
    pagina_actual = "principal"
    audio_activado = False  # Detener audio al salir del índice
    palabras_clave = []
    oracion_desordenada = []
    return render_template("principal.html")


@app.route("/pagina2")
def pagina2():
    # Limitar a un máximo de 20 palabras para la plantilla
    palabras_limited = palabras_random[:20]
    print("Palabras seleccionadas aleatoriamente:", palabras_limited)  # Diagnóstico
    return render_template("pagina2.html", palabras=palabras_limited)


@app.route("/index")
def index():
    # Aquí agregas la lógica para tu página de index
    global pagina_actual, texto_reconocido, respuesta_vosk, inicio_svg
    inicio_svg = 0
    texto_reconocido = "Esperando..."
    respuesta_vosk = ""
    pagina_actual = "index"

    return render_template("index.html")


# Función para analizar texto con Stanza
def analizar_texto_con_stanza(texto):
    doc = nlp(texto)
    etiquetas = []
    for sentence in doc.sentences:
        for word in sentence.words:
            etiquetas.append(
                {
                    "palabra": word.text,
                    "etiqueta": POS_TRANSLATIONS.get(
                        word.upos, "Desconocido"
                    ),  # Convertir UPOS a etiqueta traducida
                }
            )
    return etiquetas


@app.route("/actualizar_texto")
def actualizar_texto():
    global texto_reconocido, respuesta_vosk, analisis, etiquetas, oracion_desordenada
    # Procesa el texto reconocido con Stanza
    return jsonify(
        {
            "texto_reconocido": texto_reconocido,
            "respuesta_vosk": respuesta_vosk,
            "etiquetas": etiquetas,
            "palabras_clave": oracion_desordenada,
        }
    )


def analisis_o():
    global texto_reconocido, respuesta_vosk, last_text_reconocido, last_svg, POS_TRANSLATIONS

    # Analizar la oración detectada
    doc = nlp(texto_reconocido)
    # Construir análisis gramatical
    analisis = []
    for sentence in doc.sentences:  # Iterar sobre las oraciones
        for word in sentence.words:  # Iterar sobre las palabras
            analisis.append(
                {
                    "texto": word.text,
                    "etiqueta": POS_TRANSLATIONS.get(word.upos, word.upos),
                    "dep": word.deprel,
                    "padre": (
                        word.head_text
                        if word.head is not None and word.head > 0
                        else "root"
                    ),
                }
            )

    # Definir el ancho y alto del SVG
    svg_width = 800
    svg_height = 800
    max_words_per_line = 6  # Número máximo de palabras por línea
    letter_spacing = 20  # Espaciado reducido entre las palabras
    # Calcular el ancho de cada palabra y la distancia entre ellas
    word_width = 70  # Estimación del ancho de cada palabra
    x_offset = 150  # Posición inicial en X
    y_offset = 20  # Posición inicial en Y

    # Dividir la oración en filas de 5 palabras
    words_in_line = []
    # Calcular la cantidad total de palabras
    total_words = sum(len(sentence.words) for sentence in doc.sentences)
    lines_needed = (total_words // max_words_per_line) + 1
    print("Lineas: " + str(lines_needed))
    # Ajustamos la altura del SVG según la cantidad de filas necesarias
    svg_height = (
        lines_needed * 80
    )  # Aumentar la altura en función de las filas necesarias
    print("alto: " + str(svg_height))
    svg = """<svg width="100%" height="{height}" xmlns="http://www.w3.org/2000/svg">""".format(
        height=svg_height
    )  # Inicializar SVG

    if texto_reconocido == "Esperando...":
        # Calcular el centro para centrar el texto
        total_tokens = sum(len(sentence.words) for sentence in doc.sentences)
        svg_width = 600  # Ancho del área SVG
        initial_x_offset = 500  # Espaciado inicial para centrar
        x_offset = initial_x_offset
        y_offset = 40  # Altura fija
        # Dibujar cada palabra
        # svg = '''<svg width="100%" height="600" xmlns="http://www.w3.org/2000/svg">'''  # Inicializar SVG
        for sentence in doc.sentences:
            for word in sentence.words:
                svg += f'<text x="{x_offset}" y="{y_offset}" font-size="20" text-anchor="middle">{word.text}</text>'
                x_offset += 50  # Ajustar la distancia entre palabras
        svg += "</svg>"  # Cerrar el SVG
    else:
        # svg = '''<svg width="100%" height="100" xmlns="http://www.w3.org/2000/svg">'''  # Inicializar SVG
        for sentence in doc.sentences:
            for i, word in enumerate(sentence.words):
                # Si alcanzamos el límite de palabras por línea, saltamos a la siguiente fila
                if i % max_words_per_line == 0 and i != 0:
                    y_offset += 60  # Distancia entre filas
                    x_offset = (
                        svg_width - (max_words_per_line * (word_width + letter_spacing))
                    ) // 2  # Centrar fila horizontalmente

                # Añadir la palabra con su posición en la línea
                words_in_line.append((word, x_offset, y_offset))

                # Ajustar el desplazamiento en X para la siguiente palabra
                x_offset += word_width + letter_spacing

        # Dibujar las palabras y sus etiquetas POS
        for word, x, y in words_in_line:
            # Dibujar la palabra
            svg += f'<text x="{x}" y="{y}" font-size="20" text-anchor="middle">{word.text}</text>'

            # Calcular la longitud aproximada del texto (puede ajustarse según la fuente)
            text_length = (
                len(POS_TRANSLATIONS.get(word.upos, word.upos)) * 7
            )  # Aproximado

            # Dibujar el fondo (rectángulo con esquinas redondeadas)
            svg += f'<rect x="{x - text_length / 2 - 5}" y="{y + 5}" width="{text_length + 10}" height="20" rx="5" ry="5" fill="blue"/>'

            # Dibujar la etiqueta POS justo debajo de la palabra
            svg += f'<text x="{x}" y="{y + 20}" font-size="13" text-anchor="middle" fill="white">{POS_TRANSLATIONS.get(word.upos, word.upos)}</text>'

        svg += "</svg>"  # Cerrar el SVG

    last_svg = svg


@app.route("/analisis_oracion")
def analisis_oracion():
    global texto_reconocido, respuesta_vosk, last_text_reconocido, last_svg, POS_TRANSLATIONS, analisis

    return jsonify(
        {
            "texto_reconocido": texto_reconocido,
            "respuesta": respuesta_vosk,
            "analisis": analisis,
            "svg_gramatica": last_svg,
        }
    )


@app.route("/audio_status")
def audio_status():
    global audio_en_reproduccion
    # print("en reproduccion")
    return jsonify({"enReproduccion": audio_en_reproduccion})


@app.route("/activar_audio", methods=["POST"])
def activar_audio():
    global audio_activado
    audio_activado = True  # Activar el procesamiento del audio
    return jsonify({"status": "activo"})


@app.route("/detener_audio", methods=["POST"])
def detener_audio():
    global audio_activado
    audio_activado = False  # Detener el procesamiento del audio
    return jsonify({"status": "detenido"})


@app.route("/reproducir_audio")
def reproducir_audio():
    texto = request.args.get("texto", "")
    print("boton:" + texto)

    audio_filename = "audio_frase.mp3"

    # Eliminar el archivo si ya existe
    if os.path.exists(audio_filename):
        try:
            os.remove(audio_filename)
            print(f"Archivo {audio_filename} eliminado.")
        except PermissionError:
            print(f"No se pudo eliminar {audio_filename}, puede estar en uso.")
            return jsonify({"status": "Error al eliminar archivo"}), 500

    if texto:
        tts = gTTS(texto, lang="es", slow=False)

        if not pygame.mixer.get_init():
            pygame.mixer.init()

        if pygame.mixer.music.get_busy():
            print("ocupado")
            pygame.mixer.music.fadeout(1000)
            pygame.mixer.music.stop()

        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)

        try:
            tts.save(audio_filename)
        except PermissionError:
            print(f"Error al guardar el archivo {audio_filename}")
            return jsonify({"status": "Error al guardar archivo"}), 500

        pygame.mixer.music.load(audio_filename)
        pygame.mixer.music.play()

        while pygame.mixer.music.get_busy():
            pygame.time.Clock().tick(10)

        pygame.mixer.music.stop()
        pygame.mixer.quit()

        return jsonify({"status": "finalizado"})
    else:
        return jsonify({"status": "texto no válido"}), 400


# 📌 Función para registrar una nueva palabra
def registrar_palabra(categoria_id, palabra):
    if not os.path.exists(EXCEL_FILE):
        df_palabra = pd.DataFrame(
            columns=["ID_Palabra", "Palabra", "Contador", "Fecha", "ID_Categoria"]
        )
    else:
        df_palabra = pd.read_excel(EXCEL_FILE, sheet_name="Palabras")

    # Obtener el próximo ID_Palabra
    next_id_palabra = df_palabra["ID_Palabra"].max() + 1 if not df_palabra.empty else 1

    nueva_palabra = {
        "ID_Palabra": next_id_palabra,
        "Palabra": palabra,
        "Contador": 0,
        "Fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "ID_Categoria": categoria_id,  # Relacionado con la categoría
    }

    # Agregar la nueva palabra al DataFrame
    df_palabra = df_palabra.append(nueva_palabra, ignore_index=True)

    # Guardar las palabras en el archivo Excel
    with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl", mode="a") as writer:
        df_palabra.to_excel(writer, sheet_name="Palabras", index=False)


@app.route("/pagina3", methods=["GET", "POST"])
def pagina3():
    categorias, palabras = obtener_todo()

    return render_template(
        "index2.html",
        categorias=categorias,
        palabras=[],  # Se inicia vacío hasta que se seleccione una categoría
    )


# Función para incrementar el contador cuando se haga clic en la palabra
def addCuenta(idPalabra):

    verificar_excel()  # Asegurar que el archivo Excel existe

    try:
        # Leer todas las hojas del archivo
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        # Verificar que la hoja "Categorias" exista
        if "Palabras" not in excel_data:
            return (
                jsonify({"status": False, "message": "Hoja 'Palabras' no encontrada"}),
                404,
            )

        df_palabra = excel_data["Palabras"]

        # Filtrar la palabra que corresponde con el ID
        palabra_encontrada = df_palabra[
            df_palabra["Palabra"].str.lower() == idPalabra.lower()
        ]

        if palabra_encontrada.empty:
            return jsonify({"status": False, "message": "Palabra no encontrada"}), 404

        # Incrementar el contador
        id_palabra = palabra_encontrada.iloc[0][
            "ID_Palabra"
        ]  # Obtener el ID de la palabra
        df_palabra.loc[df_palabra["ID_Palabra"] == id_palabra, "Contador"] += 1

        # Guardar TODAS las hojas en el mismo archivo
        excel_data["Palabras"] = df_palabra
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            for sheet_name, df in excel_data.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return jsonify(
            {"status": True, "message": "Contador Palabra actualizada correctamente"}
        )

    except Exception as e:
        return (
            jsonify(
                {"status": False, "message": f"Error al editar el contador: {str(e)}"}
            ),
            500,
        )


@app.route("/incrementar_contador", methods=["POST"])
def incrementar_contador():
    data = request.get_json()
    idPalabra = data.get("palabra")

    # Llamar a la función para incrementar el contador en el archivo Excel
    message = addCuenta(idPalabra)

    return message


def obtener_todo():
    """Obtiene todas las palabras y categorías desde el archivo Excel."""
    try:
        df_palabras = pd.read_excel(EXCEL_FILE, sheet_name="Palabras")
        df_categorias = pd.read_excel(EXCEL_FILE, sheet_name="Categorias")

        # Convertir a listas de diccionarios
        palabras = df_palabras.to_dict(orient="records")
        categorias = df_categorias.to_dict(orient="records")

        return categorias, palabras

    except Exception as e:
        print(f"Error al obtener datos: {str(e)}")
        return [], []


@app.route("/guardar", methods=["POST"])
def guardar_palabra():
    verificar_excel()  # Asegurar que el archivo Excel existe

    palabra = request.form.get("palabra").strip().lower()  # Normalizar la palabra
    id_categoria = request.form.get("id_categoria").strip()  # ID de la categoría

    if not palabra or not id_categoria:
        return jsonify({"status": "error", "message": "Datos incompletos"}), 400

    try:
        # Leer todas las hojas del archivo
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        # Verificar que la hoja "Palabras" exista, si no, crearla vacía
        if "Palabras" not in excel_data:
            df_palabras = pd.DataFrame(
                columns=["ID_Palabra", "ID_Categoria", "Palabra", "Contador", "Fecha"]
            )
        else:
            df_palabras = excel_data["Palabras"]

        # Verificar que la hoja "Categorias" existe para validar el ID_Categoria
        if "Categorias" not in excel_data:
            return (
                jsonify(
                    {"status": "error", "message": "No hay categorías registradas"}
                ),
                400,
            )

        df_categorias = excel_data["Categorias"]

        # Validar si el ID de la categoría existe
        if int(id_categoria) not in df_categorias["ID_Categoria"].values:
            return (
                jsonify({"status": "error", "message": "ID de categoría no válido"}),
                400,
            )

        # Verificar si la palabra ya existe en esa categoría
        existe = df_palabras[
            (df_palabras["Palabra"].str.lower() == palabra)
            & (df_palabras["ID_Categoria"] == int(id_categoria))
        ]

        if not existe.empty:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "La palabra ya está registrada en esta categoría",
                    }
                ),
                400,
            )

        # Obtener un nuevo ID_Palabra
        nuevo_id_palabra = (
            df_palabras["ID_Palabra"].max() + 1 if not df_palabras.empty else 1
        )

        # Agregar la nueva palabra al DataFrame
        nueva_fila = pd.DataFrame(
            [
                {
                    "ID_Palabra": nuevo_id_palabra,
                    "ID_Categoria": int(id_categoria),
                    "Palabra": palabra,
                    "Contador": 0,  # Inicialmente en 0
                    "Fecha": datetime.now().strftime(
                        "%Y-%m-%d %H:%M:%S"
                    ),  # Fecha actual
                }
            ]
        )
        df_palabras = pd.concat([df_palabras, nueva_fila], ignore_index=True)

        # Guardar TODAS las hojas en el mismo archivo
        excel_data["Palabras"] = df_palabras
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            for sheet_name, df in excel_data.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return jsonify(
            {"status": "success", "message": "Palabra guardada correctamente"}
        )

    except Exception as e:
        return (
            jsonify(
                {"status": "error", "message": f"Error al guardar la palabra: {str(e)}"}
            ),
            500,
        )


# 📌 Ruta para consultar palabras de una categoría
@app.route("/consultar", methods=["GET"])
def consultar():
    # Obtener el ID_Categoria desde los parámetros de la consulta (query parameter)
    id_categoria = request.args.get("id_categoria")

    if not id_categoria:
        return jsonify({"status": "error", "message": "ID_Categoria es requerido"}), 400

    try:
        # Leer todas las hojas del archivo Excel
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        # Verificar que la hoja "Palabras" exista
        if "Palabras" not in excel_data:
            return (
                jsonify(
                    {"status": "error", "message": "No existen palabras registradas"}
                ),
                400,
            )

        df_palabras = excel_data["Palabras"]

        # Filtrar las palabras que correspondan al ID_Categoria proporcionado
        palabras_categoria = df_palabras[
            df_palabras["ID_Categoria"] == int(id_categoria)
        ]

        if palabras_categoria.empty:
            return (
                jsonify(
                    {
                        "status": "error",
                        "message": "No hay palabras registradas para esta categoría",
                    }
                ),
                404,
            )

        # Convertir el DataFrame de palabras a una lista de diccionarios
        palabras_lista = palabras_categoria[
            ["ID_Palabra", "Palabra", "Contador", "Fecha"]
        ].to_dict(orient="records")

        return jsonify({"status": "success", "data": palabras_lista})

    except Exception as e:
        return (
            jsonify(
                {"status": "error", "message": f"Error al consultar palabras: {str(e)}"}
            ),
            500,
        )


@app.route("/tabla")
def user_management():
    categorias, palabras = obtener_relacionPalabras()

    return render_template(
        "palabras.html",
        palabras=palabras,
        categorias_unicas=categorias,
    )


@app.route("/submitEditCategoria", methods=["POST"])
def submit_edit_categoria():
    verificar_excel()  # Asegurar que el archivo Excel existe

    id_categoria = request.form.get("id")
    nueva_categoria = request.form.get("editarCategoria")

    if not id_categoria or not nueva_categoria:
        return jsonify({"status": False, "message": "Datos incompletos"}), 400

    try:
        # Leer todas las hojas del archivo
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        # Verificar que la hoja "Categorias" exista
        if "Categorias" not in excel_data:
            return (
                jsonify(
                    {"status": False, "message": "Hoja 'Categorias' no encontrada"}
                ),
                404,
            )

        df_categoria = excel_data["Categorias"]

        # Convertir todas las categorías a minúsculas para evitar duplicados insensibles a mayúsculas
        categorias_existentes = df_categoria["Categoria"].str.lower().tolist()

        # Verificar si la nueva categoría ya existe (ignorando mayúsculas/minúsculas)
        if nueva_categoria.lower() in categorias_existentes:
            return jsonify({"status": False, "message": "La categoría ya existe"}), 400

        # Buscar la fila con el ID proporcionado
        index = df_categoria[df_categoria["ID_Categoria"] == int(id_categoria)].index

        if index.empty:
            return (
                jsonify({"status": False, "message": "ID de categoría no encontrado"}),
                404,
            )

        # Actualizar el nombre de la categoría
        df_categoria.at[index[0], "Categoria"] = nueva_categoria

        # Guardar TODAS las hojas en el mismo archivo
        excel_data["Categorias"] = df_categoria
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            for sheet_name, df in excel_data.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return jsonify(
            {"status": True, "message": "Categoría actualizada correctamente"}
        )

    except Exception as e:
        return (
            jsonify(
                {"status": False, "message": f"Error al editar categoría: {str(e)}"}
            ),
            500,
        )


@app.route("/categoria")
def categoria():

    categorias, palabras = obtener_todo()

    # Extraer nombres únicos de las categorías
    categorias_unicas = list(set(categoria["Categoria"] for categoria in categorias))

    return render_template(
        "categorias.html", datos=categorias, categorias_unicas=categorias_unicas
    )


def obtener_relacionPalabras():
    """Obtiene todas las palabras y categorías desde el archivo Excel."""
    try:
        df_palabras = pd.read_excel(EXCEL_FILE, sheet_name="Palabras")
        df_categorias = pd.read_excel(EXCEL_FILE, sheet_name="Categorias")

        # Convertir a listas de diccionarios
        palabras = df_palabras.to_dict(orient="records")
        categorias = df_categorias.to_dict(orient="records")

        # Crear un diccionario para mapear ID_Categoria a Categoria
        categorias_dict = {
            categoria["ID_Categoria"]: categoria["Categoria"]
            for categoria in categorias
        }

        # Agregar la columna "Categoria" a cada palabra
        for palabra in palabras:
            palabra["Categoria"] = categorias_dict.get(
                palabra["ID_Categoria"], "Sin categoría"
            )

        return categorias, palabras

    except Exception as e:
        print(f"Error al obtener datos: {str(e)}")
        return [], []


# Función para asegurar que el archivo y las hojas existen
def verificar_excel():
    if not os.path.exists(EXCEL_FILE):
        # Crear un archivo Excel vacío con las hojas "Categorias" y "Palabras"
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            df_categorias = pd.DataFrame(columns=["ID_Categoria", "Categoria", "Fecha"])
            df_palabras = pd.DataFrame(
                columns=["ID_Palabra", "ID_Categoria", "Palabra", "Contador", "Fecha"]
            )

            df_categorias.to_excel(writer, sheet_name="Categorias", index=False)
            df_palabras.to_excel(writer, sheet_name="Palabras", index=False)


@app.route("/registrar_categoria", methods=["POST"])
def registrar_categoria():
    verificar_excel()  # Asegurar que el archivo existe antes de leerlo

    nueva_categoria = request.form["nuevaCategoria"].strip()

    if not nueva_categoria:
        return (
            jsonify({"success": False, "message": "Debe ingresar una categoría"}),
            400,
        )

    try:
        df_categoria = pd.read_excel(EXCEL_FILE, sheet_name="Categorias")
    except ValueError:
        df_categoria = pd.DataFrame(columns=["ID_Categoria", "Categoria", "Fecha"])

    categorias_existentes = df_categoria["Categoria"].astype(str).str.lower().tolist()

    if nueva_categoria.lower() in categorias_existentes:
        return jsonify({"success": False, "message": "La categoría ya existe"}), 400

    next_id_categoria = (
        df_categoria["ID_Categoria"].max() + 1 if not df_categoria.empty else 1
    )

    nueva_fila = {
        "ID_Categoria": next_id_categoria,
        "Categoria": nueva_categoria.upper(),
        "Fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }

    df_categoria = pd.concat(
        [df_categoria, pd.DataFrame([nueva_fila])], ignore_index=True
    )

    with pd.ExcelWriter(
        EXCEL_FILE, engine="openpyxl", mode="a", if_sheet_exists="replace"
    ) as writer:
        df_categoria.to_excel(writer, sheet_name="Categorias", index=False)

    return jsonify({"success": True, "message": "Categoría registrada exitosamente"})


@app.route("/get_word", methods=["POST"])
def get_word():
    datos = request.get_json()
    idpalabra = datos.get("idpalabra")
    idcategoria = datos.get("idcategoria")
    categoria = datos.get("categoria")

    if not os.path.exists(EXCEL_FILE):
        return jsonify({"success": False, "error": "Archivo Excel no encontrado"}), 404

    df_palabras = pd.read_excel(EXCEL_FILE, sheet_name="Palabras")

    # Buscar la fila con la categoría y palabra
    fila = df_palabras[(df_palabras["ID_Palabra"] == int(idpalabra))]

    if fila.empty:
        return jsonify({"error": "Palabra no encontrada"}), 404

    # Convertir la fila a un diccionario para enviar como JSON
    palabra_info = fila.iloc[0].to_dict()

    return jsonify(
        {"info": palabra_info, "idcategoria": idcategoria, "categoria": categoria}
    )


# Ruta para manejar el envío del formulario editar
@app.route("/submitEdit", methods=["POST"])
def submitEdit():
    verificar_excel()  # Asegurar que el archivo Excel existe

    try:
        id_palabra = request.form.get("id")
        idcategoria = request.form.get("editarCategoria")
        editar_palabra = request.form.get("editarPalabra")
        editar_contador = request.form.get("editarContador")

        # Leer todas las hojas del archivo
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        # Verificar que la hoja "Categorias" exista
        if "Palabras" not in excel_data:
            return (
                jsonify({"status": False, "message": "Hoja 'Palabras' no encontrada"}),
                404,
            )

        df_palabras = excel_data["Palabras"]

        # Buscar la fila con el ID proporcionado
        index = df_palabras[df_palabras["ID_Palabra"] == int(id_palabra)].index

        if index.empty:
            return (
                jsonify({"status": False, "message": "ID de palabra no encontrado"}),
                404,
            )

        # Actualizar el nombre de la categoría
        df_palabras.at[index[0], "ID_Categoria"] = int(idcategoria)
        df_palabras.at[index[0], "Palabra"] = editar_palabra
        df_palabras.at[index[0], "Contador"] = int(editar_contador)

        # Guardar TODAS las hojas en el mismo archivo
        excel_data["Palabras"] = df_palabras
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            for sheet_name, df in excel_data.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return jsonify({"status": True, "message": "Palabra actualizada correctamente"})

    except Exception as e:
        return (
            jsonify({"status": False, "message": f"Error al editar palabra: {str(e)}"}),
            500,
        )


@app.route("/eliminar_palabra", methods=["POST"])
def eliminar_palabra():

    verificar_excel()  # Asegurar que el archivo Excel existe

    try:

        datos = request.get_json()
        idpalabra = datos.get("idpalabra")

        # Leer todas las hojas del archivo
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        # Verificar que la hoja "Categorias" exista
        if "Palabras" not in excel_data:
            return (
                jsonify({"status": False, "message": "Hoja 'Palabras' no encontrada"}),
                404,
            )

        df_palabras = excel_data["Palabras"]

        # Buscar la fila con la categoría y palabra
        fila = df_palabras[(df_palabras["ID_Palabra"] == int(idpalabra))]

        if fila.empty:
            return jsonify({"error": "Palabra no encontrada"}), 404

        # Filtrar y eliminar la palabra
        nueva_df = df_palabras[(df_palabras["ID_Palabra"] != int(idpalabra))]

        # Guardar TODAS las hojas en el mismo archivo
        excel_data["Palabras"] = nueva_df
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            for sheet_name, df in excel_data.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return jsonify({"status": True, "message": "Palabra borrada correctamente"})

    except Exception as e:
        return (
            jsonify({"status": False, "message": f"Error al borrar: {str(e)}"}),
            500,
        )


@app.route("/eliminar_categoria", methods=["POST"])
def eliminar_categoria():
    verificar_excel()  # Asegurar que el archivo Excel existe

    try:
        datos = request.get_json()
        idcategoria = datos.get("idcategoria")

        if not idcategoria:
            return jsonify({"error": "ID de categoría no proporcionado"}), 400

        # Leer todas las hojas del archivo
        excel_data = pd.read_excel(EXCEL_FILE, sheet_name=None)

        df_categorias = excel_data["Categorias"]
        df_palabras = excel_data["Palabras"]

        # Verificar si la categoría existe
        categoria_existe = df_categorias[
            df_categorias["ID_Categoria"] == int(idcategoria)
        ]
        if categoria_existe.empty:
            return jsonify({"error": "Categoría no encontrada"}), 404

        # Filtrar y eliminar todas las palabras con el ID_Categoria
        df_palabras_filtrado = df_palabras[
            df_palabras["ID_Categoria"] != int(idcategoria)
        ]

        # Filtrar y eliminar la categoría
        df_categorias_filtrado = df_categorias[
            df_categorias["ID_Categoria"] != int(idcategoria)
        ]

        # Actualizar las hojas en el diccionario excel_data
        excel_data["Categorias"] = df_categorias_filtrado
        excel_data["Palabras"] = df_palabras_filtrado

        # Guardar TODAS las hojas en el mismo archivo
        with pd.ExcelWriter(EXCEL_FILE, engine="openpyxl") as writer:
            for sheet_name, df in excel_data.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)

        return jsonify(
            {
                "status": True,
                "message": "Categoría y palabras asociadas eliminadas correctamente",
            }
        )

    except Exception as e:
        return jsonify({"status": False, "message": f"Error al borrar: {str(e)}"}), 500


if __name__ == "__main__":
    # Inicializar las partes necesarias una sola vez
    inicializar_pygame()  # Esta línea solo debería ejecutarse una vez
    inicializar_vosk()
    inicializar_mic()
    # Iniciar el procesamiento en segundo plano
    threading.Thread(target=procesar_audio, daemon=True).start()
    # Ejecutar Flask sin recarga automática
    # app.run(debug=True, host="0.0.0.0", port=5000, use_reloader=False)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
