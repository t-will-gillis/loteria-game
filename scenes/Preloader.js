import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {

    constructor() {

        super('preloader')
    }

    preload() {

        //BELOW loading spritesheet showing all of the 54 Loteria cards + a texture to place the cards on
        this.load.spritesheet('loteria', 'textures/LoteriaBordersA.png', { frameWidth: 200, frameHeight: 332 })
        this.load.image('paper', 'textures/paper_back.png')
        this.load.image('texture', 'textures/texture.png')
        this.load.image('frontCard', 'textures/LoteriaFront.png')
        // this.load.image('cokeCap', 'textures/cokeCap.png')
        this.load.spritesheet('cokeSprites2', 'textures/cokeSprites2.png', { frameWidth: 750, frameHeight: 750 })
    }

    create() {

        this.scene.start('game')
    }

}