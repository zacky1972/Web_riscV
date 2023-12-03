# Features 
- 機能
    - インタプリタモード
        - ログ遡り(ArrowUp | ArrowDown)
        - 自動スクロール
        - エラーメッセージの表示
        - 複数行入力(Shift + Enter)
        - 自動フォーカス
    - コンパイルモード
        - キー操作
        - エラー表示
        - ステップ実行
        - ステップ時のフォーカス
        - リセットボタン
    - メモリー表示
        - 差分の可視化
- 命令
    - ロード命令
        - li
        - l(b|h)(u)
        - lw
    - ストア命令
        - si
        - s(b|h)(u)
        - sw
    - 移動命令
        - mv
    - 算術演算命令
        - add(u, i)
        - sub(u, i)
    - ジャンプ命令
        - j
        - jal
        - jr
        - beq
        - bne
        - b(g|l)(e|t)(u)
    - ラベル
    - ecall
        - 0: 整数入力
        - 1: 文字列入力 
        - 2: 整数表示
        - 3: 文字列表示
- 例外処理
    - インタプリタモード
        - 空入力
    - zoroへの書き込み禁止

# Install
    ```bash
    cd /path/to/Web_riscV
    npm install -g yarn
    yarn install
    yarn run
    ``` 
