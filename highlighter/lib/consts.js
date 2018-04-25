function getColor(item) {
  switch (item.color % 4) {
    case 0:
      return 'green'
    case 1:
      return 'black'
    case 2:
      return 'red'
    case 3:
      return 'blue'
  }
}
function getHeight(item) {
  switch (item.height % 3) {
    case 0:
      return '2vh'
    case 1:
      return '5vh'
    case 2:
      return '100vh'
  }
}