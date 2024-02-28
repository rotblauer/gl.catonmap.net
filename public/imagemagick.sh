#!/usr/bin/env bash

## Add border.
# convert cat-icon-white.png -write mpr:in -resize 200% \
#   -channel A -morphology dilate disk:19n +channel \
#   -fill black -colorize 100 -resize 50% mpr:in -composite cat-icon-white-bordered.png

## Create colorized icons per activity.
declare -A activity_pairs=(
    ['Stationary']='#f32d2d'
    ['Walking']='#e78719'
    ['Running']='#028532'
    ['Bike']='#1238f6'
    ['Automotive']='#be00ff'
    ['Unknown']='#888888' # black cat is normal cat; grey cat is unknown uncativity
#    ['Unknown']='#000000'
)

for activity in "${!activity_pairs[@]}"; do
  convert cat-icon.png +level-colors "${activity_pairs[$activity]}", cat-icon-${activity}.png
done
