/* global describe, test, expect, beforeEach, afterEach, jest */
/**
 * Top-page i18n tests
 */

const { detectLanguage, applyLanguage, I18N_STRINGS } = require('../i18n')

describe('detectLanguage', () => {
  test('?lang=en overrides browser language', () => {
    expect(detectLanguage('?lang=en', ['ja-JP'])).toBe('en')
  })

  test('?lang=ja overrides browser language', () => {
    expect(detectLanguage('?lang=ja', ['en-US'])).toBe('ja')
  })

  test('invalid ?lang= is ignored', () => {
    expect(detectLanguage('?lang=fr', ['en-US'])).toBe('en')
    expect(detectLanguage('?lang=fr', ['ja'])).toBe('ja')
  })

  test('ja / ja-JP browser language selects Japanese', () => {
    expect(detectLanguage('', ['ja'])).toBe('ja')
    expect(detectLanguage('', ['ja-JP'])).toBe('ja')
    expect(detectLanguage('', ['JA-jp'])).toBe('ja')
  })

  test('non-ja browser language selects English', () => {
    expect(detectLanguage('', ['en'])).toBe('en')
    expect(detectLanguage('', ['en-US'])).toBe('en')
    expect(detectLanguage('', ['fr-FR', 'de'])).toBe('en')
  })

  test('prefers first matching ja in navigator.languages list', () => {
    expect(detectLanguage('', ['en-US', 'ja-JP'])).toBe('ja')
  })

  test('accepts a single language string', () => {
    expect(detectLanguage('', 'ja-JP')).toBe('ja')
    expect(detectLanguage('', 'en-GB')).toBe('en')
  })
})

