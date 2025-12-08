// Jest セットアップファイル
// 環境変数の設定やグローバルモックの設定

// window.requestAnimationFrame が必要なテスト用にモック提供
if (typeof window !== 'undefined') {
  window.requestAnimationFrame = window.requestAnimationFrame || function (callback) {
    return setTimeout(callback, 16)
  }
  window.cancelAnimationFrame = window.cancelAnimationFrame || function (id) {
    clearTimeout(id)
  }
}
