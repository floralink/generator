#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import path from "path";
import { cwd, exit } from "process";
import {
  fileToObjectArray,
  mapToEntriesObject,
  writeObjectToJSON,
} from "../lib/index.js";

/**
 * Handling command line arguments
 */

const optionDefinitions = [
  { name: "input", alias: "i", type: String },
  { name: "output", alias: "o", type: String },
  { name: "mapping", alias: "m", type: String },
  { name: "delimiter", alias: "d", type: String },
  { name: "emptyvalues", alias: "e", type: String },
];
const options = commandLineArgs(optionDefinitions);

if (!options.input) {
  log("Input file must be specified with --input or -i flag", "ERROR");
  exit();
}

log("Starting reading file and generating database...", "PROCESS");

// raw arguments and defaults
const destinationPathArg = options.output || "./database.json";
const mappingsPathArg = options.mapping || "./mapping.js";
const delimiter = options.delimiter || ",";

function getAbsolutePath(relativePath) {
  return path.resolve(cwd(), relativePath);
}

// all parsed arguments (except for mapping, which is dynamically loaded)
const filePath = getAbsolutePath(options.input);
const destinationPath = getAbsolutePath(destinationPathArg);
const mappingsPath = getAbsolutePath(mappingsPathArg);

let emptyValues = [];
if (options.emptyvalues) emptyValues = options.emptyvalues.split(",");

/**
 * Perform the database generation
 */

(async () => {
  const { default: mapping } = await import("file://" + mappingsPath);
  const taxonDataArray = fileToObjectArray(filePath, {
    delimiter,
  });
  const taxonDataObject = mapToEntriesObject(
    taxonDataArray,
    mapping,
    emptyValues
  );
  writeObjectToJSON(destinationPath, taxonDataObject);
  log(
    `Database with ${
      Object.values(taxonDataObject).length
    } entries generated and saved to ${destinationPathArg}`,
    "SUCCESS"
  );
  const omitted = taxonDataArray.length - Object.values(taxonDataObject).length;
  if (omitted > 0)
    log(`${omitted} entries have been omitted due to empty values`, "WARNING");
})();

function log(msg, type = "INFO") {
  let colorCode = 37; // defaults to white if type unknown
  switch (type.toLowerCase()) {
    case "info":
      colorCode = "90";
      break;
    case "process":
      colorCode = "35";
      break;
    case "success":
      colorCode = "32";
      break;
    case "warning":
      colorCode = "33";
      break;
    case "error":
      colorCode = "31";
      break;
  }

  console.log(`\x1b[${colorCode}m%s\x1b[0m`, `${type}: ${msg}`);
}
