import mainScene from './main.js'

var config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 650,
    backgroundColor: 0x000000,
    scene: [mainScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y:0},
            debug: false
        }
    }
}
export default config;