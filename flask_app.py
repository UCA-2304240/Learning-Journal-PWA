# Flask → web framework we use.
# request → gets data sent from the client (form submission in JSON).
# jsonify → converts Python data into JSON for responses.
# render_template → loads the form4.html file from the templates/ folder.
# json, os → for file reading/writing.
# datetime → to add a date when a reflection is submitted.
from flask import Flask, request, jsonify, render_template
import json
import os
from datetime import datetime

# Creates the Flask application object.
app = Flask(__name__)
# BASE_DIR = current folder.
# DATA_FILE = path to reflections.json, the file where reflections are stored.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


# Internal Functions
def load_reflections():
    path = os.path.join(DATA_DIR, "reflections.json")
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return []


def save_reflections(reflections):
    path = os.path.join(DATA_DIR, "reflections.json")
    with open(path, "w") as f:
        json.dump(reflections, f, indent=4, ensure_ascii=False)

# pages
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/journal")
def journal():
    return render_template("journal.html", reflections=load_reflections())

@app.route("/journal/zxcv")
def journal_edit():
    return render_template("journal_edit.html", reflections=load_reflections())

@app.route("/about")
def about():
    return render_template("about.html")

@app.route("/projects")
def projects():
    return render_template("projects.html")

# other routes
@app.route("/data/<filename>")
def data(filename):
    if not filename.endswith(".json"):
        return 400
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f), 200
    return 404

@app.route('/sw.js')
def service_worker():
    return app.send_static_file('js/sw.js')


# Defines /api/reflections with GET method.
# Loads reflections from the JSON file.
# Returns them as JSON to the front-end.
@app.route("/api/reflections", methods=["GET"])
def get_reflections():
    reflections = load_reflections()
    return jsonify(reflections)


@app.route("/api/reflections", methods=["POST"])
def add_reflection():
    data = request.get_json(force=True)

    reflections = load_reflections()
    reflections.append(data)
    save_reflections(reflections)

    return jsonify(data), 201

@app.route("/api/reflections", methods=["DELETE"])
def delete_reflection():
    data = request.get_json(force=True)
    reflections = load_reflections()
    
    index = data.get("index")
    if index is not None and 0 <= index < len(reflections):
        reflections.pop(index)
        save_reflections(reflections)
        return jsonify({"success": True, "message": "Reflection deleted"}), 200
    
    return jsonify({"success": False, "message": "Invalid index"}), 400


if __name__ == "__main__":
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run()
