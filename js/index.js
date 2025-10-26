// Date
const dateContainer = document.querySelector('.choose-header-event-1');

function updateDate() {
    
    let now = new Date();
    let dateStr = now.toLocaleTimeString();
    dateStr += "<b>" + now.toLocaleDateString() + "</b>";
    dateContainer.innerHTML = dateStr;

    setTimeout(() => {
        updateDate();
    }, 1000);
}

updateDate();

// Banner Image
const bannerImg = document.querySelector('.choose-banner-img');
const bannerTitle = document.querySelector('.choose-banner-title-1');
document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    // const y = e.clientY / window.innerHeight;
    bannerImg.style.right = `${x * 2 + 40}%`;
    bannerTitle.style.left = `${x * 1 + 10}%`;
});