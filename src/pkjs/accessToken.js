const {CLIENT_ID, VT_KEY, VT_SECRET} = require('./APITokens');

let access_token = '';
let token_expiration_time = 0;
let access_start_time = (new Date().getTime()) / 1000;

function getAccessToken(callback) {/*
  if (access_token && token_expiration_time !== 0) {
    console.log(`exper time: ${token_expiration_time}`);
    console.log(`start time: ${access_start_time}`);
    console.log(`access_tok: ${access_token}`);
    return callback(access_token);
  }*/
  let currentTime = (new Date().getTime()) / 1000;
  if (currentTime - access_start_time < token_expiration_time) {
    console.log(`expir time: ${token_expiration_time}`);
    console.log(`sta->now t: ${currentTime - access_start_time}`);
    return callback(access_token);
  }
  console.log('token has expired or does not exist, fetching a new one from vasttrafik api.');
  let req = new XMLHttpRequest();
  req.responseType = 'json';
  req.open('POST', 'https://api.vasttrafik.se/token', true);
  req.setRequestHeader('Content-type', "application/x-www-form-urlencoded");

  const token = window.btoa(`${VT_KEY}:${VT_SECRET}`);

  req.setRequestHeader('Authorization', 'Basic ' + token);
  req.onload = function () {
    if (req.readyState === 4) {
      if (req.status === 200) {
        console.log(JSON.stringify(req.response));
        access_start_time = currentTime;
        access_token = req.response.access_token;
        token_expiration_time = req.response.expires_in;
        return callback(access_token);
      } else {
        console.log('Error');
        console.log(JSON.stringify(req.response));
        return callback('', req.response);
      }
    }
  };
  req.send(`grant_type=client_credentials&scope=${CLIENT_ID}`);
}

module.exports = {
  getAccessToken
}
