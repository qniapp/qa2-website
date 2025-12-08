/* global describe, test, expect, jest, beforeEach, afterEach */
// QA² Particle Animation System Tests
// TDD: RED phase - テストを先に作成

const { Particle, ParticleSystem } = require('./particles.js')

/**
 * Particle クラスのテスト
 */
describe('Particle', () => {
  describe('constructor', () => {
    test('必須プロパティが正しく初期化される', () => {
      const particle = new Particle({
        angle: Math.PI / 4,
        radius: 100,
        arcLength: 0.3,
        hue: 180,
        speed: 0.002,
        opacity: 0.8
      })

      expect(particle.angle).toBe(Math.PI / 4)
      expect(particle.radius).toBe(100)
      expect(particle.arcLength).toBe(0.3)
      expect(particle.hue).toBe(180)
      expect(particle.speed).toBe(0.002)
      expect(particle.opacity).toBe(0.8)
    })

    test('デフォルト値が設定される', () => {
      const particle = new Particle({})

      expect(particle.angle).toBeDefined()
      expect(particle.radius).toBeDefined()
      expect(particle.arcLength).toBeDefined()
      expect(particle.hue).toBeDefined()
      expect(particle.speed).toBeDefined()
      expect(particle.opacity).toBeDefined()
    })
  })

  describe('update', () => {
    test('角度が速度に応じて更新される', () => {
      const particle = new Particle({
        angle: 0,
        speed: 0.002
      })

      particle.update()

      expect(particle.angle).toBe(0.002)
    })

    test('角度が 2π を超えたらラップアラウンドする', () => {
      const particle = new Particle({
        angle: Math.PI * 2 - 0.001,
        speed: 0.002
      })

      particle.update()

      expect(particle.angle).toBeLessThan(Math.PI * 2)
      expect(particle.angle).toBeGreaterThan(0)
    })
  })
})

/**
 * ParticleSystem パーティクル生成のテスト
 */
describe('ParticleSystem - Particle Generation', () => {
  let mockCanvas
  let mockCtx

  beforeEach(() => {
    // Canvas モックの作成
    mockCtx = {
      scale: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      strokeStyle: ''
    }

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockCtx),
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 800,
        height: 600
      }),
      width: 800,
      height: 600
    }

    document.getElementById = jest.fn().mockReturnValue(mockCanvas)
  })

  describe('initializeParticles', () => {
    test('80-120 個のパーティクルが生成される', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      expect(system.particles.length).toBeGreaterThanOrEqual(80)
      expect(system.particles.length).toBeLessThanOrEqual(120)
    })

    test('パーティクルが虹色（色相 0-360）で分散される', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const hues = system.particles.map(p => p.hue)
      const minHue = Math.min(...hues)
      const maxHue = Math.max(...hues)

      // 色相が広く分散されていることを確認
      expect(maxHue - minHue).toBeGreaterThan(200)
    })

    test('各パーティクルが Particle インスタンスである', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      system.particles.forEach(particle => {
        expect(particle).toBeInstanceOf(Particle)
      })
    })

    test('パーティクルの半径が適切な範囲内である', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const center = system.getCenter()
      const minDimension = Math.min(center.x, center.y)

      system.particles.forEach(particle => {
        expect(particle.radius).toBeGreaterThan(minDimension * 0.15)
        expect(particle.radius).toBeLessThan(minDimension * 0.95)
      })
    })

    test('パーティクルの回転速度が 0.001-0.005 rad/frame の範囲内', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      system.particles.forEach(particle => {
        expect(particle.speed).toBeGreaterThanOrEqual(0.001)
        expect(particle.speed).toBeLessThanOrEqual(0.005)
      })
    })
  })

  describe('虹色の色相分布', () => {
    test('紫 (270-330°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const purpleParticles = system.particles.filter(
        p => p.hue >= 270 && p.hue <= 330
      )
      expect(purpleParticles.length).toBeGreaterThan(0)
    })

    test('青 (200-250°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const blueParticles = system.particles.filter(
        p => p.hue >= 200 && p.hue <= 250
      )
      expect(blueParticles.length).toBeGreaterThan(0)
    })

    test('シアン (170-200°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const cyanParticles = system.particles.filter(
        p => p.hue >= 170 && p.hue <= 200
      )
      expect(cyanParticles.length).toBeGreaterThan(0)
    })

    test('緑 (90-150°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const greenParticles = system.particles.filter(
        p => p.hue >= 90 && p.hue <= 150
      )
      expect(greenParticles.length).toBeGreaterThan(0)
    })

    test('黄 (40-70°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const yellowParticles = system.particles.filter(
        p => p.hue >= 40 && p.hue <= 70
      )
      expect(yellowParticles.length).toBeGreaterThan(0)
    })

    test('オレンジ (20-40°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const orangeParticles = system.particles.filter(
        p => p.hue >= 20 && p.hue <= 40
      )
      expect(orangeParticles.length).toBeGreaterThan(0)
    })

    test('ピンク (330-360° または 0-20°) のパーティクルが存在する', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      const pinkParticles = system.particles.filter(
        p => p.hue >= 330 || p.hue <= 20
      )
      expect(pinkParticles.length).toBeGreaterThan(0)
    })
  })
})

