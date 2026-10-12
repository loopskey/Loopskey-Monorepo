const MARKUP = /<\/?[a-z!][^>]*>/i;
const SPACES = /[^\S\n]+/g;
const BLANK_RUNS = /\n{3,}/g;
const LINE_EDGES = / ?\n ?/g;

const NEWLINE = 0x0a;
const LAST_C0_CONTROL = 0x1f;
const FIRST_C1_CONTROL = 0x7f;
const LAST_C1_CONTROL = 0x9f;

const isControlCode = (code: number) =>
  (code <= LAST_C0_CONTROL && code !== NEWLINE) ||
  (code >= FIRST_C1_CONTROL && code <= LAST_C1_CONTROL);

const withoutControlCharacters = (value: string) =>
  Array.from(value, (character) =>
    isControlCode(character.charCodeAt(0)) ? " " : character,
  ).join("");

export const containsMarkup = (value: string) => MARKUP.test(value);

export const cleanPlainText = (value: string) =>
  withoutControlCharacters(value.replace(/\r\n?/g, "\n"))
    .replace(SPACES, " ")
    .replace(LINE_EDGES, "\n")
    .replace(BLANK_RUNS, "\n\n")
    .trim();

export const cleanSingleLine = (value: string) =>
  cleanPlainText(value).replace(/\n+/g, " ");
