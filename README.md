<div align="center">
  <img src="assets/extension_logo.png" alt="Auto-Doc Logo" width="128" height="128">
  <h1>Auto-Doc</h1>
  <p><strong>Your personal code diary. Automatically document every change, every save, without lifting a finger.</strong></p>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=ni3dev.auto-doc"><img src="https://vsmarketplacebadge.apphb.com/version-short/ni3dev.auto-doc.svg?color=green&style=for-the-badge" alt="Marketplace Version"></a>
    <a href="https://marketplace.visualstudio.com/items?itemName=ni3dev.auto-doc"><img src="https://vsmarketplacebadge.apphb.com/installs-short/ni3dev.auto-doc.svg?color=blue&style=for-the-badge" alt="Marketplace Installs"></a>
    <a href="https://marketplace.visualstudio.com/items?itemName=ni3dev.auto-doc"><img src="https://vsmarketplacebadge.apphb.com/rating-short/ni3dev.auto-doc.svg?color=yellow&style=for-the-badge" alt="Marketplace Rating"></a>
  </p>
</div>

---

**Auto-Doc** is a powerful yet simple VS Code extension designed for developers who need to keep a running diary of their work. It silently monitors your file saves, intelligently detects changes, and appends a detailed, line-by-line log to a Markdown file in your project.



## Why Auto-Doc?

In a fast-paced development environment, documenting every small change is tedious and often forgotten. Auto-Doc solves this by integrating documentation directly into your natural workflow. Never again forget why you removed a block of code or what you added during a late-night coding session.

---

## Features

| Feature                 | Description                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| **📝 Automatic Logging** | Works silently in the background. Just save your file (`Ctrl+S`), and your changes are logged.            |
| **📊 Precise Diffing** | Pinpoints the exact lines that were **added** or **removed**, complete with line numbers.                |
| **📄 Dynamic Log Files** | Creates a neatly formatted Markdown log file named after your project (e.g., `MyProject_Documentation.md`). |
| **⚙️ Status Bar Control** | An icon in the status bar shows you if logging is active and lets you toggle it on/off with a single click. |
| **⚡️ Command Palette** | Use commands to instantly open the log file or toggle logging.                                           |
| **📄 PDF Export** | Convert your entire change log into a clean, rendered PDF document with a single command.                |

---

## Usage

1.  **Install** the Auto-Doc extension from the VS Code Marketplace.
2.  **Open** any project folder. You'll see the **`$(file-text) Auto-Doc: ON`** icon in your status bar.
3.  **Start Coding!** Every time you save a file, your changes will be prepended to the `YourProjectName_Documentation.md` file.

### Available Commands

Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and type "Auto-Doc" to see all available commands:

* **`Auto-Doc: Open Log File`**: Instantly finds and opens the documentation file.
* **`Auto-Doc: Toggle Logging On/Off`**: Temporarily pause or resume logging. You can also do this by clicking the status bar item.
* **`Auto-Doc: Export Log to PDF`**: Generates a PDF version of your documentation file.

---

## What's Next?

This is the first stable version of Auto-Doc. Future plans include more customization options and potential cloud-sync features for teams.

**Enjoy a seamless documentation experience!**