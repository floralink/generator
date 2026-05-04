#!/usr/bin/env node
import { resolve } from "node:path";
import { cwd } from "node:process";
import { pathToFileURL } from "node:url";
import type {
	GroupType,
	IdentifierIndexedObject,
	JsonGroup,
	JsonSourcePlugin,
	TaxaJsonGroup,
	TraitsJsonGroup,
} from "@floralink/core";
import { defineCommand, runMain } from "citty";
import consola from "consola";
import { fileToObjectArray, writeObjectToJSON } from "./io.js";
import { mapToEntriesObject } from "./processing.js";

// Defaults
const defaultDelimiter = ",";
const defaultEmpty: string[] = [];

const main = defineCommand({
	meta: {
		name: "flgen",
		version: "2.0.0",
		description:
			"Simple command line tool for mapping CSV tables to JSON databases",
	},
	async run() {
		const pluginAbsolutePath = getAbsolutePath("./index.js");
		const pluginFileURL = pathToFileURL(pluginAbsolutePath).toString();
		const plugin = (await import(pluginFileURL)).default as JsonSourcePlugin;

		if (!plugin) {
			consola.error("Plugin index.js can't be imported. Does the file exist?");
			return;
		}

		plugin.groups.forEach((group) => {
			consola.start(
				`Starting plugin data transformation for "${group.title}" (ID: ${group.id})`,
			);

			const inputPath = getAbsolutePath(`./source/${group.generate.input}`);
			const outputPath = getAbsolutePath(`./data/${group.id}.json`);

			// Parse CSV to JS array
			const taxonDataArray = fileToObjectArray(inputPath, {
				delimiter: group.generate.delimiter || defaultDelimiter,
			});

			consola.info("Source file imported");

			let taxonDataObject: IdentifierIndexedObject<GroupType> = {};

			if (groupIsTaxaJsonGroup(group)) {
				// Map array to indexed object
				taxonDataObject = mapToEntriesObject(
					taxonDataArray,
					group.generate.map,
					"id",
					group.generate.empty ?? defaultEmpty,
				);
			} else if (groupIsTraitsJsonGroup(group)) {
				// Map array to indexed object
				taxonDataObject = mapToEntriesObject(
					taxonDataArray,
					group.generate.map,
					"taxonID",
					group.generate.empty ?? defaultEmpty,
				);
			}

			const entriesTotal = Object.keys(taxonDataObject).length;

			// Warn if entries were omitted
			const omitted = taxonDataArray.length - entriesTotal;
			if (omitted > 0)
				consola.info(`NOTE: ${omitted} entries were ignored in total`);

			consola.info("Source format transformed");

			// Write to JSON file
			writeObjectToJSON(outputPath, taxonDataObject);

			// Success
			consola.success(
				`JSON database with ${entriesTotal} entries written to ./data/${group.id}.json\n`,
			);
		});
	},
});

runMain(main);

function getAbsolutePath(relativePath: string) {
	return resolve(cwd(), relativePath);
}

function groupIsTaxaJsonGroup(group: JsonGroup): group is TaxaJsonGroup {
	return group.type === "taxa";
}

function groupIsTraitsJsonGroup(group: JsonGroup): group is TraitsJsonGroup {
	return group.type === "traits";
}
