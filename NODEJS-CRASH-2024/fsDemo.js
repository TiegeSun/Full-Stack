// import fs from 'fs';
import fs from 'fs/promises';

// fs.readFile('./test.txt', 'utf8', (err, data) => {
//   if (err) throw err;
//   console.log(err);
// });

// const data = fs.readFileSync('./test.txt', 'utf8');
// console.log(data);;

// fs.readFile('./test/txt', 'utf8')
//   .then((data) => console.log(data))
//   .catch((err) => console.log(err));

const readFile = async () => {
  try {
    const data = await fs.readFile('./test.txt', 'utf8');
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

const writeFile = async () => {
  try {
    await fs.writeFile('./test.txt', 'Hello, I am writing to this file');
    console.log('File written to...');
  } catch (error) {
    console.log(error);
  }
}

const appendFile = async () => {
  try {
    await fs.appendFile('./test.txt', '\n');
    console.log('File appending to...');
  } catch (error) {
    console.log(error);
  }
}

writeFile();
appendFile();
readFile();
