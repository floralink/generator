#!/usr/bin/env node

import commandLineArgs from "command-line-args";
import path from "path";
import { cwd } from "process";
import { fileToDataObject, writeObjectToJSON } from "../lib/index.js";

/**
 * Handling command line arguments
 */

const optionDefinitions = [
  { name: "input", alias: "i", type: String },
  { name: "output", alias: "o", type: String },
  { name: "mapping", alias: "m", type: String },
  { name: "delimiter", alias: "d", type: String },
];
const options = commandLineArgs(optionDefinitions);

if (!options.input) {
  console.error("ERROR: Input file must be specified with --input or -i flag");
  process.exit();
}

// raw arguments and defaults
const filePathArg = options.input;
const destinationPathArg = options.output || "./database.json";
const mappingsPathArg = options.mapping || "./mapping.js";
const delimiter = options.delimiter || ",";

function getAbsolutePath(relativePath) {
  return path.resolve(cwd(), relativePath);
}

// all parsed arguments (except for mapping, which is dynamically loaded)
const filePath = getAbsolutePath(filePathArg);
const destinationPath = getAbsolutePath(destinationPathArg);
const mappingsPath = getAbsolutePath(mappingsPathArg);

/**
 * Perform the database generation
 */

(async () => {
  const { default: mapping } = await import("file://" + mappingsPath);
  const taxonData = fileToDataObject(filePath, mapping, { delimiter });
  writeObjectToJSON(destinationPath, taxonData);
})();
