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

      // TODO: Skip entry if all values are empty
      mappedObject[mappedEntry.id] = mappedEntry;
    }
  });
  return mappedObject;
}

// NOTE: Does not work on values inside objects and arrays
function valueOrUndefined(value, emptyValues = []) {
  // Trim value if it is a string
  let processedValue = value;
  if (typeof value === "string") processedValue = value.trim();

  // Return undefined for empty values
  if (["", ...emptyValues].includes(processedValue)) {
    return undefined;
  } else {
    return processedValue;
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
  fs.writeFileSync(destination, JSON.stringify(dataObject, null, 2));
}

export { fileToObjectArray, mapToEntriesObject, writeObjectToJSON };
