#!/usr/bin/env bash

# Use ansible you big dummy.

rsync -avz --delete ./dist/ rotblauer.catonmap:/www/gl.catonmap.net/
