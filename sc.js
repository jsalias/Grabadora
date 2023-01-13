const grabar = document.getElementById('grabar');
const escuchar = document.getElementById('escuchar');
const texto = document.getElementById('texto');
const copia = document.getElementById('copiar');


let recognition = new webkitSpeechRecognition();
recognition.lang = 'es-ES';
recognition.continuos= true;
recognition.intetrimResults = true;

recognition.onresult = (evet)=>{
    const results = evet.results;
    const frase = results[results.length-1][0].transcript;
    texto.value += frase;
}
grabar.addEventListener('click', ()=>{

    recognition.start();
} );


escuchar.addEventListener('click',()=>{
       leerTexto(texto.value);
});

recognition.onend = (evet)=>{
    console.log("El microfono dejo de escuchar");
}

recognition.onerror = (evet)=>{
    console.log(evet.error);
}

 function leerTexto(texto){

    const speech = new SpeechSynthesisUtterance();
    speech.text = texto;
    speech.volume =2;
    speech.rate = 1;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);

}



copiar.addEventListener('click',()=>{
    copiart(texto.value);
});

function copiart(){
    var textoc= texto.value;
    navigator.clipboard.writeText(textoc);
}