/**
 * ParticleSystem 回転アニメーションループのテスト
 * Task 3.3: 回転アニメーションループを実装
 * Requirements: 2.4, 2.5
 */
describe('ParticleSystem - Animation Loop', () => {
  let mockCanvas
  let mockCtx
  let originalRAF
  let originalCAF

  beforeEach(() => {
    // requestAnimationFrame のモック
    originalRAF = global.requestAnimationFrame
    originalCAF = global.cancelAnimationFrame
    global.requestAnimationFrame = jest.fn((callback) => {
      return setTimeout(callback, 16) // 約 60fps
    })
    global.cancelAnimationFrame = jest.fn((id) => {
      clearTimeout(id)
    })

    // Canvas モックの作成
    const mockGradient = {
      addColorStop: jest.fn()
    }
    mockCtx = {
      scale: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      createLinearGradient: jest.fn().mockReturnValue(mockGradient),
      strokeStyle: '',
      lineWidth: 0,
      lineCap: ''
    }

    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockCtx),
      getBoundingClientRect: jest.fn().mockReturnValue({
        width: 800,
        height: 600
      }),
      width: 800,
      height: 600
    }

    document.getElementById = jest.fn().mockReturnValue(mockCanvas)
  })

  afterEach(() => {
    global.requestAnimationFrame = originalRAF
    global.cancelAnimationFrame = originalCAF
  })

  describe('start', () => {
    test('アニメーションが開始される', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      system.start()

      expect(system.isRunning).toBe(true)
      expect(global.requestAnimationFrame).toHaveBeenCalled()
    })

    test('animationId が設定される', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      system.start()

      expect(system.animationId).not.toBeNull()
    })

    test('すでに実行中の場合、二重起動しない', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      system.start()
      const firstCallCount = global.requestAnimationFrame.mock.calls.length
      system.start() // 二重起動の試み

      // 新しい requestAnimationFrame が呼ばれていないことを確認
      expect(global.requestAnimationFrame.mock.calls.length).toBe(firstCallCount)
    })
  })

  describe('stop', () => {
    test('アニメーションが停止される', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()
      system.start()

      system.stop()

      expect(system.isRunning).toBe(false)
      expect(global.cancelAnimationFrame).toHaveBeenCalled()
    })

    test('animationId が null にリセットされる', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()
      system.start()

      system.stop()

      expect(system.animationId).toBeNull()
    })

    test('停止中に呼び出しても安全', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      // start していない状態で stop を呼び出し
      expect(() => system.stop()).not.toThrow()
    })
  })

  describe('animate (フレーム更新)', () => {
    test('各パーティクルの update が呼ばれる', (done) => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      // パーティクルに update スパイを設定
      const updateSpies = system.particles.map(p => jest.spyOn(p, 'update'))

      system.start()

      // 1 フレーム後に確認
      setTimeout(() => {
        updateSpies.forEach(spy => {
          expect(spy).toHaveBeenCalled()
        })
        system.stop()
        done()
      }, 32) // 2 フレーム分待機
    })

    test('Canvas がクリアされて再描画される', (done) => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      system.start()

      setTimeout(() => {
        // clear メソッドで setTransform と clearRect が呼ばれることを確認
        expect(mockCtx.setTransform).toHaveBeenCalled()
        expect(mockCtx.clearRect).toHaveBeenCalled()
        system.stop()
        done()
      }, 32)
    })

    test('パーティクルの角度がフレームごとに更新される', (done) => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()

      // 最初のパーティクルの初期角度を記録
      const initialAngles = system.particles.map(p => p.angle)

      system.start()

      setTimeout(() => {
        // 角度が変化していることを確認
        system.particles.forEach((particle, index) => {
          expect(particle.angle).not.toBe(initialAngles[index])
        })
        system.stop()
        done()
      }, 50) // 3 フレーム分待機
    })

    test('回転速度が 0.001-0.005 rad/frame の範囲で適用される', () => {
      const particle = new Particle({
        angle: 0,
        speed: 0.003
      })

      // 10 フレーム分の更新をシミュレート
      for (let i = 0; i < 10; i++) {
        particle.update()
      }

      // 0.003 * 10 = 0.03
      expect(particle.angle).toBeCloseTo(0.03, 5)
    })
  })

  describe('destroy (クリーンアップ)', () => {
    test('アニメーションが停止される', () => {
      const system = new ParticleSystem('test-canvas')
      system.initializeParticles()
      system.start()

      system.destroy()

      expect(system.isRunning).toBe(false)
      expect(system.animationId).toBeNull()
    })
  })
})

/**
 * AudioPlayer クラスのテスト
 * Task 4.3: ユーザー操作による再生制御を実装
 * Requirements: 3.4
 */
