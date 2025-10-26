const navBar = `
<div class="choose-menu">
    <div class="choose-menu-links">
        <a href="/index.html"><i class="ph-house-light"></i></a>
        <a href="/pages/journal.html"><i class="ph-magnifying-glass-plus-fill"></i>journal</a>
        <a href="/pages/about.html"><i class="ph-users-three-fill"></i>about</a>
        <a href="/pages/projects.html"><i class="ph-gear-six-fill"></i>projects</a>
    </div>
</div>
`;

let script = document.scripts[document.scripts.length - 1];
script.parentElement.insertAdjacentHTML('afterbegin', navBar);
script.remove();