#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import consola from "consola";

import {
  fileToObjectArray,
  mapToEntriesObject,
  writeObjectToJSON,
} from "../lib/index.js";

import path from "path";
import { cwd } from "process";

function getAbsolutePath(relativePath) {
  return path.resolve(cwd(), relativePath);
}

const main = defineCommand({
  meta: {
    name: "flgen",
    version: "1.1.1",
    description:
      "Simple command line tool for mapping CSV tables to JSON databases",
  },
  args: {
    input: {
      alias: "i",
      type: "string",
      description: "Input CSV file",
      required: true,
    },
    output: {
      alias: "o",
      type: "string",
      description: "Output JSON file",
      required: false,
      default: "./database.json",
    },
    mapping: {
      alias: "m",
      type: "string",
      description: "Mapping file",
      required: false,
      default: "./mapping.js",
    },
    delimiter: {
      alias: "d",
      type: "string",
      description: "delimiter",
      required: false,
      default: ",",
    },
    emptyvalues: {
      alias: "e",
      type: "string",
      description:
        "Values that should be considered empty and won't be included in the output",
      required: false,
    },
  },
  async run({ args: { input, output, mapping, delimiter, emptyvalues } }) {
    consola.start("Parsing and mapping CSV data...");

    const paths = {
      input: getAbsolutePath(input),
      output: getAbsolutePath(output),
      mapping: getAbsolutePath(mapping),
    };

    // Parse CSV to JS array
    const { default: mappingFunction } = await import(
      "file://" + paths.mapping
    );
    const taxonDataArray = fileToObjectArray(paths.input, {
      delimiter,
    });

    // Map array to indexed object
    const taxonDataObject = mapToEntriesObject(
      taxonDataArray,
      mappingFunction,
      emptyvalues ? emptyvalues.split(",") : []
    );

    // Write to JSON file
    writeObjectToJSON(paths.output, taxonDataObject);

    // Success
    consola.success(
      `Database with ${
        Object.values(taxonDataObject).length
      } entries generated and saved to ${output}`
    );

    // Warn if entries were omitted
    const omitted =
      taxonDataArray.length - Object.values(taxonDataObject).length;
    if (omitted > 0)
      consola.warn(`${omitted} entries have been omitted due to empty values`);
  },
});

runMain(main);
