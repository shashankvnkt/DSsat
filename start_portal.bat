@echo off
echo ========================================================
echo        Starting DS Lab Portal (Data Science Laboratory)
echo ========================================================
echo.
echo Initializing database and starting local SQLite server...
start http://localhost:8000
python server.py
pause
