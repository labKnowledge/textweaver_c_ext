chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "insertText") {
    const activeElement = document.activeElement;
    if (
      activeElement.isContentEditable ||
      activeElement.tagName.toLowerCase() === "textarea" ||
      activeElement.tagName.toLowerCase() === "input"
    ) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const text = activeElement.value || activeElement.innerText;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);

      const newText = before + request.text + after;

      if (activeElement.isContentEditable) {
        activeElement.innerText = newText;
      } else {
        activeElement.value = newText;
      }

      // Move cursor to end of inserted text
      const newCursorPosition = start + request.text.length;
      activeElement.setSelectionRange(newCursorPosition, newCursorPosition);

      // Trigger input event for reactivity
      const inputEvent = new Event("input", { bubbles: true });
      activeElement.dispatchEvent(inputEvent);
    }
  }
});
