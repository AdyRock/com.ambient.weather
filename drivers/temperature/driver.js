'use strict';

const AmbientDriver = require('../ambientDriver');

class TemperatureDriver extends AmbientDriver
{

	/**
	 * onInit is called when the driver is initialized.
	 */
	async onInit()
	{
		this.log('TemperatureDriver has been initialized');
	}

	async onPairListDevices(ambientAPI, apiKey)
	{
		const devices = [];

		const stations = await ambientAPI.userDevices();
		this.homey.app.updateLog(`Detected Stations: ${this.homey.app.varToString(stations)}`);

		stations.forEach((station) =>
		{
			const temperatureIndoorParam = 'tempinf';
			if (station.lastData[temperatureIndoorParam])
			{
				const data = {
					id: station.macAddress,
					deviceID: 'in',
				};
				const settings = {
					apiKey,
				};

				// Add this device to the table
				devices.push(
				{
					name: 'Temperature sensor indoor',
					data,
					settings,
				},
				);
			}

			for (let i = 1; i <= 10; i++)
			{
				const moistureParam = `temp${i}f`;
				if (station.lastData[moistureParam])
				{
					const data = {
						id: station.macAddress,
						deviceID: i,
					};
					const settings = {
						apiKey,
					};

					// Add this device to the table
					devices.push(
					{
						name: `Temperature sensor ${i}`,
						data,
						settings,
					},
					);
				}
			}
		});

		return devices;
	}

}

module.exports = TemperatureDriver;
