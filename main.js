import Phaser from 'phaser'

import Preloader from './scenes/Preloader'
import Game from './scenes/Game'

const config = {
	type: Phaser.AUTO,
	width: 1200,
	height: 900,
	physics: {
		default: 'arcade',
		arcade: {
			}
	},
	scene: [Preloader, Game]
}

export default new Phaser.Game(config)