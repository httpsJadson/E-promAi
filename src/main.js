/*
    Definition of variables.
    question_area = get the value of the textarea ("Qual sua dúvida?").
    chat_area = conversation field between machine and user.
    btn_mic = get microphone button
    Recognition = initialize the initRecognition class for voice recognition
*/

const btn_mic = document.getElementById('robot-microfone');
const Recognition = initRecognition(); 
var Listening = false; 
let waitingForQuestion = false;

btn_mic.addEventListener('click', (e) => {
    if(!Recognition) return;
    
    var eye = document.getElementById("img-record");
    if(Listening) {
        Recognition.stop();
        eye.classList.remove("show-record");
    } 
    else {
        eye.classList.add("show-record");
        Recognition.start();
    }
});

const btn_silence = document.getElementById("robot-silence");
btn_silence.addEventListener('click', (e) => {
    speechSynthesis.cancel();
    var mouth = document.getElementById("mouth");
    mouth.classList.remove("speaking");
    var mouth2 = document.getElementById("mouth2");
    mouth2.classList.remove("speaking2");
});

let msgHistory = [];
/* Creation of Functions */
function initRecognition() {  
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    const gRecognition = SpeechRecognition !== undefined ? new SpeechRecognition() : null;

    if(!gRecognition) {
        alert("Infelizmente seu navegador não possui suporte ao uso de Microfone.");
        return null;
    }
    
    gRecognition.lang = "pt_BR";
    gRecognition.onstart = () => Listening = true;
    gRecognition.onend = () => Listening = false;
    gRecognition.onerror = (e) => console.log(`SpeechRecognition ERROR: ${e}`);
    gRecognition.continuous = false;
    gRecognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript.toLowerCase();
        console.log(transcript);
        if (transcript.includes("epromai")) {
            SendQuestion("Olá, eu sou o EpromAi, seu assistente virtual. Como posso ajudar você hoje?");
            waitingForQuestion = true;
        } else if (waitingForQuestion) {
            SendQuestion(transcript);
            waitingForQuestion = false;
        }
    };
    
    return gRecognition;
}

function SendQuestion(question) {
    
    if(!question)
        return writeConversation("Desculpe, não consegui entender");
        
    msgHistory.push(question);
    let str = msgHistory.join('? ');

    fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer API_KEY`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo-0301",
            "messages": [
                {"role": "system", "content": "Você é um assistente social muito solícito, gentil, amigável e conciso de suas respostas. Você é comumente chamado de EpromAi como apelido. Você foi treinado para responder perguntas sobre equidade de gênero, proteção da mulher e dúvidas sexuais, relacionadas ao corpo, mudanças hormonais e corporais."},
                {"role": "system", "content": "Responda sempre com uma linguagem de fácil entendimento, e tente sempre ao máximo resumir o possível do texto. E também só responda perguntas sobre equidade de gênero, proteção da mulher e dúvidas sexuais relacionadas ao corpo como mudanças hormonais e corporais."},
                {"role": "system", "content": str},
                {"role": "user", "content": question}
            ],
            max_tokens: 1000,
            temperature: 0.6, 
        })
    })
    .then((response) => response.json())
    .then((json) => {
        if (json.error?.message) writeConversation("Aconteceu algum problema, infelizmente não consegui obter uma resposta para sua pergunta.");
        else if (json.choices?.[0].message) {
            var response = json.choices[0].message.content || "Desculpe, Não consegui achar uma resposta para sua dúvida.";
            
            console.log(response);
            writeConversation(response);
            msgHistory.push(response);
            
            var mouth = document.getElementById("mouth");
            mouth.classList.add("speaking");
            var mouth2 = document.getElementById("mouth2");
            mouth2.classList.add("speaking2");
        }
    });    
}

function writeConversation(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Define a velocidade de fala (1.0 é a velocidade normal)

    speechSynthesis.speak(utterance);
    utterance.addEventListener('end', () => {
        var mouth = document.getElementById("mouth");
        mouth.classList.remove("speaking");
        var mouth2 = document.getElementById("mouth2");
        mouth2.classList.remove("speaking2");
    });
}


//