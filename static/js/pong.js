import * as THREE from 'three';
//https://github.com/dannylessio/threejs-pong-game/blob/master/webgl/pong_game.js

// -------------- Parameters --------------
// gameplay
var ball_speed = 0.1;

// asthetics
var x_plane = 10;
var y_plane = 5;
var x_cube = 0.1;
var y_cube = 0.5;
var ball_radius = 0.1;


// -------------- Global Variables --------------
var camera, post_scene, game_scene, renderer, renderTarget;
var player1, player2, ball;
var keyState = {};
var player1_score = 0;
var player2_score = 0;
var gamePaused = true;

const themeColor = {
    dark0: '#202020',
    dark1: '#222',
    dark2: '#252525',
    dark3: '#292929',
    dark4: '#2e2e2e',
    border: '#333',
    light1: '#eee',
    light2: '#e3e3e3',
    light3: '#d9d9d9',
    light4: '#999',
    blue2: '#888994',
    blue1: '#aeaeb0',
    red: '#ab4f4f',
    group1: '#AF7746',
    group2: '#93A253',
    group3: '#5B9F96',
    group4: '#758CBD',
    group5: '#867BA7',
    group6: '#AD719B'
};

const postProcessShader = `
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

//https://www.shadertoy.com/view/WsVSzV


float warp = 1.75; // simulate curvature of CRT monitor
float scan = 0.5; // simulate darkness between scanlines

void mainImage(out vec4 fragColor,in vec2 fragCoord)
{
    // squared distance from center
    vec2 uv = fragCoord/iResolution.xy;
    vec2 dc = abs(0.5-uv);
    dc *= dc;
    
    // warp the fragment coordinates
    uv.x -= 0.5; uv.x *= 1.0+(dc.y*(0.3*warp)); uv.x += 0.5;
    uv.y -= 0.5; uv.y *= 1.0+(dc.x*(0.4*warp)); uv.y += 0.5;

    // sample inside boundaries, otherwise set to black
    if (uv.y > 1.0 || uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0)
        fragColor = vec4(0.0,0.0,0.0,0.0);
    else
    {
        // determine if we are drawing in a scanline
        float apply = abs(sin(fragCoord.y + iTime)*0.5*scan);
        // sample the texture
    	fragColor = vec4(mix(texture(iChannel0,uv).rgb,vec3(1),apply),1.0);
    }
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`
    ;

const shader_uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
    iChannel0: { type: "t", value: null }

};

function setWorld() {
    // renderer
    renderer = new THREE.WebGLRenderer({ canvas: pongCanvas, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(pongCanvas.clientWidth, pongCanvas.clientHeight);

    // render target
    renderTarget = new THREE.WebGLRenderTarget(pongCanvas.clientWidth, pongCanvas.clientHeight);

    // scenes
    game_scene = new THREE.Scene();
    post_scene = new THREE.Scene();
}

function setObjects() {
    // ================ Game Scene ================

    // ---------------- Camera ----------------
    let cam_size = 5.5;
    camera = new THREE.OrthographicCamera(-cam_size, cam_size, cam_size / 2, -cam_size / 2, 0.1, 1000);
    camera.position.z = 5;

    // ---------------- Game Objects ----------------
    // background
    var geometry = new THREE.BoxGeometry(x_plane, y_plane, 0.01);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.dark4 });
    var background = new THREE.Mesh(geometry, material);
    game_scene.add(background);

    // center split line
    var geometry = new THREE.BoxGeometry(0.05, y_plane, 0.1);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.red });
    var dec1 = new THREE.Mesh(geometry, material);
    game_scene.add(dec1);

    // top line
    var geometry = new THREE.BoxGeometry(x_plane + 0.1, 0.05, 0.1);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.border });
    var dec2 = new THREE.Mesh(geometry, material);
    dec2.position.y = y_plane / 2 + 0.025;
    game_scene.add(dec2);

    // bottom line
    var geometry = new THREE.BoxGeometry(x_plane + 0.1, 0.05, 0.1);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.border });
    var dec3 = new THREE.Mesh(geometry, material);
    dec3.position.y = -y_plane / 2 - 0.025;
    game_scene.add(dec3);

    // player 1
    var geometry = new THREE.BoxGeometry(x_cube, y_cube, 0.1);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.group3 });
    player1 = new THREE.Mesh(geometry, material);
    player1.position.x = -x_plane / 2;
    game_scene.add(player1);

    // player 2
    var geometry = new THREE.BoxGeometry(x_cube, y_cube, 0.1);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.group4 });
    player2 = new THREE.Mesh(geometry, material);
    player2.position.x = x_plane / 2;
    game_scene.add(player2);


    // ball
    var geometry = new THREE.SphereGeometry(ball_radius, 32, 32);
    var material = new THREE.MeshBasicMaterial({ color: themeColor.red });
    ball = new THREE.Mesh(geometry, material);
    ball.position.z += 0.05;
    game_scene.add(ball);


    // ================ Post Scene ===============

    // ---------------- Game Objects ----------------
    // full screen quad for postprocessing
    var geometry = new THREE.PlaneGeometry(camera.right - camera.left, camera.top - camera.bottom);
    var material = new THREE.ShaderMaterial({
        fragmentShader: postProcessShader,
        uniforms: shader_uniforms
    });
    var post_plane = new THREE.Mesh(geometry, material);
    post_scene.add(post_plane);


}

