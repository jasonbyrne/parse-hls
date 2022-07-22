import { knownKeys } from "./known-keys";
import {
  AttributePair,
  Attributes,
  AttributeValue,
  TAG_PAIR_SPLITTER,
} from "./types";
import { coerce, toCamelCase } from "./util";

const parseAttributePair = (str: string, tag: string): AttributePair => {
  const pairs = str.trim().replace("=", "|").split("|");
  // Key-Value pair
  if (pairs.length == 2) {
    let key = toCamelCase(pairs[0]);
    let value: AttributeValue = pairs[1].replace(/("|')/g, "");
    if (knownKeys.hasOwnProperty(key)) {
      value = coerce[knownKeys[key]](value);
    }
    return {
      key: key,
      value: value,
    };
  }
  // Standalone value
  const value = (() => {
    // If it's a known key then we know how to map it
    if (knownKeys.hasOwnProperty(tag)) {
      return coerce[knownKeys[tag]](pairs[0]);
    }
    return Number.isNaN(pairs[0]) ? pairs[0] : parseFloat(pairs[0]);
  })();
  return {
    key: "value",
    value,
  };
};

export const parseAttributes = (str: string, tag: string = ""): Attributes => {
  // Split the attribute string
  const matched = str.match(TAG_PAIR_SPLITTER);
  if (matched === null) {
    return {};
  }
  // Parse attributes
  const list = (() => {
    if (tag === "inf") {
      const duration = matched[0].split(" ");
      let additionalPairs: AttributePair[] = [];
      // Additional attributes stuffed into the duration
      if (duration.length > 0) {
        duration
          .splice(1)
          .forEach((pairStr) =>
            additionalPairs.push(parseAttributePair(pairStr, tag))
          );
      }
      // Compile into output
      return [
        { key: "duration", value: parseFloat(duration[0]) },
        { key: "title", value: matched[1]?.trim() },
        ...additionalPairs,
      ];
    }
    return matched.map((pairStr) => parseAttributePair(pairStr, tag));
  })();
  // Insist on unique property names
  return list.reduce((all, current: AttributePair) => {
    if (all[current.key] === undefined) {
      all[current.key] = current.value;
    }
    return all;
  }, {} as Attributes);
};
