class mainScene extends Phaser.Scene {
    constructor() {
        super('level_1')
        this.hero_vel = 15
        this.balls_vel = 8
        this.balls_vel_y = [this.balls_vel]
        this.balls_vel_x = [0]
        this.breaker_scale = 0.6
        this.lives = 3
        this.count = 0
        this.WIDTH = 1000
        this.HEIGHT = 650

    } 

    preload() {
        //The basic assets.
        this.load.image('ball', 'assets/ball.png')
        this.load.image('breaker', 'assets/breaker.png')
        this.load.audio('beep', 'assets/beep.mp3')
        this.load.audio('level-up', 'assets/level_up.mp3')
        this.load.audio('you-lost','assets/you_lost.mp3')

        //The backgeound music.
        this.load.audio('background-music', 'assets/background_game_music.mp3')

        //The brick color textures.
        this.load.image('brick_red','assets/brick_red.png')
        this.load.image('brick_orange','assets/brick_orange.png')
        this.load.image('brick_yellow','assets/brick_yellow.png')
        this.load.image('brick_green','assets/brick_green.png')
        this.load.image('brick_blue','assets/brick_blue.png')

        //The power ups.
        this.load.image('extra_balls', 'assets/extra_balls.png')
        this.load.image('extra_life', 'assets/extra_life.png')
        this.load.image('lengthen', 'assets/lengthen.png')

    }
    bounce_up(ball) {
        var random_num_lst = [-3,-2,-1,0,1,2,3]
        let i = Math.floor(Math.random() * random_num_lst.length);
        let random_num = random_num_lst[i]
        this.balls_vel_y[this.balls.getChildren().indexOf(ball)] = -Math.abs(this.balls_vel_y[this.balls.getChildren().indexOf(ball)])
        this.balls_vel_x[this.balls.getChildren().indexOf(ball)] = random_num
            
    }
    bounce(ball) {
        var random_num_lst = [-3,-2,-1,0,1,2,3]
        let i = Math.floor(Math.random() * random_num_lst.length);
        let random_num = random_num_lst[i]
        this.balls_vel_y[this.balls.getChildren().indexOf(ball)] = -(this.balls_vel_y[this.balls.getChildren().indexOf(ball)])
        this.balls_vel_x[this.balls.getChildren().indexOf(ball)] = random_num
    }
    create() {

        this.hero = this.physics.add.sprite(475,550, 'breaker')
        this.hero.setCollideWorldBounds(true)
        this.hero.setScale(0.6)
        this.hero.body.immovable = true

        this.beep = this.sound.add('beep', {loop:false})
        this.level_up = this.sound.add('level-up', {loop:false})
        this.you_lost = this.sound.add('you-lost', {loop:false})
        this.background_music = this.sound.add('background-music', {loop:true})

        this.background_music.play()
        this.balls = this.physics.add.group()
        this.balls.create(this.hero.x,this.hero.y-250, 'ball').setScale(0.1)

        this.bricks = this.physics.add.group()

        //This is where we create the bricks!
        let brick_textures = ['brick_red', 'brick_orange', 'brick_yellow', 'brick_green', 'brick_blue']
        for (let x = 1; x < 6; x++) {
            for (let y = 1; y < 7; y++) {
                this.bricks.create(145*y,50*x,brick_textures[x-1]).setScale(0.5)
            }
        }
       this.power_ups = ['extra_balls', 'extra_life', 'lengthen']

       this.power_ups_group = this.physics.add.group()
       function use_power_up(breaker, power_up) {
            let key = power_up.texture.key
            power_up.disableBody(true,true)
            this.level_up.play()
            if (key == 'extra_life') {
                this.lives += 1
                this.lives_text.setText(`You have ${this.lives - 1} lives left.`)
            } else if (key == 'lengthen') {
                this.breaker_scale += 0.1
                this.hero.scaleX = this.breaker_scale
            } else if (key =='extra_balls') {
                this.balls.create(this.hero.x,this.hero.y-75, 'ball').setScale(0.1)
                this.balls_vel_x.push(0)
                this.balls_vel_y.push(this.balls_vel)
            }

       }
       this.lives_text = this.add.text(50,600, `You have ${this.lives - 1} lives left.`, {fontSize: 15})
       this.physics.add.overlap(this.hero, this.power_ups_group, use_power_up,null,this)


    }
    update() {
        
        this.cursors = this.input.keyboard.createCursorKeys()
        if (this.cursors.right.isDown) {
            this.hero.x += this.hero_vel
        } 
        if (this.cursors.left.isDown) {
            this.hero.x -= this.hero_vel
        }

        function del_brick(ball, brick) {
            if (this.count == 3) {
                this.count = 0
                let i = Math.floor(Math.random() * this.power_ups.length);
                let power_up = this.power_ups[i]
                this.power_ups_group.create(brick.x,brick.y,power_up).setScale(0.1)



            }
            brick.disableBody(true,true)
            this.bricks.getChildren().splice(this.bricks.getChildren().indexOf(brick), 1)
            this.beep.play()
            this.count += 1

       }
        
        for (let i = 0; i < this.balls.getChildren().length; i++) {
            let lst = this.balls.getChildren();
            lst[i].x += this.balls_vel_x[i]
            lst[i].y += this.balls_vel_y[i]
            lst[i].setCollideWorldBounds(true)
            this.physics.add.collider(lst[i],this.hero, this.bounce_up,null,this)
            this.physics.add.overlap(lst[i],this.bricks,this.bounce, null,this)
            this.physics.add.overlap(lst[i],this.bricks,del_brick,null,this)
            if (lst[i].y <= 0) {
                this.bounce(lst[i])
                this.balls_vel_y[i] = Math.abs(this.balls_vel_y[i])
            }
            if (lst[i].x <= 20 || lst[i].x >= this.WIDTH - 20 ) {
                this.bounce(lst[i])
            }
            if (lst[i].y >= 600) {
                //Deleting the ball.
                lst[i].visible = false;
                lst[i].disableBody(true,true)
                lst[i].destroy(true)
                //lst.splice(i,1)
                this.balls_vel_x.splice(i,1)
                this.balls_vel_y.splice(i,1)

                //If there are no extra balls left...
                if (lst.length == 0) {
                    //Updating the number of lives.
                    this.lives -= 1
                    this.lives_text.setText(`You have ${this.lives - 1} lives left.`)

                    //Creating a new ball.
                    this.balls.create(this.hero.x,this.hero.y - 75,'ball').setScale(0.1)
                    this.balls_vel_x.push(0)
                    this.balls_vel_y.push(this.balls_vel)
                }
            }
        }

        if (this.lives == 0) {
            this.add.text(195,175, 'You lost!', {fontSize: 100, color: '#f691ff'})
            this.lives_text.setText('Aw man! You lost!')
            this.you_lost.play()
            this.background_music.stop()
            this.scene.pause()
        }
        this.power_ups_group.children.iterate(function(power_up) {
            power_up.y += 2
        })
        if (this.bricks.getChildren().length == 0) {
            this.scene.pause()
            this.add.text(120, 175, 'Conrgats! You won!', {fontSize: 80, color: '#00ff11'})
        }
    }
    
}
export default mainScene;