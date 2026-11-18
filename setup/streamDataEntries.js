const fs = require('fs');

// Streams the entries of the top-level "data" object of an MTGJSON file
// (e.g. AtomicCards.json) without loading the whole document into memory.
// Calls onEntry(key, value) for each entry and resolves when done.
function streamDataEntries(path, onEntry) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(path, { encoding: 'utf-8' });

    let depth = 0;
    let inString = false;
    let escaped = false;
    let inData = false;

    let lastKey = null; // last string seen at depth 1 or as a key in data
    let stringParts = null; // collects a string token at depth 1/2
    let valueParts = null; // collects the current data entry's value
    let valueStart = -1;

    stream.on('data', (chunk) => {
      let stringStart = stringParts ? 0 : -1;
      if (valueParts) {
        valueStart = 0;
      }

      for (let i = 0; i < chunk.length; i += 1) {
        const ch = chunk[i];

        if (inString) {
          if (escaped) {
            escaped = false;
          } else if (ch === '\\') {
            escaped = true;
          } else if (ch === '"') {
            inString = false;
            if (stringParts) {
              stringParts.push(chunk.slice(stringStart, i + 1));
              lastKey = JSON.parse(stringParts.join(''));
              stringParts = null;
              stringStart = -1;
            }
          }
          continue;
        }

        if (ch === '"') {
          inString = true;
          // Only capture keys at the root level or directly inside "data".
          if (!valueParts && (depth === 1 || (inData && depth === 2))) {
            stringParts = [];
            stringStart = i;
          }
        } else if (ch === '{' || ch === '[') {
          if (inData && depth === 2) {
            valueParts = [];
            valueStart = i;
          }
          depth += 1;
          if (depth === 2 && lastKey === 'data' && ch === '{') {
            inData = true;
          }
        } else if (ch === '}' || ch === ']') {
          depth -= 1;
          if (inData && depth === 2 && valueParts) {
            valueParts.push(chunk.slice(valueStart, i + 1));
            try {
              onEntry(lastKey, JSON.parse(valueParts.join('')));
            } catch (e) {
              stream.destroy(e);
              return;
            }
            valueParts = null;
            valueStart = -1;
          } else if (inData && depth === 1) {
            inData = false;
          }
        }
      }

      if (stringParts && stringStart >= 0) {
        stringParts.push(chunk.slice(stringStart));
      }
      if (valueParts && valueStart >= 0) {
        valueParts.push(chunk.slice(valueStart));
      }
    });

    stream.on('error', reject);
    stream.on('end', resolve);
  });
}

module.exports = streamDataEntries;
