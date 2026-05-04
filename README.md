# @floralink/generator

A simple CLI for generating a JSON database from a CSV file and options defined in elements of the `groups` key in a Floralink plugin.

## Usage

Install @floralink/generator, for example via npm:

```shell
npm i -D @floralink/generator
```

Run the `flgen` command in the root folder of a plugin, where the `index.js` sits that exports a `JsonSourcePlugin` object.

```shell
npx flgen
```

The imported and transformed CSV input will be written as JSON to the output directory `/data` and named after the corresponding group.

## Generator configuration

```ts
interface GeneratorConfig<T extends GroupType> {
  /** A file path of a CSV file relative to the `source` folder in the plugin's root */
  input?: string;
  /** Delimiter used in the input CSV file */
  delimiter?: string;
  /** Values to be ignored or, strictly speaking, considered as empty */
  empty?: string[];
  /**
   * A custom function accepting a raw CSV row input
   * and returning Floralink-typed data (`Taxon` or `Traits`).
   * If it returns false, the entry will be ignored/discarded.
   */
  map: (o: Record<string, string>) => Partial<T> | false;
}
```

The argument passed to a `map` function is the parsed object from a CSV row.

### Taxon example

```ts
const taxonGroup = {
  // ...
  generate: {
    input: "germansl.csv",
    delimiter: ",",
    empty: ["NA"],
    map: (o) => ({
      // Identity
      id: o.TaxonUsageID,

      // Properties
      scientificName: o.TaxonName,
      authorCitation: o.NameAuthor,
      vernacularNames: [
        {
          region: "de-DE",
          name: o.VernacularName,
        },
      ],
      rank: o.TaxonRank,
      group: o.GRUPPE,

      // Relations
      childTaxonOf: { id: o.IsChildTaxonOfID },
      synonymOf: { id: o.TaxonConceptID },
    }),
  },
};
```

### Traits example

```ts
const traitsGroup = {
  // ...
  generate: {
    input: "ecodbase.csv",
    delimiter: ";",
    map: (o) => {
      // Ignore entry if all scale indicator values (from 0/1 to 9/12) are "0".
      if (scaleIndicatorFieldNames.every((f) => o[f].trim() === "0"))
        return false;

      return {
        // Identity
        taxonID: o["SPECIES_NR,N,10,0"],

        // Simple, unaltered property map
        leafPerennation: o["LF_B,C,4"],

        // This is an array property and the CSV is separated by commas
        lifeForm: o["LF_LEB,C,7"].split(","),

        // You can use custom functions to transform values
        indicatorL: convertIndicatorValue(o["OEK_L,N,5,0"], o["Z_OEK_L,C,7"]),
        indicatorT: convertIndicatorValue(o["OEK_T,N,5,0"], o["Z_OEK_T,C,7"]),
        indicatorK: convertIndicatorValue(o["OEK_K,N,5,0"], o["Z_OEK_K,C,7"]),

        // ...
      };
    },
  },
};
```

## Omitted entries

Entries might be omitted (which will be logged in the console) for one of these reasons:

- The `map` function returns false on an entry.
- All or defining fields in a mapped entry hold empty strings or other values to be considered empty as defined via the `empty` key.
- Duplicate `taxonID`

## Plugin file structure

```
/data         // Output directory for JSON databases
/source       // Location of input source files and licenses
index.js      // ES module exporting a Floralink plugin
```

## Usage prior to v2

Versions prior to version 2 were built for a now deprecated plugin system.
Instead of all options being embedded in a `Group` object, they were configured via flags and only the mapping function was imported as ES module.

These are the old flag options:

```shell
npx flgen -i mydatabase.csv -o db.json -m map.js -d ";"
```

| Flag            | Shorthand | Description                               | Default         |
| --------------- | --------- | ----------------------------------------- | --------------- |
| `--input`       | `-i`      | Input file (\*.csv)                       | - (required)    |
| `--output`      | `-o`      | Output file (\*.json)                     | `database.json` |
| `--mapping`     | `-m`      | Field mapping                             | `mapping.js`    |
| `--delimiter`   | `-d`      | Delimiter for cells in CSV file           | `","`           |
| `--emptyvalues` | `-e`      | Comma seperated list of values to exclude | (undefined)     |
| `--help`        | `-h`      | Print help                                |                 |
