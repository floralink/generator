import type {
	FlatStringObject,
	GroupType,
	IdentifierIndexedObject,
	MapFunction,
	Name,
	Primitive,
	Reference,
} from "@floralink/core";
import consola from "consola";

export function mapToEntriesObject<T extends GroupType>(
	objectArray: FlatStringObject[],
	map: MapFunction<T>,
	idKey: "id" | "taxonID" = "id",
	emptyValues: string[] = [],
) {
	const mappedObject: IdentifierIndexedObject<T> = {};
	const log: {
		mapRejected: number;
		noInformation: number;
		duplicates: string[];
	} = {
		mapRejected: 0,
		noInformation: 0,
		duplicates: [],
	};

	objectArray.forEach((o) => {
		const mapped = map(o);

		if (mapped === false) {
			log.mapRejected++;
		} else {
			const clean = cleanObject(mapped, emptyValues);
			if (Object.keys(clean).length <= 1) {
				log.noInformation++;
			} else {
				// @ts-expect-error
				const id = clean[idKey];
				if (mappedObject[id]) {
					log.duplicates.push(id);
				} else {
					mappedObject[id] = clean;
				}
			}
		}
	});

	// Report on ignored entries

	if (log.mapRejected)
		consola.info(
			`NOTE: ${log.mapRejected} entries were ignored because they were rejected by the mapping function. A reason for this could be that these entries don't hold any relevant information.`,
		);
	if (log.noInformation)
		consola.info(
			`NOTE: ${log.noInformation} entries were ignored because they don't hold any relevant information.`,
		);
	if (log.duplicates.length)
		consola.info(
			`NOTE: ${log.duplicates.length} entries were ignored because their ID already occured before (duplicate entries, affected IDs: ${log.duplicates.join(", ")}).`,
		);

	return mappedObject;
}

// ------------------------------------------------------------------------------

function cleanObject<T extends GroupType>(
	o: Partial<T>,
	emptyValues: string[] = [],
) {
	// NOTE: Inoptimal any
	// REASON: Partial<T> brings problems I gave up on solving for now
	// biome-ignore lint/suspicious/noExplicitAny: see above
	const clean: any = {};

	Object.entries(o).forEach(([key, value]) => {
		if (key === "vernacularNames") {
			// Special case: Taxon.vernacularNames
			(value as Name[]).forEach((vn) => {
				if (isValidData(vn.name, emptyValues)) {
					if (!clean.vernacularNames) clean.vernacularNames = [];
					clean.vernacularNames.push(vn);
				}
			});
		} else if (key === "sameAs") {
			// Special case: Taxon.sameAs
			(value as Reference[]).forEach((r) => {
				if (isValidData(r.id, emptyValues)) {
					if (!clean.sameAs) clean.sameAs = [];
					clean.sameAs.push(r);
				}
			});
		} else if (key === "childTaxonOf" || key === "synonymOf") {
			// Special case: Taxon.childTaxonOf or Taxon.synonymOf
			const r = value as Reference;
			if (isValidData(r.id, emptyValues)) clean[key] = r;
		} else if (Array.isArray(value)) {
			// Normal case: Primitive value array
			const cleanArray = (value as Primitive[])
				.map((v) => (isValidData(v, emptyValues) ? v : undefined))
				.filter((v) => v !== undefined);
			clean[key] = cleanArray;
		} else {
			// Normal case: Primitive value
			if (isValidData(value, emptyValues)) clean[key] = value;
		}
	});

	return clean as T;
}

function isValidData(v: Primitive, emptyValues: string[] = []) {
	if (v === undefined) return false;
	else if (typeof v === "string" && v.trim() === "") return false;
	else if (emptyValues.includes(v.toString())) return false;
	else return true;
}
