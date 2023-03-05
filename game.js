kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    clearColor: [0, 0, 0, 1]
});

let isJumping = true;
let isBig = false;
let songCurrentTime = 11;
let audio = new Audio('assets/marioSong.mp3');

loadRoot('./assets/');
loadSprite('bloco', 'bloco.png');
loadSprite('goomba', 'goomba.png');
loadSprite('surpresa', 'surpresa.png');
loadSprite('caixa_vazia', 'caixa_vazia.png');
loadSprite('moeda', 'moeda.png');
loadSprite('cogumelo', 'cogumelo.png');
loadSprite('tijolo', 'tijolo.png');
loadSprite('tubo-bottom-left', 'tubo-bottom-left.png');
loadSprite('tubo-bottom-right', 'tubo-bottom-right.png');
loadSprite('tubo-top-left', 'tubo-top-left.png');
loadSprite('tubo-top-right', 'tubo-top-right.png');
loadSprite('blue-bloco', 'blue-bloco.png');
loadSprite('blue-tijolo', 'blue-tijolo.png');
loadSprite('blue-aco', 'blue-aco.png');
loadSprite('blue-goomba', 'blue-goomba.png');

loadSprite('mario', 'mario_walking.png', {
    sliceX: 3.9,
    anims: {
        idle: {
            from: 0,
            to: 0
        },
        move: {
            from: 1,
            to: 2
        }
    }
});

scene('game', ({ level, score, big }) => {
    layer(['bg', 'obj', 'ui'], 'obj');

    const maps = [
        [
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                                                                                             =',
            '=                  %     =*%=                                                                 =',
            '=                                                                                             =',
            '=                                                                                        +-   =',
            '=                                         ^                     ^                        ()   =',
            '===============================================================================================',
        ],
        [
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/                                                                                             /',
            '/              *==%                                                      xx                   /',
            '/                                                                       xxxx                  /',
            '/                                                                      xxxxxx            +-   /',
            '/                             z            ^        z             ^   xxxxxxxx           ()   /',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ],
        [
            '                                                                                             ',
            '                                                                                             ',
            '                                                                                             ',
            '                                                                                             ',
            '                                                                                             ',
            '                                                                                             ',
            '                                                                                             ',
            '                                                                                             ',
            '                                          +-                                                 ',
            '                                          ()                                                 ',
            '              x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x                  ',
            '            x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x        ',
            '           x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x       ',
            '          x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x      ',
            '         x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x     ',
            '       x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x   ',
            '     x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x x ',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
        ]
    ];

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('bloco'), solid()],
        '$': [sprite('moeda'), 'moeda'],
        '%': [sprite('surpresa'), solid(), 'moeda-surpresa'],
        '*': [sprite('surpresa'), solid(), 'cogumelo-surpresa'],
        '}': [sprite('caixa_vazia'), solid()],
        '^': [sprite('goomba'), 'dangerous'],
        '#': [sprite('cogumelo'), 'cogumelo', body()],
        '~': [sprite('tijolo'), solid()],
        '(': [sprite('tubo-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('tubo-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('tubo-top-left'), solid(), 'tubo', scale(0.5)],
        '+': [sprite('tubo-top-right'), solid(), 'tubo', scale(0.5)],
        '!': [sprite('blue-bloco'), solid(), scale(0.5)],
        '/': [sprite('blue-tijolo'), solid(), scale(0.5)],
        'z': [sprite('blue-goomba'), 'dangerous', scale(0.5)],
        'x': [sprite('blue-aco'), solid(), scale(0.5)],
    };

    const gameLevel = addLevel(maps[level], levelCfg);
    const scoreLabel = add([
        text('Moedas:' + score, 10),
        pos(30, 8),
        layer('ui'),
        {
            value: score
        }
    ]);

    add([
        text('Level: ' + parseInt(level + 1), 10), pos(160, 8), layer('ui')
    ]);


    function big() {
        return {
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1);
                isBig = false;
            },
            biggify() {
                this.scale = vec2(1.5);
                isBig = true
            }

        };
    };

    const player = add([
        sprite('mario', {
            animSpeed: 0.1,
            frame: 0
        }),
        solid(),
        body(),
        big(),
        pos(60, 0),
        origin('bot')
    ]);

    if (isBig) {
        player.biggify();
    }

    keyDown('left', () => {
        player.flipX(true);
        player.move(-120, 0)
    });

    keyDown('right', () => {
        player.flipX(false);
        player.move(120, 0)
    });

    keyPress('space', () => {
        if (player.grounded()) {
            player.jump(400);
            isJumping = true;
        }
    });
    // anima player
    keyPress('left', () => {
        player.flipX(true);
        player.play('move');
    });

    keyPress('right', () => {
        player.flipX(false);
        player.play('move');
    });
    // anima player

    // anima parado
    keyRelease('left', () => {
        player.play('idle')
    });

    keyRelease('right', () => {
        player.play('idle')
    });
    // anima parado

    action('dangerous', (obj) => {
        obj.move(-20, 0)
    });

    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        }
    });

    player.on('headbutt', (obj) => {
        if (obj.is('moeda-surpresa')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1));
            destroy(obj);
            gameLevel.spawn('}', obj.gridPos.sub(0, 0));
        }
    });

    player.on('headbutt', (obj) => {
        if (obj.is('cogumelo-surpresa')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1));
            destroy(obj);
            gameLevel.spawn('}', obj.gridPos.sub(0, 0));
        }
    });

    action('cogumelo', (obj) => {
        obj.move(20, 0);
    });

    player.collides('cogumelo', (obj) => {
        destroy(obj);
        player.biggify();
    });

    player.collides('dangerous', (obj) => {
        if (isJumping) {
            destroy(obj);
        } else {
            if (isBig) {
                player.smallify();
            } else {
                audio.pause();
                songCurrentTime = 11;
                go('lose', ({ score: scoreLabel.value }))
            }
        }
    });

    player.collides('moeda', (obj) => {
        destroy(obj);
        scoreLabel.value++;
        scoreLabel.text = 'Moedas: ' + scoreLabel.value;
    });

    player.collides('tubo', (obj) => {
        keyPress('down', () => {
            setCurrentMusicTime();
            go("game", {
                level: (level + 1) % maps.length,
                score: scoreLabel.value,
                big: isBig
            })
        });
    });

    playMusic();

    function playMusic() {
        setTimeout(() => {
            audio.play();
        }, 1500);
        audio.currentTime = songCurrentTime;
        audio.loop = true;
        audio.volume = 0.1;
    }

    function setCurrentMusicTime() {
        songCurrentTime = audio.currentTime;
    }
});

scene('lose', ({ score }) => {
    add([
        text('score: ' + score, 18), origin('center'), pos(width() / 2, height() / 2)
    ]);
    keyPress('space', () => {
        go('game', ({ level: 0, score: 0, big: isBig }));
    });
});

go('game', ({ level: 0, score: 0, big: isBig }));
