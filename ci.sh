#!/usr/bin/env bash

function chart {
    ./js2chart.sh index
    srcs=('clr' 'hashmyjs')
    for i in "${srcs[@]}"; do
        ./js2chart.sh -p src/ $i
    done
}

function cc {
    files=('index' 'clr' 'hashmyjs')
    paths=('.' 'src' 'src')
    j=0
    for i in "${files[@]}"; do
        npm run cc ${paths[$j]}\/${i}.js > logs/${i}.md
        ((j++))
    done
}

npm run fmt && npm run doc && npm test && chart && cc && git commit -ae
