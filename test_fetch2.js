const url = `https://docs.google.com/spreadsheets/d/1WSgDPnsjfb0ppkBhyaPqpimO6DN6NZoJhQ2l6tZ9jRk/gviz/tq?tqx=out:csv&tq=select%20*`;
fetch(url).then(res => res.text()).then(text => {
  const lines = text.split('\n');
  console.log(lines.find(l => l.includes('ESPONJA MÁGICA')));
});
