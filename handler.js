const got = require('got');

const invalidQueryMissingComma = "Error: missing comma.";
const helperMessage = "Query must be formatted as follows: <city name>, <2-letter state abbreviation> <forecast|weather>.";
const invalidQueryMissingRequestType = "Error: missing or invalid request type.";
const invalidQueryMissingCity = "Error: missing or invalid city.";
const invalidQueryMissingState = "Error: missing or invalid state.";
const locNotFound = "Error: location not found. :(";

exports.handler = function(context, event, callback) {
    let twiml = new Twilio.twiml.MessagingResponse();

    const body = event.Body ? event.Body.toLowerCase().trim() : null;
    
    processedQuery = process(body);

  if (processedQuery.err) {
    console.log(processedQuery.err);
    twiml.message(processedQuery.err);
    callback(null, twiml);
  }
  
    switch (processedQuery.type) {
      case "weather":
      case "current":
          got.post(`http://api.wunderground.com/api/${context.WU_KEY}/conditions/q/${processedQuery.state}/${processedQuery.city}.json`,
                   {json: true})
    .then(response => {
            if (!response.body.current_observation) {
               callback(null, locNotFound);
            }
            callback(null, formatCurrentConditions(response.body.current_observation));
    })
    .catch(err => {
            callback(err);
    });
        break;
        
      case "forecast":
          got.post(`http://api.wunderground.com/api/${context.WU_KEY}/forecast10day/q/${processedQuery.state}/${processedQuery.city}.json`,
                   {json: true})
    .then(response => {
            // 'forecastday' is not a typo
            callback(null, formatForecast(response.body.forecast.txt_forecast.forecastday));
    })
    .catch(err => {
      callback(err);
    });      
        break;
        
      default:
        twiml.message(helperMessage);
        callback(null, twiml);
    }
  
};

function formatCurrentConditions(currentConditions) {
  let {temperature_string, wind_string, relative_humidity, weather, observation_time } = currentConditions;
   let twiml = new Twilio.twiml.MessagingResponse();
   let message = twiml.message();
   message.body(`Temperature: ${temperature_string}
Wind: ${wind_string}
Humidity: ${relative_humidity}
Conditions: ${weather}
${observation_time}`);
  return twiml;
}

function formatForecast(forecastDays) {
   let twiml = new Twilio.twiml.MessagingResponse();
   let message = twiml.message();
   let messageText = "";
   forecastDays.forEach(day => {
     if (day.period < 10) { 
       messageText += `
${day.title}
${day.fcttext}
${day.pop}% chance of precip
`    }
  });
  message.body(messageText);
  return twiml;
}

function process(query) {
  let separatedQuery = query.split(",");
  if (separatedQuery.length != 2) {
    return { city: "", state: "", type: "", err: invalidQueryMissingComma + " " + helperMessage};
  }
  
  let city = separatedQuery[0].trim();
  if (!city) {
    return {city: "", state: "", type: "", err: invalidQueryMissingCity + " " + helperMessage};
  }
  
  let stateMatch = separatedQuery[1].trim().match(/\w{2}/);
  if (!stateMatch) {
    return {city: "", state: "", type: "", err: invalidQueryMissingState + " " + helperMessage};
  }
  let state = stateMatch[0];
                                                          
  let typeMatch = separatedQuery[1].match(/forecast|current|weather/);
  if (!typeMatch) {
    return {city: "", state: "", type: "", err: invalidQueryMissingRequestType + " " + helperMessage};
  }
  let type = typeMatch[0];

  return {city, state, type, err: null};
}
