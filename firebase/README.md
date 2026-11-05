# city2 の Firebase 保存先

既存の Realtime Database 内の `buidings/posts` を、トップと city2 の画像投稿専用に使います。city1 は `shusshinSentence/posts` のままです。

Firebase コンソールでプロジェクト `database-s-9e4b3` を開き、Realtime Database → ルールに `database.rules.json` の内容を貼り付けて公開してください。既存の保存先のルールは維持しています。このルールはログインなしの読み書きを許可します。

保存先 `buidings` は、ルール公開後の最初の投稿で自動的に作成されます。手動で空のノードを作る必要はありません。既存の端末内の画像投稿は、新しい保存先へ再送するようにしています。

このファイルを GitHub に置くだけでは、Firebase のルールは変更されません。ルールの公開は Firebase コンソールで行ってください。
