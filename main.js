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
        children: [], // 子ツイート配列を追加
      };
    }
    // 子ツイート配列がない場合は追加
    if (!tweet.children) {
      tweet.children = [];
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
        children: [], // 子ツイート配列を追加
      };
    }
    // 子ツイート配列がない場合は追加
    if (!tweet.children) {
      tweet.children = [];
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

// 子ツイートを追加する処理
ipcMain.handle("add-child-tweet", async (event, parentIndex, childTweet) => {
  const tweets = store.get("tweets", []);
  
  // 親ツイートが存在するか確認
  if (parentIndex < 0 || parentIndex >= tweets.length) {
    throw new Error("Parent tweet not found");
  }
  
  // 親ツイートに子ツイート配列がなければ初期化
  if (!tweets[parentIndex].children) {
    tweets[parentIndex].children = [];
  }
  
  // 子ツイートにタイムスタンプがなければ追加
  if (!childTweet.timestamp) {
    childTweet.timestamp = new Date().toISOString();
  }
  
  // 子ツイートを親ツイートの子ツイート配列に追加
  tweets[parentIndex].children.push(childTweet);
  
  // 更新したツイート配列を保存
  store.set("tweets", tweets);
  
  return tweets;
});

// 子ツイートを削除する処理
ipcMain.handle("delete-child-tweet", async (event, parentIndex, childIndex) => {
  const tweets = store.get("tweets", []);
  
  // 親ツイートが存在するか確認
  if (parentIndex < 0 || parentIndex >= tweets.length) {
    throw new Error("Parent tweet not found");
  }
  
  // 親ツイートに子ツイート配列があるか確認
  if (!tweets[parentIndex].children || !Array.isArray(tweets[parentIndex].children)) {
    throw new Error("Child tweets array not found");
  }
  
  // 子ツイートが存在するか確認
  if (childIndex < 0 || childIndex >= tweets[parentIndex].children.length) {
    throw new Error("Child tweet not found");
  }
  
  // 子ツイートを削除
  tweets[parentIndex].children.splice(childIndex, 1);
  
  // 更新したツイート配列を保存
  store.set("tweets", tweets);
  
  return tweets;
});

// 子ツイートを編集する処理
ipcMain.handle("edit-child-tweet", async (event, parentIndex, childIndex, updatedContent) => {
  const tweets = store.get("tweets", []);
  
  // 親ツイートが存在するか確認
  if (parentIndex < 0 || parentIndex >= tweets.length) {
    throw new Error("Parent tweet not found");
  }
  
  // 親ツイートに子ツイート配列があるか確認
  if (!tweets[parentIndex].children || !Array.isArray(tweets[parentIndex].children)) {
    throw new Error("Child tweets array not found");
  }
  
  // 子ツイートが存在するか確認
  if (childIndex < 0 || childIndex >= tweets[parentIndex].children.length) {
    throw new Error("Child tweet not found");
  }
  
  // 子ツイートの内容を更新
  tweets[parentIndex].children[childIndex].content = updatedContent;
  
  // 更新したツイート配列を保存
  store.set("tweets", tweets);
  
  return tweets;
});

ipcMain.handle("flush-tweets", async () => {
  store.set("tweets", []);
  return [];
});

// JSONエクスポート機能
ipcMain.handle("export-tweets-json", async () => {
  const tweets = store.get("tweets", []);
  return tweets;
});

// JSONインポート機能
ipcMain.handle("import-tweets-json", async (event, importedTweets) => {
  try {
    // インポートされたデータが配列であることを確認
    if (!Array.isArray(importedTweets)) {
      throw new Error("Invalid data format");
    }
    
    // 各ツイートが正しい形式であることを確認
    const validatedTweets = importedTweets.map(tweet => {
      // 基本的な検証
      if (!tweet || typeof tweet !== 'object') {
        throw new Error("Invalid tweet format");
      }
      
      // 必須フィールドの確認
      if (!tweet.content || typeof tweet.content !== 'string') {
        throw new Error("Tweet content is missing or invalid");
      }
      
      // タイムスタンプがない場合は現在の時刻を設定
      const timestamp = tweet.timestamp && new Date(tweet.timestamp).toString() !== "Invalid Date" 
        ? tweet.timestamp 
        : new Date().toISOString();
      
      // 子ツイートの検証
      let children = [];
      if (tweet.children && Array.isArray(tweet.children)) {
        children = tweet.children.map(child => {
          if (!child || typeof child !== 'object' || !child.content || typeof child.content !== 'string') {
            return null; // 無効な子ツイートはnullに
          }
          
          const childTimestamp = child.timestamp && new Date(child.timestamp).toString() !== "Invalid Date"
            ? child.timestamp
            : new Date().toISOString();
            
          return {
            content: child.content,
            timestamp: childTimestamp
          };
        }).filter(child => child !== null); // nullの子ツイートを除外
      }
      
      return {
        content: tweet.content,
        timestamp: timestamp,
        children: children
      };
    });
    
    // 検証済みのツイートを保存
    store.set("tweets", validatedTweets);
    return validatedTweets;
  } catch (error) {
    console.error("Import error:", error);
    throw error;
  }
});

// JSONマージ機能
ipcMain.handle("merge-tweets-json", async (event, importedTweets) => {
  try {
    // インポートされたデータが配列であることを確認
    if (!Array.isArray(importedTweets)) {
      throw new Error("Invalid data format");
    }
    
    // 現在のツイートを取得
    const currentTweets = store.get("tweets", []);
    
    // 各ツイートが正しい形式であることを確認
    const validatedImportedTweets = importedTweets.map(tweet => {
      // 基本的な検証
      if (!tweet || typeof tweet !== 'object') {
        throw new Error("Invalid tweet format");
      }
      
      // 必須フィールドの確認
      if (!tweet.content || typeof tweet.content !== 'string') {
        throw new Error("Tweet content is missing or invalid");
      }
      
      // タイムスタンプがない場合は現在の時刻を設定
      const timestamp = tweet.timestamp && new Date(tweet.timestamp).toString() !== "Invalid Date" 
        ? tweet.timestamp 
        : new Date().toISOString();
      
      // 子ツイートの検証
      let children = [];
      if (tweet.children && Array.isArray(tweet.children)) {
        children = tweet.children.map(child => {
          if (!child || typeof child !== 'object' || !child.content || typeof child.content !== 'string') {
            return null; // 無効な子ツイートはnullに
          }
          
          const childTimestamp = child.timestamp && new Date(child.timestamp).toString() !== "Invalid Date"
            ? child.timestamp
            : new Date().toISOString();
            
          return {
            content: child.content,
            timestamp: childTimestamp
          };
        }).filter(child => child !== null); // nullの子ツイートを除外
      }
      
      return {
        content: tweet.content,
        timestamp: timestamp,
        children: children
      };
    });
    
    // 重複を避けるためのマップ（コンテンツとタイムスタンプの組み合わせをキーとして使用）
    const uniqueTweets = new Map();
    
    // 現在のツイートをマップに追加
    currentTweets.forEach(tweet => {
      const key = `${tweet.content}_${tweet.timestamp}`;
      uniqueTweets.set(key, tweet);
    });
    
    // インポートされたツイートをマップに追加（重複する場合は上書き）
    validatedImportedTweets.forEach(tweet => {
      const key = `${tweet.content}_${tweet.timestamp}`;
      // 既存のツイートがある場合は子ツイートをマージ
      if (uniqueTweets.has(key)) {
        const existingTweet = uniqueTweets.get(key);
        // 既存の子ツイートと新しい子ツイートをマージ
        const existingChildren = existingTweet.children || [];
        const newChildren = tweet.children || [];
        
        // 子ツイートの重複を避けるためのマップ
        const uniqueChildren = new Map();
        
        // 既存の子ツイートをマップに追加
        existingChildren.forEach(child => {
          const childKey = `${child.content}_${child.timestamp}`;
          uniqueChildren.set(childKey, child);
        });
        
        // 新しい子ツイートをマップに追加
        newChildren.forEach(child => {
          const childKey = `${child.content}_${child.timestamp}`;
          uniqueChildren.set(childKey, child);
        });
        
        // マージした子ツイートを設定
        existingTweet.children = Array.from(uniqueChildren.values());
        uniqueTweets.set(key, existingTweet);
      } else {
        uniqueTweets.set(key, tweet);
      }
    });
    
    // マップから配列に変換
    const mergedTweets = Array.from(uniqueTweets.values());
    
    // タイムスタンプでソート（新しい順）
    mergedTweets.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // マージされたツイートを保存
    store.set("tweets", mergedTweets);
    return mergedTweets;
  } catch (error) {
    console.error("Merge error:", error);
    throw error;
  }
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
