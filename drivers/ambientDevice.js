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
		this.pollStationData();
	}

	async pollStationData()
	{
		// First time we poll immediately, then we wait 5 minutes to keep within the API rate limits. If the timer already exists, we clear it and start a new one for 5 minutes.
		let timeout = 1000;
		if (this.pollTimer)
		{
			this.homey.clearTimeout(this.pollTimer);
			timeout = 1000 * 60 * 5; // 5 minutes
			this.pollTimer = null;
		}

		// Add a random delay of up to 30 seconds to avoid all devices polling at the same time
		timeout += Math.floor(Math.random() * 1000 * 30);

		this.pollTimer = this.homey.setTimeout(() =>
		{
			const apiKey = this.getSetting('apiKey');
			this.getStationData(apiKey);
		}, timeout);
	}

	/**
	 * onAdded is called when the user adds the device, called just after pairing.
	 */
	async onAdded()
	{
		// // Initialise with the current data
		// const apiKey = this.getSetting('apiKey');
		// this.getStationData(apiKey);

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

	async getStationData(apiKey)
	{
		const stationDataArray = await this.app.getAPIData(apiKey, this.macAddress);
		this.app.updateLog(`getStationData: ${this.app.varToString(stationDataArray)}`);
		if (stationDataArray && Array.isArray(stationDataArray) && (stationDataArray.length > 0))
		{
			const stationData = stationDataArray[0];
			this.updateStationData(stationData, true);
			return true;
		}

		return false;
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
