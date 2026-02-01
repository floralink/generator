import consola from "consola";

// This functiion is mostly borrowed from a stack overflow answer
// by Trevor Dixon and Peter Mortensen (CC BY-SA 4.0):
// https://stackoverflow.com/a/14991797

// prettier-ignore

function csvToArray(str, del = ',') {
  var arr = [];
  var quote = false;  // 'true' means we're inside a quoted field

  // Iterate over each character, keep track of current row and column (of the returned array)
  for (var row = 0, col = 0, c = 0; c < str.length; c++) {
      var cc = str[c], nc = str[c+1];        // Current character, next character
      arr[row] = arr[row] || [];             // Create a new row if necessary
      arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

      // If the current character is a quotation mark, and we're inside a
      // quoted field, and the next character is also a quotation mark,
      // add a quotation mark to the current column and skip the next character
      if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

      // If it's just one quotation mark, begin/end quoted field
      if (cc == '"') { quote = !quote; continue; }

      // If it's a comma and we're not in a quoted field, move on to the next column
      if (cc == del && !quote) { ++col; continue; }

      // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
      // and move on to the next row and move to column 0 of that new row
      if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

      // If it's a newline (LF or CR) and we're not in a quoted field,
      // move on to the next row and move to column 0 of that new row
      if (cc == '\n' && !quote) { ++row; col = 0; continue; }
      if (cc == '\r' && !quote) { ++row; col = 0; continue; }

      // Otherwise, append the current character to the current column
      arr[row][col] += cc;
  }
  return arr;
}

export function csvToObjectArray(
  csvString,
  delimiter = ";",
  encapsulator = '"',
) {
  let result = [];
  let omittedEntries = [];

  const csvArray = csvToArray(csvString, delimiter);
  const fieldNames = csvArray[0];

  // iterate over data (taxon) entries (rows without header)
  csvArray.slice(1).forEach((rowArray) => {
    // make sure the CSV file format is consistent
    if (rowArray.length === fieldNames.length) {
      // populate object with field names as keys and cells as values
      let taxonEntry = {};
      rowArray.forEach((cell, i) => {
        taxonEntry[fieldNames[i]] = cell;
      });
      result.push(taxonEntry);
    } else {
      // if row length inconsistent with field name length
      consola.warn(
        "The following entry will be omitted because the number of cells does not match the number of fields in the header. Maybe the delimiter is wrong? Other possible cause are missing column headers, line breaks or incorrectly formatted data.",
        rowArray[0],
      );
      omittedEntries.push(rowArray[0]);
    }
  });

  // ERROR HANDLING
  if (omittedEntries.length > 0) {
    consola.warn(
      `${omittedEntries.length} following rows were omitted in total because of errors. 
      Values of the first column (${fieldNames[0]}) for the omitted rows are: ${omittedEntries}`,
    );
  }

  return result;
}
