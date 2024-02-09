'use strict';

// eslint-disable-next-line node/no-extraneous-require
const Homey = require('homey');
const nodemailer = require('nodemailer');
const AmbientWeatherApi = require('ambient-weather-api');

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
		this.realTimeAPI = null;
		this.registeringRealTime = false;
		this.realTimeSubKeys = [];

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

		this.log('MyApp has been initialized');
	}

	async onUninit()
	{
		if (this.realTimeAPI !== null)
		{
			this.realTimeAPI.unsubscribe(this.realTimeSubKeys);
			this.realTimeAPI.disconnect();
		}
	}

	async asyncDelay(period)
	{
		await new Promise((resolve) => this.homey.setTimeout(resolve, period));
	}

	async getAPIInstance(userAPIKey)
	{
		const applicationKey = Homey.env.AMBIENT_WEATHER_APPLICATION_KEY;
		const apiInstance = new AmbientWeatherApi({ apiKey: userAPIKey, applicationKey });

		this.homey.app.updateLog('Got new API instance');
		return apiInstance;
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
			this.log('waiting to register realtime');
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

		// Setup real time notifications
		if (this.realTimeAPI !== null)
		{
			// Already connected so just subscribe
			this.realTimeAPI.subscribe(this.realTimeSubKeys);
			this.registeringRealTime = false;
			this.log('Registered realtime');
			return;
		}

		// Create a connection
		this.realTimeAPI = await this.getAPIInstance(userAPIKey);
		this.realTimeAPI.connect();

		this.realTimeAPI.on('connect', () =>
		{
			this.homey.app.updateLog('Connected to Ambient Weather Realtime API!');

			// Connected so subscribe
			this.realTimeAPI.subscribe(this.realTimeSubKeys);
		});

		this.realTimeAPI.on('subscribed', (data) =>
		{
			this.homey.app.updateLog(`Subscribed to ${data.devices.length} device(s): ${data.devices.map(getName).join(', ')}`);
		});

		this.realTimeAPI.on('data', (data) =>
		{
			this.homey.app.updateLog(`realtime data: ${this.homey.app.varToString(data)}`);
			this.updateStationData(data);
		});

		this.registeringRealTime = false;
		this.log('Registered realtime');
	}

	updateStationData(data)
	{
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

	varToString(source, includeStack = true)
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
				if (includeStack)
				{
					const stack = source.stack.replace('/\\n/g', '\n');
					return `${source.message}\n${stack}`;
				}
				return source.message;
			}
			if (typeof (source) === 'object')
			{
				return JSON.stringify(source, null, 2);
			}
			if (typeof (source) === 'string')
			{
				return source;
			}

			return source.toString();
		}
		catch (error)
		{
			this.log('Error decoding message to a string', source);
			return 'Error decoding message to a string';
		}
	}

	updateLogEnabledSetting(enabled)
	{
		this.homey.settings.set('logEnabled', enabled);

		const drivers = this.homey.drivers.getDrivers();
		for (const driver of Object.values(drivers))
		{
			const devices = driver.getDevices();
			for (const device of Object.values(devices))
			{
				if (device.updateLogEnabledSetting)
				{
					device.updateLogEnabledSetting(enabled);
				}
			}
		}
	}

	updateLog(newMessage, isError = false)
	{
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

		this.log(newMessage);

		// Remove the API key from the output
		const apiKeyIndex = newMessage.indexOf('apiKey=');
		if (apiKeyIndex > 0)
		{
			newMessage = newMessage.substring(0, apiKeyIndex + 7);
		}

		let oldText = this.homey.settings.get('diagLog');
		if (!oldText)
		{
			oldText = '';
		}

		if (oldText.length > maxSize)
		{
			// Remove characters from the beginning to make space for the new message.
			oldText = oldText.substring(newMessage.length + 20);
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
		oldText += newMessage;
		oldText += '\r\n\r\n';
		this.homey.settings.set('diagLog', oldText);
	}

	// Send the log to the developer (not applicable to Homey cloud)
	async sendLog(logType, replyAddress)
	{
		let tries = 5;

		let logData;
		if (logType === 'diag')
		{
			logData = this.homey.settings.get('diagLog');
		}

		if (!logData)
		{
			throw new Error(this.homey.__('logEmpty'));
		}

		let lastError = '';

		while (tries-- > 0)
		{
			try
			{
				lastError = '';

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
				await transporter.sendMail(
				{
					from: `"Homey User" <${Homey.env.MAIL_USER}>`, // sender address
					to: Homey.env.MAIL_RECIPIENT, // list of receivers
					cc: replyAddress,
					subject: `Ambient Weather ${logType} log`, // Subject line
					text: logData, // plain text body
				},
				);

				return this.homey.__('logSent');
			}
			catch (err)
			{
				lastError = err.message;
			}
		}

		if (lastError !== '')
		{
			throw new Error(lastError);
		}
		return this.homey.__('logSendFailed');
	}

}

module.exports = MyApp;
