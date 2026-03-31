import Phaser from 'phaser'

export default class Game extends Phaser.Scene {


    // /** @type {Phaser.Physics.Arcade.StaticGroup} */
    // gameBoard

    // /** @type {Phaser.Physics.Arcade.Sprite} */
    // activeCard

    // /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    // cursors

    // /** @type {Phaser.Physics.Arcade.Sprite} */
    // boardIcon

    cardData= 888
    noCardsDrawn = 0
    matchCheckArrays = {
        'Player 1': [],
    }
    dealButton

    winArrays = [
        [0, 1, 2, 3],
        [0, 3, 12 , 15],
        [0, 4, 8, 12],
        [0, 5, 10, 15],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 6, 9, 12],
        [3, 7, 11, 15],
        [4, 5, 6, 7],
        [5, 6, 9, 10],
        [8, 9, 10, 11],
        [12, 13, 14, 15]
    ]


    constructor() {
        super('game')
    }

    init() {

        this.cursors = this.input.keyboard.createCursorKeys()
    }

    create() {


        const { width, height } = this.scale

        this.gameBoard = this.physics.add.staticGroup()

        //BELOW gives a point where a predefined board can be inserted instead of calling this.createBoardArray()
        const gameBoardArray = this.createBoardArray()
        this.createBoard(gameBoardArray, 0.25, 0.45, 0.45, 'Player 1')

        //BELOW create additional cards for co-players
        const noAddlBoards = 6

        for (let addl = 2; addl < noAddlBoards + 2; addl++) {
            let addlPlayer = 'Player '+ addl
            let addlBoardArray = this.createBoardArray()
            let addlX = .75 + .145 * (addl%2)
            let addlY = 0.2 + 0.275 * Math.floor((addl-2)/2)
            let addlScale = .14
            this.createBoard(addlBoardArray, addlX, addlY, addlScale, addlPlayer)
            this.matchCheckArrays[(`${addlPlayer}`)] = []
        }


        //BELOW creates deck of 54 cards.
        //TWG how does this correspond to @type statements above?
        this.deckArray = Phaser.Utils.Array.NumberArray(0, 53)
        console.log('kkk')
        console.log(this.deckArray)
        Phaser.Utils.Array.Shuffle(this.deckArray)
        console.log(this.deckArray)



        //BELOW creates top card i.e. visual back of card
        this.topCard = this.add.image(675, 350, 'frontCard').setScale(1.33).setDepth(-33)

        this.dealButton = this.add.text(width * .56, height * .60, 'Deal!', { fontSize: 28}).setOrigin(0.5)

        this.dealButton.setInteractive()
        this.dealButton.on('pointerdown', this.handleDeal, this.card)

        this.cardsDrawn = this.add.text(width * .56, height * .65, '', { fontSize: 18}).setOrigin(0.5)

        this.gameStatus = this.add.text(width * 0.5, height * .95, '', { fontSize: 64}).setOrigin(0.5)

    }

    createBoardArray() {

        //BELOW to randomize cards without having repeats. Though as written, still possible that second random call will repeat (which is actually OK- just don't want three repeats)
        let gameBoardArray = []
        for (let item = 0; item < 16; item++) {
            let gameBoardItem = Math.floor(Math.random()*54)
            if (gameBoardArray.includes(gameBoardItem)) {
                gameBoardItem = Math.floor(Math.random()*54)
            }
            gameBoardArray.push(gameBoardItem)
        }
        return gameBoardArray
    }


    createBoard(gameBoardArray, boardXRatio, boardYRatio, itemScale, playerName) {

        const { width, height }  = this.scale
        const boardLocX = boardXRatio * width
        const boardLocY = boardYRatio * height
        this.add.image(boardLocX, boardLocY, 'paper').setScale(itemScale)

        //Given .png image d X h = 200 x 332 (check Preloader.js) and 4 X 4 gameBoard
        let itemD = 200
        let itemH = 332
        let itemSpace = 25
        let initX = boardLocX - ((4 * itemD + 3 * itemSpace) * 0.5 * itemScale)
        let initY = Math.floor(boardLocY - ((4 * itemH + 3 * itemSpace) * 0.5 * itemScale))
        let incremX = (itemD + itemSpace) * itemScale
        let incremY = (itemH + itemSpace) * itemScale
        this.playerNameText = this.add.text(initX + (itemD+itemSpace/2)*itemScale, initY + (4*itemH + 5*itemSpace)*itemScale, playerName, { fontSize: (96*itemScale)})

        for (let row =0; row < 4; row++) {
            for (let col = 0; col <4; col++) {
                /** @type {Phaser.Physics.Arcade.Sprite} */
                const boardIcon = this.gameBoard.get(initX + (incremX * col), initY + (incremY * row), 'loteria', gameBoardArray[4*row + col]).setOrigin(0, 0)
                    boardIcon.setScale(itemScale)
                    .setData('xLoc', initX + (incremX * col))
                    .setData('yLoc', initY + (incremY * row))
                    .setData('scale', itemScale)
                    .setData('picId', gameBoardArray[4*row + col])
                    .setData('boardId', 4*row + col )
                    .setData('playerName', playerName)
            }
        }
        this.add.image(boardLocX, boardLocY, 'texture').setScale(itemScale).setAlpha(.1)
    }

    handleDeal() {
        console.log(`ppp`)

    }

    dealCard() {
        this.activeCard = this.deckArray.shift()
    }


    updateDeck() {

        let activeCard

        if (this.cursors.up.isDown && !this.flipFlop) {
            this.dealButton.setText('Down to Check')
            this.deckIndex = this.deckArray.shift()
            this.card = this.add.sprite(675, 350, 'loteria', this.deckIndex).setScale(0, 1)
            this.card.setData('id' , this.deckIndex )
            this.flipFlop = true

                this.tweens.add({
                    targets: this.card,
                    x: 675,
                    y: 350,
                    scaleX: 1,

                    duration: 200,
                    onComplete: () => {
                        activeCard = this.card
                        this.cardData = this.card.getData('id')
                        this.noCardsDrawn++
                        this.cardsDrawn.setText(`Cards Drawn: ${this.noCardsDrawn}`)

                    }})
        }
    }


    //BELOW checking for matches across all boards and changing them to green if true.
    /**
     *
     * @param {Phaser.Physics.Arcade.Sprite} boardIcon
     */
    checkMatch() {
        const random = Math.floor(Math.random() * 7);
        const ranX = Math.floor(Math.random() * 25);
        const ranY = Math.floor(Math.random() * 75);
        this.children.each(c => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const child = c
            if (child.getData('picId') === this.cardData) {
                let playerNameName = child.getData('playerName')
                let playerBoardId = child.getData('boardId')
                let scale = child.getData('scale')
                let xLoc = child.getData('xLoc')+(ranX*scale)
                let yLoc = child.getData('yLoc')+(ranY*scale)
                this.matchCheckArrays[(`${playerNameName}`)].push(playerBoardId)
                console.log(this.matchCheckArrays[(`${playerNameName}`)])
                this.coke = this.add.sprite(300, -2500, 'cokeSprites2', random).setScale(.275*scale).setOrigin(0, 0)
                this.tweens.add({
                    targets: this.coke,
                    x: xLoc,
                    y: yLoc,
                    // scaleX: 1,

                    duration: 500,
                    onComplete: () => {
                        child.setTint(0x00ff00).setAlpha(.33)
                    }
                })

                if (this.matchCheckArrays[(`${playerNameName}`)].length > 3) {
                    this.checkWinConditions((`${playerNameName}`))
                }
            }
        })
    }

    updateBoardSelection() {
        if (!this.flipFlop2) {
            this.flipFlop2 = true
        }
    }

    flipFlipFlop() {

        if( this.cursors.down.isDown && this.flipFlop) {
            this.flipFlop = false
            this.flipFlop2 = false
            this.dealButton.setText(`Up to Deal`)
            this.checkMatch()
        }
    }

    checkWinConditions(playerNameName) {

        const plrArray = this.matchCheckArrays[(`${playerNameName}`)]
        for (let i = 0; i < this.winArrays.length; i++) {
            if (this.checkContains(this.winArrays[i], plrArray)) {
                this.gameStatus.setText(`${playerNameName} Wins!`)
            }
        }
    }

    checkContains(first, second) {

        const indexArray = first.map(el => {
            return second.indexOf(el)
        })
        return indexArray.indexOf(-1) === -1
    }

    update() {

        this.updateDeck()
        this.updateBoardSelection()
        this.flipFlipFlop()

    }
}