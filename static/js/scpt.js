async function fetchCSVData() {
  const response = await fetch('/static/Movies_Inf.csv');
  const data = await response.text();
  return data;
}

async function parseCSVData(){
  const csvData = await fetchCSVData();
  const rows = csvData.split('\n');
  const headers = rows[0].split(',');
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i].split(',');
    const entry = {};

    for (let j = 0; j < headers.length; j++) {
      entry[headers[j]] = row[j];
    }

    data.push(entry);
  }

  return data;
}

async function search() {
  const searchTerm = document.getElementById('search-input').value;

  const csvData = await parseCSVData();
  const filteredData = csvData.filter(
    (row) =>
      row['Title'] &&
      row['Title'].toLowerCase()==(searchTerm.toLowerCase())
  );
  if (filteredData.length > 0) {
    localStorage.setItem('filteredData', JSON.stringify(filteredData[0]));
    localStorage.setItem('castNames', JSON.stringify(filteredData[0]['Cast'].split(';')));
    const newWindow = window.open('details.html','_parent');
  } else {
    const newWindow = window.open();
    newWindow.document.write('<p class="no-results">No results found.</p>');
  }


}