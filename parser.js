const xlsx = require('xlsx');
const wb = xlsx.readFile('STOCKEO EARNINGS 💲💹.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
console.log(JSON.stringify(xlsx.utils.sheet_to_json(ws), null, 2));
