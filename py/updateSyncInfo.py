import json
import random
import string

if __name__ == "__main__":
    data = {}
    data["dayToken"] = ''.join(random.choices(string.ascii_letters + string.digits, k=16))
    with open("data/syncInfo.json", "w") as f:
        f.write(json.dumps(data, ensure_ascii=False, indent=2))