function save_ball_speed() {
    if (ball_speed != 0) {
        return ball_speed;
    }
}

var lock = 0;
function respawn_on_player1(recover_speed) {
    ball.position.copy(player1.position);
    console.log(recover_speed)
    ball_speed = -recover_speed;
    lock = 0;
}

function respawn_on_player2(recover_speed) {
    ball.position.copy(player2.position);
    console.log(recover_speed)
    ball_speed = -recover_speed;
    lock = 0;
}

function get_random_angle(minimum, maximum) {

    var randomnumber = Math.random() * (maximum - minimum) + minimum;

    return randomnumber;
}

var ball_angle = Math.PI;
var player2_speed = 0.05;

function game_loop(time) {

    ball.position.x += ball_speed * Math.cos(ball_angle);
    ball.position.y += ball_speed * Math.sin(ball_angle);


    /* check player1 collision */
    if ((ball.position.x < player1.position.x + (x_cube / 2)) &&
        (ball.position.y < (player1.position.y + y_cube / 2)) &&
        (ball.position.y > (player1.position.y - y_cube / 2))) {

        if (lock == 0) {
            ball.position.x = player1.position.x + (x_cube / 2);
            ball_speed = -ball_speed;
            ball_angle = get_random_angle(-Math.PI / 4, Math.PI / 4);
        }
    }

    /* check player2 collision */
    if ((ball.position.x > player2.position.x - (x_cube / 2)) &&
        (ball.position.y < (player2.position.y + y_cube / 2)) &&
        (ball.position.y > (player2.position.y - y_cube / 2))) {

        if (lock == 0) {
            ball.position.x = player2.position.x - (x_cube / 2);
            ball_speed = -ball_speed;
            ball_angle = get_random_angle(-Math.PI / 4, Math.PI / 4);
        }
    }

    /* collision with tob barrier */
    if (ball.position.y >= (y_plane / 2)) {
        ball_angle = -ball_angle;
    }

    /* collision with tob barrier */
    if (ball.position.y <= -(y_plane / 2)) {
        ball_angle = -ball_angle;
    }

    /* AI of red player */
    if (player2.position.y <= (ball.position.y - player2_speed)) {
        if (player2.position.y < ((y_plane / 2) - (y_cube / 2))) {
            player2.position.y += player2_speed;
        }
    }

    if (player2.position.y > ball.position.y) {
        if (player2.position.y > (- (y_plane / 2) + (y_cube / 2))) {
            player2.position.y -= 0.1;
        }
    }

    /* Goal on player1 side */
    if (ball.position.x < -x_plane / 2 - 2 * ball_radius) {
        var old_ball_speed = save_ball_speed();

        if (lock == 0) {
            player2_score += 1;
            document.getElementById("player2_score").innerHTML = player2_score;
            setTimeout(respawn_on_player1, 1000, old_ball_speed);
            lock = 1;
        }

        ball_speed = 0;
    }


    /* Goal on player2 side */
    if (ball.position.x > x_plane / 2 + 2 * ball_radius) {

        var old_ball_speed = save_ball_speed();

        if (lock == 0) {
            player1_score += 1;
            document.getElementById("player1_score").innerHTML = player1_score;
            setTimeout(respawn_on_player2, 1000, old_ball_speed);
            lock = 1;
        }

        ball_speed = 0;
    }

    if (!gamePaused) {
        requestAnimationFrame(game_loop);
    }
}

function render_loop(time) {
    time = time * 0.001; // convert to seconds

    shader_uniforms.iResolution.value.set(pongCanvas.width, pongCanvas.height, 1);
    shader_uniforms.iTime.value = time;
    shader_uniforms.iChannel0.value = renderTarget.texture;

    renderer.setRenderTarget(renderTarget);
    renderer.render(game_scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(post_scene, camera);

    requestAnimationFrame(render_loop);
}


function setEventListenerHandler() {
    window.addEventListener('keydown', function (e) {
        keyState[e.keyCode || e.which] = true;
    }, true);

    window.addEventListener('keyup', function (e) {
        keyState[e.keyCode || e.which] = false;
    }, true);

    window.addEventListener('resize', onWindowResize, false);

    resetGame.addEventListener('click', reset);
    pauseGame.addEventListener('click', () => {
        if (gamePaused) {
            gamePaused = false;
            pauseGame.innerHTML = "Pause Game";
            game_loop();
        } else {
            gamePaused = true;
            pauseGame.innerHTML = "Resume Game";
        }
    });
}

function setKeyboardControls() {
    setTimeout(setKeyboardControls, 10);
    if (gamePaused) {
        return;
    }

    if (keyState[87]) {

        if (player1.position.y < ((y_plane / 2) - (y_cube / 2))) {
            player1.position.y += 0.1;
        }
    }

    if (keyState[83]) {

        if (player1.position.y > (- (y_plane / 2) + (y_cube / 2))) {
            player1.position.y -= 0.1;
        }
    }


}


function onWindowResize() {
}


function reset() {

    player1_score = 0;
    player2_score = 0;
    document.getElementById("player1_score").innerHTML = player1_score;
    document.getElementById("player2_score").innerHTML = player2_score;

    if (lock == 0) {
        ball.position.x = 0;
        ball.position.y = 0;
        ball_speed = -0.1;
        ball_angle = Math.PI;
    }
}

function setup() {
    setEventListenerHandler();
    setKeyboardControls();
    setWorld();
    setObjects();
    requestAnimationFrame(render_loop);
}

setup();