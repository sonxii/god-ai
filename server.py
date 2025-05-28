from flask import Flask, request, jsonify, render_template
from config import OPENAI_API_KEY
from openai_helper import get_ai_reply
import openai
import os

openai.api_key = OPENAI_API_KEY

app = Flask(__name__)

history = []

# 狀態控制變數
start_triggered = False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pray', methods=['POST'])
def pray():
    global start_triggered
    data = request.get_json()
    user_message = data.get('message')

    if not start_triggered:
        start_triggered = True

    # 拿 GPT 回應
    reply = get_ai_reply(user_message, stage="normal")

    # 把對話加入歷史紀錄
    history.append({
        "user": user_message,
        "reply": reply
    })

    return jsonify({'reply': reply})

@app.route('/api/shouldStart')
def should_start():
    return jsonify({'shouldStart': start_triggered})

@app.route('/latest')
def latest():
    if history:
        return jsonify(history[-1])  # 傳出最新一筆
    else:
        return jsonify({"reply": "尚未有祈願"})
        
@app.route('/api/response_count')
def response_count():
    return jsonify({'response_count': len(history)})


@app.route('/display')
def display():
    return render_template('display.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

