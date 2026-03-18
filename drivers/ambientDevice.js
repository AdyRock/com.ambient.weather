/* jslint node: true */

'use strict';

const Homey = require('homey');

class AmbientDevice extends Homey.Device
{

	/**
	 * Typed app accessor so editor navigation can resolve methods defined in app.js.
	 * @returns {import('../app')}
	 */
	get app()
	{
		return this.homey.app;
	}

	async onInit()
	{
		this.macAddress = this.getData().id;
		// Setup real time notifications
		const apiKey = this.getSetting('apiKey');
		this.homey.app.registerRealTime(apiKey);
	}

	/**
	 * onAdded is called when the user adds the device, called just after pairing.
	 */
	async onAdded()
	{
		// // Initialise with the current data
		// this.getStationData();

		this.log('Device has been added');
	}

	/**
	 * onSettings is called when the user updates the device's settings.
	 * @param {object} event the onSettings event data
	 * @param {object} event.oldSettings The old settings object
	 * @param {object} event.newSettings The new settings object
	 * @param {string[]} event.changedKeys An array of keys changed since the previous version
	 * @returns {Promise<string|void>} return a custom message that will be displayed
	 */
	async onSettings({ oldSettings, newSettings, changedKeys })
	{
		this.log('Device settings have been updated');
	}

	async getStationData()
	{
		const apiKey = this.getSetting('apiKey');
		const stationDataArray = await this.homey.app.getStationData(apiKey, this.macAddress);
		if (stationDataArray && Array.isArray(stationDataArray) && (stationDataArray.length > 0))
		{
			// Update each device with the stationDataArray, the devices will pick the relevant data based on their macAddress.
			for (const stationData of stationDataArray)
			{
				const data = {};
				data.lastData = stationData;
				data.macAddress = stationData.macAddress;
				this.updateStationData(data, true);
			}
		}
		else if (stationDataArray)
		{
			this.updateStationData(stationDataArray, true);
		}
	}

	setCapability(capability, value, addRemove)
	{
		if (value !== undefined)
		{
			if (this.hasCapability(capability))
			{
				this.setCapabilityValue(capability, value).catch(this.error);
			}
			else if (addRemove)
			{
				this.addCapability(capability).then(() =>
				{
					this.setCapabilityValue(capability, value).catch(this.error);
				});
			}
		}
		else if (addRemove)
		{
			if (this.hasCapability(capability))
			{
				this.removeCapability(capability).catch(this.error);
			}
		}
	}

	async onCapabilitySendLog(value)
	{
		this.app.sendLog('diag', this.getSetting('replyEmail')).catch(this.error);
	}

}

module.exports = AmbientDevice;
