let DEBUG_MODE = false; // set to false to remove hitboxes
let performanceMode = false;
let performanceBackground;
(() => {
    let benchy;
    let font;
    let uuid;
    if (localStorage.getItem('uuid')) {
        uuid = localStorage.getItem('uuid');
    } else {
        uuid = crypto.randomUUID();
        localStorage.setItem("uuid",uuid);
    }

    // === INPUT HANDLING ===
    let spacePressed = false;
    let wPressed = false;
    let aPressed = false;
    let sPressed = false;
    let dPressed = false;
    let shiftPressed = false;
    let faceForward = true; // tracks which way benchy is facing

    // === GAME VARIABLES ===
    let gameState = 'playing';
    let score = 0;
    let highScore = 0;
    let freezeTimer = 0; // for "level" transitions
    let level = 1;
    let highlevel = 1;

    // === PLAYER SETTINGS ===
    let benchyConfig = {
        x: 0, // current x pos
        y: 400, // current y pos
        z: 75, // current z pos - DOES NOT CHANGE
        velocityY: 0, // stores the y velocity
        velocityX: 0, // stores the x velocity
        speed: 8, // default speed
        sprintSpeed: 15, // how fast the benchy moves when holding shift
        walkSpeed: 8, // how fast the benchy moves when it is moving by default
        gravity: -0.5, // gravity is backwards because webgl uses negatives for y-Pos
        jumpForce: 12, // makes benchy jump higher
        groundY: 0, // used for ground collisions
        isJumping: false, // self explanitory
        acf: 0.08, // air control factor - lower = less air control
        ga: 0.2, // ground acceleration - higher = snappier movement
    };

    // Hitbox adjustments
    let hitboxOffsets = {
        x: 100,
        y: 30,
        z: -100,
        w: 30,
        h: 20,
        d: 40,
    };

    // === CAMERA SETUP ===
    let cameraConfig = {
        z: 800,
    };

    // === LEVEL GENERATION ===
    let scenes = [];
    let sceneWidth = 500; // default width
    let lastSceneWidth = sceneWidth;
    let lastSceneX = 0;

    // Basic starting scene - nothing fancy
    let defaultScene = {
        ground: 0,
        platforms: [{ x: 100, y: 100, w: 200 }],
        coins: [{ x: 200, y: 150 }],
        spikes: [{ x: 0, y: 100 }],
        sceneWidth: 200,
    };

    // Load scenes from external file (scenesFile should be defined elsewhere)
    let sceneTemplates = scenesFile;

    let parallaxLayers; // will be populated in preload()

    // === ASSET LOADING ===
    window.preload = () => {
        // Loading all our assets
        performanceBackground = loadImage('./water/6.png');
        benchy = loadModel('./LowPoly3DBenchy.obj'); // our main character!
        font = loadFont('font.ttf');

        // Parallax background layers - these create nice depth
        parallaxLayers = [
            { y: -100, z: 45, speed: 0.11, img: loadImage('water/5.png'), tileCount: 20, offsetTiles: 3 },
            { y: 145, z: 50, speed: 0.12, img: loadImage('water/4.png'), tileCount: 20, offsetTiles: 3 },
            // { y: -100, z: 15, speed: 0.35, img: loadImage('./clouds/1.png'), tileCount: 20, offsetTiles: 3 },  // disabled for now
            { y: -100, z: 14, speed: 0.13, img: loadImage('./clouds/2.png'), tileCount: 20, offsetTiles: 3 },
            { y: -100, z: 13, speed: 0.14, img: loadImage('./clouds/3.png'), tileCount: 20, offsetTiles: 3 },
            { y: -60, z: 0, speed: 0.15, img: loadImage('./clouds/4.png'), tileCount: 20, offsetTiles: 3 }, // too many clouds
            { y: 60, z: 15, speed: 0, img: loadImage('water/1.png'), tileCount: 20, offsetTiles: 3 }, // Bottom Sand with water
            { y: 210, z: 15, speed: 0, img: loadImage('./water/2.png'), tileCount: 20, offsetTiles: 3 }, //sandy mountain thing
        ];
    };

    // === INITIALIZATION ===
    window.setup = () => {
        let canvas = createCanvas(800, 600, WEBGL);
        canvas.parent('game-canvas-container');
        angleMode(DEGREES); // I find degrees easier to work with than radians
        textFont(font);

        // Start with the default scene and add a few more
        addScene(defaultScene);
        for (let i = 1; i < 4; i++) {
            addScene();
        }
    };

    // === COLLISION DETECTION HELPERS ===
    function getPlayerHitbox() {
        // Calculate the player's collision box
        const halfW = 5 + hitboxOffsets.w;
        const halfH = 5 + hitboxOffsets.h;
        const halfD = 5 + hitboxOffsets.d;

        return {
            left: benchyConfig.x - halfW + hitboxOffsets.x,
            right: benchyConfig.x + halfW + hitboxOffsets.x,
            top: benchyConfig.y + halfH + hitboxOffsets.y,
            bottom: benchyConfig.y - halfH + hitboxOffsets.y,
            front: benchyConfig.z - halfD + hitboxOffsets.z,
            back: benchyConfig.z + halfD + hitboxOffsets.z,
        };
    }

    // === DEBUG VISUALIZATION ===
    function drawPlayerHitbox() {
        if (!DEBUG_MODE) return; // safety check

        let hitbox = getPlayerHitbox();

        // Calculate center and dimensions
        let w = hitbox.right - hitbox.left;
        let h = hitbox.top - hitbox.bottom;
        let d = hitbox.back - hitbox.front;
        let centerX = (hitbox.left + hitbox.right) / 2;
        let centerY = (hitbox.top + hitbox.bottom) / 2;
        let centerZ = (hitbox.front + hitbox.back) / 2;

        push();
        noFill();
        stroke(255, 0, 0); // bright red so it's easy to see
        strokeWeight(2);
        translate(centerX, -centerY, -centerZ); // flip Y for screen coords
        box(w, h, d);
        pop();
    }

    function isOnGround() {
        const playerHitbox = getPlayerHitbox();
        const feetY = playerHitbox.bottom;
        const tolerance = 1.5; // small buffer to prevent jittery behavior

        // Check all platforms in all scenes
        for (let scene of scenes) {
            for (let platform of scene.platforms) {
                const platformTop = platform.y + (platform.h / 2 || 10);
                const platformLeft = scene.startX + platform.x - platform.w / 2;
                const platformRight = scene.startX + platform.x + platform.w / 2;

                // Check if player is horizontally aligned with platform
                const horizontalOverlap = playerHitbox.right > platformLeft && playerHitbox.left < platformRight;

                // Check if feet are close enough to platform top
                if (horizontalOverlap && feetY >= platformTop - tolerance && feetY <= platformTop + tolerance) {
                    return true;
                }
            }
        }

        return false; // not on any platform
    }

    function applyGravity() {
        const playerHitbox = getPlayerHitbox();
        const currentFeetY = playerHitbox.bottom;

        // Apply gravity force
        benchyConfig.velocityY += benchyConfig.gravity;
        const nextY = benchyConfig.y + benchyConfig.velocityY;
        const nextFeetY = nextY - (benchyConfig.y - playerHitbox.bottom);

        // Only check for platform collisions when falling
        if (benchyConfig.velocityY < 0) {
            let landedOnPlatform = false;
            let highestPlatformTop = -Infinity;

            for (let scene of scenes) {
                for (let platform of scene.platforms) {
                    const platformTop = platform.y + (platform.h / 2 || 10);
                    const platformLeft = scene.startX + platform.x - platform.w / 2;
                    const platformRight = scene.startX + platform.x + platform.w / 2;

                    // Check horizontal overlap
                    const horizontalOverlap = playerHitbox.right > platformLeft && playerHitbox.left < platformRight;

                    // Check if we're landing on this platform
                    if (horizontalOverlap && currentFeetY >= platformTop && nextFeetY <= platformTop) {
                        landedOnPlatform = true;
                        highestPlatformTop = Math.max(highestPlatformTop, platformTop);
                    }

                    // Debug visualization for platforms
                    if (DEBUG_MODE) {
                        push();
                        rectMode(CENTER);
                        noFill();
                        stroke('lime');
                        strokeWeight(2);
                        translate(0, 0, platform.d || 50);
                        rect((platformLeft + platformRight) / 2, -platform.y, platform.w, platform.h || 10);
                        pop();
                    }
                }
            }

            // Land on the highest platform we collided with
            if (landedOnPlatform) {
                benchyConfig.y = highestPlatformTop + (benchyConfig.y - playerHitbox.bottom);
                benchyConfig.velocityY = 0;
                benchyConfig.isJumping = false;
                return;
            }
        }

        // No collision, update position normally
        benchyConfig.y = nextY;
    }

    function handleMovement() {
        // Determine target horizontal velocity based on input
        let targetVelocityX = 0;
        if (dPressed) {
            targetVelocityX = benchyConfig.speed;
        } else if (aPressed) {
            targetVelocityX = -benchyConfig.speed;
        }

        // Apply different acceleration based on whether we're grounded
        if (isOnGround()) {
            // Ground movement - more responsive
            benchyConfig.velocityX += (targetVelocityX - benchyConfig.velocityX) * benchyConfig.ga;
        } else {
            // Air movement - less control
            benchyConfig.velocityX += (targetVelocityX - benchyConfig.velocityX) * benchyConfig.acf;
        }

        // Clean up tiny velocities to prevent jitter
        if (Math.abs(benchyConfig.velocityX) < 0.1) {
            benchyConfig.velocityX = 0;
        }

        // Update facing direction based on movement
        if (benchyConfig.velocityX < 0) {
            faceForward = false;
        } else if (benchyConfig.velocityX > 0) {
            faceForward = true;
        }

        // Apply horizontal movement
        benchyConfig.x += benchyConfig.velocityX;
    }

    function handleJump() {
        // Only allow jumping when on ground and jump keys are pressed
        if ((spacePressed || wPressed) && isOnGround()) {
            benchyConfig.velocityY = benchyConfig.jumpForce;
            benchyConfig.isJumping = true;
        }
    }

    function handleSprint() {
        // Gradually adjust speed towards target (sprint vs walk)
        const targetSpeed = shiftPressed ? benchyConfig.sprintSpeed : benchyConfig.walkSpeed;
        if (benchyConfig.speed < targetSpeed) {
            benchyConfig.speed += 1; // speed up
        } else if (benchyConfig.speed > targetSpeed) {
            benchyConfig.speed -= 1; // slow down
        }
    }

    function checkObjectCollisions() {
        let playerHitbox = getPlayerHitbox();

        // Check each scene for collectibles and hazards
        for (let scene of scenes) {
            // Coin collection
            if (scene.coins) {
                for (let i = scene.coins.length - 1; i >= 0; i--) {
                    let coin = scene.coins[i];
                    let coinX = scene.startX + coin.x;
                    let coinY = coin.y;
                    let coinRadius = 24;

                    // Simple circle-to-rectangle collision
                    let closestX = Math.max(playerHitbox.left, Math.min(coinX, playerHitbox.right));
                    let closestY = Math.max(playerHitbox.bottom, Math.min(coinY, playerHitbox.top));

                    if (dist(coinX, coinY, closestX, closestY) < coinRadius) {
                        scene.coins.splice(i, 1); // remove collected coin
                        score += 10;
                    }

                    // Debug visualization for coins
                    if (DEBUG_MODE) {
                        push();
                        ellipseMode(CENTER);
                        noFill();
                        stroke('green');
                        strokeWeight(2);
                        ellipse(scene.startX + coin.x, -coin.y, coinRadius * 2);
                        pop();
                    }
                }
            }

            // Spike collision (deadly!)
            if (scene.spikes) {
                for (let spike of scene.spikes) {
                    let spikeX = scene.startX + spike.x;
                    let spikeY = spike.y + 20; // visual offset
                    let spikeWidth = 20;
                    let spikeHeight = 20;

                    const hitboxPadding = 1; // small safety margin
                    const safePadding = Math.min(hitboxPadding, spikeWidth / 2);

                    // Calculate spike boundaries
                    const spikeTop = spikeY + spikeHeight / 2 - safePadding;
                    const spikeBottom = spikeY - spikeHeight / 2 + safePadding;
                    const spikeLeft = spikeX - spikeWidth / 2 + safePadding;
                    const spikeRight = spikeX + spikeWidth / 2 - safePadding;

                    // AABB collision detection
                    if (playerHitbox.right > spikeLeft && playerHitbox.left < spikeRight && playerHitbox.bottom < spikeTop && playerHitbox.top > spikeBottom) {
                        onDeath();
                    }

                    // Debug visualization for spikes
                    if (DEBUG_MODE) {
                        push();
                        rectMode(CENTER);
                        noFill();
                        strokeWeight(2);

                        // Draw collision box in green
                        stroke('lime');
                        rect(spikeX, -spikeY, spikeWidth - safePadding * 2, spikeHeight - safePadding * 2);

                        // Draw visual representation in red
                        stroke('red');
                        strokeWeight(1);
                        rect(spikeX, -spikeY, spikeWidth, spikeHeight);
                        pop();
                    }
                }
            }
        }
    }

    // === GAME STATE MANAGEMENT ===
    function onDeath() {
        gameState = 'dead';
        score += level * 100; // level based score
        if (score > highScore) {
            highScore = score;
        }
        highlevel = level;
    }

    window.resetGame = (isLightReset) => {
        // Clear and regenerate scenes
        scenes = [];
        lastSceneX = 0;
        addScene(defaultScene);
        for (let i = 1; i < 4; i++) {
            addScene();
        }

        // Reset player position and physics
        benchyConfig.x = 0;
        benchyConfig.y = 200;
        benchyConfig.z = 75;
        benchyConfig.velocityY = 0;
        benchyConfig.velocityX = 0;
        gameState = 'playing';

        // Only reset level on full restart
        if (!isLightReset) {
            score = 0;
            level = 1;
        }
    };

    // === UI RENDERING ===
    function drawScoreboard() {
        push();
        resetMatrix(); // switch to 2D screen coordinates
        textFont(font);
        textSize(24);
        textAlign(RIGHT, TOP);
        fill(0);

        // Position relative to player but fixed on screen
        let screenX = benchyConfig.x - 20;
        let screenY = -200;
        translate(0, 0, 10); // bring forward a bit

        // Display current game stats
        text(`Score: ${score}`, screenX, screenY);
        text(`High: ${highScore}`, screenX, screenY + 28);
        text(`Level: ${level}`, screenX, screenY + 56);
        pop();
    }

    function drawLevelChange() {
        camera(0, 0, cameraConfig.z, 0, 0, 0);

        // Semi-transparent overlay
        fill(0, 0, 0, 180);
        rectMode(CENTER);
        rect(0, 0, width, height);

        // Death message and stats
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(36);
        text(`Level ${level}`, 0, 0);
    }

    // === MAIN GAME LOOP ===
    window.draw = () => {
        background(163, 199, 255); // nice sky blue

        // Background rendering - performance mode uses static image
        if (!performanceMode) {
            for (const layer of parallaxLayers) {
                drawBackground(layer);
            }
            let direction = createVector(0, 50, -5);
            directionalLight(255, 228, 156, direction);
        } else {
            push();
            translate(0, 0, -100);
            image(performanceBackground, benchyConfig.x - 1100, -500);
            pop();
        }

        if (gameState === 'playing') {
            // Debug info if enabled
            if (DEBUG_MODE) {
                drawDebug();
                drawPlayerHitbox();
            }

            // Physics update
            applyGravity();

            // Input handling (unless frozen for level transition)
            if (--freezeTimer <= 0) {
                handleJump();
                handleSprint();
                handleMovement();
            } else {
                drawLevelChange();
            }

            // Level progression - reset at 9000 units
            if (benchyConfig.x > 9000) {
                level += 1;
                freezeTimer = 180; // brief pause
                resetGame(true);
            }

            // Collision detection
            checkObjectCollisions();

            // Fall death check
            if (benchyConfig.y <= -1000) {
                onDeath();
            }

            // Camera follows player with slight offset
            camera(benchyConfig.x + 200, 0, cameraConfig.z, benchyConfig.x + 200, 0, 0);

            // Scene management and rendering
            manageScenes();
            drawScenes();
            drawPlayer();
            drawScoreboard();
        } else if (gameState === 'dead') {
            benchyConfig.x = 0; // reset camera position
            drawDeathScreen();
        }
    };

    // === SCENE MANAGEMENT ===
    function addScene(forceScene) {
        // Use provided scene or pick random template
        let template = random(sceneTemplates);
        if (forceScene) {
            template = forceScene;
        }

        // Deep copy the template to avoid modifying original
        let newScene = JSON.parse(JSON.stringify(template));
        newScene.startX = lastSceneX;
        lastSceneX += template.sceneLength || sceneWidth;
        scenes.push(newScene);
        lastSceneWidth = template.sceneLength || sceneWidth;
    }

    function manageScenes() {
        // Keep generating scenes ahead of the player
        while (lastSceneX - benchyConfig.x < lastSceneWidth * 2) {
            addScene();
        }

        // Update ground level based on current scene
        for (let scene of scenes) {
            if (benchyConfig.x >= scene.startX && benchyConfig.x < scene.startX + sceneWidth) {
                benchyConfig.groundY = scene.ground;
            }
        }
    }

    function drawScenes() {
        noStroke();
        fill(255, 200, 150); // nice tan color for platforms

        // Render all scene elements
        for (let scene of scenes) {
            // Draw platforms
            for (let platform of scene.platforms) {
                push();
                rectMode(CENTER);
                translate(scene.startX + platform.x, -platform.y, 0);
                box(platform.w || 0, platform.h || 10, platform.d || 100);
                pop();
            }

            // Draw coins (if any)
            if (scene.coins) {
                for (let coin of scene.coins) {
                    push();
                    fill(255, 223, 0); // gold color
                    translate(scene.startX + coin.x, -coin.y, 0);
                    sphere(10);
                    pop();
                }
            }

            // Draw spikes (if any)
            if (scene.spikes) {
                for (let spike of scene.spikes) {
                    push();
                    fill(150, 0, 0); // dark red
                    translate(scene.startX + spike.x, -spike.y - 20, 25);
                    rotateX(180);
                    cone(10, 20);
                    pop();
                }
            }

            // Draw water hazards (if any)
            if (scene.water) {
                for (let water of scene.water) {
                    push();
                    fill(0, 100, 255, 150); // semi-transparent blue
                    translate(scene.startX + water.x, -water.y, 0);
                    box(water.w, 5, 200);
                    pop();
                }
            }
        }
    }

    // === PLAYER RENDERING ===
    function drawPlayer() {
        push();
        normalMaterial();
        translate(benchyConfig.x, -benchyConfig.y, -benchyConfig.z);
        rotateX(90);

        // Flip model based on facing direction
        if (!faceForward) {
            translate(200, 200, 0);
            rotateY(180);
            rotateX(-180);
        }

        model(benchy);
        pop();
    }

    // === DEATH SCREEN ===
    function drawDeathScreen() {
        camera(0, 0, cameraConfig.z, 0, 0, 0);

        // Semi-transparent overlay
        fill(0, 0, 0, 180);
        rectMode(CENTER);
        rect(0, 0, width, height);

        // Death message and stats
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(36);
        text('YOU DIED', 0, 0);

        textSize(20);
        text(`Score: ${score}`, 0, 40);
        text(`High Score: ${highScore}`, 0, 70);
        text(`Level: ${level}`, 0, 100);

        $('#dialog').get(0).classList.remove('opacity-0', 'pointer-events-none');
        $('#scoreEnd').html(score);
        $('#levelEnd').html(level);
    }

    // === BACKGROUND PARALLAX ===
    function drawBackground(config) {
        // Calculate parallax effect based on depth and player position
        let depthDifference = config.z - benchyConfig.z;
        let scaleFactor = 1 / (1 + depthDifference * 0.001);
        let parallaxSpeed = config.speed * scaleFactor;
        let tileWidth = 500 * scaleFactor;
        let tileHeight = 300 * scaleFactor;
        let worldX = benchyConfig.x * parallaxSpeed;

        push();
        translate(0, 0, -config.z);

        // Draw repeating tiles
        for (let i = -(config.offsetTiles || 3); i < (config.tileCount || 7); i++) {
            let x = i * tileWidth - (worldX % tileWidth);
            push();
            translate(x, config.y, 0);

            if (config.img) {
                texture(config.img);
                plane(tileWidth, tileHeight);
            } else {
                fill(config.color);
                plane(tileWidth, tileHeight);
            }
            pop();
        }
        pop();
    }

    // === DEBUG OVERLAY ===
    function drawDebug() {
        push();
        resetMatrix();
        textFont(font);
        textSize(14);
        textAlign(RIGHT, TOP);

        // Debug info lines
        let debugLines = [
            `x: ${benchyConfig.x.toFixed(1)}`,
            `y: ${benchyConfig.y.toFixed(1)}`,
            `z: ${benchyConfig.z.toFixed(1)}`,
            `velY: ${benchyConfig.velocityY.toFixed(2)}`,
            `velX: ${benchyConfig.velocityX.toFixed(2)}`,
            `speed: ${benchyConfig.speed}`,
            `sprinting: ${shiftPressed}`,
            `isJumping: ${benchyConfig.isJumping}`,
            `onGround: ${isOnGround()}`,
            `groundY: ${benchyConfig.groundY}`,
            `scenes: ${scenes.length}`,
            `fps: ${Math.max(0, Math.round(frameRate()))}`,
        ];

        // Calculate debug box dimensions
        let margin = 8;
        let lineHeight = 18;
        let maxWidth = Math.max(...debugLines.map((line) => textWidth(line))) + margin * 2;
        let boxWidth = maxWidth;
        let boxHeight = debugLines.length * lineHeight + margin * 2;
        let boxX = width / 2 - margin - boxWidth;
        let boxY = -height / 2 + margin;

        // Draw debug box background
        fill(0, 0, 255, 140);
        noStroke();
        rectMode(CORNER);
        rect(boxX, boxY, boxWidth, boxHeight, 6);

        // Draw debug box border
        stroke(0, 200, 0, 200);
        noFill();
        rect(boxX, boxY, boxWidth, boxHeight, 6);

        // Draw debug text
        fill(0, 255, 0);
        for (let i = 0; i < debugLines.length; i++) {
            text(debugLines[i], width / 2 - margin, boxY + margin + i * lineHeight);
        }
        pop();
    }

    // === INPUT HANDLING ===
    window.keyPressed = () => {
        // Map key codes to input state
        if (keyCode === 32) spacePressed = true; // Space
        if (keyCode === 87) wPressed = true; // W
        if (keyCode === 65) aPressed = true; // A
        if (keyCode === 83) sPressed = true; // S
        if (keyCode === 68) dPressed = true; // D
        if (keyCode === SHIFT) shiftPressed = true; // Shift
        if (keyCode === UP_ARROW) wPressed = true;
        if (keyCode === LEFT_ARROW) aPressed = true;
        if (keyCode === DOWN_ARROW) sPressed = true;
        if (keyCode === RIGHT_ARROW) dPressed = true;
        if (gameState !== 'dead') {
            return false;
        } // prevent default browser behavior
    };

    window.keyReleased = () => {
        // Clear input state when keys are released
        if (keyCode === 32) spacePressed = false; // Space
        if (keyCode === 87) wPressed = false; // W
        if (keyCode === 65) aPressed = false; // A
        if (keyCode === 83) sPressed = false; // S
        if (keyCode === 68) dPressed = false; // D
        if (keyCode === SHIFT) shiftPressed = false; // Shift
        if (keyCode === UP_ARROW) wPressed = false;
        if (keyCode === LEFT_ARROW) aPressed = false;
        if (keyCode === DOWN_ARROW) sPressed = false;
        if (keyCode === RIGHT_ARROW) dPressed = false;
        if (gameState !== 'dead') {
            return false;
        } // prevent default browser behavior
    };

    window.showScoreModal = () => {
        let modal = $('#dialog').get(0);
        modal.classList.remove('hidden');
    };

    window.submitscore = () => {
        $.ajax({
            url: 'https://p5api.retreat896.com/addScore',
            method: 'POST',
            contentType: 'application/json', // important
            dataType: 'json', // expecting JSON back
            data: JSON.stringify({
                username: String($('#username').val()),
                highscore: Number(highScore), // ensure number
                highlevel: Number(highlevel), // ensure number
                uuid: String(uuid),
            }),
            success: function (data) {
                const scoresList = $('#scorelist');
                scoresList.empty();
                let rank = 1;

                // sort by highscore
                data.scores.sort((a, b) => b.highscore - a.highscore);

                data.scores.forEach((scoreEntry) => {
                    const listItem = $(`
                    <li class="flex items-center justify-center bg-gray-700/50 p-3 rounded-md transition-transform hover:scale-105 hover:bg-gray-700 flex-1 gap-4">
                        <div class="flex items-center gap-1">
                            <span class="font-bold text-yellow-400">${rank}</span>
                            <span class="font-semibold">
                                ${scoreEntry.username.charAt(0).toUpperCase() + scoreEntry.username.slice(1)}
                            </span>
                        </div>
                        <span class="font-bold text-blue-400">
                            Score: ${scoreEntry.highscore} - Level: ${scoreEntry.highlevel}
                        </span>
                    </li>`);
                    scoresList.append(listItem);
                    rank++;
                });
            },
            error: function (xhr, status, error) {
                console.error('Error submitting score:', error, xhr.responseText);
            },
        });
    };
})();
