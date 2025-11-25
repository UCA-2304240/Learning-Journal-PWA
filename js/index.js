// Date
const dateContainer = document.querySelector('.choose-header-time-1');
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

// localStorage for welcome text
const welocomeContainer = document.querySelector('.choose-header-welcome-blurb');
if(localStorage.getItem('welcomeText')) {
    welocomeContainer.value = localStorage.getItem('welcomeText');
} else {
    welocomeContainer.value = "Customize your welcome message here. Be sure to unfocus before refreshing to save the text";
}
welocomeContainer.addEventListener('change', (e) => {
    localStorage.setItem('welcomeText', e.target.value);
});
