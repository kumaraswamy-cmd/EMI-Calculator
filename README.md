# EMI Calculator

A local Apple-inspired web EMI Calculator built with Python, HTML, CSS, and JavaScript.

## Features
- Runs locally in your browser
- Apple-style desktop window design
- Calculates monthly EMI, total payable, and total interest
- Includes sliders and direct number inputs
- Handles zero-interest loans

## Technologies Used
- Python standard library local server
- HTML
- CSS
- JavaScript
- Optional Node.js fallback server

## How to Run

On Windows, you can double-click:

```text
start.bat
```

Or run with Python:

```bash
python main.py
```

The app opens automatically. If it does not, open the local URL printed in the terminal, usually:

```text
http://127.0.0.1:8000
```

If Python is not installed, `start.bat` opens `web/index.html` directly in your browser, which still runs the calculator locally.

If Node.js is installed but Python is not, `start.bat` will use `server.js` to run the same local web app.
