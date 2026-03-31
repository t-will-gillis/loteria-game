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
    gameOver = false
    matchCheckArrays = {
        'Player 1': [],
    }
    dealButton
    p1PlacedSquares = new Set()
    currentDealCaps = []

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

    //BELOW angle (degrees, 0=top/12 o'clock, clockwise) from which each player's cap enters the screen
    playerAngles = {
        'Player 1': 270,
        'Player 2': 10,
        'Player 3': 30,
        'Player 4': 55,
        'Player 5': 75,
        'Player 6': 100,
        'Player 7': 125,
    }


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

        this.dealButton = this.add.text(width * .56, height * .70, 'Deal!', { fontSize: 28}).setOrigin(0.5)

        this.dealButton.setInteractive()
        this.dealButton.on('pointerdown', this.handleDeal, this)

        this.cardsDrawn = this.add.text(width * .56, height * .75, '', { fontSize: 18}).setOrigin(0.5)

        this.gameStatus = this.add.text(width * 0.5, height * .95, '', { fontSize: 64}).setOrigin(0.5)

        this.loteriaButton = this.add.text(width * 0.13, height * 0.88, 'Loteria!', { fontSize: 32 }).setOrigin(0.5)
        this.loteriaButton.setInteractive()
        this.loteriaButton.on('pointerdown', this.claimWin, this)

        this.mentirosaText = this.add.text(width * 0.13, height * 0.93, '', { fontSize: 28 }).setOrigin(0.5)

        this.createPileCap()

    }

    createBoardArray() {

        //BELOW to randomize cards allowing at most one repeated card across the whole board
        let gameBoardArray = []
        let hasDuplicate = false
        for (let item = 0; item < 16; item++) {
            let gameBoardItem = Math.floor(Math.random()*54)
            while (
                gameBoardArray.filter(x => x === gameBoardItem).length >= 2 ||
                (hasDuplicate && gameBoardArray.includes(gameBoardItem))
            ) {
                gameBoardItem = Math.floor(Math.random()*54)
            }
            if (gameBoardArray.includes(gameBoardItem)) hasDuplicate = true
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
        this.doDeal()
    }

    doDeal() {
        if (this.flipFlop) return
        this.deckIndex = this.deckArray.shift()
        this.card = this.add.sprite(675, 350, 'loteria', this.deckIndex).setScale(0, 1)
        this.card.setData('id', this.deckIndex)
        this.flipFlop = true
        const landX = 675 + Phaser.Math.Between(-15, 15)
        const landY = 350 + Phaser.Math.Between(-11, 11)
        const landAngle = Phaser.Math.Between(-6, 6)
        this.tweens.add({
            targets: this.card,
            x: landX,
            y: landY,
            scaleX: 1,
            angle: landAngle,
            duration: 200,
            onComplete: () => {
                this.cardData = this.card.getData('id')
                this.noCardsDrawn++
                this.cardsDrawn.setText(`Cards Drawn: ${this.noCardsDrawn}`)
                this.flipFlop = false
                this.freezePlayerCaps()
                this.scheduleAIMatches()
            }
        })
    }

    updateDeck() {
        if (this.cursors.up.isDown) {
            this.doDeal()
        }
    }


    scheduleAIMatches() {
        const aiPlayers = Object.keys(this.matchCheckArrays).filter(p => p !== 'Player 1')
        aiPlayers.forEach(playerName => {
            const delay = Phaser.Math.Between(500, 3000)
            this.time.delayedCall(delay, () => {
                this.checkMatchForPlayer(playerName)
            })
        })
    }

    createPileCap() {
        const { width, height } = this.scale
        const pileX = width * 0.05
        const pileY = height * 0.45
        const capScale = 0.275 * 0.45
        const random = Math.floor(Math.random() * 7)
        const cap = this.add.sprite(pileX, pileY, 'cokeSprites2', random)
            .setScale(capScale)
            .setOrigin(0.5)
            .setInteractive()
        this.input.setDraggable(cap)
        cap.setData('isPile', true)
        cap.setData('boardId', null)
        cap.setData('homeX', pileX)
        cap.setData('homeY', pileY)
        cap.on('dragstart', () => {
            cap.setData('prevX', cap.x)
            cap.setData('prevY', cap.y)
            cap.setDepth(10)
        })
        cap.on('drag', (_pointer, dragX, dragY) => {
            cap.x = dragX
            cap.y = dragY
        })
        cap.on('dragend', () => {
            cap.setDepth(0)
            this.handleCapDrop(cap)
        })
        this.pileCap = cap
    }

    handleCapDrop(cap) {
        const isPile = cap.getData('isPile')
        const currentBoardId = cap.getData('boardId')
        const target = this.findP1DropTarget(cap.x, cap.y, currentBoardId)

        if (target) {
            const boardId = target.getData('boardId')
            const xLoc = target.getData('xLoc')
            const yLoc = target.getData('yLoc')
            const scale = target.getData('scale')
            const snapX = xLoc + (200 * scale) / 2
            const snapY = yLoc + (332 * scale) / 2

            //BELOW if this placed cap was already on a different square, free the old square
            if (!isPile && currentBoardId !== null) {
                this.currentDealCaps = this.currentDealCaps.filter(e => e.sprite !== cap)
            }

            cap.x = snapX
            cap.y = snapY
            cap.setData('boardId', boardId)
            cap.setData('homeX', snapX)
            cap.setData('homeY', snapY)
            cap.setData('isPile', false)
            this.currentDealCaps.push({ sprite: cap, boardId })

            //BELOW placed cap was the pile cap — spawn a fresh one in the pile
            if (isPile) {
                this.createPileCap()
            }
        } else {
            //BELOW invalid drop — return to where the cap came from
            this.tweens.add({
                targets: cap,
                x: cap.getData('prevX'),
                y: cap.getData('prevY'),
                duration: 150
            })
        }
    }

    findP1DropTarget(x, y, excludeBoardId) {
        const occupied = new Set([
            ...this.p1PlacedSquares,
            ...this.currentDealCaps.map(e => e.boardId)
        ])
        if (excludeBoardId !== null) occupied.delete(excludeBoardId)

        let target = null
        this.children.each(c => {
            if (target) return
            if (c.getData('playerName') !== 'Player 1') return
            if (c.getData('picId') !== this.cardData) return
            if (occupied.has(c.getData('boardId'))) return
            const xLoc = c.getData('xLoc')
            const yLoc = c.getData('yLoc')
            const scale = c.getData('scale')
            if (x >= xLoc && x <= xLoc + 200 * scale && y >= yLoc && y <= yLoc + 332 * scale) {
                target = c
            }
        })
        return target
    }

    freezePlayerCaps() {
        const newlyFrozen = new Set(this.currentDealCaps.map(e => e.boardId))
        for (const { sprite, boardId } of this.currentDealCaps) {
            sprite.disableInteractive()
            this.p1PlacedSquares.add(boardId)
            this.matchCheckArrays['Player 1'].push(boardId)
        }
        this.currentDealCaps = []
        this.children.each(c => {
            if (c.getData('playerName') === 'Player 1' && newlyFrozen.has(c.getData('boardId'))) {
                c.setTint(0x00ff00).setAlpha(.33)
            }
        })
    }

    claimWin() {
        const plrArray = this.matchCheckArrays['Player 1']
        const hasWin = this.winArrays.some(combo => this.checkContains(combo, plrArray))
        if (hasWin) {
            this.checkWinConditions('Player 1')
        } else {
            this.mentirosaText.setText('Mentirosa!')
            this.tweens.add({
                targets: this.mentirosaText,
                alpha: 0,
                delay: 800,
                duration: 400,
                onComplete: () => {
                    this.mentirosaText.setText('')
                    this.mentirosaText.setAlpha(1)
                }
            })
        }
    }

    //BELOW checking for matches on a single player's board and placing their cap
    checkMatchForPlayer(playerName) {
        const random = Math.floor(Math.random() * 7)
        const ranX = Math.floor(Math.random() * 25)
        const ranY = Math.floor(Math.random() * 75)
        const angleRad = Phaser.Math.DegToRad(this.playerAngles[playerName] ?? 0)
        const capDistance = 1500

        this.children.each(c => {
            const child = c
            if (child.getData('picId') === this.cardData && child.getData('playerName') === playerName) {
                let playerBoardId = child.getData('boardId')
                let scale = child.getData('scale')
                let xLoc = child.getData('xLoc') + (ranX * scale)
                let yLoc = child.getData('yLoc') + (ranY * scale)
                const startX = xLoc + Math.sin(angleRad) * capDistance
                const startY = yLoc - Math.cos(angleRad) * capDistance
                this.matchCheckArrays[playerName].push(playerBoardId)
                const coke = this.add.sprite(startX, startY, 'cokeSprites2', random).setScale(.275 * scale).setOrigin(0, 0)
                this.tweens.add({
                    targets: coke,
                    x: xLoc,
                    y: yLoc,
                    duration: 500,
                    onComplete: () => {
                        child.setTint(0x00ff00).setAlpha(.33)
                        if (this.matchCheckArrays[playerName].length > 3) {
                            this.checkWinConditions(playerName)
                        }
                    }
                })
            }
        })
    }

    checkWinConditions(playerNameName) {

        const plrArray = this.matchCheckArrays[(`${playerNameName}`)]
        for (let i = 0; i < this.winArrays.length; i++) {
            if (this.checkContains(this.winArrays[i], plrArray)) {
                this.gameOver = true
                this.dealButton.disableInteractive()
                this.dealButton.setText('Game Over')
                this.gameStatus.setText(`${playerNameName} Wins!`)
                this.highlightWin(playerNameName, this.winArrays[i])
            }
        }
    }

    highlightWin(playerNameName, winArray) {

        this.children.each(c => {
            const child = c
            if (child.getData('playerName') === playerNameName && winArray.includes(child.getData('boardId'))) {
                //BELOW gold tint + pulse on the winning line — adjust tint color or tween values to change the effect
                child.clearTint()
                child.setAlpha(1)
                child.setTint(0xffd700)
                this.tweens.add({
                    targets: child,
                    alpha: 0.5,
                    yoyo: true,
                    repeat: -1,
                    duration: 400
                })
            }
        })
    }

    checkContains(first, second) {

        const indexArray = first.map(el => {
            return second.indexOf(el)
        })
        return indexArray.indexOf(-1) === -1
    }

    update() {

        if (this.gameOver) return
        this.updateDeck()

    }
}