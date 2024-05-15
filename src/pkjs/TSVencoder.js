/*
INPUT:
[
  [
    {
      name: "19",
      type: "BUS",
      origin {
        id: "9022014006550001",
        name: "Sägengatan, Göteborg",
        track: "A",
        time: "10:55",
        date: "2022-08-13"
      },
      destination {
        id: "9022014004380001",
        name: "Lilla Bommen, Göteborg",
        time: "11:08",
        date: "2022-08-13"
      }
    },
    {...},
    {...}
  ],
  [...],
  [...]
]
*/
/*
OUTPUT:
tripIndex/tripId \t name \t track \t time \t destination \t time \n
                 \t name \t track \t time \t destination \t time \n
tripIndex/tripId \t name \t track \t time \t destination \t time \n
                 \t name \t track \t time \t destination \t time \n
*/
// Length is limited to 1028 chars. Longer outputs will be cut off at a '\n'.
function encodeTripListToTSV(tripList) {
  //const maxWatchAppMessageSizeInbound = 1028;
  const maxOutputLegsPerTrip = 4;
  const maxOutputTrips = 4;
  let output = "";
  for (let i = 0; i < tripList.length; i++) {
    if (i >= maxOutputTrips) {
      break;
    }
    output += `${i}`;

    let numberOfLegs = 0;
    for (let j = 0; j < tripList[i].length; j++) {
      if (numberOfLegs >= maxOutputLegsPerTrip) {
        break;
      }
      if (tripList[i][j].type === 'WALK') {
        continue;
      }
      numberOfLegs++;
      output += `\t${trimString(tripList[i][j].name, 3)}\t${trimString(tripList[i][j].origin.track, 3)}\t${tripList[i][j].origin.time}\t${trimString(tripList[i][j].destination.name, 9)}\t${tripList[i][j].destination.time}\n`;
    }
  }
  return output;
}

// Trims string to specified length, epsilon will be added to trimed strings longer than 10 char
function trimString(string, maxLength) {
  output = string.slice(0, maxLength);
  if (output.length > 10 && string.length > output.length) {
    output = `${output.slice(0, -3)}...`;
  }
  return output;
}

module.exports = {
  encodeTripListToTSV
}
