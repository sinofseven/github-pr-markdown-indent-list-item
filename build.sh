#!/usr/bin/env bash

pnpm run build
cd dist

zip -r ../package.zip *
