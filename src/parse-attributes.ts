import { AttributePair, Attributes, TAG_PAIR_SPLITTER } from "./types";
import { coerce, toCamelCase } from "./util";

const parseAttributePair = (str: string, tag: string): AttributePair => {
  const pairs = str.trim().replace("=", "|").split("|");
  // Key-Value pair
  if (pairs.length == 2) {
    return {
      key: toCamelCase(pairs[0]),
      value: pairs[1].replace(/("|')/g, ""),
    };
  }
  // Standalone value
  return {
    key: "value",
    value: pairs[0],
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
