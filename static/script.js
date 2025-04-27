// Voice visualization setup
const voiceWave = document.querySelector('.voice-wave');
let isRecording = false;

// Message display functions
function addMessage(text, type = 'user') {
    const messageDisplay = document.querySelector('.message-display');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<p>${text}</p>`;
    messageDisplay.appendChild(messageDiv);
    messageDisplay.scrollTop = messageDisplay.scrollHeight;
}

// Add to command history
function addToHistory(command) {
    const historyList = document.querySelector('.history-list');
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.textContent = command;
    historyList.appendChild(historyItem);
}

// Voice command handling
const voiceBtn = document.getElementById('voiceBtn');
voiceBtn.addEventListener('click', async () => {
    if (!isRecording) {
        isRecording = true;
        voiceBtn.classList.add('active');
        voiceWave.style.animation = 'wave 1s infinite';
        addMessage('Listening...', 'system');
        
        try {
            const response = await fetch('/start_voice', { method: 'POST' });
            const data = await response.json();
            if (data.text && data.text !== 'Could not understand audio') {
                addMessage(data.text, 'user');
                addToHistory(data.text);
                
                // Get AI response
                const aiResponse = await fetch('/get_response', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ command: data.text })
                });
                const aiData = await aiResponse.json();
                addMessage(aiData.response, 'system');
            } else {
                addMessage('Could not understand audio. Please try again.', 'system');
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error processing voice command', 'system');
        }
        
        isRecording = false;
        voiceBtn.classList.remove('active');
        voiceWave.style.animation = 'none';
    }
});

// Image generation handling
const imageBtn = document.getElementById('imageBtn');
imageBtn.addEventListener('click', async () => {
    const prompt = prompt('Enter image description:');
    if (prompt) {
        addMessage(`Generating image: ${prompt}`, 'user');
        try {
            const response = await fetch('/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: `image ${prompt}` })
            });
            const data = await response.json();
            addMessage(data.response, 'system');
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error generating image', 'system');
        }
    }
});
        
        isRecording = false;
        voiceBtn.classList.remove('active');
        voiceWave.style.animation = 'none';
    }
});

// Image generation handling
const imageBtn = document.getElementById('imageBtn');
imageBtn.addEventListener('click', async () => {
    const prompt = await fetch('/get_image_prompt', { method: 'GET' });
    const promptData = await prompt.json();
    
    addMessage('Generating image: ' + promptData.prompt, 'system');
    
    try {
        const response = await fetch('/generate_image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: promptData.prompt })
        });
        const data = await response.json();
        
        // Display generated image
        const imgElement = document.createElement('img');
        imgElement.src = data.image_path;
        imgElement.alt = 'Generated Image';
        imgElement.className = 'generated-image';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system';
        messageDiv.appendChild(imgElement);
        document.querySelector('.message-display').appendChild(messageDiv);
    } catch (error) {
        console.error('Error:', error);
        addMessage('Error generating image', 'system');
    }
});

// Text input handling
const commandInput = document.querySelector('.command-input input');
const sendBtn = document.querySelector('.send-btn');

async function sendCommand() {
    const command = commandInput.value.trim();
    if (command) {
        addMessage(command, 'user');
        addToHistory(command);
        commandInput.value = '';
        
        try {
            const response = await fetch('/get_response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command })
            });
            const data = await response.json();
            addMessage(data.response, 'system');
        } catch (error) {
            console.error('Error:', error);
            addMessage('Error processing command', 'system');
        }
    }
}

sendBtn.addEventListener('click', sendCommand);
commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendCommand();
    }
});

// Add keyframe animation for voice wave
const style = document.createElement('style');
style.textContent = `
@keyframes wave {
    0% { transform: scaleY(0.1); }
    50% { transform: scaleY(1); }
    100% { transform: scaleY(0.1); }
}
`;
document.head.appendChild(style);