describe('applyLanguage', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <p class="description" data-i18n="description">
          <budoux-ja>量子コンピューティングの世界を体験できるパズルゲーム。量子ゲートを操作し、美しいパターンを生み出そう。</budoux-ja>
        </p>
        <nav>
          <a href="presskit.html" data-i18n="navPresskit">プレスキット</a>
          <a href="support.html" data-i18n="navSupport">サポート</a>
          <a href="privacy.html" data-i18n="navPrivacy">プライバシーポリシー</a>
          <a href="terms.html" data-i18n="navTerms">利用約款</a>
        </nav>
      </main>
      <footer>
        <div class="store-badges">
          <img data-i18n-badge="ios" src="svg/badge_ios_ja_bk.svg" alt="App Store からダウンロード">
          <img data-i18n-badge="android" src="svg/badge_android_ja.svg" alt="Google Play で手に入れよう">
        </div>
        <nav class="footer-nav" data-i18n-aria="footerNavLabel" aria-label="フッターナビゲーション">
          <a data-i18n="footerAbout">サイトのご利用について</a>
          <a data-i18n="footerSecurity">情報セキュリティ方針</a>
        </nav>
      </footer>
      <button id="audio-toggle" data-aria-play="BGM を再生" data-aria-pause="BGM を停止" aria-label="BGM を再生"></button>
      <meta name="description" content="QA² は量子コンピューティングの世界を体験できるパズルゲームです。">
    `
    // jsdom puts meta in body; also set title
    document.title = 'QA² - Quantum Puzzle Game'
  })

  afterEach(() => {
    document.documentElement.removeAttribute('data-i18n-ready')
    document.documentElement.lang = 'ja'
  })

  test('Japanese keeps JP copy and badges', () => {
    applyLanguage('ja')

    expect(document.documentElement.lang).toBe('ja')
    expect(document.querySelector('[data-i18n="description"]').textContent)
      .toContain('量子コンピューティング')
    expect(document.querySelector('[data-i18n="description"] budoux-ja')).not.toBeNull()
    expect(document.querySelector('[data-i18n="navPresskit"]').textContent).toBe('プレスキット')
    expect(document.querySelector('[data-i18n="navSupport"]').textContent).toBe('サポート')
    expect(document.querySelector('[data-i18n="navPrivacy"]').textContent).toBe('プライバシーポリシー')
    expect(document.querySelector('[data-i18n="navTerms"]').textContent).toBe('利用約款')
    expect(document.querySelector('[data-i18n="footerAbout"]').textContent.trim())
      .toBe('サイトのご利用について')
    expect(document.querySelector('[data-i18n="footerSecurity"]').textContent.trim())
      .toBe('情報セキュリティ方針')
    expect(document.querySelector('[data-i18n-badge="ios"]').getAttribute('src'))
      .toBe('svg/badge_ios_ja_bk.svg')
    expect(document.querySelector('[data-i18n-badge="android"]').getAttribute('src'))
      .toBe('svg/badge_android_ja.svg')
    expect(document.querySelector('[data-i18n-badge="ios"]').getAttribute('alt'))
      .toBe('App Store からダウンロード')
    expect(document.querySelector('[data-i18n-badge="android"]').getAttribute('alt'))
      .toBe('Google Play で手に入れよう')
  })

  test('English swaps approved copy and EN badges', () => {
    applyLanguage('en')

    const en = I18N_STRINGS.en
    expect(document.documentElement.lang).toBe('en')
    expect(document.title).toBe(en.title)
    expect(document.querySelector('meta[name="description"]').getAttribute('content'))
      .toBe(en.metaDescription)
    expect(document.querySelector('[data-i18n="description"]').textContent)
      .toBe(en.description)
    expect(document.querySelector('[data-i18n="description"] budoux-ja')).toBeNull()
    expect(document.querySelector('[data-i18n="navPresskit"]').textContent).toBe('Press Kit')
    expect(document.querySelector('[data-i18n="navSupport"]').textContent).toBe('Support')
    expect(document.querySelector('[data-i18n="navPrivacy"]').textContent).toBe('Privacy Policy')
    expect(document.querySelector('[data-i18n="navTerms"]').textContent).toBe('Terms of Use')
    expect(document.querySelector('[data-i18n="footerAbout"]').textContent.trim())
      .toBe('About this site')
    expect(document.querySelector('[data-i18n="footerSecurity"]').textContent.trim())
      .toBe('Information Security Policy')
    expect(document.querySelector('.footer-nav').getAttribute('aria-label'))
      .toBe('Footer navigation')
    expect(document.querySelector('[data-i18n-badge="ios"]').getAttribute('src'))
      .toBe('svg/badge_ios_en_bk.svg')
    expect(document.querySelector('[data-i18n-badge="android"]').getAttribute('src'))
      .toBe('svg/badge_android_en.svg')
    expect(document.querySelector('[data-i18n-badge="ios"]').getAttribute('alt'))
      .toBe('Download on the App Store')
    expect(document.querySelector('[data-i18n-badge="android"]').getAttribute('alt'))
      .toBe('Get it on Google Play')
    expect(document.getElementById('audio-toggle').getAttribute('data-aria-play'))
      .toBe('Play BGM')
    expect(document.getElementById('audio-toggle').getAttribute('data-aria-pause'))
      .toBe('Stop BGM')
    expect(document.getElementById('audio-toggle').getAttribute('aria-label'))
      .toBe('Play BGM')
  })
})

describe('index.html i18n hooks', () => {
  const fs = require('fs')
  const path = require('path')
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8')

  test('loads i18n.js on the top page', () => {
    expect(html).toMatch(/src="i18n\.js"/)
  })

  test('marks translatable top-page strings with data-i18n', () => {
    expect(html).toMatch(/data-i18n="description"/)
    expect(html).toMatch(/data-i18n="navPresskit"/)
    expect(html).toMatch(/data-i18n="navSupport"/)
    expect(html).toMatch(/data-i18n="navPrivacy"/)
    expect(html).toMatch(/data-i18n="navTerms"/)
    expect(html).toMatch(/data-i18n="footerAbout"/)
    expect(html).toMatch(/data-i18n="footerSecurity"/)
  })

  test('keeps Japanese as the default markup content', () => {
    expect(html).toMatch(/プレスキット/)
    expect(html).toMatch(/量子コンピューティングの世界を体験できるパズルゲーム/)
  })
})
