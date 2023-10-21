var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var score = 0;
var scoreMax = 0;
var scoreText = 'Score: ' + score;
var scoreMaxText = 'Max: ' + window.sessionStorage.getItem("Max");
var autor = 'By David Moreno Alonso'
var music;
var starAudio;
var deadAudio;
var jumpAudio;
var gameOver = false;

var game = new Phaser.Game(config)

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    this.load.audio('music', 'assets/audio.mp3');
    this.load.audio('starAudio', 'assets/star.mp3')
    this.load.audio('dead', 'assets/dead.mp3')
    this.load.audio('jump', 'assets/jump.mp3')

}

function create() {
    music = this.sound.add('music', { loop: true, volume: .9 });
    music.play();
    starAudio = this.sound.add('starAudio', { loop: false });
    deadAudio = this.sound.add('dead', { loop: false });
    jumpAudio = this.sound.add('jump', { loop: false, volume: 2 });

    this.add.image(400, 300, 'sky');

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
    platforms.create(400, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450, 'dude');
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //player.body.setGravityY(300);
    this.physics.add.collider(player, platforms);

    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 10, stepX: 70 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.2, 0.2))
    });
    this.physics.add.collider(stars, platforms);

    this.physics.add.overlap(player, stars, collectStar, null, true)

    scoreText = this.add.text(16, 16, scoreText, { fontSize: '25px', fill: '#000' });
    scoreMaxText = this.add.text(16, 40, scoreMaxText, { fontSize: '25px', fill: '#000' });
    autor = this.add.text(590, 570, autor, { fontSize: '15px', fill: '#000' });

    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, bombs);
    this.physics.add.collider(player, bombs, hitbomb, null, this)
}

function update() {
    if (gameOver) {
        return;
    }
    if (score > window.sessionStorage.getItem("Max")) {
        scoreMax = score;
        scoreMaxText.setText('Max: ' + scoreMax);
        window.sessionStorage.setItem("Max", scoreMax)
    }
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn', true);
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
        jumpAudio.play();
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    starAudio.play();
    score += 10;
    scoreText.setText('Score: ' + score);
    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true)
        });
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 100)
    }
}

function hitbomb(player, bomb) {
    this.physics.pause();
    music.stop();
    deadAudio.play();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}


document.addEventListener("keydown", function () {
    if (event.key=== "r") {
        location.reload();
    }
})