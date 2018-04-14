# weather-text

## Basic Description
A thing I made to get current weather conditions and a 5-day forecast for a US city/state combo

## More Formal Description
This is a Twilio function that responds to a text message with either a 5-day forecast or the current weather for the city and state (US-only at the moment, unfortunately). It's set up as a webhook for a Twilio SMS-capable phone number set up for this purpose.

## Additional Information
The SMS must be formatted like this:
`{city name|ZIP code}, st {forecast|current|weather}`

This is SMS-only for now (and possibly in perpetuity, depending on how much free time and interest I have) because it was developed on a Chromebook and I didn't want the additional overhead of running multiple browser tabs.

It is case- and white-space insensitive; the only thing that matters is the comma separating the city/zip and state.
