# @floralink/generator

Simple CLI tool for generating Floralink plugin databases from CSV files. The data is mapped to per-taxon objects with the help of a `mapping.js` configuration file. More generally Generator can map CSV tables to JSON files given a mapping structure. It's possible to build nested object structures from two-dimensional tables.

## Usage

Install @floralink/generator as a dev dependency in your plugin package:

```shell
npm install -D @floralink/generator
```

Use from your source data folder:

```shell
npx flgen -i mydatabase.csv
```

## Flags

You can configure the generator with flags:

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

## Mapping

Example `mapping.js` file for returning the desired object structure from a CSV generated object:

```javascript
// the argument passed by the generator is the parsed object from a CSV row
export default function (o) {
  return {
    // reference
    id: o["DATA_ID"],
    reference: {
      id: "myplugin",
      version: "1.0.0",
    },
    // db fields
    myFieldOne: o["MY_FACTOR"],
    myFieldTwo: o["CRYPTIC_FIELD_NAME,d,d"],
    // can be nested too
    myFieldThree: {
      myFieldFour: "MyFieldType", // static field values
      myFieldFive: o["REF_FACTOR"],
    },
    // use functions to modify data
    myFieldSix: convertToMyFieldSix(o["component value 1"], o["component value 2"]),
  };
}

// this can be anything from switch/case statements to calculations
// it is recommended to convert data only as such
// that original data can be rebuilt though
function convertToMyFieldSix(val1, val2) {
  switch (val1): {
    // ...
  }
}
```

You can specify if the data entry passed in the argument should be ommited in the resulting database by returning `undefined` in your function.
After the mapping of all entries, Generator checks all values of an entry against a list of values that mean that there is no data (see `--emptyvalues` flag). Fields with an empty string are always ommited.

Look at the [available plugins](https://github.com/floralink/plugins) of Floralink on GitHub for further examples.
