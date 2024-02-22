const canvas = document.querySelector('canvas')
const a1 = document.querySelector('.a-1')
const j1 = document.querySelector('.j-1')
const l1 = document.querySelector('.l-1')
const r1 = document.querySelector('.r-1')

const a2 = document.querySelector('.a-2')
const j2 = document.querySelector('.j-2')
const l2 = document.querySelector('.l-2')
const r2 = document.querySelector('.r-2')

const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
  position: {
    x: 0,
    y: 0
  },
  imageSrc: './img/background.png'
})

const shop = new Sprite({
  position: {
    x: 600,
    y: 128
  },
  imageSrc: './img/shop.png',
  scale: 2.75,
  framesMax: 6
})

const player = new Fighter({
  position: {
    x: 0,
    y: 0
  },
  velocity: {
    x: 0,
    y: 0
  },
  offset: {
    x: 0,
    y: 0
  },
  imageSrc: './img/samuraiMack/Idle.png',
  framesMax: 8,
  scale: 2.5,
  offset: {
    x: 215,
    y: 157
  },
  sprites: {
    idle: {
      imageSrc: './img/samuraiMack/Idle.png',
      framesMax: 8
    },
    run: {
      imageSrc: './img/samuraiMack/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/samuraiMack/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/samuraiMack/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/samuraiMack/Attack1.png',
      framesMax: 6
    },
    takeHit: {
      imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
      framesMax: 4
    },
    death: {
      imageSrc: './img/samuraiMack/Death.png',
      framesMax: 6
    }
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50
    },
    width: 160,
    height: 50
  }
})

const enemy = new Fighter({
  position: {
    x: 400,
    y: 100
  },
  velocity: {
    x: 0,
    y: 0
  },
  color: 'blue',
  offset: {
    x: -50,
    y: 0
  },
  imageSrc: './img/kenji/Idle.png',
  framesMax: 4,
  scale: 2.5,
  offset: {
    x: 215,
    y: 167
  },
  sprites: {
    idle: {
      imageSrc: './img/kenji/Idle.png',
      framesMax: 4
    },
    run: {
      imageSrc: './img/kenji/Run.png',
      framesMax: 8
    },
    jump: {
      imageSrc: './img/kenji/Jump.png',
      framesMax: 2
    },
    fall: {
      imageSrc: './img/kenji/Fall.png',
      framesMax: 2
    },
    attack1: {
      imageSrc: './img/kenji/Attack1.png',
      framesMax: 4
    },
    takeHit: {
      imageSrc: './img/kenji/Take hit.png',
      framesMax: 3
    },
    death: {
      imageSrc: './img/kenji/Death.png',
      framesMax: 7
    }
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50
    },
    width: 170,
    height: 50
  }
})

console.log(player)

const keys = {
  a: {
    pressed: false
  },
  d: {
    pressed: false
  },
  ArrowRight: {
    pressed: false
  },
  ArrowLeft: {
    pressed: false
  }
}

decreaseTimer()

function animate() {
  window.requestAnimationFrame(animate)
  c.fillStyle = 'black'
  c.fillRect(0, 0, canvas.width, canvas.height)
  background.update()
  shop.update()
  c.fillStyle = 'rgba(255, 255, 255, 0.15)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update()
  enemy.update()

  player.velocity.x = 0
  enemy.velocity.x = 0

  // player movement

  if (keys.a.pressed && player.lastKey === 'a') {
    player.velocity.x = -5
    player.switchSprite('run')
  } else if (keys.d.pressed && player.lastKey === 'd') {
    player.velocity.x = 5
    player.switchSprite('run')
  } else {
    player.switchSprite('idle')
  }

  // jumping
  if (player.velocity.y < 0) {
    player.switchSprite('jump')
  } else if (player.velocity.y > 0) {
    player.switchSprite('fall')
  }

  // Enemy movement
  if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
    enemy.velocity.x = -5
    enemy.switchSprite('run')
  } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
    enemy.velocity.x = 5
    enemy.switchSprite('run')
  } else {
    enemy.switchSprite('idle')
  }

  // jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite('jump')
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite('fall')
  }

  // detect for collision & enemy gets hit
  if (
    rectangularCollision({
      rectangle1: player,
      rectangle2: enemy
    }) &&
    player.isAttacking &&
    player.framesCurrent === 4
  ) {
    enemy.takeHit()
    player.isAttacking = false

    gsap.to('#enemyHealth', {
      width: enemy.health + '%'
    })
  }

  // if player misses
  if (player.isAttacking && player.framesCurrent === 4) {
    player.isAttacking = false
  }

  // this is where our player gets hit
  if (
    rectangularCollision({
      rectangle1: enemy,
      rectangle2: player
    }) &&
    enemy.isAttacking &&
    enemy.framesCurrent === 2
  ) {
    player.takeHit()
    enemy.isAttacking = false

    gsap.to('#playerHealth', {
      width: player.health + '%'
    })
  }

  // if player misses
  if (enemy.isAttacking && enemy.framesCurrent === 2) {
    enemy.isAttacking = false
  }

  // end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId })
  }
}

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'd':
      keys.d.pressed = false
      break
    case 'a':
      keys.a.pressed = false
      break
  }

  // enemy keys
  switch (event.key) {
    case 'ArrowRight':
      keys.ArrowRight.pressed = false
      break
    case 'ArrowLeft':
      keys.ArrowLeft.pressed = false
      break
  }
})

