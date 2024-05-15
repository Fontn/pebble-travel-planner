const keys = require('message_keys');

const Settings = require('./settings');
const Location = require('./location');
const AccessToken = require('./accessToken');
const VasttrafikParser = require('./vasttrafikParser');
const TSVencoder = require('./TSVencoder');

let oSelection = 0;
let dSelection = 0;

console.log(`Settings: ${JSON.stringify(Settings.getSettings())}`);

Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready.');

  // Update s_js_ready on watch
  Pebble.sendAppMessage({'JSReady': 1});

  // Grabs current location and fetches the closest buss stops.
  //Location.getLocation((pos) => {
  //  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
  //  fetchStops(pos.coords.latitude, pos.coords.longitude, 5);
  //});

  // Dummy values for testing, coordinates are close to Sägengatan
  //fetchStops(57.709048, 11.918377, 5);

  //fetchLocation("Sägengatan");

  //fetchLocation("Nordviksgatan");

  //fetchTrip("9021014006580000", "9021014005012000");

  // fetchTripGeography();
});

Pebble.addEventListener('appmessage', function(e) {
  const settings = Settings.getSettings();

  // Get the dictionary from the message
  var dict = e.payload;

  // Iterate all the parts of the message
  for (let key in dict) {
    console.log(`Got message: key: ${key}, value: ${dict[key]}`);
  }

  // Handle specific messages
  if (dict['oSelection'] !== undefined) {
    oSelection = dict['oSelection'];
    console.log(`From: ${dict['oSelection']}`);
    console.log(settings[keys.locationId + oSelection]);
  }
  if (dict['dSelection'] !== undefined) {
    dSelection = dict['dSelection'];
    console.log(`  To: ${dict['dSelection']}`);
    console.log(settings[keys.locationId + dSelection]);
  }
  if (dict['oSelection'] !== undefined || dict['dSelection'] !== undefined) {
    fetchTrip(settings[keys.locationId + oSelection], settings[keys.locationId + dSelection], (response, error) => {
      if (error) {
        console.log('ERROR');
        console.log(JSON.stringify(error));
        return;
      } else {
        const parsedTripList = VasttrafikParser.parseTripResponse(response);
        const TSVTripList = TSVencoder.encodeTripListToTSV(parsedTripList);
        console.log('Sending TSV');
        console.log(TSVTripList);
        Pebble.sendAppMessage({'tripListTSV': TSVTripList});
      }
    });
  }
});

function scale(lat_lon_array, xMax, yMax) {
  let minLat = Math.min.apply(Math, lat_lon_array.map(function(o) { return o.lat; }));
  let maxLat = Math.max.apply(Math, lat_lon_array.map(function(o) { return o.lat; }));
  let minLon = Math.min.apply(Math, lat_lon_array.map(function(o) { return o.lon; }));
  let maxLon = Math.max.apply(Math, lat_lon_array.map(function(o) { return o.lon; }));

  let result = [];
  for (let i = 0; i < lat_lon_array.length; i++) {
    let point = {x:0, y:0};
    if (minLat - maxLat > minLon - maxLon) {
      point.x = Math.floor(xMax * (lat_lon_array[i].lon - minLon) / (maxLon - minLon));
      point.y = Math.floor(yMax * (lat_lon_array[i].lat - minLat) / (maxLon - minLon));
    } else {
      point.x = Math.floor(xMax * (lat_lon_array[i].lon - minLon) / (maxLat - minLat));
      point.y = Math.floor(yMax * (lat_lon_array[i].lat - minLat) / (maxLat - minLat));
    }
    result.push(point);
  }

  const uniqueResult = [...new Set(result.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
  return uniqueResult;
}

function fetchTrip(origin, destination, callback) {
  AccessToken.getAccessToken((token, error) => {
    if (error) {
      return;
    }

    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', `https://api.vasttrafik.se/bin/rest.exe/v2/trip?originId=${origin}&destId=${destination}&format=json`, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onload = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          if (req.response.TripList.error) {
            callback(undefined, req.response.TripList);
          } else {
            callback(req.response, undefined);
          }
        } else {
          callback(undefined, req.response);
        }
      }
    };
    req.send(null);
  });
}

function fetchDepartureBoard(origin, destination) {
  AccessToken.getAccessToken((token, error) => {
    if (error) {
      return;
    }

    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', `https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard?id=${origin}&direction=${destination}&format=json`, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onload = function () {
      console.log(req)
      if (req.readyState === 4) {
        if (req.status === 200) {
          console.log(JSON.stringify(req.response));
        } else {
          console.log(JSON.stringify(req.response));
          console.log('Error');
        }
      }
    };
    req.send(null);
  });
}

function fetchTripGeography() {
  AccessToken.getAccessToken((token, error) => {
    if (error) {
      return;
    }
    let xMax = 144;
    let yMax = 168;

    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', 'https://api.vasttrafik.se/bin/rest.exe/v2/geometry?ref=63648%2F58814%2F999216%2F478393%2F80%26startIdx%3D2%26endIdx%3D10%26date%3D2021-12-23%26format%3Djson%26', true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onload = function () {
      console.log(req)
      if (req.readyState === 4) {
        if (req.status === 200) {
          console.log(JSON.stringify(req.response));
          if (req.response.Geometry.Points.Point) {
            console.log(JSON.stringify(scale(req.response.Geometry.Points.Point, xMax, yMax)));
          }
        } else {
          console.log(JSON.stringify(req.response));
          console.log('Error');
        }
      }
    };
    req.send(null);
  });
}

function handleStopLocations(stopLocations) {
  for (let i = 0; i < stopLocations.length; i++) {
    console.log(JSON.stringify(stopLocations[i]));
  }
  let xMax = 144;
  let yMax = 168;
  console.log(JSON.stringify(scale(stopLocations, xMax, yMax)));
}

function fetchStops(lat, lon, maxNumberOfStops) {
  AccessToken.getAccessToken((token, error) => {
    if (error) {
      return;
    }
    console.log(lat, lon);

    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', `https://api.vasttrafik.se/bin/rest.exe/v2/location.nearbystops?originCoordLong=${lon}&originCoordLat=${lat}&maxNo=${maxNumberOfStops}&format=json`, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onload = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {
          if (req.response.LocationList.StopLocation) {
            let stopLocations = req.response.LocationList.StopLocation;
            stopLocations.push({name:'geolocation', lat:lat, lon:lon});
            handleStopLocations(stopLocations);
          }
        } else {
          console.log(JSON.stringify(req.response));
          console.log('Error');
        }
      }
    };
    req.send(null);
  });
}
