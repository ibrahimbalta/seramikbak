@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo    SeramikBak - SegFormer AI Python Visualizer Mikroservisi
echo ======================================================================
echo.

:: Hugging Face Cache on D: Drive
if exist "D:\floor_tile_env\hf_cache" (
    echo [*] D:\floor_tile_env\hf_cache tespit edildi.
    set "HF_HOME=D:\floor_tile_env\hf_cache"
)

:: Check for existing D: virtual environment or local .venv
if exist "D:\floor_tile_env\Scripts\activate.bat" (
    echo [*] D:\floor_tile_env ortami aktif ediliyor...
    call "D:\floor_tile_env\Scripts\activate.bat"
) else if exist "c:\Users\A\Downloads\floor-tile-visualizer-main\floor-tile-visualizer-main\.venv\Scripts\activate.bat" (
    echo [*] Downloads klasorundeki .venv aktif ediliyor...
    call "c:\Users\A\Downloads\floor-tile-visualizer-main\floor-tile-visualizer-main\.venv\Scripts\activate.bat"
) else (
    echo [*] Sistem Python kullaniliyor...
)

echo.
echo ======================================================================
echo   Sunucu Baslatiliyor: http://127.0.0.1:8000
echo   SeramikBak Next.js otomatik baglanacaktir.
echo ======================================================================
echo.

python -m uvicorn app:app --host 127.0.0.1 --port 8000 --reload

pause
