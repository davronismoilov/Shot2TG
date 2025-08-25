# Telegram Screenshot Sender Extension

This is a **Chrome Extension** that allows you to automatically or manually take screenshots of your browser and send them to a Telegram chat via a bot.

## Features
- Take screenshots manually by clicking the **Send Now** button.
- Automatically send screenshots at a specified interval (every N minutes).
- Configure **Telegram Bot Token**, **Chat ID**, and **Interval** directly in the popup UI.
- Simple and clean design.

## Installation
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/telegram-screenshot-extension.git
   cd telegram-screenshot-extension
   ```

2. Open Chrome and go to:
   ```
   chrome://extensions/
   ```

3. Enable **Developer mode** (top right corner).

4. Click **Load unpacked** and select the project folder.

5. The extension will appear in your browser toolbar.

## Usage
1. Click on the extension icon to open the popup.
2. Enter your:
   - **Telegram Bot Token**
   - **Chat ID**
   - **Interval (minutes)**
3. Click **Save Settings**.
4. You can:
   - Click **Send Now** to instantly send a screenshot.
   - Wait for the interval, and the extension will automatically send screenshots.

## Example
- Popup UI fields:
  - Bot Token: `123456:ABC-123xyz`
  - Chat ID: `987654321`
  - Interval: `60` (sends every hour)

## Project Structure
```
📂 telegram-screenshot-extension
 ┣ 📜 manifest.json
 ┣ 📜 background.js
 ┣ 📜 popup.html
 ┣ 📜 popup.js
 ┗ 📜 README.md
```

## Requirements
- Chrome Browser
- Telegram Bot Token (create from [BotFather](https://t.me/BotFather))
- Your Telegram Chat ID (you can get it using [@userinfobot](https://t.me/userinfobot))

## License
MIT License




