'use strict';

// eslint-disable-next-line node/no-extraneous-require
const Homey = require('homey');
const nodemailer = require('nodemailer');
const AmbientWeatherApi = require('ambient-weather-api');

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes

if (process.env.DEBUG === '1')
{
	// eslint-disable-next-line node/no-unsupported-features/node-builtins, global-require
	require('inspector').open(9223, '0.0.0.0', true);
}

class MyApp extends Homey.App
{

	/**
	 * onInit is called when the app is initialized.
	 */
	async onInit()
	{
		this.realTimeAPI = [];
		this.registeringRealTime = false;
		this.realTimeSubKeys = [];
		this.subscribedDevices = [];

		this.homey.app.apiKey = this.homey.settings.get('APIToken');
		if (!this.homey.app.apiKey)
		{
			this.homey.app.apiKey = '';
		}

		// Conditions for moisture sensor
		const measureMoistureIsLessCondition = this.homey.flow.getConditionCard('measure_moisture_is_less');
		measureMoistureIsLessCondition.registerRunListener(async (args, state) =>
		{
			const moisture = args.device.getCapabilityValue('measure_moisture');
			return moisture < args.value;
		});

		const measureMoistureIsEqualCondition = this.homey.flow.getConditionCard('measure_moisture_equal');
		measureMoistureIsEqualCondition.registerRunListener(async (args, state) =>
		{
			const moisture = args.device.getCapabilityValue('measure_moisture');
			return moisture === args.value;
		});

		// Conditions for weather station
		const measureTemperatureFeelsLikeIsLessCondition = this.homey.flow.getConditionCard('measure_temperature.feelsLike_is_less');
		measureTemperatureFeelsLikeIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_temperature.feelsLike');
			return value < args.value;
		});

		const measureTemperatureFeelsLikeEqualCondition = this.homey.flow.getConditionCard('measure_temperature.feelsLike_equal');
		measureTemperatureFeelsLikeEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_temperature.feelsLike');
			return value === args.value;
		});

		const measureTemperatureDewPointIsLessCondition = this.homey.flow.getConditionCard('measure_temperature.dewPoint_is_less');
		measureTemperatureDewPointIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_temperature.dewPoint');
			return value < args.value;
		});

		const measureTemperatureDewPointEqualCondition = this.homey.flow.getConditionCard('measure_temperature.dewPoint_equal');
		measureTemperatureDewPointEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_temperature.dewPoint');
			return value === args.value;
		});

		const measureRainEventIsLessCondition = this.homey.flow.getConditionCard('measure_rain.event_is_less');
		measureRainEventIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.event');
			return value < args.value;
		});

		const measureRainEventEqualCondition = this.homey.flow.getConditionCard('measure_rain.event_equal');
		measureRainEventEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.event');
			return value === args.value;
		});

		const measureRainHourlyIsLessCondition = this.homey.flow.getConditionCard('measure_rain.hourly_is_less');
		measureRainHourlyIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.hourly');
			return value < args.value;
		});

		const measureRainHourlyEqualCondition = this.homey.flow.getConditionCard('measure_rain.hourly_equal');
		measureRainHourlyEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_temperature.hourly');
			return value === args.value;
		});

		const measureRainDailyIsLessCondition = this.homey.flow.getConditionCard('measure_rain.daily_is_less');
		measureRainDailyIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.daily');
			return value < args.value;
		});

		const measureRainDailyEqualCondition = this.homey.flow.getConditionCard('measure_rain.daily_equal');
		measureRainDailyEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.daily');
			return value === args.value;
		});

		const measureRainWeeklyIsLessCondition = this.homey.flow.getConditionCard('measure_rain.weekly_is_less');
		measureRainWeeklyIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.weekly');
			return value < args.value;
		});

		const measureRainWeeklyEqualCondition = this.homey.flow.getConditionCard('measure_rain.weekly_equal');
		measureRainWeeklyEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.weekly');
			return value === args.value;
		});

		const measureRainMonthlyIsLessCondition = this.homey.flow.getConditionCard('measure_rain.monthly_is_less');
		measureRainMonthlyIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.monthly');
			return value < args.value;
		});

		const measureRainMonthlyEqualCondition = this.homey.flow.getConditionCard('measure_rain.monthly_equal');
		measureRainMonthlyEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.monthly');
			return value === args.value;
		});

		const measureRainYearlyIsLessCondition = this.homey.flow.getConditionCard('measure_rain.yearly_is_less');
		measureRainYearlyIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.yearly');
			return value < args.value;
		});

		const measureRainYearlyEqualCondition = this.homey.flow.getConditionCard('measure_rain.yearly_equal');
		measureRainYearlyEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.yearly');
			return value === args.value;
		});

		const measureRainTotalIsLessCondition = this.homey.flow.getConditionCard('measure_rain.total_is_less');
		measureRainTotalIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.total');
			return value < args.value;
		});

		const measureRainTotalEqualCondition = this.homey.flow.getConditionCard('measure_rain.total_equal');
		measureRainTotalEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_rain.total');
			return value === args.value;
		});

		// Lightening conditions
		const measureLightningIsLessCondition = this.homey.flow.getConditionCard('measure_lightning_is_less');
		measureLightningIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_lightning');
			return value < args.value;
		});

		const measureLightningEqualCondition = this.homey.flow.getConditionCard('measure_lightning_equal');
		measureLightningEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_lightning');
			return value === args.value;
		});

		const measureLightningNumIsLessCondition = this.homey.flow.getConditionCard('measure_lightning_num_is_less');
		measureLightningNumIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_lightning_num');
			return value < args.value;
		});

		const measureLightningNumEqualCondition = this.homey.flow.getConditionCard('measure_lightning_num_equal');
		measureLightningNumEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_lightning_num');
			return value === args.value;
		});

		// PM2.5 conditions
		const measureAqiIsLessCondition = this.homey.flow.getConditionCard('measure_aqi_is_less');
		measureAqiIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_aqi');
			return value < args.value;
		});

		const measureAqiEqualCondition = this.homey.flow.getConditionCard('measure_aqi_equal');
		measureAqiEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_aqi');
			return value === args.value;
		});

		const measureAqiAvgIsLessCondition = this.homey.flow.getConditionCard('measure_aqi.avg_is_less');
		measureAqiAvgIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_aqi.avg');
			return value < args.value;
		});

		const measureAqiAvgEqualCondition = this.homey.flow.getConditionCard('measure_aqi.avg_equal');
		measureAqiAvgEqualCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getCapabilityValue('measure_aqi.avg');
			return value === args.value;
		});

		const hoursSinceRainedIsLessCondition = this.homey.flow.getConditionCard('hours_since-rained');
		hoursSinceRainedIsLessCondition.registerRunListener(async (args, state) =>
		{
			const value = args.device.getHoursSinceLatRained();
			return value < args.value;
		});

		// Start polling timer to update devices every 5 minutes in case we miss real time updates or the device doesn't support real time updates.
		this.pollingInterval = this.homey.setInterval(() =>
		{
			this.pollData();
		}, POLLING_INTERVAL + 1000); // Add 1 second to avoid hitting the cache twice in a row.

		this.log('MyApp has been initialized');
	}

	async onUninit()
	{
		if (this.realTimeAPI && this.realTimeAPI.length > 0)
		{
			// Unsubscribe from real time updates and disconnect
			this.realTimeAPI.forEach((apiInstance) => {
				apiInstance.unsubscribe(this.realTimeSubKeys);
				apiInstance.disconnect();
			});
			this.realTimeAPI = [];
		}
	}

	async asyncDelay(period)
	{
		await new Promise((resolve) => this.homey.setTimeout(resolve, period));
	}

	async getAPIInstance(userAPIKey)
	{
		// Find an existing API instance for the same API key
		if (this.realTimeAPI.length > 0)
		{
			const existingInstance = this.realTimeAPI.find((apiInstance) => apiInstance.apiKey === userAPIKey);
			if (existingInstance)
			{
				this.homey.app.updateLog('Reusing existing API instance');
				return existingInstance;
			}
		}

		const applicationKey = Homey.env.AMBIENT_WEATHER_APPLICATION_KEY;
		this.realTimeAPI.push(new AmbientWeatherApi({ apiKey: userAPIKey, applicationKey }));

		this.updateLog('Got new API instance');
		return this.realTimeAPI[this.realTimeAPI.length - 1];
	}

	async getAPIData(userAPIKey, macAddress)
	{
		const apiInstance = await this.homey.app.getAPIInstance(userAPIKey);
		return apiInstance.deviceData(macAddress, { limit: 1 });
	}

	async registerRealTime(userAPIKey)
	{
		while (this.registeringRealTime)
		{
			this.homey.app.updateLog('waiting to register realtime');
			await this.asyncDelay(500);
		}

		this.registeringRealTime = true;

		// helper function
		function getName(device)
		{
			return device.info.name;
		}

		if (this.realTimeSubKeys.findIndex((keyEntry) => keyEntry === userAPIKey) >= 0)
		{
			// Already subscribed
			this.homey.app.updateLog(`Key ${userAPIKey} already subscribed to Realtime API!`);
			this.registeringRealTime = false;
			return;
		}

		this.realTimeSubKeys.push(userAPIKey);

		// Create a connection
		const apiInstance = await this.getAPIInstance(userAPIKey);
		apiInstance.connect();

		apiInstance.on('connect', () =>
		{
			this.homey.app.updateLog('Connected to Ambient Weather Realtime API!');

			// Connected so subscribe
			apiInstance.subscribe(this.realTimeSubKeys);
		});

		apiInstance.on('subscribed', (data) =>
		{
			this.homey.app.updateLog(`Subscribed to ${data.devices.length} device(s): ${data.devices.map(getName).join(', ')}`, true);
			this.homey.app.updateLog(`${this.homey.app.varToString(data)}`);
			data.devices.forEach((device) =>
			{
				this.updateStationData(device);
			});
		});

		apiInstance.on('data', (data) =>
		{
			this.homey.app.updateLog(`Realtime data: ${this.homey.app.varToString(data)}`);

			// Check if data is ana array of devices or a single device and call updateStationData for each device in the data array to update the devices with the new data.
			if (data && data.macAddress)
			{
				this.updateStationData(data);
			}
			else if (data && data.device)
			{
				this.updateStationData(data.device);
			}
			else if (data && data.devices)
			{
				// If it's an array of devices, loop through the array and call updateStationData for each device in the data array to update the devices with the new data.
				if (data && data.devices && data.devices.length > 0)
				{
					// call updateStationData for each device in the data array to update the devices with the new data.
					data.devices.forEach((device) => {
						this.updateStationData(device);
					});
				}
			}
		});

		this.registeringRealTime = false;
		this.homey.app.updateLog('Registered realtime');
	}

	async pollData()
	{
		this.homey.app.updateLog('Polling data for all devices');
		const drivers = this.homey.drivers.getDrivers();
		for (const driver of Object.values(drivers))
		{
			const devices = driver.getDevices();
			for (const device of Object.values(devices))
			{
				if (device.getStationData)
				{
					await device.getStationData();
				}
			}
		}
	}

	updateStationData(data)
	{
		// Check the data array to see if we have already fetched the data for this macAddress and update the data for the devices with the new data.
		if (data && data.macAddress)
		{
			// add the lastDataReceived timestamp to the data so we know when we received the last update for this device.
			data.lastDataReceived = new Date();

			// Update the data in the array so if a device is added later with this macAddress it can get the latest data without needing to fetch it again.
			const stationData = this.subscribedDevices.find((device) => device.macAddress === data.macAddress);
			if (stationData)
			{
				// Update the existing data with the new data. This will keep any existing properties that are not included in the new data and update any properties that are included in the new data.
				this.homey.app.updateLog(`Updating station data for macAddress ${data.macAddress}`);
				Object.assign(stationData, data);
			}
			else
			{
				this.homey.app.updateLog(`Received data for new device, adding to subscribedDevices array for macAddress ${data.macAddress}`);

				// Add the new device data to the array so if a device is added later with this macAddress it can get the latest data without needing to fetch it again.
				this.subscribedDevices.push(data);
			}
		}

		const drivers = this.homey.drivers.getDrivers();
		for (const driver of Object.values(drivers))
		{
			const devices = driver.getDevices();
			for (const device of Object.values(devices))
			{
				// const device = devices[i];
				if (device.updateStationData)
				{
					device.updateStationData(data, false);
				}
			}
		}
	}

	async getStationData(apiKey, macAddress)
	{
		while (this.fetchingData)
		{
			this.homey.app.updateLog('waiting to fetch data');
			await this.asyncDelay(500);
		}

		this.fetchingData = true;
		let stationData = null;

		try
		{
			// Check the data array to see if we have already fetched the data for this macAddress in the last 5 minutes to avoid hitting API rate limits.
			stationData = this.subscribedDevices ? this.subscribedDevices.find((data) => data.macAddress === macAddress) : null;

			// If we have the data but it's older than 5 minutes, remove it and fetch new data.
			if (stationData && (!stationData.lastDataReceived || (Date.now() - new Date(stationData.lastDataReceived)) >= POLLING_INTERVAL))
			{
				this.subscribedDevices = this.subscribedDevices.filter((data) => data.macAddress !== macAddress);
				stationData = null;
			}

			if (stationData)
			{
				this.homey.app.updateLog('Using cached station data');
			}
			else
			{
				stationData = await this.getAPIData(apiKey, macAddress);
				if (stationData)
				{
					// Update the lastDataReceived to now since we are getting the data now.
					stationData.lastDataReceived = new Date();
					stationData.macAddress = macAddress;

					// Add the new data to the array so if a device is added later with this macAddress it can get the latest data without needing to fetch it again.
					this.subscribedDevices = this.subscribedDevices || [];
					this.subscribedDevices.push(stationData);
					this.homey.app.updateLog('Fetched new station data');
					this.homey.app.updateLog(`Station data: ${this.homey.app.varToString(stationData)}`);
				}
			}
		}
		catch (err)
		{
			this.homey.app.updateLog(`Error fetching station data: ${err.message}`, true);
			this.homey.app.updateLog(`Error details: ${this.homey.app.varToString(err)}`, true);
		}

		this.fetchingData = false;

		return stationData;
	}

	varToString(source)
	{
		try
		{
			if (source === null)
			{
				return 'null';
			}
			if (source === undefined)
			{
				return 'undefined';
			}
			if (source instanceof Error)
			{
				const stack = source.stack.replace('/\\n/g', '\n');
				return `${source.message}\n${stack}`;
			}
			if (typeof (source) === 'object')
			{
				const getCircularReplacer = () =>
				{
					const seen = new WeakSet();
					return (key, value) =>
					{
						if (typeof value === 'object' && value !== null)
						{
							if (seen.has(value))
							{
								return '';
							}
							seen.add(value);
						}
						return value;
					};
				};

				return JSON.stringify(source, getCircularReplacer(), 2);
			}
			if (typeof (source) === 'string')
			{
				return source;
			}
		}
		catch (err)
		{
			this.updateLog(`VarToString Error: ${err.message}`);
		}

		return source.toString();
	}

	sanitizeApiKeys(source)
	{
		if (source === null || source === undefined)
		{
			return source;
		}

		let sanitized = source;
		if (typeof sanitized !== 'string')
		{
			sanitized = this.varToString(sanitized);
		}

		// JSON style with quoted value: "apiKey": "..."
		sanitized = sanitized.replace(/("apiKey"\s*:\s*)"([^"\\]*(?:\\.[^"\\]*)*)"/gi, '$1"****"');

		// JSON-like style with unquoted value: "apiKey": value
		sanitized = sanitized.replace(/("apiKey"\s*:\s*)([^,\r\n}\]]+)/gi, (match, prefix, value) =>
		{
			if ((value || '').trim().startsWith('"'))
			{
				return match;
			}
			return `${prefix}"****"`;
		});

		// Query-string style: apiKey=...
		sanitized = sanitized.replace(/(apiKey=)[^&;\s\r\n]*/gi, '$1****');

		return sanitized;
	}

	updateLog(newMessage, isError = false)
	{
		const sanitizedMessage = this.sanitizeApiKeys(newMessage);

		// Maximum size of the log in characters
		let maxSize = 30000;
		if (!this.homey.settings.get('logEnabled'))
		{
			if (!isError)
			{
				return;
			}

			// Reduce the size if only logging errors
			maxSize = 5000;
		}

		this.log(sanitizedMessage);

		let oldText = this.homey.settings.get('diagLog');
		if (!oldText)
		{
			oldText = '';
		}

		if (oldText.length > maxSize)
		{
			// Remove characters from the beginning to make space for the new message.
			oldText = oldText.substring(sanitizedMessage.length + 20);
			const n = oldText.indexOf('\n');
			if (n >= 0)
			{
				// Remove up to and including the first \n so the log starts on a whole line
				oldText = oldText.substring(n + 1);
			}
		}

		const nowTime = new Date(Date.now());

		if (oldText.length === 0)
		{
			oldText = 'Log ID: ';
			oldText += nowTime.toJSON();
			oldText += '\r\n';
			oldText += 'App version ';
			oldText += Homey.manifest.version;
			oldText += '\r\n\r\n';
			this.logLastTime = nowTime;
		}

		oldText += nowTime.toJSON();
		oldText += '\r\n  ';

		oldText += '* ';
		oldText += sanitizedMessage;
		oldText += '\r\n\r\n';
		this.homey.settings.set('diagLog', oldText);
		this.homey.api.realtime('com.ambient.weather.logupdated', { log: oldText });
	}

	// Send the log to the developer (not applicable to Homey cloud)
	async sendLog({ email = '', description = '', log = '' })
	{
		let tries = 5;
		let error = null;
		while (tries-- > 0)
		{
			try
			{
				// create reusable transporter object using the default SMTP transport
				const transporter = nodemailer.createTransport(
					{
						host: Homey.env.MAIL_HOST, // Homey.env.MAIL_HOST,
						port: 465,
						ignoreTLS: false,
						secure: true, // true for 465, false for other ports
						auth:
						{
							user: Homey.env.MAIL_USER, // generated ethereal user
							pass: Homey.env.MAIL_SECRET, // generated ethereal password
						},
						tls:
						{
							// do not fail on invalid certs
							rejectUnauthorized: false,
						},
					},
				);

				// send mail with defined transport object
				const info = await transporter.sendMail(
					{
						from: `"Homey User" <${Homey.env.MAIL_USER}>`, // sender address
						to: Homey.env.MAIL_RECIPIENT, // list of receivers
						cc: email,
						subject: `Ambient Weather log (${Homey.manifest.version})`, // Subject line
						text: `${email}\n${description}\n\n${log}`, // plain text body
					},
				);

				this.updateLog(`Message sent: ${info.messageId}`);
				// Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

				// Preview only available when sending through an Ethereal account
				this.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
				return this.homey.__('settings.logSent');
			}
			catch (err)
			{
				this.updateLog(`Send log error: ${err.message}`, 0);
				error = err;
			}
		}

		throw new Error(this.homey.__('settings.logSendFailed') + error.message);
	}

	async getDeviceList()
	{
		const subList = this.varToString(this.subscribedDevices);
		return this.sanitizeApiKeys(subList);
	}

	getLog()
	{
		const logText = this.homey.settings.get('diagLog') || '';
		return this.sanitizeApiKeys(logText);
	}

	clearLog()
	{
		this.homey.settings.set('diagLog', '');
		this.homey.api.realtime('com.ambient.weather.logupdated', { log: '' });
	}

}

module.exports = MyApp;
