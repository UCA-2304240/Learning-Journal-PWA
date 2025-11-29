import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")

def get_static_paths():
    """Get all file paths under the static directory"""
    paths = []
    
    for root, dirs, files in os.walk(STATIC_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            relative_path = os.path.relpath(full_path, BASE_DIR)
            # Convert to forward slashes and prepend /
            web_path = '"/' + relative_path.replace('\\', '/') + '",'
            paths.append(web_path)
    
    return sorted(paths)

if __name__ == "__main__":
    paths = get_static_paths()
    for path in paths:
        print(path)

# ! Remove service workers and manifest.json from list as they are not needed