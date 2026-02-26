/* eslint-disable no-multi-spaces */
/* eslint-disable object-curly-newline */

'use strict';

const AmbientDevice = require('../ambientDevice');

const AQITable = [
	{ name: 'good',        ConcLo: 0,      ConcHi: 12,      AQIlo: 0,      AQIhi: 50 },
	{ name: 'Moderate',    ConcLo: 12.1,   ConcHi: 35.5,    AQIlo: 51,     AQIhi: 100 },
	{ name: 'UnhealthyLo', ConcLo: 35.5,   ConcHi: 55.4,    AQIlo: 101,    AQIhi: 150 },
	{ name: 'Unhealthy',   ConcLo: 55.5,   ConcHi: 150.4,   AQIlo: 151,    AQIhi: 200 },
	{ name: 'UnhealthyHi', ConcLo: 150.5,  ConcHi: 250.4,   AQIlo: 201,    AQIhi: 300 },
	{ name: 'Hazardous',   ConcLo: 250.5,  ConcHi: 500.4,   AQIlo: 301,    AQIhi: 500 },
];

class PM25Device extends AmbientDevice
{

	/**
	 * onInit is called when the device is initialized.
	 */
	async onInit()
	{
		super.onInit();
		this.inOut = this.getData().inOut;

		this.registerCapabilityListener('button.send_log', this.onCapabilitySendLog.bind(this));

		this.log('PM25 has been initialized');
	}

	/**
	 * onRenamed is called when the user updates the device's name.
	 * This method can be used this to synchronise the name to the device.
	 * @param {string} name The new name
	 */
	async onRenamed(name)
	{
		this.log('PM25 was renamed');
	}

	/**
	 * onDeleted is called when the user deleted the device.
	 */
	async onDeleted()
	{
		this.log('PM25 has been deleted');
	}

	updateStationData(stationData, addRemove)
	{
		if (stationData && (addRemove || (stationData.macAddress === this.macAddress)))
		{
			// Setup / extend polling just in case we don't receive real time updates for some reason. This will ensure the device data is updated at least every 10 minutes.
			this.pollStationData();

			const pm25 = stationData[`pm25${this.inOut}`];
			this.setCapability('measure_pm25', pm25, addRemove);

			const pm25Avg = stationData[`pm25${this.inOut}_24h`];
			this.setCapability('measure_pm25.avg', pm25Avg, addRemove);

			if (pm25)
			{
				// Calculate AQI
				let tableIdx = AQITable.findIndex((entry) => entry.ConcHi > pm25);

				// If the value is above the highest value in the table, use the highest value
				if (tableIdx === -1)
				{
					tableIdx = AQITable.length - 1;
				}

				const AQI = ((AQITable[tableIdx].AQIhi - AQITable[tableIdx].AQIlo) / (AQITable[tableIdx].ConcHi - AQITable[tableIdx].ConcLo)) * (pm25 - AQITable[tableIdx].ConcLo) + AQITable[tableIdx].AQIlo;

				this.setCapability('measure_aqi', AQI, addRemove);
				const aqText = this.homey.__(AQITable[tableIdx].name);
				if (aqText !== this.getCapabilityValue('measure_aq'))
				{
					this.setCapability('measure_aq', aqText, addRemove);

					const tokens = {
						measure_aq_name: aqText,
						measure_aq_item: tableIdx,
					};

					const state = {
						value: tableIdx,
					};

					this.driver.triggerAQChanged(this, tokens, state);
				}
			}

			if (pm25Avg)
			{
				// Calculate AQI Ag
				const tableIdx = AQITable.findIndex((entry) => entry.ConcHi > pm25Avg);
				if ((tableIdx >= 0) && (tableIdx < AQITable.length))
				{
					const AQI = ((AQITable[tableIdx].AQIhi - AQITable[tableIdx].AQIlo) / (AQITable[tableIdx].ConcHi - AQITable[tableIdx].ConcLo)) * (pm25Avg - AQITable[tableIdx].ConcLo)  + AQITable[tableIdx].AQIlo;

					this.setCapability('measure_aqi.avg', AQI, addRemove);
					this.setCapability('measure_aq.avg', this.homey.__(AQITable[tableIdx].name), addRemove);
				}
			}

			this.setCapability('alarm_battery', (stationData[`bat_25${this.inOut}`] !== undefined) ? (stationData[`bat_25${this.inOut}`] === 0) : stationData[`bat_25${this.inOut}`], addRemove);
		}
	}

}

module.exports = PM25Device;
