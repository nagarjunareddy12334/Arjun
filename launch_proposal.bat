@echo off
start "" "http://localhost:8081/"
if errorlevel 1 start "" "%~dp0index.html"
exit
