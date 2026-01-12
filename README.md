# 🚫 Video Autoplay Blocker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](https://github.com/yourusername/BlockVideoPlayback)
[![Chrome](https://img.shields.io/badge/Browser-Chrome-brightgreen.svg)](https://google.com/chrome)

A lightweight environment-aware browser extension designed to aggressively block video autoplay and programmatically pause media playback across all websites. Utilizing **Main World Interception**, it prevents sites from bypassing standard autoplay policies.

---

## ✨ Features

- **Tough Autoplay Blocking**: Intercepts video elements at the core level to prevent automatic playback.
- **Main World Injection**: Operates in the same execution context as the website for maximum effectiveness.
- **Site-Specific Management**: View and manage which sites have been affected.
- **Toggle Switch**: Quickly enable or disable the blocker via a clean popup interface.
- **Manifest V3**: Built on the latest Chrome Extension standards for performance and security.

## 🚀 Installation

Since this extension is in development, you can load it manually in Chrome:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/BlockVideoPlayback.git
   ```
2. **Open Extensions Page**:
   - Navigate to `chrome://extensions/` in your browser.
3. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right corner.
4. **Load Unpacked**:
   - Click "Load unpacked" and select the `Extension` directory within the project folder.

## 🛠️ Technical Overview

### Main World Interception
Standard content scripts run in isolated worlds. This extension injects `inject.js` into the **Main World** (`world: "MAIN"`), allowing it to directly override HTMLMediaElement prototypes and event listeners before the page's own scripts can execute.

### Core Components
- `content.js`: Handles communication between the extension and the page.
- `inject.js`: The "Main World" payload that neutralizes autoplay logic.
- `popup.js`: Manages the user interface and storage synchronization.
- `manifest.json`: Configuration for permissions and content script injection strategies.

## �️ Privacy & Ethics

We believe that technology should serve the user, not the other way around. 

- **Zero Data Collection**: This extension does not collect, store, or transmit any personal data, browsing history, or usage statistics.
- **Privacy by Design**: All operations happen locally within your browser. There are no external tracking scripts or analytics embedded.
- **User-Centric**: Our goal is to enhance your web experience and provide a quieter browsing environment without turning you into merchandise. 

## �📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for a quieter web browsing experience.</p>
