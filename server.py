from flask import Flask, request, jsonify, render_template
from config import OPENAI_API_KEY
from openai_helper import get_ai_reply
import openai
import os

openai.api_key = OPENAI_API_KEY

app = Flask(__name__)

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
        start_triggered = True  # ✅ 第一次祈願即觸發大銀幕開始

    # 取得 AI 回應
    reply = get_ai_reply(user_message, stage="normal")
    return jsonify({'reply': reply})

@app.route('/api/shouldStart')
def should_start():
    return jsonify({'shouldStart': start_triggered})

@app.route('/display')
def display():
    return render_template('display.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)