describe('AudioPlayer', () => {
  let AudioPlayer
  let mockAudioElement
  let mockPlayButton
  let mockPlayIcon
  let mockPauseIcon

  beforeEach(() => {
    // AudioPlayer クラスをインポート
    const module = require('./particles.js')
    AudioPlayer = module.AudioPlayer

    // Audio 要素のモック
    mockAudioElement = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      paused: true,
      loop: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      error: null
    }

    // 再生アイコンのモック
    mockPlayIcon = {
      style: { display: '' }
    }

    // 停止アイコンのモック
    mockPauseIcon = {
      style: { display: 'none' }
    }

    // 再生ボタンのモック
    mockPlayButton = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      querySelector: jest.fn((selector) => {
        if (selector === '.play-icon') return mockPlayIcon
        if (selector === '.pause-icon') return mockPauseIcon
        return null
      }),
      setAttribute: jest.fn(),
      disabled: false
    }

    // DOM モック
    document.getElementById = jest.fn((id) => {
      if (id === 'bgm-audio') return mockAudioElement
      if (id === 'audio-toggle') return mockPlayButton
      return null
    })
  })

  describe('constructor', () => {
    test('AudioPlayer が正しく初期化される', () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')

      expect(player.audio).toBe(mockAudioElement)
      expect(player.button).toBe(mockPlayButton)
      expect(player.isPlaying).toBe(false)
      expect(player.isLoaded).toBe(true)
    })

    test('audio 要素が見つからない場合、isLoaded が false になる', () => {
      document.getElementById = jest.fn().mockReturnValue(null)

      const player = new AudioPlayer('invalid-audio', 'audio-toggle')

      expect(player.isLoaded).toBe(false)
    })

    test('ボタンにクリックイベントリスナーが追加される', () => {
      // eslint-disable-next-line no-unused-vars
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')

      expect(mockPlayButton.addEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })

  describe('toggle (再生/停止切り替え)', () => {
    test('停止中にクリックすると再生が開始される', async () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      mockAudioElement.paused = true

      await player.toggle()

      expect(mockAudioElement.play).toHaveBeenCalled()
    })

    test('再生中にクリックすると停止する', async () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      mockAudioElement.paused = false
      player.isPlaying = true

      await player.toggle()

      expect(mockAudioElement.pause).toHaveBeenCalled()
    })

    test('初回クリック時にのみ BGM を開始する（ブラウザポリシー対応）', async () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      mockAudioElement.paused = true

      // 初回クリック
      await player.toggle()
      expect(mockAudioElement.play).toHaveBeenCalledTimes(1)

      // 停止
      mockAudioElement.paused = false
      player.isPlaying = true
      await player.toggle()

      // 再度再生
      mockAudioElement.paused = true
      player.isPlaying = false
      await player.toggle()

      // play が再度呼ばれていることを確認
      expect(mockAudioElement.play).toHaveBeenCalledTimes(2)
    })
  })

  describe('updateButtonUI (ボタンアイコン切り替え)', () => {
    test('再生中は停止アイコン（⏸）を表示', async () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      mockAudioElement.paused = true

      await player.toggle()

      // 再生アイコンが非表示、停止アイコンが表示
      expect(mockPlayIcon.style.display).toBe('none')
      expect(mockPauseIcon.style.display).toBe('')
    })

    test('停止中は再生アイコン（▶）を表示', async () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      mockAudioElement.paused = false
      player.isPlaying = true

      await player.toggle()

      // 再生アイコンが表示、停止アイコンが非表示
      expect(mockPlayIcon.style.display).toBe('')
      expect(mockPauseIcon.style.display).toBe('none')
    })

    test('aria-label が状態に応じて更新される', async () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      mockAudioElement.paused = true

      await player.toggle()

      expect(mockPlayButton.setAttribute).toHaveBeenCalledWith(
        'aria-label',
        'BGM を停止'
      )
    })
  })

  describe('エラーハンドリング', () => {
    test('オーディオロード失敗時にボタンが無効化される', () => {
      mockAudioElement.error = { code: 4 }
      document.getElementById = jest.fn((id) => {
        if (id === 'bgm-audio') return mockAudioElement
        if (id === 'audio-toggle') return mockPlayButton
        return null
      })

      const player = new AudioPlayer('bgm-audio', 'audio-toggle')
      player.handleError()

      expect(mockPlayButton.disabled).toBe(true)
    })

    test('play() が失敗した場合、isPlaying が false のまま', async () => {
      mockAudioElement.play = jest.fn().mockRejectedValue(new Error('Play failed'))
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')

      await player.toggle()

      expect(player.isPlaying).toBe(false)
    })
  })

  describe('destroy (クリーンアップ)', () => {
    test('イベントリスナーが削除される', () => {
      const player = new AudioPlayer('bgm-audio', 'audio-toggle')

      player.destroy()

      expect(mockPlayButton.removeEventListener).toHaveBeenCalledWith(
        'click',
        expect.any(Function)
      )
    })
  })
})
