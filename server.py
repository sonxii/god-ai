from flask import Flask, request, jsonify, render_template, Response
from openai_helper import get_ai_reply
import openai
import os
import time
from threading import Lock

# ✅ 從 Render 設定的環境變數讀取 API 金鑰與密碼
openai.api_key = os.environ.get("OPENAI_API_KEY")  # 不再從 config 匯入
openai.organization = os.environ.get("OPENAI_ORG_ID")  # 如果你 Render 有設定就加，沒有可省略

ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "default123")
RESET_KEY = os.environ.get("RESET_KEY", "letmein")

app = Flask(__name__)

total_message_count = 0
history = []
final_triggered = False
subscribers = []
lock = Lock()
all_replies = []  # ✅ 新增：收集所有神靈回覆

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/pray', methods=['POST'])
def pray():
    global total_message_count, final_triggered
    data = request.get_json()
    user_message = data.get('message')

    if final_triggered:
        return jsonify({'reply': '神靈已步入沉寂，無法再聽見你的聲音。', 'final_triggered': True})

    with lock:
        total_message_count += 1
        stage = get_stage(total_message_count)

        reply = get_ai_reply(user_message, stage)
        
        all_replies.append(reply)
        history.append({'user': user_message, 'reply': reply})
        notify_subscribers()  # ✅ 每次祈願完即推送更新

        if total_message_count >= 16 and not final_triggered:
            final_triggered = True
            
            notify_final()

    return jsonify({'reply': reply, 'final_triggered': final_triggered})

@app.route('/collect', methods=['POST'])
def collect():
    # ✅ 如果你還是想要手機端額外偷偷送，也可以保留
    data = request.get_json()
    reply = data.get('reply')
    if reply:
        all_replies.append(reply)
        notify_subscribers()
    return jsonify(success=True)

@app.route('/subscribe')
def subscribe():
    def event_stream():
        messages = []
        subscribers.append(messages)
        try:
            while True:
                if messages:
                    msg = messages.pop(0)
                    yield f'data: {msg}\n\n'
                time.sleep(0.5)
        except GeneratorExit:
            subscribers.remove(messages)
    return Response(event_stream(), content_type='text/event-stream')

@app.route('/display')
def display():
    return render_template('display.html')

@app.route('/stream')
def stream():
    def stream_data():
        q = []
        subscribers.append(q)
        try:
            while True:
                if q:
                    _ = q.pop(0)
                    payload = {
                        'replies': all_replies,
                        'count': total_message_count,
                        'stage': get_stage(total_message_count) if not final_triggered else 'final'
                    }
                    yield f'data: {jsonify(payload).get_data(as_text=True)}\n\n'
                time.sleep(0.5)
        except GeneratorExit:
            subscribers.remove(q)
    return Response(stream_data(), content_type='text/event-stream')

def notify_subscribers():
    for messages in subscribers:
        messages.append('UPDATE')

def notify_final():
    for messages in subscribers:
        messages.append('FINAL')

@app.route('/admin', methods=['GET', 'POST'])
def admin():
    global total_message_count, final_triggered, all_replies
    if request.method == 'POST':
        password = request.form.get('password')
        if password == ADMIN_PASSWORD:
            total_message_count = 0
            final_triggered = False
            all_replies.clear()
            history.clear()  # ✅ 清空歷史對話
            return '重置成功！'
        else:
            return '密碼錯誤。'
    return '''
        <form method="post">
            管理者密碼：<input type="password" name="password">
            <input type="submit" value="重置神靈">
        </form>
    '''

@app.route('/reset')
def reset():
    global total_message_count, final_triggered, all_replies
    key = request.args.get('key')
    if key == RESET_KEY:
        total_message_count = 0
        final_triggered = False
        all_replies.clear()
        history.clear()  # ✅ 清空歷史對話
        return '系統已重置。'
    else:
        return '密鑰錯誤。'

@app.route('/api/response_count')
def response_count():
    return jsonify({'response_count': len(history)})
    
@app.route('/latest')
def latest():
    if all_replies:
        return jsonify({'reply': all_replies[-1]})
    else:
        return jsonify({'reply': '目前尚無神靈回應'})
        
def get_stage(count):
    if count <= 7:
        return 'normal'
    elif count <= 11:
        return 'half_glitch'
    else:
        return 'chaos'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, threaded=True)
