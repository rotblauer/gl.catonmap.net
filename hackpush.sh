#!/usr/bin/env bash

# Use ansible you big dummy.

set -e
set -x
npm run build
rsync -avz --delete ./dist/ rotblauer.catonmap:/www/gl.catonmap.net/
