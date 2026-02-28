#!/bin/bash
export PATH="/c/Program Files/nodejs:$PATH"
export PATH="$LOCALAPPDATA/Programs/Python/Python311:$LOCALAPPDATA/Programs/Python/Python311/Scripts:$PATH"
python.exe -m uvicorn main:app --port 8000
