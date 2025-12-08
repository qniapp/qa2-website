/* global requestAnimationFrame, cancelAnimationFrame */
// QA² Particle Animation System
// Task 3.1: Canvas の初期化とリサイズ対応
// Task 3.2: パーティクルシステムの実装

/**
 * Particle クラス
 * 弧状の線として描画される個別のパーティクル
 */
class Particle {
  /**
     * パーティクルを初期化
     * @param {Object} options - パーティクル設定
     * @param {number} options.angle - 現在の角度（ラジアン）
     * @param {number} options.radius - 中心からの距離
     * @param {number} options.arcLength - 弧の長さ（ラジアン）
     * @param {number} options.hue - HSL の色相（0-360）
     * @param {number} options.speed - 回転速度
     * @param {number} options.opacity - 透明度（0-1）
     */
  constructor (options = {}) {
    this.angle = options.angle ?? Math.random() * Math.PI * 2
    this.radius = options.radius ?? 100
    this.arcLength = options.arcLength ?? 0.3 + Math.random() * 0.4
    this.hue = options.hue ?? Math.random() * 360
    this.speed = options.speed ?? 0.001 + Math.random() * 0.004
    this.opacity = options.opacity ?? 0.5 + Math.random() * 0.5
  }

  /**
     * パーティクルの状態を更新（回転）
     */
  update () {
    this.angle += this.speed
    // 2π を超えたらラップアラウンド
    if (this.angle >= Math.PI * 2) {
      this.angle -= Math.PI * 2
    }
  }

  /**
     * パーティクルを描画（細い軌跡スタイル：グラデーションで先端が明るく消えていく）
     * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
     * @param {number} centerX - 中心 X 座標
     * @param {number} centerY - 中心 Y 座標
     */
  draw (ctx, centerX, centerY) {
    // 先頭の位置を計算
    const headAngle = this.angle + this.arcLength
    const headX = centerX + Math.cos(headAngle) * this.radius
    const headY = centerY + Math.sin(headAngle) * this.radius

    // 軌跡の開始位置（尾の先端）
    const tailX = centerX + Math.cos(this.angle) * this.radius
    const tailY = centerY + Math.sin(this.angle) * this.radius

    // グラデーション軌跡を描画（尾から先頭へ徐々に明るく）
    const gradient = ctx.createLinearGradient(tailX, tailY, headX, headY)
    gradient.addColorStop(0, `hsla(${this.hue}, 80%, 50%, 0)`)
    gradient.addColorStop(0.5, `hsla(${this.hue}, 85%, 55%, ${this.opacity * 0.4})`)
    gradient.addColorStop(0.85, `hsla(${this.hue}, 90%, 60%, ${this.opacity * 0.7})`)
    gradient.addColorStop(1, `hsla(${this.hue}, 100%, 65%, ${this.opacity})`)

    ctx.beginPath()
    ctx.arc(
      centerX,
      centerY,
      this.radius,
      this.angle,
      headAngle
    )
    ctx.strokeStyle = gradient
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    ctx.stroke()
  }
}

/**
 * ParticleSystem クラス
 * 虹色の弧状パーティクルを中心軸で回転させるアニメーションシステム
 */
class ParticleSystem {
  /**
     * ParticleSystem を初期化
     * @param {string} canvasId - Canvas 要素の ID
     */
  constructor (canvasId) {
    this.canvas = document.getElementById(canvasId)
    if (!this.canvas) {
      console.error(`Canvas element with id "${canvasId}" not found`)
      return
    }

    this.ctx = this.canvas.getContext('2d')
    if (!this.ctx) {
      console.error('Failed to get 2D context')
      return
    }

    this.particles = []
    this.animationId = null
    this.isRunning = false

    // 初期化
    this.setupCanvas()
    this.setupResizeHandler()
  }

