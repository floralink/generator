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
        mappedEntry[key] = sanitize(value, emptyValues);
      });
      mappedObject[mappedEntry.id] = mappedEntry;
    }
    // todo: check if all properties empty -> restructure data
  });
  return mappedObject;
}

// todo: sanitize dangerous content
function sanitize(value, emptyValues = []) {
  let trimmed = value;
  if (typeof value === String) trimmed = value.trim();
  if (["", ...emptyValues].includes(trimmed)) {
    return undefined;
  } else {
    return trimmed;
  }
}

function fileToObjectArray(
  filePath,
  options = {
    delimiter: ",",
  }
) {
  const fileString = readStringFromFile(filePath);
  // todo: switch case file extension
  const objectArray = csvToObjectArray(fileString, options.delimiter);
  return objectArray;
}

function writeObjectToJSON(destination, dataObject) {
  fs.writeFileSync(destination, JSON.stringify(dataObject));
}

export { fileToObjectArray, mapToEntriesObject, writeObjectToJSON };
