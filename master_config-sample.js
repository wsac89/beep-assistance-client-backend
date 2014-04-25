/** Change variables values and save this file has master_config.js **/
var conf = {
	locations : [], 
	api_url : '' 			// API URL. Ex.: https://foobar.net/api/
};

// Populate the locations array, every location that a beep_assistance_client is installed
// conf.locations[0] = 'Dominical School 1';	//or
// conf.locations[0] = '7 years class'

exports.config = conf;