  /**
     * Canvas のサイズを設定（デバイスピクセル比対応）
     */
  setupCanvas () {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()

    // Canvas の内部解像度を設定（高解像度対応）
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr

    // CSS サイズは変更しない（スタイルで制御）
    this.ctx.scale(dpr, dpr)

    // 表示サイズを保存（描画計算用）
    this.displayWidth = rect.width
    this.displayHeight = rect.height
  }

  /**
     * ウィンドウリサイズ時のハンドラを設定
     */
  setupResizeHandler () {
    // デバウンス処理でパフォーマンス最適化
    let resizeTimeout
    this.resizeHandler = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.setupCanvas()
        // パーティクルが存在する場合は再描画
        if (this.particles.length > 0) {
          this.draw()
        }
      }, 100)
    }

    window.addEventListener('resize', this.resizeHandler)
  }

  /**
     * Canvas の中心座標を取得
     * @returns {{x: number, y: number}} 中心座標
     */
  getCenter () {
    return {
      x: this.displayWidth / 2,
      y: this.displayHeight / 2
    }
  }

  /**
     * Canvas をクリア
     */
  clear () {
    // デバイスピクセル比を考慮してクリア
    this.ctx.save()
    this.ctx.setTransform(1, 0, 0, 1, 0, 0)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.restore()
  }

  /**
     * パーティクルを初期化（虹色で 80-120 個生成）
     * Requirements: 2.3 - 虹色パーティクル
     */
  initializeParticles () {
    this.particles = []

    // 80-120 個のパーティクルを生成
    const MIN_PARTICLES = 80
    const PARTICLE_RANGE = 41 // 80 + [0,40] = 80-120 particles
    const particleCount = MIN_PARTICLES + Math.floor(Math.random() * PARTICLE_RANGE)

    const center = this.getCenter()
    const minDimension = Math.min(center.x, center.y)

    // 虹色の色相を分散させて生成
    // 紫(270-330), 青(200-250), シアン(170-200), 緑(90-150), 黄(40-70), オレンジ(20-40), ピンク(330-360, 0-20)
    const rainbowHues = [
      { min: 270, max: 330 }, // 紫
      { min: 200, max: 250 }, // 青
      { min: 170, max: 200 }, // シアン
      { min: 90, max: 150 }, // 緑
      { min: 40, max: 70 }, // 黄
      { min: 20, max: 40 }, // オレンジ
      { min: 330, max: 360 }, // ピンク（高）
      { min: 0, max: 20 } // ピンク（低）
    ]

    for (let i = 0; i < particleCount; i++) {
      // 虹色を順番に割り当て
      const hueRange = rainbowHues[i % rainbowHues.length]
      const hue = hueRange.min + Math.random() * (hueRange.max - hueRange.min)

      // 半径は中心からの 15%-95% の範囲
      const radius = minDimension * (0.15 + Math.random() * 0.8)

      const particle = new Particle({
        angle: Math.random() * Math.PI * 2,
        radius,
        arcLength: 0.4 + Math.random() * 0.8,
        hue,
        speed: 0.001 + Math.random() * 0.004,
        opacity: 0.4 + Math.random() * 0.6
      })

      this.particles.push(particle)
    }
  }

  /**
     * 描画処理
     */
  draw () {
    this.clear()

    const center = this.getCenter()

    // 全パーティクルを描画
    this.particles.forEach(particle => {
      particle.draw(this.ctx, center.x, center.y)
    })
  }

  /**
     * アニメーションを開始
     * Task 3.3: requestAnimationFrame によるアニメーションループ
     * Requirements: 2.4, 2.5
     */
  start () {
    // すでに実行中の場合は二重起動しない
    if (this.isRunning) {
      return
    }

    this.isRunning = true
    this.animate()
  }

  /**
     * アニメーションを停止
     */
  stop () {
    this.isRunning = false

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  /**
     * アニメーションフレーム処理
     * Task 3.3: Canvas をクリアして再描画するフレーム更新処理
     * Requirements: 2.4, 2.5
     */
  animate () {
    if (!this.isRunning) {
      return
    }

    // 各パーティクルを更新（回転）
    this.particles.forEach(particle => {
      particle.update()
    })

    // 再描画
    this.draw()

    // 次のフレームをリクエスト
    this.animationId = requestAnimationFrame(() => this.animate())
  }

  /**
     * リソースのクリーンアップ
     */
  destroy () {
    this.stop()

    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
    }
  }
}

