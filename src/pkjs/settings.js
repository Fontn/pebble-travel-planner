const Clay = require('pebble-clay');
const clayConfig = require('./config');
const clay = new Clay(clayConfig, null, { autoHandleEvents: false });

const keys = require('message_keys');

const AccessToken = require('./accessToken');

// Loads initial settings from localstorage and saves it in a vairable
let currentSettings = JSON.parse(localStorage.getItem('settings'));

Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }

  // Get the keys and values from each config item
  const dict = clay.getSettings(e.response);

  let previousSettings = Object.assign({}, currentSettings);

  // Stores settings in a varible and in localstorage
  currentSettings = Object.assign(currentSettings, dict);
  localStorage.setItem('settings', JSON.stringify(currentSettings));
  console.log(JSON.stringify(previousSettings));
  console.log(JSON.stringify(currentSettings));

  // Fetches any missing or changed location IDs
  fetchAndStoreLocations(previousSettings);

  // Filter out key value pairs with empty values
  let translatedDict = {};
  for (let key in dict) {
    if (!dict[key]) {
      continue;
    }
    translatedDict[key] = dict[key];
  }

  // Send settings values to watch
  Pebble.sendAppMessage(translatedDict, function(e) {
    console.log('Sent config data to Pebble');
  }, function(e) {
    console.log('Failed to send config data!');
    console.log(JSON.stringify(e));
  });
});

function fetchAndStoreLocations(previousSettings) {
  let hasSettingsChanged = false;
  for (let i = 0; i < 8; i++) {
    if (!currentSettings[keys.location + i]) {
      currentSettings[keys.locationId + i] = '';
      continue;
    }
    if (currentSettings[keys.location + i] === previousSettings[keys.location + i]) {
      continue;
    }
    // Location has been changed and is not empty. New location id should be fetched.
    fetchLocation(currentSettings[keys.location + i], i);
  }
}

function fetchLocation(name, keyIndex) {
  AccessToken.getAccessToken((token, error) => {
    if (error) {
      return;
    }

    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', `https://api.vasttrafik.se/bin/rest.exe/v2/location.name?input=${name}&format=json`, true);
    req.setRequestHeader('Authorization', 'Bearer ' + token);
    req.onload = function () {
      if (req.readyState === 4) {
        if (req.status === 200) {

          // Stores the location id in settings
          currentSettings[keys.locationId + keyIndex] = req.response.LocationList.StopLocation[0].id;
          localStorage.setItem('settings', JSON.stringify(currentSettings));
        } else {
          console.log(JSON.stringify(req.response));
          console.log('Error');
        }
      }
    };
    req.send(null);
  });
}

module.exports = {
  // Retrives the settings object.
  getSettings: function () {
    return currentSettings;
  }
}
