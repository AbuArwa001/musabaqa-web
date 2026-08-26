const http = require('http');

async function test() {
  const res = await fetch('http://localhost:8000/api/v1/categories/');
  const text = await res.text();
  console.log("Categories Length:", text.length);
  try { JSON.parse(text); console.log("Parsed ok"); } catch (e) { console.log(e.message); }
}

test();
