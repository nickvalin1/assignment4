window.onload = function() {
    
    var game = new Phaser.Game( 800, 640, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    function preload() {
        game.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('tiles', 'assets/tiles/tiles.png');
        game.load.spritesheet('dude', 'assets/dude.png', 32, 32);
        game.load.spritesheet('enemy', 'assets/alien.gif', 108, 105);
        game.load.audio('music', 'assets/starman.m4a');
    }
    
    var music;
    var enemies;
    var map;
    var layer;
    var player;
    var cursors;
    
    function create() {
        game.physics.startSystem(Phaser.Physics.ARCADE);
        
        music=game.add.audio('music');
        music.addMarker('start', 19, 175);
        music.play('start');
        
        map=game.add.tilemap('map');
        map.addTilesetImage('tiles');
        map.setCollision([36]);
        layer=map.createLayer('Tile Layer 1');
        layer.resizeWorld();
        
        player=game.add.sprite(32,64, 'dude');
        game.physics.arcade.enable(player);
        player.body.bounce.y=.2;
        player.body.gravity.y=300;
        player.body.collideWorldBounds=true;
        player.animations.add('left', [3,4,5], 10, true);
        player.animations.add('right', [6,7,8], 10, true);
        player.scale.setTo(.75,.75);
        
        enemies=game.add.group();
        enemies.enableBody=true;
        makeEnemy(32,576);
        makeEnemy(192, 576);
        makeEnemy(224, 192);
        makeEnemy(544, 96);
        makeEnemy(768, 576);
        makeEnemy(1184, 448);
        makeEnemy(1216, 576);
        makeEnemy(1472, 576);
        
        cursors=game.input.keyboard.createCursorKeys();
        
        game.camera.follow(player);
    }
    
    function makeEnemy(x,y) {
        var enemy=enemies.create(x,y,'enemy');
        enemy.scale.setTo(.3,.3);
        enemy.body.gravity.y=300;
        enemy.body.velocity.x=50*(game.rnd.integerInRange(5,10)/10);
        enemy.anchor.setTo(.5,.5);
        enemy.animations.add('right', [0,1,2], 5, true);
        enemy.animations.play('right');
    }
    
    function changeDirection(enemy) {
        if (enemy.body.blocked.right){
            enemy.body.velocity.x=-50*(game.rnd.integerInRange(5,10)/10);
            enemy.scale.x *= -1;
        }
        else if(enemy.body.blocked.left){
            enemy.body.velocity.x=50*(game.rnd.integerInRange(5,10)/10);
            enemy.scale.x *= -1;
        }
    }
    
    function mathProblem(player,enemy) {
        var x=game.rnd.integerInRange(1,10);
        var y=game.rnd.integerInRange(1,10);
        var answer=x+y;
        var input=0;
        while (input!=answer) {
            input = prompt(x+' + '+y+' =');
        }
        enemy.kill();
        player.body.velocity.x=0;
        player.body.velocity.y=0;
        //fixes a bug where the direction held will stay held until pressed again
        cursors.left.isDown=false;
        cursors.right.isDown=false;
        cursors.up.isDown=false;
        cursors.down.isDown=false;
    }
    
    function update() {
        game.physics.arcade.collide(layer, player);
        game.physics.arcade.collide(enemies, player, mathProblem, null, this, enemies);
        game.physics.arcade.collide(enemies, layer);
        player.body.velocity.x=0;
        if (cursors.left.isDown) {
            player.body.velocity.x=-150;
            player.animations.play('left');
            if (player.body.blocked.right&&!player.body.onFloor()) {//wall jump
                player.body.velocity.y=-150;
            }
        }
        else if (cursors.right.isDown) {
            player.body.velocity.x=150;
            player.animations.play('right');
            if (player.body.blocked.left&&!player.body.onFloor()) {//wall jump
                player.body.velocity.y=-150;
            }
        }
        else {
            player.animations.stop();
            player.frame=1;
        }
        if (cursors.up.isDown && (player.body.onFloor()||player.body.touching.down)) {
            player.body.gravity.y=300;
            player.body.velocity.y=-300;
        }
        if (cursors.down.isDown &&(!player.body.onFloor()||player.body.touching.down)) {
            player.body.gravity.y=600;
        }
        enemies.forEachAlive(changeDirection,this);
    }
}