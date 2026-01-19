# Learning-Journal-PWA

The Learning Journal is Progressive Web Application (PWA) for showcasing and documenting the learning progress throughout the course. The learning objectives mainly cover frontend and backend. The main content of the PWA is the reflections of each week, and the mini project which is the game of Pong. The main style is from code Pen, and new css classes are built on top with similar naming conventions. One of the key challenge throughout the entire progress is the transition to the flask app structure, which underwent a major reconstruction to html, script, and project structure, essentially rethinking everything.

# Project Structure
├───data (dynamic json files)
├───py
├───static
│   ├───css
│   ├───images
│   └───js
└───templates (dynamic html files)

# Page Structure
Jinja is used for the pages. Currently, all pages inherit from base, which includes the basic header and footer.