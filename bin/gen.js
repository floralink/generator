#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import path from "path";
import { cwd, exit } from "process";
import {
  fileToObjectArray,
  mapToEntriesObject,
  writeObjectToJSON,
} from "../lib/index.js";
import consola from "consola";

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
  consola.error(
    new Error("An input file must be specified via --input or the -i flag.")
  );
  exit();
}

consola.start("Parsing and mapping CSV data...");

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
  consola.success(
    `Database with ${
      Object.values(taxonDataObject).length
    } entries generated and saved to ${destinationPathArg}`
  );
  const omitted = taxonDataArray.length - Object.values(taxonDataObject).length;
  if (omitted > 0)
    consola.warn(`${omitted} entries have been omitted due to empty values`);
})();
