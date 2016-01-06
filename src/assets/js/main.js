/* global Phaser */

// Wrapping in jQuery just in case easy DOM access is needed.
(function gametime() {

	// Set base game size
	var game = new Phaser.Game(256, 240, Phaser.CANVAS, 'gameDiv');

	var showDeadZone = false;

	var playerSprites = {
		venkman:'assets/images/venkman_ss.png'

		// TODO: add more character sprite options
		// ray:'assets/images/venkman_ss.png',
		// egon:'assets/images/venkman_ss.png',
		// winston:'assets/images/venkman_ss.png',
		// louis:'assets/images/venkman_ss.png',
		// janine:'assets/images/venkman_ss.png'
	};

	var pixel = {
		scale: 2,
		canvas: null,
		context: null,
		width: 0,
		height: 0
	};

	var player1;
	var player1_dir; // 0:up, 3:right, 6:down, 9:left
	var walkSpeed = 2;

	var bosonDarts;
	var fireRate = 8;
	var nextFire = 0;

	var main = {

		preload: function() {
			game.load.spritesheet('player1', playerSprites.venkman, 16, 24, 12);
			game.load.image('tile', 'assets/images/tile.png');
			game.load.image('bosonDart', 'assets/images/bullet.png');

			player1_dir = 3;
		},

		create: function() {

			game.physics.startSystem(Phaser.Physics.ARCADE);

			this.setupCanvas();

			game.add.tileSprite(0, 0, 512, 480, 'tile');

			player1 = game.add.sprite(100, 100, 'player1');

			player1.animations.add('standdown',  [0], 6, true);
			player1.animations.add('standleft',  [3], 6, true);
			player1.animations.add('standup',    [6], 6, true);
			player1.animations.add('standright', [9], 6, true);

			player1.animations.add('walkdown',  [0,1,2,1],    10, true);
			player1.animations.add('walkleft',  [3,4,5,4],    10, true);
			player1.animations.add('walkup',    [6,7,8,7],    10, true);
			player1.animations.add('walkright', [9,10,11,10], 10, true);

			player1.anchor.set(0.5, 0.5);
			player1.smoothed = false;

			bosonDarts = game.add.group();
			bosonDarts.enableBody = true;
   			bosonDarts.physicsBodyType = Phaser.Physics.ARCADE;

			bosonDarts.createMultiple(50, 'bosonDart');
			bosonDarts.setAll('checkWorldBounds', true);
			bosonDarts.setAll('outOfBoundsKill', true);

			this.setupPlayfield();
		},

		update: function() {
			this.updatePlayerMovement();
		},

		render: function() {
			var deadZone = game.camera.deadzone;

			if(showDeadZone) {
				// Draw camera dead zone
				game.context.fillStyle = 'rgba(0,255,0,0.6)';
				game.context.fillRect(deadZone.x, deadZone.y, deadZone.width, deadZone.height);
			}

			pixel.context.drawImage(game.canvas, 0, 0, game.width, game.height, 0, 0, pixel.width, pixel.height);
		},

		setupCanvas: function() {
			game.stage.backgroundColor = '#124184';
			game.canvas.style['display'] = 'none';

			pixel.canvas = Phaser.Canvas.create(game, game.width * pixel.scale, game.height * pixel.scale);
			console.log(game.width * pixel.scale);
			console.log(game.height * pixel.scale);
			pixel.context = pixel.canvas.getContext('2d');
			Phaser.Canvas.addToDOM(pixel.canvas);
			Phaser.Canvas.setSmoothingEnabled(pixel.context, false);
			pixel.width = pixel.canvas.width;
			pixel.height = pixel.canvas.height;

		},

		setupPlayfield: function() {
			// Set up world and camera
			game.world.setBounds(0, 0, 512, 480);
			game.camera.follow(player1);
			// Pos.X = (Window.X - Rec.X) / 2, Pos.Y = (Window.Y - Rec.Y) / 2
			// Camera deadzone: allows the power to move fluidly in a small space without the camera shifting
			game.camera.deadzone = new Phaser.Rectangle(112, 104, 32, 32);
		},

		updatePlayerMovement: function() {
			// This could use improvement, especially when integrating virtual controls for mobile
			
			// Left
			if((game.input.keyboard.isDown(Phaser.Keyboard.LEFT) ||
				game.input.keyboard.isDown(Phaser.Keyboard.A)) 
				&& player1.x > 0) {

				player1.x -= walkSpeed;
				player1.animations.play('walkleft');
				player1_dir = 9;
			// Right
			} else if((game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) ||
				game.input.keyboard.isDown(Phaser.Keyboard.D)) 
				&& player1.x < 512) {

				player1.x += walkSpeed;
				player1.animations.play('walkright');
				player1_dir = 3;
			}

			// Up
			if((game.input.keyboard.isDown(Phaser.Keyboard.UP) ||
				game.input.keyboard.isDown(Phaser.Keyboard.W)) 
				&& player1.y > 0) {

				player1.y -= walkSpeed;
				player1.animations.play('walkup');
				player1_dir = 0;

			// Down
			} else if((game.input.keyboard.isDown(Phaser.Keyboard.DOWN) ||
						game.input.keyboard.isDown(Phaser.Keyboard.S))
						&& player1.y < 480) {

				player1.y += walkSpeed;
				player1.animations.play('walkdown');
				player1_dir = 6;
			}

			if( !game.input.keyboard.isDown(Phaser.Keyboard.LEFT) &&
				!game.input.keyboard.isDown(Phaser.Keyboard.A) &&

				!game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) &&
				!game.input.keyboard.isDown(Phaser.Keyboard.D) &&

				!game.input.keyboard.isDown(Phaser.Keyboard.UP) &&
				!game.input.keyboard.isDown(Phaser.Keyboard.W) &&

				!game.input.keyboard.isDown(Phaser.Keyboard.DOWN) &&
				!game.input.keyboard.isDown(Phaser.Keyboard.S)) {

				switch(player1_dir) {
					case 0:
						player1.animations.play('standup');
						break;
					case 3:
						player1.animations.play('standright');
						break;
					case 6:
						player1.animations.play('standdown');
						break;
					case 9:
						player1.animations.play('standleft');
						break;
					default:
						player1.animations.play('standdown');
				}
			}

			if(game.input.keyboard.isDown(Phaser.Keyboard.Z)) {
				this.fire();
			}
		},

		fire: function() {
			if(game.time.now > nextFire && bosonDarts.countDead() > 0) {
				nextFire = game.time.now  + fireRate;
				var bosonDart = bosonDarts.getFirstDead();

				switch(player1_dir) {
					case 0:
						bosonDart.reset(player1.x-4, player1.y-12);
						break;
					case 3:
						bosonDart.reset(player1.x+4, player1.y-2);
						break;
					case 6:
						bosonDart.reset(player1.x-4, player1.y+4);
						break;
					case 9:
						bosonDart.reset(player1.x-12, player1.y-2);
						break;
				}

				game.physics.arcade.moveToPointer(bosonDart, 300);

			}
		}

	};

	game.state.add('main', main);
	game.state.start('main');

})();


