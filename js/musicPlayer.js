var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        playerVars: {
            'playsinline': 1, 'disablekb': 1, 'loop': 1, 'rel': 0, 'controls': 0, 'fs': 0, 'playlist': [['h0AAFhx3RmA', 'IFF6cbRhAnc']],
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    })
}

window.addEventListener('load', () => {
    var volumeBtn = document.getElementById("volume");
    var playBtn = document.getElementById("play");
    var playTime = document.getElementById("time-played");
    var ff = document.getElementById("ff");
    var rw = document.getElementById("rw");
    var prog = document.getElementById('progress');
    var progImg = document.querySelector("#audio-progress-dragger>img");
    var progCont = document.getElementById("audio-progress-dragger");

    var mousedown = false;
    var percentage = 0;

    playBtn.addEventListener("click", function (e) {
        if (player.getPlayerState() == 1) {
            player.pauseVideo();
            playBtn.classList.remove("fa-pause");
            playBtn.classList.add("fa-play");
            progImg.src = '/images/Kawaii Art.png'

        } else if (player.getPlayerState() == 2 || player.getPlayerState() == -1) {
            player.playVideo();
            playBtn.classList.remove("fa-play");
            playBtn.classList.add("fa-pause");
            progImg.src = '/images/Kawaii Art.gif'
        }
    });


    volumeBtn.addEventListener("click", function (e) {
        volumeBtn.classList.remove("bounce");
        if (player.isMuted()) {
            player.unMute()
            volumeBtn.classList.remove("fa-volume-slash");
            volumeBtn.classList.add("fa-volume");
        } else {
            player.mute()
            volumeBtn.classList.remove("fa-volume");
            volumeBtn.classList.add("fa-volume-slash");
        }
    });


    rw.addEventListener("click", function (e) {
        if (player.getCurrentTime() < 1) {
            player.previousVideo();
        }
        else {
            player.seekTo(player.getCurrentTime() - 10, true);
        }



    });

    ff.addEventListener("click", function (e) {
        player.seekTo(player.getCurrentTime() + 10, true)
    });

    prog.addEventListener("click", (e) => {
        percentage = ((e.x - prog.getClientRects()[0].x) / prog.clientWidth).toFixed(3);
        player.seekTo(percentage * player.getDuration(), true)
    })

    var mouse_down_on_prog = false;
    var current_time_percentage = 0;

    prog.addEventListener("mousedown", (e) => {
        mouse_down_on_prog = true;
        current_time_percentage = ((e.x - prog.getClientRects()[0].x) / prog.clientWidth).toFixed(3);
    })

    window.addEventListener('mousemove', (e) => {
        if (mouse_down_on_prog) {
            current_time_percentage = ((e.x - prog.getClientRects()[0].x) / prog.clientWidth).toFixed(3);
            if (current_time_percentage < 0) {
                current_time_percentage = 0;
            }
            if (current_time_percentage > 1) {
                current_time_percentage = 1;
            }
        }
    });

    window.addEventListener("mouseup", (e) => {
        if (mouse_down_on_prog) {
            current_time_percentage = ((e.x - prog.getClientRects()[0].x) / prog.clientWidth).toFixed(3);
            player.seekTo(current_time_percentage * player.getDuration(), true)
            mouse_down_on_prog = false;
        }
    })


    setInterval(() => {
        time = player.getCurrentTime();
        duration = player.getDuration();
        playTime.innerText = getTimeCodeFromNum(time) + ' / ' + getTimeCodeFromNum(duration);
        if (!mouse_down_on_prog) {
            progCont.setAttribute('style', 'left: ' + (100 * time / duration).toFixed(3) + '%;');
        }
    }, 100)

    setInterval(() => {
        if(player == null) return;
        time = player.getCurrentTime();
        duration = player.getDuration();
        playTime.innerText = getTimeCodeFromNum(time) + ' / ' + getTimeCodeFromNum(duration);
        if (!mouse_down_on_prog) {
            if (player.getPlayerState() != 1) {
                progCont.setAttribute('style', 'left: ' + (100 * time / duration).toFixed(3) + '%;');
            }
        }
    }, 200)


    setInterval(() => {
        if (mouse_down_on_prog) {
            progCont.setAttribute('style', 'left: ' + (100 * current_time_percentage).toFixed(3) + '%;');
        }
    }, 10)

    set_player_width();
})

function getTimeCodeFromNum(num) {
    let seconds = parseInt(num);
    let minutes = parseInt(seconds / 60);
    seconds -= minutes * 60;
    const hours = parseInt(minutes / 60);
    minutes -= hours * 60;

    if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
    return `${String(hours).padStart(2, 0)}:${minutes}:${String(
        seconds % 60
    ).padStart(2, 0)}`;
}

function onPlayerReady() {
    player.setVolume(30);
    player.mute()
    player.playVideo();
}

// Player State: {UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5}
function onPlayerStateChange(e) {
    if (e['data']) {
        title = player.getVideoData().title;
        if (title != null) {
            song_name = title.slice(title.indexOf('《'), title.indexOf('》') + 1)
            document.getElementById("song-name").innerText = song_name;
        }
    }
}

function set_player_width() {
    let w = document.getElementById('player_wrapper');
    w.setAttribute('style', 'flex-basis: ' + (w.clientHeight * 16 / 9).toFixed(3) + 'px;');
    // w.setAttribute('style', 'flex-basis: ' + 0);
}

window.addEventListener('resize', () => {
    set_player_width();
})