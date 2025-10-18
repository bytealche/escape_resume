from flask import Flask, render_template, redirect, url_for, send_from_directory, jsonify, request
import os

app = Flask(__name__)

# Game Configuration
GAME_CONFIG = {
    "total_levels": 6,
    "total_time_limit": 1800,  # 30 minutes total
    "hint_penalty": 5,  # seconds deducted per hint
    "max_score": 1400
}

# Level Answers (server-side validation)
LEVEL_ANSWERS = {
    1: {
        "type": "text",
        "answer": "aniket",
        "hint": "Each pair of digits (8 bits) represents one letter. Use an ASCII/Binary converter.",
        "points": 100
    },
    2: {
        "type": "text",
        "answer": ["software developer", "softwaredeveloper"],
        "hint": "Shift each letter back by 3 positions in the alphabet. For example: D→A, E→B, F→C.",
        "points": 150
    },
    3: {
        "type": "number",
        "answer": 63,
        "hint": "Look at the pattern: each number is (previous number × 2) + 1. For example: 3×2+1=7, 7×2+1=15.",
        "points": 200
    },
    4: {
        "type": "mapping",
        "answer": {
            "React": "frontend",
            "Node.js": "backend",
            "PostgreSQL": "database",
            "Docker": "devops"
        },
        "hint": "Think about typical web application architecture: Frontend (user interface) → Backend (server logic) → Database (data storage) → DevOps (deployment).",
        "points": 250
    },
    5: {
        "type": "multi-select",
        "answer": ["Python", "JavaScript", "React", "SQL", "Docker"],
        "hint": "Focus on modern web development technologies. Look for languages, frameworks, and tools commonly used in full-stack development.",
        "points": 300
    },
    6: {
        "type": "number",
        "answer": 5,
        "hint": "Calculate: Position A (3 years) + Position B (2 years) + Position C (1 year, but overlaps with A). Don't double-count overlapping years!",
        "points": 400
    }
}


@app.route('/')
def home():
    """Render home page"""
    return render_template('index.html')


@app.route('/level/<int:num>')
def level(num):
    """Render level pages"""
    if 1 <= num <= 6:
        return render_template(f'level{num}.html')
    return redirect(url_for('home'))


@app.route('/api/verify/<int:level_num>', methods=['POST'])
def verify_answer(level_num):
    """API endpoint to verify answers"""
    if level_num not in LEVEL_ANSWERS:
        return jsonify({"success": False, "error": "Invalid level"}), 404
    
    level_data = LEVEL_ANSWERS[level_num]
    data = request.get_json()
    user_answer = data.get('answer', '')
    
    correct = False
    
    # Text input validation
    if level_data['type'] == 'text':
        user_answer = user_answer.strip().lower()
        if isinstance(level_data['answer'], list):
            correct = user_answer in [a.lower() for a in level_data['answer']]
        else:
            correct = user_answer == level_data['answer'].lower()
    
    # Number input validation
    elif level_data['type'] == 'number':
        try:
            correct = int(user_answer) == level_data['answer']
        except (ValueError, TypeError):
            correct = False
    
    # Drag-drop mapping validation
    elif level_data['type'] == 'mapping':
        submitted_mapping = data.get('mapping', {})
        correct = submitted_mapping == level_data['answer']
    
    # Multi-select validation
    elif level_data['type'] == 'multi-select':
        submitted_answers = set(data.get('selected', []))
        correct_answers = set(level_data['answer'])
        correct = submitted_answers == correct_answers
    
    return jsonify({
        "success": correct,
        "points": level_data['points'] if correct else 0,
        "message": "Correct! Level unlocked." if correct else "Incorrect answer. Try again!"
    })


@app.route('/api/hint/<int:level_num>', methods=['GET'])
def get_hint(level_num):
    """API endpoint to get hints"""
    if level_num not in LEVEL_ANSWERS:
        return jsonify({"error": "Invalid level"}), 404
    
    return jsonify({
        "hint": LEVEL_ANSWERS[level_num]['hint'],
        "penalty": GAME_CONFIG['hint_penalty']
    })


@app.route('/api/config', methods=['GET'])
def get_config():
    """Get game configuration"""
    return jsonify(GAME_CONFIG)


@app.route('/resume')
def resume():
    """Serve resume PDF"""
    return send_from_directory('static/assets', 'resume.pdf')


@app.route('/static/css/<path:filename>')
def serve_css(filename):
    """Serve CSS files"""
    return send_from_directory('static/css', filename)


@app.route('/static/js/<path:filename>')
def serve_js(filename):
    """Serve JavaScript files"""
    return send_from_directory('static/js', filename)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)