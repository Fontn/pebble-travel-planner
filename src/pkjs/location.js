
// An ID to store to later clear the watch
var watchId;

// Debugging Callback
function success(pos) {
  console.log('Location changed!');
  console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
}

// Debugging Callback
function error(err) {
  if(err.code == err.PERMISSION_DENIED) {
    console.log('Location access was denied by the user.');
  } else {
    console.log('location error (' + err.code + '): ' + err.message);
  }
}

const options = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 5000
};

module.exports = {
  // Retrives the current location.
  getLocation: function (callback) {
    return navigator.geolocation.getCurrentPosition(callback, error, options);
  },
  // watches the current location. The callback is called continually with the current location
  watchLocation: function (callback) {
    watchId = navigator.geolocation.watchPosition(callback, error, options);
  },
  // Clears the location watch.
  clearWatch: function () {
    navigator.geolocation.clearWatch(watchId)
  }
}
