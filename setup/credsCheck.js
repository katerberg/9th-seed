const fs = require('fs');

async function checkDb() {
  return new Promise((res, rej) => {
    const file = './creds/dbCreds.json';
    fs.readFile(file, 'utf8', (err, contents) => {
      if (err) {
        rej(`Unable to find ${file}`);
      } else {
        try {
          const parsed = JSON.parse(contents);

          if (
            !parsed ||
            !parsed.database ||
            !parsed.host ||
            !parsed.password ||
            !parsed.user
          ) {
            rej(`Missing required fields in ${file}`);
          }
        } catch (e) {
          rej(`Invalid JSON in ${file}`);
        }

        res();
      }
    });
  });
}

async function checkTwitch() {
  return new Promise((res, rej) => {
    const file = './creds/twitchCreds.json';
    fs.readFile(file, 'utf8', (err, contents) => {
      if (err) {
        rej(`Unable to find ${file}`);
      } else {
        try {
          const parsed = JSON.parse(contents);
          if (!parsed || !parsed.password || !parsed.username) {
            rej(`Missing required fields in ${file}`);
          }
        } catch (e) {
          rej(`Invalid JSON in ${file}`);
        }

        res();
      }
    });
  });
}

async function checkCreds() {
  try {
    await checkDb();
    await checkTwitch();
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
}

checkCreds();
