main();

type Position = {
  lineString: string;
  lineNumber: number;
};

function isTargetPage(): boolean {
  const part = document.location.pathname.split("/");
  const targets: { [key: number]: string }[] = [
    { 3: "wiki" },
    { 3: "issues" },
    { 3: "compare" },
    { 3: "pull" },
  ];
  for (const t of targets) {
    const max = Object.keys(t).length;
    let count = 0;
    for (const [i, v] of Object.entries(t)) {
      if (part[Number(i)] === v) {
        count += 1;
      }
    }
    if (max === count) {
      return true;
    }
  }
  return false;
}

function isPullRequestConversationPage(): boolean {
  const part = document.location.pathname.split("/");
  return part.length >= 4 && part[3] === "pull";
}

function getPosition(elm: HTMLTextAreaElement): Position {
  const substr = elm.value.substring(0, elm.selectionStart);
  const lines = substr.split("\n");
  return {
    lineNumber: lines.length,
    lineString: elm.value.split("\n")[lines.length - 1],
  };
}

function isUlLi(text: string): boolean {
  return /^ *[-*]/.test(text);
}

function isOlLi(text: string): boolean {
  return /^ *[0-9]+\./.test(text);
}

function indentTab(
  elm: HTMLTextAreaElement,
  lineNumber: number,
  isUlLi: boolean
) {
  const padNumber = isUlLi ? 2 : 3;
  const cursor = elm.selectionStart + padNumber;
  elm.value = elm.value
    .split("\n")
    .map((l, i) => {
      const padding = i + 1 === lineNumber ? "".padStart(padNumber) : "";
      return padding + l;
    })
    .join("\n");
  elm.selectionStart = cursor;
  elm.selectionEnd = cursor;
}

function getStartIndexUlLi(line: string): number {
  const startIndex = line.search(/[-*]/);
  if (startIndex < 2) {
    return startIndex;
  } else {
    return 2;
  }
}

function getStartIndexOlLi(line: string): number {
  const startIndex = line.search(/[0-9]/);
  if (startIndex < 3) {
    return startIndex;
  } else {
    return 3;
  }
}

function unindentTab(
  elm: HTMLTextAreaElement,
  position: Position,
  isUlLi: boolean
) {
  const index = isUlLi
    ? getStartIndexUlLi(position.lineString)
    : getStartIndexOlLi(position.lineString);
  const cursor = elm.selectionStart - index;
  elm.value = elm.value
    .split("\n")
    .map((l, i) => {
      return i + 1 === position.lineNumber ? l.substring(index) : l;
    })
    .join("\n");
  elm.selectionStart = cursor;
  elm.selectionEnd = cursor;
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.code !== "Tab") {
    return;
  }
  e.preventDefault();
  if (e.repeat) {
    return;
  }
  const elm = e.target;
  if (!(elm instanceof HTMLTextAreaElement)) {
    return;
  }
  const position = getPosition(elm);
  const flagUlLi = isUlLi(position.lineString);
  const flagOlLi = isOlLi(position.lineString);
  if (!(flagUlLi || flagOlLi)) {
    return;
  }
  if (e.shiftKey && flagUlLi) {
    unindentTab(elm, position, true);
  } else if (e.shiftKey && flagOlLi) {
    unindentTab(elm, position, false);
  } else if (flagUlLi) {
    indentTab(elm, position.lineNumber, true);
  } else if (flagOlLi) {
    indentTab(elm, position.lineNumber, false);
  }
}

function callbackMutationObserver(
  mutationList: MutationRecord[],
  observer: MutationObserver
) {
  if (isTargetPage()) {
    const list = document.getElementsByTagName("textarea");
    for (const elm of list) {
      elm.removeEventListener("keydown", handleKeyDown);
      elm.addEventListener("keydown", handleKeyDown);
      elm.style.setProperty("font-family", "Jetbrains Mono", "important");
      elm.style.setProperty("font-variant-ligatures", "none", "important");
    }
  }
}

function main() {
  const observer = new MutationObserver(callbackMutationObserver);
  observer.observe(document, { subtree: true, childList: true });
}
