@echo off
title Leela Laher Tech Point - Digital Catalogue
cd /d "%~dp0"
echo Starting Leela Laher Tech Point Digital Catalogue...
start "" http://localhost:8080/
python server.py
pause
