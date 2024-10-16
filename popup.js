let db;

const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("TextInsertDB", 1);

    request.onerror = (event) => {
      console.error("Database error: " + event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;
      const objectStore = db.createObjectStore("texts", {
        keyPath: "id",
        autoIncrement: true,
      });
      objectStore.createIndex("name", "name", { unique: false });
    };
  });
};

const saveText = async () => {
  const text = document.getElementById("text-input").value;
  const name = document.getElementById("text-name").value;

  const transaction = db.transaction(["texts"], "readwrite");
  const objectStore = transaction.objectStore("texts");
  const request = objectStore.add({ name: name, content: text });

  request.onsuccess = () => {
    console.log("Text saved");
    loadTexts();
  };
};

const loadTexts = () => {
  const select = document.getElementById("text-select");
  select.innerHTML = "";

  const objectStore = db.transaction("texts").objectStore("texts");
  objectStore.openCursor().onsuccess = (event) => {
    const cursor = event.target.result;
    if (cursor) {
      const option = document.createElement("option");
      option.value = cursor.value.id;
      option.textContent = cursor.value.name;
      select.appendChild(option);
      cursor.continue();
    }
  };
};

const insertSelectedText = async () => {
  const select = document.getElementById("text-select");
  const id = parseInt(select.value);

  const transaction = db.transaction(["texts"]);
  const objectStore = transaction.objectStore("texts");
  const request = objectStore.get(id);

  request.onsuccess = (event) => {
    const text = event.target.result.content;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: "insertText", text: text });
    });
  };
};

document.addEventListener("DOMContentLoaded", async () => {
  await initDB();
  loadTexts();
});
document.getElementById("save-button").addEventListener("click", saveText);
document
  .getElementById("insert-button")
  .addEventListener("click", insertSelectedText);
