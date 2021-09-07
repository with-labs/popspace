#! /bin/bash

for filename in video_source/*.mp4; do

        basePath=${filename%.*}
        baseName=${basePath##*/}

        # ffmpeg -i "$filename" -vf scale=880:-1 -c:v libvpx -crf 20 -b:v 1M -c:a libvorbis dist/template_"$baseName".webm
        
        ffmpeg -i "$filename" -crf 20 -vf scale=880:-1 dist/template_"$baseName".mp4
        
        # ffmpeg -i "$filename" -crf 20 -vf scale=880:-1 -vcodec libx265 dist/template_"$baseName"_h265.mp4
        
        ffmpeg -ss 0 -i "$filename" -vframes 1 -vf scale=880:-1 -f image2 dist/template_"$baseName".jpg
        
        printf "%s\n" "$filename conversion complete!"
        printf "%s\n" "---------------------------------------"

done

printf "%s\n" "Conversion from mp4 to webm complete!"
