- [x] 各ツイートに子ツイートを入れられる機能を付けたい
  - [x] 子ツイートは選択したツイートの上でなんらかのコマンドでできるようにしたい
  - [x] ツイートをツリー表示できるようにしたい
  - [x] テキストにExportする際には子ツイートであることはタブで見極められるようにしたい
- [ ] 現在支配されているマインドを示す、mind hook機能を実装したい
  - [x] mind hook機能はボタンでも操作できる
  - [x] mind hook状態はブラウザを閉じても保持される
  - [x] 同時に mind hook に登録できるツイート（mind)は3つまで
  - [x] mind hook機能はわかりやすい表示をする
  - [x] mind hook機能はキーボードショートカット（fキー）で操作できる
- [x] mind hook機能の改善
  - [x] mind hook表示のスタイルを強化（黄色のボーダー、背景色、テキスト色）
  - [x] mind hookインジケータ（💭）の追加
  - [x] mind hookされたツイートへのスクロール機能
  - [x] mind hook状態の切り替え時のアニメーション改善
- [x] mind hook機能のバグ修正
  - [x] フォーカス機能を無効化し、マインドフック機能のみを使用するように変更
  - [x] fキーを複数回押すと以前のインジケータ（☆）が表示される問題を修正
  - [x] マインドフックインジケータを「💭」に統一
  - [x] Fキーを押したときにマインドフック機能が正しく動作しない問題を修正
  - [x] マインドフック切り替え時のマトリックスエフェクトを追加
- [ ] mind hook機能の拡張
  - [ ] 子ツイートもマインドフックできるようにする
  - [ ] マインドフックされたツイートの一覧表示機能
  - [ ] マインドフックされたツイートへのジャンプ機能の強化
- [ ] デグレ発生
  - [ ] j,k でツイート編集画面にフォーカスされない
  - [ ] ctrl + shift + j でjson export が呼び出されない
  - [ ] 他にも機能していないショートカットコマンドがある
  - [ ] 削除されるべきでないツイートが削除される（インデックスミス）など発生しているので、新機能開発時にミスを起こさないような工夫をしてください（コメントなどがいいのかな）
  - [ ] 人間というよりあなたがミスしづらい工夫でOKです
- [x] マージJSON機能の修正
  - [x] マージJSON後のツイート表示順序が「昔→今」になる問題を修正
- [ ] ウィンドウ位置
  - [ ] 前回終了したウインドウ位置で起動してほしい
- [ ] 現在は子ツイートのインデントは2つまでだが、これを4つまでできるようにしたい
  - [ ] なので一つ一つのインデント（ピクセルずらし）は控えめにしておきたい
- [ ] 子ツイートでも並び順は新→古にしたい

## マインドフック機能の現状と課題

### 現在できていること
- マインドフックボタンをクリックすると、選択したツイートにマインドフックが設定/解除される
- マインドフック状態はLocalStorageに保存され、ブラウザを閉じても保持される
- Fキーを押すと、現在フォーカスされているツイートにマインドフックが設定/解除される
- マインドフックされたツイートには💭インジケータが表示され、背景色や枠線が変更されて視覚的に区別できる
- マインドフックされたツイート間をAlt+↑/↓キーで移動できる
- マインドフック切り替え時にマトリックスエフェクトが表示される

### 今後の拡張機能
1. 子ツイートもマインドフックできるようにする
2. マインドフックされたツイートの一覧表示機能を追加する
3. マインドフックされたツイートへのジャンプ機能を強化する
  