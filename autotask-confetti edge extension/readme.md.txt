# latest update
added logos

# Autotask Confetti

A small Microsoft Edge extension that adds a confetti effect when the **Save & Close** button is clicked in Autotask.

## Who made this

Created by ~~ChatGPT~~ Owen for a user working on Autotask in Microsoft Edge.

## How it works

This extension uses a content script that runs on matching Autotask pages.  
When the page loads, the script listens for clicks on the Autotask button labeled **Save & Close**.  
If that button is clicked, the script creates small animated DOM elements that fall across the screen like confetti.

## Installation

This extension is meant to be loaded as an **unpacked extension** in Microsoft Edge.

1. Open `edge://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the folder containing this extension

## Notes

- The extension only runs on matching Autotask pages.
- It does not send data anywhere.
- It only modifies the page visually.

## Files

- `manifest.json` — extension config and page matching rules
- `content.js` — the script that adds the confetti effect
- `README.md` — this file