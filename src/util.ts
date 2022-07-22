import { AttributeValue } from "./types";

export const toTagFriendlyName = (tag: string): string => {
  if (tag.startsWith("EXT")) {
    tag = tag.substr(3);
  }
  return toCamelCase(
    tag
      .split(/[- ]/)
      .filter((part) => part.length > 0)
      .filter((part, i) => !(part === "X" && i == 0))
      .join("-")
  );
};

export const toCamelCase = (str: string): string => {
  return str.split("-").reduce((all, c) => {
    if (!all) {
      all += c.toLowerCase();
      return all;
    }
    all += c.charAt(0) + c.slice(1).toLowerCase();
    return all;
  }, "");
};

export const coerce: { [key: string]: (value: string) => AttributeValue } = {
  number: (value) => {
    return parseFloat(value);
  },
  integer: (value) => {
    return parseInt(value);
  },
  date: (value) => {
    return new Date(value);
  },
  string: (value) => {
    return String(value).trim();
  },
  stringArray: (value) => {
    return String(value).split(",");
  },
  boolean: (value) => {
    return value.toUpperCase() !== "NO";
  },
};
