const grabar = document.getElementById('grabar');
const escuchar = document.getElementById('escuchar');
const texto = document.getElementById('texto');
const copiar = document.getElementById('copiar');
const reset = document.getElementById('reset');
const confirmacion = document.getElementById('confirmacion');
const confirmarReset = document.getElementById('confirmarReset');
const cancelarReset = document.getElementById('cancelarReset');

// Configuración del reconocimiento de voz
let recognition = new webkitSpeechRecognition();
recognition.lang = 'es-ES';
recognition.continuous = true; // Reconocimiento continuo
recognition.interimResults = false; // Solo resultados finales

let isRecognizing = false; // Control del estado del reconocimiento
let lastText = ""; // Guarda el último texto transcrito
let pauseTimer = null; // Temporizador para detectar pausas largas
let voces = [];// Variable para guardar las voces disponibles

// Función para capitalizar el inicio de cada oración
function capitalizeSentences(inputText) {
    return inputText.replace(/(^\s*|\.\s*)([a-záéíóúüñ])/g, (match, separator, letter) => {
        return separator + letter.toUpperCase();
    });
}

// Procesar texto recibido del reconocimiento de voz
function processText(inputText) {
    let processedText = inputText
        .replace(/\bpunto\b/gi, ".") // Reemplaza "punto" por "."
        .replace(/\bcoma\b/gi, ","); // Reemplaza "coma" por ","

    processedText = capitalizeSentences(processedText);

    return processedText;
}

// Detectar pausas largas y agregar un punto
function handlePause() {
    if (pauseTimer) clearTimeout(pauseTimer); // Reinicia el temporizador
    pauseTimer = setTimeout(() => {
        if (texto.value.trim() && !texto.value.trim().endsWith(".")) {
            texto.value = texto.value.trim() + ". ";
            console.log("Punto agregado tras pausa de 2 segundos.");
        }
    }, 500); // 2 segundos de pausa
}

// Evento cuando se recibe una transcripción
recognition.onresult = (event) => {
    const results = event.results;
    const transcript = results[results.length - 1][0].transcript.trim();
    const processedTranscript = processText(transcript);

    texto.value += processedTranscript + " ";
    lastText = texto.value; // Actualiza el último texto

    handlePause(); // Iniciar temporizador para detectar pausas
};

// Reiniciar el reconocimiento si no se detuvo manualmente
recognition.onend = () => {
    if (isRecognizing) {
        recognition.start();
        console.log("Reiniciando el reconocimiento de voz...");
    }
};

// Manejo de errores del reconocimiento de voz
recognition.onerror = (event) => {
    console.error("Error de reconocimiento:", event.error);
};

// Botón "Grabar" para iniciar o detener el reconocimiento
grabar.addEventListener('click', () => {
    if (isRecognizing) {
        // Si está grabando, detener el reconocimiento
        isRecognizing = false;
        recognition.stop();
        grabar.textContent = "Grabar";
        grabar.style.backgroundColor = ""; // Restablece el color original
        console.log("El micrófono dejó de escuchar.");
    } else {
        // Si no está grabando, iniciar el reconocimiento
        isRecognizing = true;
        recognition.start();
        grabar.textContent = "Detener Grabación";
        grabar.style.backgroundColor = "red"; // Cambia el color para indicar grabación
        console.log("El micrófono está escuchando...");
    }
});


// Botón "Copiar" para copiar el texto al portapapeles
copiar.addEventListener('click', () => {
    navigator.clipboard.writeText(texto.value)
        .then(() => console.log("Texto copiado al portapapeles"))
        .catch((err) => console.error("Error al copiar texto:", err));
});

// Funcionalidad del botón "Reset"
reset.addEventListener('click', () => {
    confirmacion.style.display = 'block'; // Mostrar confirmación
});

// Confirmar el reset (borrar texto)
confirmarReset.addEventListener('click', () => {
    texto.value = ""; // Borra el contenido
    confirmacion.style.display = 'none'; // Oculta confirmación
    console.log("El texto ha sido borrado.");
});

// Cancelar el reset
cancelarReset.addEventListener('click', () => {
    confirmacion.style.display = 'none'; // Oculta confirmación
    console.log("Se canceló el borrado de texto.");
});

function cargarVoces() {
    voces = window.speechSynthesis.getVoices();
    console.log("Voces disponibles:", voces);

    // Opcional: Listar las voces en la consola
    voces.forEach((voz, index) => {
        console.log(`${index}: ${voz.name} (${voz.lang})`);
    });
}
// Detectar cuando cambian las voces y recargar la lista
window.speechSynthesis.onvoiceschanged = cargarVoces;

// Botón "Escuchar" para leer el contenido del texto
escuchar.addEventListener('click', () => {
    const speech = new SpeechSynthesisUtterance();
    speech.text = texto.value;
    speech.volume = 1;
    speech.rate = 0.9;
    speech.pitch = 1;

    // Selecciona una voz más natural, como "Google español"
    const vozNatural = voces.find(voz => voz.name.includes("Google español") || voz.name.includes("Microsoft Sabina"));
    if (vozNatural) {
        speech.voice = vozNatural;
        console.log("Usando voz:", vozNatural.name);
    } else {
        console.warn("No se encontró una voz más natural. Usando la predeterminada.");
    }

    // Reproducir el texto
    window.speechSynthesis.speak(speech);
});
const guardarDoc = document.getElementById('guardarDoc');

guardarDoc.addEventListener('click', () => {
    // Solicitar al usuario el nombre del archivo
    let nombreArchivo = prompt("Introduce el nombre del archivo:", "documento");
    if (!nombreArchivo) {
        nombreArchivo = "documento"; // Nombre predeterminado si el usuario no introduce nada
    }

    // Agregar la extensión .doc si el usuario no la incluye
    if (!nombreArchivo.endsWith(".doc")) {
        nombreArchivo += ".doc";
    }

    // Crear el contenido del documento en formato HTML básico
    const contenido = `
        <html>
            <head>
                <meta charset="UTF-8">
                <title>${nombreArchivo}</title>
            </head>
            <body>
                <p>${texto.value.replace(/\n/g, "<br>")}</p>
            </body>
        </html>
    `;

    // Crear un Blob con el contenido y tipo MIME para un archivo .doc
    const blob = new Blob(['\ufeff', contenido], { type: 'application/msword' });

    // Crear un enlace de descarga temporal
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo; // Nombre del archivo ingresado por el usuario

    // Activar la descarga
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);

    console.log(`Archivo "${nombreArchivo}" descargado.`);
});