/**
 * AudioPlayer クラス
 * Task 4.3: ユーザー操作による再生制御
 * Requirements: 3.4
 */
class AudioPlayer {
  /**
     * AudioPlayer を初期化
     * @param {string} audioId - audio 要素の ID
     * @param {string} buttonId - 再生ボタン要素の ID
     */
  constructor (audioId, buttonId) {
    this.audio = document.getElementById(audioId)
    this.button = document.getElementById(buttonId)
    this.isPlaying = false
    this.isLoaded = false

    // 要素が見つからない場合は早期リターン
    if (!this.audio) {
      console.error(`Audio element with id "${audioId}" not found`)
      return
    }

    if (!this.button) {
      console.error(`Button element with id "${buttonId}" not found`)
      return
    }

    this.isLoaded = true

    // アイコン要素を取得
    this.playIcon = this.button.querySelector('.play-icon')
    this.pauseIcon = this.button.querySelector('.pause-icon')

    // クリックハンドラをバインド
    this.handleClick = this.toggle.bind(this)
    this.button.addEventListener('click', this.handleClick)

    // オーディオエラーハンドリング
    this.audio.addEventListener('error', () => this.handleError())
  }

  /**
     * 再生/停止を切り替え
     * Requirement 3.4: ユーザー操作で再生を開始
     */
  async toggle () {
    if (!this.isLoaded) return

    try {
      if (this.audio.paused) {
        // 停止中 → 再生開始
        await this.audio.play()
        this.isPlaying = true
      } else {
        // 再生中 → 停止
        this.audio.pause()
        this.isPlaying = false
      }
      this.updateButtonUI()
    } catch (error) {
      console.error('Audio playback failed:', error)
      this.isPlaying = false
    }
  }

  /**
     * ボタンの UI を更新（アイコン切り替え）
     * Requirement 3.3: 再生/停止コントロール
     */
  updateButtonUI () {
    if (this.isPlaying) {
      // 再生中: 停止アイコンを表示
      if (this.playIcon) this.playIcon.style.display = 'none'
      if (this.pauseIcon) this.pauseIcon.style.display = ''
      this.button.setAttribute('aria-label', 'BGM を停止')
    } else {
      // 停止中: 再生アイコンを表示
      if (this.playIcon) this.playIcon.style.display = ''
      if (this.pauseIcon) this.pauseIcon.style.display = 'none'
      this.button.setAttribute('aria-label', 'BGM を再生')
    }
  }

  /**
     * オーディオロードエラーのハンドリング
     */
  handleError () {
    console.error('Audio load failed')
    if (this.button) {
      this.button.disabled = true
    }
    this.isLoaded = false
  }

  /**
     * リソースのクリーンアップ
     */
  destroy () {
    if (this.button && this.handleClick) {
      this.button.removeEventListener('click', this.handleClick)
    }
  }
}

// DOM 読み込み完了後に初期化
if (typeof document !== 'undefined' && document.addEventListener) {
  document.addEventListener('DOMContentLoaded', () => {
    const particleSystem = new ParticleSystem('particle-canvas')

    // パーティクルを初期化
    particleSystem.initializeParticles()

    // アニメーション開始
    particleSystem.start()

    // オーディオプレーヤーを初期化 (Task 4.3)
    const audioPlayer = new AudioPlayer('bgm-audio', 'audio-toggle')

    // グローバルに公開（デバッグ用）
    window.particleSystem = particleSystem
    window.audioPlayer = audioPlayer
  })
}

// Node.js 環境でのエクスポート（テスト用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Particle, ParticleSystem, AudioPlayer }
}