a1.addEventListener('click', () => {
  player.attack()
})

let isRunning = false

r1.addEventListener('mousedown', () => {
  isRunning = true // Kullanıcı butona bastığında koşu başlar
  runRight() // Koşu fonksiyonunu çağır
})

r1.addEventListener('mouseup', () => {
  isRunning = false
  player.velocity.x = 0
  player.switchSprite('idle')
})
l1.addEventListener('mousedown', () => {
  isRunning = true // Kullanıcı butona bastığında koşu başlar
  runLeft() // Koşu fonksiyonunu çağır
})

l1.addEventListener('mouseup', () => {
  isRunning = false
  player.velocity.x = 0
  player.switchSprite('idle')
})

function runRight() {
  if (isRunning) {
    // Eğer koşu durumu aktifse
    player.velocity.x = 5 // Karakterin hızını ayarla
    player.switchSprite('run') // Koşu animasyonunu başlat
    requestAnimationFrame(runRight) // Animasyonu tekrarla
  }
}
function runLeft() {
  if (isRunning) {
    player.velocity.x = -5 // Karakterin hızını ayarla
    player.switchSprite('run') // Koşu animasyonunu başlat
    requestAnimationFrame(runLeft) // Animasyonu tekrarla
  }
}

j1.addEventListener('click', () => {
  if (!player.dead && player.velocity.y === 0) {
    // Simple ground check to prevent mid-air jumps
    player.velocity.y = -20 // Initiate jump
    player.switchSprite('jump')
  }
})

//? ENEMY BUTTONS

let isRunning2 = false

function runRight2() {
  if (isRunning2) {
    // Eğer koşu durumu aktifse
    enemy.velocity.x = 5 // Karakterin hızını ayarla
    enemy.switchSprite('run') // Koşu animasyonunu başlat
    requestAnimationFrame(runRight2) // Animasyonu tekrarla
  }
}
function runLeft2() {
  if (isRunning2) {
    enemy.velocity.x = -5 // Karakterin hızını ayarla
    enemy.switchSprite('run') // Koşu animasyonunu başlat
    requestAnimationFrame(runLeft2) // Animasyonu tekrarla
  }
}

a2.addEventListener('click', () => {
  enemy.attack()
})

r2.addEventListener('mousedown', () => {
  isRunning2 = true // Kullanıcı butona bastığında koşu başlar
  runRight2() // Koşu fonksiyonunu çağır
})

r2.addEventListener('mouseup', () => {
  isRunning2 = false
  enemy.velocity.x = 0
  enemy.switchSprite('idle')
})
l2.addEventListener('mousedown', () => {
  isRunning2 = true // Kullanıcı butona bastığında koşu başlar
  runLeft2() // Koşu fonksiyonunu çağır
})

l2.addEventListener('mouseup', () => {
  isRunning2 = false
  enemy.velocity.x = 0
  enemy.switchSprite('idle')
})

j2.addEventListener('click', () => {
  if (!enemy.dead && enemy.velocity.y === 0) {
    // Simple ground check to prevent mid-air jumps
    enemy.velocity.y = -20 // Initiate jump
    enemy.switchSprite('jump')
  }
})
