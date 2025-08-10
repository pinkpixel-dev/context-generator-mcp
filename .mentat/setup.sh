#!/bin/bash

# Install dependencies using npm ci for reproducible builds
npm ci

# Build the TypeScript project
npm run build
