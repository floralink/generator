import * as fs from "fs";

import { csvToObjectArray } from "./formats/csv.js";

function readStringFromFile(file) {
  let buffer = fs.readFileSync(file);
  return buffer.toString();
}

function mapToEntriesObject(objectArray, mapping, emptyValues = []) {
  let mappedObject = {};
  objectArray.forEach((o) => {
    let mappedEntry = mapping(o);
    if (mappedEntry) {
      Object.entries(mappedEntry).forEach(([key, value]) => {
        mappedEntry[key] = valueOrUndefined(value, emptyValues);
      });
      mappedObject[mappedEntry.id] = mappedEntry;
    }
  });
  return mappedObject;
}

// NOTE: does not work on values inside objects and arrays
function valueOrUndefined(value, emptyValues = []) {
  let trimmed = value;
  if (typeof value === "string") trimmed = value.trim();
  else if (["", ...emptyValues].includes(trimmed)) {
    return undefined;
  } else {
    return trimmed;
  }
}

function fileToObjectArray(
  filePath,
  options = {
    delimiter: ",",
  },
) {
  const fileString = readStringFromFile(filePath);
  const objectArray = csvToObjectArray(fileString, options.delimiter);
  return objectArray;
}

function writeObjectToJSON(destination, dataObject) {
  fs.writeFileSync(destination, JSON.stringify(dataObject));
}

export { fileToObjectArray, mapToEntriesObject, writeObjectToJSON };
