# Nodeイメージの取得
FROM node:16.15.0-alpine
# ワーキングディレクトリの指定
WORKDIR /app
# パッケージをコピー(このファイルだけ別にして先にインストールしたほうが良い)
COPY package*.json ./
# npm モジュールをインストール
RUN npm install --quiet
# その他のファイルをコピー
COPY . .
# このコマンドをしないといけないとwarnが出たので
RUN npm rebuild
# 本当はいらないが開発環境でvue-cliを使っていたのでそこに含まれているパッケージを使っているようでwarnが出たので入れる
#RUN npm install vue-cli -g
# ビルドします
RUN npm run build
# なくても良い
ENV HOST 0.0.0.0
# なくても良い
EXPOSE 3000
# 起動コマンド
CMD ["npm", "run", "dev"]
