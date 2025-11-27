document.querySelector("#add_tag").addEventListener("click", (e) => {
    let new_tag_dom = document.createElement("div");
    new_tag_dom.setAttribute("contenteditable", "true");
    new_tag_dom.innerText = "New Tag";

    let tag_container = document.querySelector("#tag_container");
    tag_container.insertBefore(new_tag_dom, tag_container.lastElementChild);

});

document.querySelector("#add_entry").addEventListener("click", (e) => {
    let tag_elems = document.querySelectorAll("#tag_container > div");
    let tags = [];
    for (let i = 0; i < tag_elems.length - 1; i++) {
        tags.push(tag_elems[i].innerText);
    }
    let entry = {
        "title": document.querySelector("#title").innerText,
        "sub_title": document.querySelector("#sub_title").innerText,
        "tags": tags,
        "content": document.querySelector("#content").innerText,
        "author": document.querySelector("#author").innerText,
        "date": document.querySelector("#date").innerText,
    }

    fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry)
    }).then(res => {
        if(res.ok) {
            location.reload();
        }
    })
});

document.querySelectorAll(".choose-board-recent-del").forEach((elem, index) => {
    elem.addEventListener("click", (e) => {
        fetch("/api/reflections", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "index": index })
        }).then(res => {
            if(res.ok) {
                location.reload();
            }
        })
    });
});