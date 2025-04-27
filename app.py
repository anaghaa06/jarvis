from flask import Flask, request, jsonify
from flask.templating import render_template
import openai_request as ai
import image_generation
import speech_recognition as sr
import mtranslate
import datetime
import random
import webbrowser
from plyer import notification
import pyautogui
import wikipedia
import pywhatkit as pwk
import smtplib
import user_config
import pyttsx3

app = Flask(__name__)

# Initialize text-to-speech engine
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id)
engine.setProperty("rate", 170)

# Store chat history
jarvis_chat = []

def speak(audio):
    print(audio)
    engine.say(audio)
    engine.runAndWait()
    return audio

def listen():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source)
    try:
        content = r.recognize_google(audio, language='en-in')
        content = mtranslate.translate(content, to_language="en-in")
        return content.lower()
    except Exception as e:
        return "Could not understand audio"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/start_voice', methods=['POST'])
def start_voice():
    text = listen()
    return jsonify({'text': text})

@app.route('/get_response', methods=['POST'])
def get_response():
    global jarvis_chat
    data = request.json
    user_input = data.get('command', '').lower()

    if "hello" in user_input:
        response = "Welcome, How can i help you."
    elif "play music" in user_input:
        song = random.randint(1,3)
        if song == 1:
            url = "https://www.youtube.com/watch?v=yJg-Y5byMMw"
        elif song == 2:
            url = "https://www.youtube.com/watch?v=TW9d8vYrVFQ"
        else:
            url = "https://www.youtube.com/watch?v=U6cPjurCOmQ"
        webbrowser.open(url)
        response = "Playing music"
    elif "say time" in user_input:
        now_time = datetime.datetime.now().strftime("%H:%M")
        response = f"Current time is {now_time}"
    elif "say date" in user_input:
        now_date = datetime.datetime.now().strftime("%d:%m")
        response = f"Current date is {now_date}"
    elif "new task" in user_input:
        task = user_input.replace("new task", "").strip()
        if task:
            with open("todo.txt", "a") as file:
                file.write(task + "\n")
            response = f"Added task: {task}"
        else:
            response = "No task specified"
    elif "speak task" in user_input:
        with open("todo.txt", "r") as file:
            tasks = file.read()
        response = f"Work we have to do today is: {tasks}"
    elif "show work" in user_input:
        with open("todo.txt", "r") as file:
            tasks = file.read()
        notification.notify(title="Today's work", message=tasks)
        response = "Showing tasks in notification"
    elif "wikipedia" in user_input:
        query = user_input.replace("wikipedia", "").strip()
        result = wikipedia.summary(query, sentences=2)
        response = result
    elif "image" in user_input:
        image_generation.generate_image(user_input)
        response = "Generating image based on your request"
    elif "ask ai" in user_input:
        jarvis_chat = []
        query = user_input.replace("ask ai", "").strip()
        jarvis_chat.append({"role": "user", "content": query})
        response = ai.send_request(jarvis_chat)
    elif "clear chat" in user_input:
        jarvis_chat = []
        response = "Chat cleared"
    else:
        jarvis_chat.append({"role": "user", "content": user_input})
        response = ai.send_request(jarvis_chat)
        jarvis_chat.append({"role": "assistant", "content": response})

    return jsonify({'response': speak(response)})

if __name__ == '__main__':
    app.run(debug=True)