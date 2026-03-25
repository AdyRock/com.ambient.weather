'use strict';

const AmbientDevice = require('../ambientDevice');

class StationDevice extends AmbientDevice
{

	/**
	 * onInit is called when the device is initialized.
	 */
	async onInit()
	{
		this.hoursSinceLastRain = 0;
		if (!this.hasCapability('last_rain_event'))
		{
			this.addCapability('last_rain_event');
		}

		this.langCode = this.homey.i18n.getLanguage();

		super.onInit();
		this.registerCapabilityListener('button.send_log', this.onCapabilitySendLog.bind(this));

		this.log('StationDevice has been initialized');
	}

	/**
	 * onRenamed is called when the user updates the device's name.
	 * This method can be used this to synchronise the name to the device.
	 * @param {string} name The new name
	 */
	async onRenamed(name)
	{
		this.log('StationDevice was renamed');
	}

	/**
	 * onDeleted is called when the user deleted the device.
	 */
	async onDeleted()
	{
		this.log('StationDevice has been deleted');
	}

	updateStationData(stationData, addRemove)
	{
		if (stationData && (addRemove || (stationData.macAddress === this.macAddress)))
		{
			let deviceData = stationData.lastData;
			if (!deviceData)
			{
				if (Array.isArray(stationData))
				{
					deviceData = stationData[0];
				}
				else
				{
					deviceData = stationData;
				}
			}

			if (deviceData)
			{
				this.setCapability('measure_temperature', (deviceData.tempf !== undefined) ? (((deviceData.tempf - 32) * 5) / 9) : deviceData.tempf, addRemove);
				this.setCapability('measure_temperature.feelsLike', (deviceData.feelsLike !== undefined) ? (((deviceData.feelsLike - 32) * 5) / 9) : deviceData.feelsLike, addRemove);
				this.setCapability('measure_temperature.dewPoint', (deviceData.dewPoint !== undefined) ? (((deviceData.dewPoint - 32) * 5) / 9) : deviceData.dewPoint, addRemove);
				this.setCapability('measure_humidity', deviceData.humidity, addRemove);

				this.setCapability('measure_wind_angle', deviceData.winddir, addRemove);
				this.setCapability('measure_wind_strength', (deviceData.windspeedmph !== undefined) ? (deviceData.windspeedmph * 1.609344) : deviceData.windspeedmph, addRemove);
				this.setCapability('measure_wind_strength.avg2m', (deviceData.windspdmph_avg2m !== undefined) ? (deviceData.windspdmph_avg2m * 1.609344) : deviceData.windspdmph_avg2m, addRemove);
				this.setCapability('measure_wind_angle.avg2m', deviceData.winddir_avg2m, addRemove);
				this.setCapability('measure_wind_strength.avg10m', (deviceData.windspdmph_avg10m !== undefined) ? (deviceData.windspdmph_avg10m * 1.609344) : deviceData.windspdmph_avg10m, addRemove);
				this.setCapability('measure_wind_angle.avg10m', deviceData.winddir_avg10m, addRemove);

				this.setCapability('measure_gust_angle', deviceData.windgustdir, addRemove);
				this.setCapability('measure_gust_strength', (deviceData.windgustmph !== undefined) ? (deviceData.windgustmph * 1.609344) : deviceData.windgustmph, addRemove);
				this.setCapability('measure_gust_strength.daily', (deviceData.maxdailygust !== undefined) ? (deviceData.maxdailygust * 1.609344) : deviceData.maxdailygust, addRemove);

				this.setCapability('measure_radiation', deviceData.solarradiation, addRemove);
				this.setCapability('measure_ultraviolet', deviceData.uv, addRemove);

				this.setCapability('measure_rain', (deviceData.eventrainin !== undefined) ? (deviceData.eventrainin * 25.4) : deviceData.eventrainin, addRemove);
				this.setCapability('measure_rain.rate', (deviceData.hourlyrainin !== undefined) ? (deviceData.hourlyrainin * 25.4) : deviceData.hourlyrainin, addRemove);
				this.setCapability('measure_rain.total', (deviceData.totalrainin !== undefined) ? (deviceData.totalrainin * 25.4) : deviceData.totalrainin, addRemove);
				this.setCapability('measure_rain.today', (deviceData.dailyrainin !== undefined) ? (deviceData.dailyrainin * 25.4) : deviceData.dailyrainin, addRemove);
				this.setCapability('measure_rain.period24', (deviceData['24hourrainin'] !== undefined) ? (deviceData['24hourrainin'] * 25.4) : deviceData['24hourrainin'], addRemove);
				this.setCapability('measure_rain.week', (deviceData.weeklyrainin !== undefined) ? (deviceData.weeklyrainin * 25.4) : deviceData.weeklyrainin, addRemove);
				this.setCapability('measure_rain.month', (deviceData.monthlyrainin !== undefined) ? (deviceData.monthlyrainin * 25.4) : deviceData.monthlyrainin, addRemove);
				this.setCapability('measure_rain.year', (deviceData.yearlyrainin !== undefined) ? (deviceData.yearlyrainin * 25.4) : deviceData.yearlyrainin, addRemove);

				this.setCapability('alarm_battery', (deviceData.battout !== undefined) ? (deviceData.battout === 0) : deviceData.battout, addRemove);

				if (deviceData.lastRain)
				{
					this.lastRainDate = new Date(deviceData.lastRain);

					// Allow for Homey's timezone setting
					const tzString = this.homey.clock.getTimezone();
					const lastRainDate = new Date(this.lastRainDate.toLocaleString('en-US', { timeZone: tzString }));

					// Get the date using the short month format
					const formatString = { year: 'numeric', month: 'short', day: '2-digit', hour12: false, hour: '2-digit', minute: '2-digit' };
					const date = lastRainDate.toLocaleDateString(this.langCode, formatString);
					this.setCapabilityValue('last_rain_event', date);

					const hours = this.getHoursSinceLastRained();
					if (hours !== this.hoursSinceLastRain)
					{
						this.hoursSinceLastRain = hours;
						const tokens = {
							hours,
						};

						const state = {
							value: hours,
						};

						this.driver.TriggerHoursSinceRained(this, tokens, state);
					}
				}
			}
		}
	}

	getHoursSinceLastRained()
	{
		const now = new Date();
		const diff = now - this.lastRainDate;
		return Math.floor(diff / 3600000);
	}

}

module.exports = StationDevice;
