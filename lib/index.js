import * as fs from "fs";

import { csvToObjectArray } from "./formats/csv.js";

function readStringFromFile(file) {
  let buffer = fs.readFileSync(file);
  return buffer.toString();
}

function mapToEntriesObject(objectArray, mapping) {
  let mappedObject = {};
  objectArray.forEach((o) => {
    let mappedEntry = mapping(o);
    mappedObject[mappedEntry.id] = mappedEntry;
  });
  return mappedObject;
}

function fileToDataObject(
  filePath,
  mapping,
  options = {
    delimiter: ",",
  }
) {
  const fileString = readStringFromFile(filePath);
  // todo: switch case file extension
  const objectArray = csvToObjectArray(fileString, options.delimiter);
  return mapToEntriesObject(objectArray, mapping);
}

function writeObjectToJSON(destination, dataObject) {
  fs.writeFileSync(destination, JSON.stringify(dataObject));
}

export { mapToEntriesObject, fileToDataObject, writeObjectToJSON };
