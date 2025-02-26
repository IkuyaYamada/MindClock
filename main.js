/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('commonjs-module')} */

const { app, BrowserWindow, ipcMain } = require("electron");
const Store = require("electron-store");
const store = new Store();

function createWindow() {
  const win = new BrowserWindow({
    width: 750,
    height: 800,
    frame: false,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile("index.html");
}

// データの保存と読み込みのIPC通信を設定
ipcMain.handle("save-tweets", async (event, tweets) => {
  // 新しいデータ構造で保存
  const tweetsWithMetadata = tweets.map((tweet) => {
    if (typeof tweet === "string") {
      // 古い形式のデータを新形式に変換
      return {
        content: tweet,
        timestamp: new Date().toISOString(),
      };
    }
    return tweet;
  });
  store.set("tweets", tweetsWithMetadata);
  return true;
});

ipcMain.handle("load-tweets", async () => {
  const tweets = store.get("tweets", []);
  // 古いデータ形式をチェックして変換
  const convertedTweets = tweets.map((tweet) => {
    if (typeof tweet === "string") {
      return {
        content: tweet,
        timestamp: new Date().toISOString(),
      };
    }
    return tweet;
  });
  return convertedTweets;
});

ipcMain.handle("delete-tweet", async (event, index) => {
  const tweets = store.get("tweets", []);
  tweets.splice(index, 1);
  store.set("tweets", tweets);
  return tweets;
});

ipcMain.handle("flush-tweets", async () => {
  store.set("tweets", []);
  return [];
});

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
