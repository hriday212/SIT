#!/bin/bash
export PATH="/c/Program Files/nodejs:$PATH"
yes | npx hardhat run scripts/deploy.js --network localhost
