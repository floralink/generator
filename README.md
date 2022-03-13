# @floralink/generator

Simple CLI tool for generating Floralink plugin databases from CSV files. The data is mapped to per-taxon objects with the help of a `mappings.js` configuration file. More generally Generator can map CSV tables to JSON files given a mapping structure. It's possible to build nested object structures from two-dimensional tables.

# Usage

Install @floralink/generator as a dev dependency in your plugin package:

```
npm install -D @floralink/generator
```

Use from your source data folder:

```
npx flgen -i mydatabase.csv
```

## Flags

You can configure the generator with flags:

```
npx flgen -i mydatabase.csv -o db.json -m map.js -d ";"
```

| Flag          | Shorthand | Description                     | Default         |
| ------------- | --------- | ------------------------------- | --------------- |
| `--input`     | `-i`      | Input file (\*.csv)             | - (required)    |
| `--output`    | `-o`      | Output file (\*.json)           | `database.json` |
| `--mappings`  | `-m`      | Field mappings                  | `mappings.js`   |
| `--delimiter` | `-d`      | Delimiter for cells in CSV file | `","`           |

## Mappings

Example `mappings.js` file:

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
    // can be nested too ...
    myFieldThree: {
      myFieldFour: "MyFieldType", // static field values
      myFieldFive: o["REF_FACTOR"]
    },
    // ... or use functions to modify data
    myFieldSix: convertToMyFieldSix(o["component value 1"], o["component value 2"])
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

You can look at the [available plugins](https://github.com/floralink/plugins) of Floralink on GitHub for further examples.
