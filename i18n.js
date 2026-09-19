/**
 * Top-page bilingual support (ja / en).
 * Detects browser language (and optional ?lang=ja|en override),
 * then swaps copy, badges, and aria-labels on index.html.
 */

const I18N_STRINGS = {
  ja: {
    title: 'QA² - Quantum Puzzle Game',
    metaDescription: 'QA² は量子コンピューティングの世界を体験できるパズルゲームです。',
    description: '量子コンピューティングの世界を体験できるパズルゲーム。量子ゲートを操作し、美しいパターンを生み出そう。',
    navPresskit: 'プレスキット',
    navSupport: 'サポート',
    navPrivacy: 'プライバシーポリシー',
    navTerms: '利用約款',
    storeIosAlt: 'App Store からダウンロード',
    storeAndroidAlt: 'Google Play で手に入れよう',
    footerAbout: 'サイトのご利用について',
    footerSecurity: '情報セキュリティ方針',
    footerNavLabel: 'フッターナビゲーション',
    audioPlay: 'BGM を再生',
    audioPause: 'BGM を停止',
    badgeIos: 'svg/badge_ios_ja_bk.svg',
    badgeAndroid: 'svg/badge_android_ja.svg'
  },
  en: {
    title: 'QA² - Quantum Puzzle Game',
    metaDescription: 'QA² is a puzzle game that lets you experience quantum computing.',
    description: 'A puzzle game that lets you experience quantum computing. Play with quantum gates and create beautiful patterns.',
    navPresskit: 'Press Kit',
    navSupport: 'Support',
    navPrivacy: 'Privacy Policy',
    navTerms: 'Terms of Use',
    storeIosAlt: 'Download on the App Store',
    storeAndroidAlt: 'Get it on Google Play',
    footerAbout: 'About this site',
    footerSecurity: 'Information Security Policy',
    footerNavLabel: 'Footer navigation',
    audioPlay: 'Play BGM',
    audioPause: 'Stop BGM',
    badgeIos: 'svg/badge_ios_en_bk.svg',
    badgeAndroid: 'svg/badge_android_en.svg'
  }
}

/**
 * Resolve UI language from ?lang= override or browser languages.
 * @param {string} [search] - location.search (or equivalent) for testing
 * @param {string|string[]} [languages] - navigator.languages / language
 * @returns {'ja'|'en'}
 */
function detectLanguage (search, languages) {
  const query = search != null ? search : (typeof window !== 'undefined' ? window.location.search : '')
  try {
    const params = new URLSearchParams(query.startsWith('?') ? query : `?${query}`)
    const override = params.get('lang')
    if (override === 'ja' || override === 'en') {
      return override
    }
  } catch (e) {
    // ignore invalid query strings
  }

  let list = languages
  if (list == null && typeof navigator !== 'undefined') {
    list = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || 'en']
  }
  if (typeof list === 'string') {
    list = [list]
  }
  if (!Array.isArray(list) || list.length === 0) {
    return 'en'
  }

  for (let i = 0; i < list.length; i++) {
    if (String(list[i]).toLowerCase().startsWith('ja')) {
      return 'ja'
    }
  }
  return 'en'
}

/**
 * Apply language strings to the top page DOM.
 * @param {'ja'|'en'} lang
 * @param {Document} [doc]
 */
function applyLanguage (lang, doc) {
  const documentRef = doc || document
  const t = I18N_STRINGS[lang] || I18N_STRINGS.en

  documentRef.documentElement.lang = lang
  documentRef.documentElement.setAttribute('data-i18n-ready', 'true')

  if (documentRef.title !== undefined) {
    documentRef.title = t.title
  }

  const meta = documentRef.querySelector('meta[name="description"]')
  if (meta) {
    meta.setAttribute('content', t.metaDescription)
  }

  documentRef.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')
    if (t[key] == null) return

    if (key === 'description') {
      if (lang === 'ja') {
        el.innerHTML = `<budoux-ja>${t[key]}</budoux-ja>`
      } else {
        el.textContent = t[key]
      }
      return
    }

    el.textContent = t[key]
  })

  documentRef.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria')
    if (t[key] != null) {
      el.setAttribute('aria-label', t[key])
    }
  })

  const audioBtn = documentRef.getElementById('audio-toggle')
  if (audioBtn) {
    audioBtn.setAttribute('data-aria-play', t.audioPlay)
    audioBtn.setAttribute('data-aria-pause', t.audioPause)
    const playing = typeof window !== 'undefined' &&
      window.audioPlayer &&
      window.audioPlayer.isPlaying
    audioBtn.setAttribute('aria-label', playing ? t.audioPause : t.audioPlay)
  }

  const iosImg = documentRef.querySelector('[data-i18n-badge="ios"]')
  if (iosImg) {
    iosImg.setAttribute('src', t.badgeIos)
    iosImg.setAttribute('alt', t.storeIosAlt)
  }

  const androidImg = documentRef.querySelector('[data-i18n-badge="android"]')
  if (androidImg) {
    androidImg.setAttribute('src', t.badgeAndroid)
    androidImg.setAttribute('alt', t.storeAndroidAlt)
  }
}

function initI18n () {
  const lang = detectLanguage()
  applyLanguage(lang)
}

// Browser script tag only (skip when required by Jest / Node)
if (typeof document !== 'undefined' && typeof module === 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n)
  } else {
    initI18n()
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    I18N_STRINGS,
    detectLanguage,
    applyLanguage,
    initI18n
  }
}
