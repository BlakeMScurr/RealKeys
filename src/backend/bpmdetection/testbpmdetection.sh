#!/usr/bin/env bash

docker build -t beatdetector . && cat testdata/firework.wav | docker run -i beatdetector