#!/bin/bash

# ======================================================================
#             🏠 Floor Tile Visualizer - Startup Script 🏠
# ======================================================================

echo "======================================================================"
echo "            🏠 Floor Tile Visualizer - Startup Script 🏠"
echo "======================================================================"
echo ""

# Check for Python 3
if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "[ERROR] Python was not found on your system PATH."
    echo "Please install Python 3.10+."
    echo ""
    read -p "Press Enter to exit..."
    exit 1
fi

echo "[*] Using python command: $PYTHON_CMD"
$PYTHON_CMD --version
echo ""

# Setup Virtual Environment
if [ ! -d ".venv" ]; then
    echo "[*] Creating a virtual environment (.venv) ..."
    $PYTHON_CMD -m venv .venv
    if [ $? -ne 0 ]; then
        echo "[ERROR] Failed to create virtual environment."
        read -p "Press Enter to exit..."
        exit 1
    fi
    echo "[✓] Virtual environment created successfully."
    echo ""
fi

# Activate Virtual Environment
echo "[*] Activating virtual environment ..."
source .venv/bin/activate
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to activate virtual environment."
    read -p "Press Enter to exit..."
    exit 1
fi
echo ""

# Install / Update Dependencies
echo "[*] Checking and installing dependencies from backend/requirements.txt ..."
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies."
    read -p "Press Enter to exit..."
    exit 1
fi
echo "[✓] Dependencies successfully verified."
echo ""

# Launch FastAPI Server
echo "======================================================================"
echo "  Starting the Floor Tile Visualizer Server..."
echo "  Open your browser at: http://localhost:8000"
echo "  (Note: The first floor detection will download the AI model ~47MB)"
echo "======================================================================"
echo ""

cd backend
uvicorn app:app --host 127.0.0.1 --port 8000
