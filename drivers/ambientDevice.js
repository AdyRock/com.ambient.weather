/* jslint node: true */

'use strict';

const Homey = require('homey');

class AmbientDevice extends Homey.Device
{

	async onInit()
	{
		this.updateLogEnabledSetting(this.homey.settings.get('logEnabled'));

		this.macAddress = this.getData().id;
		// Setup real time notifications
		const apiKey = this.getSetting('apiKey');
		this.homey.app.registerRealTime(apiKey);
		this.pollStationData();
	}

	async pollStationData()
	{
		// First time we poll immediately, then we wait 10 seconds to prevent multiple devices polling at the same time
		let timeout = 100;
		if (this.pollTimer)
		{
			this.homey.clearTimeout(this.pollTimer);
			timeout = 10000;
			this.pollTimer = null;
		}

		this.pollTimer = this.homey.setTimeout(() =>
		{
			const apiKey = this.getSetting('apiKey');
			this.getStationData(apiKey);
			this.pollStationData();
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

	updateLogEnabledSetting(enabled)
	{
		if (enabled)
		{
			this.setSettings({ logEnabled: true });
		}
		else
		{
			this.setSettings({ logEnabled: false });
		}
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
		if (changedKeys.indexOf('logEnabled') >= 0)
		{
			setImmediate(() =>
			{
				this.homey.app.updateLogEnabledSetting(newSettings.logEnabled);
			});
		}
	}

	async getStationData(apiKey)
	{
		const stationDataArray = await this.homey.app.getAPIData(apiKey, this.macAddress);
		this.homey.app.updateLog(`getStationData: ${this.homey.app.varToString(stationDataArray)}`);
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
		this.homey.app.sendLog('diag', this.getSetting('replyEmail')).catch(this.error);
	}

}

module.exports = AmbientDevice;
