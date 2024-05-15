/*
TripList:

errorText: String
error: String

serverdate: "2022-08-13" // , exist when no error
servertime: "10:30"      // , exist when no error
Trip: [{}]
*/
/*
Trip:

type: "WALK" | "CAR" | "BIKE"
Leg: [{}]
valid: Boolean
*/
/*
Leg:
name: "Buss 19"
sname: "19"
journeyNumber: "627"     // I don't know what this is
type: "BUS" | "TRAM" | "BOAT" | "WALK" | "BIKE" | "CAR" | "VAS" | "LDT" | "REG" | "TAXI"
id: "9015014501900627"   // id of the journey
direction: "Fredriksdal" // direction information
fgColor: "#D8E8B0"
bgColor: "#006C93"

JourneyDetailRef: {"ref":"https://api.vasttrafik.se/bin/rest.exe/v2/journeyDetail?ref=999963%2F360762%2F110824%2F277911%2F80%3Fdate%3D2022-08-13%26station_evaId%3D6550001%26station_type%3Ddep%26format%3Djson%26"}}

Origin: {
  name: "Sägengatan, Göteborg",
  type: "ST",
  id: "9022014006550001",
  routeIdx: "3",
  time: "10:54",
  date: "2022-08-13",
  track: "A",
  rtTime: "10:55",
  rtDate: "2022-08-13",
  $: "\n"
}
Destination: {
  name: "Lilla Bommen, Göteborg",
  type: "ST",
  id: "9022014004380001",
  routeIdx: "9",
  time: "11:08",
  date: "2022-08-13",
  track:"A",
  rtTime: "11:08",
  rtDate: "2022-08-13",
  $: "\n"
}
*/
/*
OUTPUT:
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
  ]
]
*/
function parseTripResponse(response) {
  return parseTripList(response.TripList);
}

function parseTripList(tripList) {
  if (tripList.error) {
    // TODO: Add error handling
    console.log(JSON.stringify(tripList));
    return new Array([]);
  }
  const output = [];
  for (let i = 0; i < tripList.Trip.length; i++) {
    output.push(parseTrip(tripList.Trip[i]));
  }
  return output;
}

function parseTrip(trip) {
  const output = [];
  if (!(trip.Leg instanceof Array)) {
    output.push(parseLeg(trip.Leg));
  }
  for (let i = 0; i < trip.Leg.length; i++) {
    if (trip.Leg[i].type == 'WALK') {
      continue;
    }
    output.push(parseLeg(trip.Leg[i]));
  }
  return output;
}

function parseLeg(leg) {
  const output = {};
  if (leg.sname === undefined) {
    output.name = leg.name;
  } else {
    output.name = leg.sname;
  }
  output.type = leg.type;
  output.origin = parseOrigin(leg.Origin);
  output.destination = parseDestination(leg.Destination);
  return output;
}

function parseOrigin(origin) {
  const output = {};
  output.id = origin.id
  output.name = origin.name
  output.track = origin.track
  output.time = origin.rtTime
  output.date = origin.rtDate
  return output;
}

function parseDestination(destination) {
  const output = {};
  output.id = destination.id
  output.name = destination.name
  output.time = destination.rtTime
  output.date = destination.rtDate
  return output;
}

module.exports = {
  parseTripResponse
}
