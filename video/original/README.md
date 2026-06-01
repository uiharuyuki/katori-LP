# エンコード前のオリジナル動画

このフォルダには、軽量化エンコード前のオリジナル動画を保全しています。

| ファイル | 元 | 本番(エンコード後) |
|---|---|---|
| video--1.mp4 | 64MB / 852x480 / 約4140 kb/s | 9.6MB / 約625 kb/s |
| video--2.mp4 | 80MB / 852x480 / 約4138 kb/s | 22MB / 約1111 kb/s |
| video--3.mp4 | 27MB / 1280x852 / 約7504 kb/s | 1.6MB / 約448 kb/s |

本番で使用しているのは `video/video--X.mp4`（このフォルダの1つ上）です。
解像度・尺は維持したまま、音声除去とビットレート削減（H.264 High / faststart）で
合計 171MB → 約33MB に軽量化しています。

## 再エンコード手順（参考）

```sh
ffmpeg -y -i video/original/video--1.mp4 -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -preset medium -crf 23 -movflags +faststart \
  -vf "scale='min(1280,iw)':-2" video/video--1.mp4
```

品質を上げたい場合は `-crf` を下げる（例: 20）、さらに軽くしたい場合は上げる（例: 26〜28）。
