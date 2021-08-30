## Compress videos from jitter to h265 with high compression

`ffmpeg -i input.mp4 -vcodec libx265 -crf 24 output.mp4`

## Compress video from jitter to h264 (better compatibility) with high compression

`ffmpeg -i input.mp4 -crf 26 output.mp4`
