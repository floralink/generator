import * as fs from "node:fs";
import { dirname } from "node:path";
import { csvToObjectArray } from "./csv.js";

function readStringFromFile(filePath: string) {
	const buffer = fs.readFileSync(filePath);
	return buffer.toString();
}

export function fileToObjectArray(
	filePath: string,
	options = {
		delimiter: ",",
	},
) {
	const fileString = readStringFromFile(filePath);
	const objectArray = csvToObjectArray(fileString, options.delimiter);
	return objectArray;
}

export function writeObjectToJSON(destinationPath: string, dataObject: object) {
	fs.mkdirSync(dirname(destinationPath), { recursive: true });
	fs.writeFileSync(destinationPath, JSON.stringify(dataObject, null, 2));
}
