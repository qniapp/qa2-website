/* global describe, test, expect, beforeAll */
/**
 * index.html 構造テスト
 * Requirements: 1.1, 1.2, 1.3, 1.4, 2.2
 */

const fs = require('fs')
const path = require('path')

describe('index.html 構造テスト', () => {
  let htmlContent

  beforeAll(() => {
    const htmlPath = path.join(__dirname, '..', 'index.html')
    htmlContent = fs.readFileSync(htmlPath, 'utf8')
  })

  describe('Requirement 1.1: QA² ロゴ表示', () => {
    test('QA² ロゴが存在する', () => {
      expect(htmlContent).toMatch(/QA.*2/)
    })

    test('ロゴクラスが適用されている', () => {
      expect(htmlContent).toMatch(/class="logo"/)
    })

    test('上付き文字の 2 が使用されている', () => {
      expect(htmlContent).toMatch(/<sup>2<\/sup>/)
    })
  })

  describe('Requirement 1.2: ゲーム説明文', () => {
    test('説明文セクションが存在する', () => {
      expect(htmlContent).toMatch(/class="description"/)
    })
  })

  describe('Requirement 1.3: サポートページリンク', () => {
    test('サポートページへのリンクが存在する', () => {
      expect(htmlContent).toMatch(/href="support\.html"/)
    })
  })

  describe('Requirement 1.4: プライバシーポリシーリンク', () => {
    test('プライバシーポリシーページへのリンクが存在する', () => {
      expect(htmlContent).toMatch(/href="privacy\.html"/)
    })
  })

  describe('Requirement 2.2: 白い QA² ロゴ中央配置', () => {
    test('main 要素で中央配置構造が存在する', () => {
      expect(htmlContent).toMatch(/<main/)
    })
  })

  describe('Canvas 要素', () => {
    test('パーティクルアニメーション用 Canvas が存在する', () => {
      expect(htmlContent).toMatch(/id="particle-canvas"/)
    })
  })

  describe('ナビゲーション構造', () => {
    test('nav 要素が存在する', () => {
      expect(htmlContent).toMatch(/<nav/)
    })

    test('footer 要素が存在する', () => {
      expect(htmlContent).toMatch(/<footer/)
    })
  })
})
