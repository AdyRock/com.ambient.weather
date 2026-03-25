'use strict';

const AmbientDevice = require('../ambientDevice');

class TemperatureDevice extends AmbientDevice
{

	/**
	 * onInit is called when the device is initialized.
	 */
	async onInit()
	{
		super.onInit();
		this.deviceID = this.getData().deviceID;

		this.registerCapabilityListener('button.send_log', this.onCapabilitySendLog.bind(this));

		this.log('TemperatureDevice has been initialized');
	}

	/**
	 * onRenamed is called when the user updates the device's name.
	 * This method can be used this to synchronise the name to the device.
	 * @param {string} name The new name
	 */
	async onRenamed(name)
	{
		this.log('TemperatureDevice was renamed');
	}

	/**
	 * onDeleted is called when the user deleted the device.
	 */
	async onDeleted()
	{
		this.log('TemperatureDevice has been deleted');
	}

	updateStationData(deviceData, addRemove)
	{
		if (deviceData && (addRemove || (deviceData.macAddress === this.macAddress)))
		{
			// eslint-disable-next-line max-len
			this.setCapability('measure_temperature', (deviceData[`temp${this.deviceID}f`] !== undefined) ? (((deviceData[`temp${this.deviceID}f`] - 32) * 5) / 9) : deviceData[`temp${this.deviceID}f`], addRemove);
			this.setCapability('measure_humidity', deviceData[`humidity${this.deviceID}`], addRemove);
			this.setCapability('measure_pressure', (deviceData.baromrelin !== undefined) ? deviceData.baromrelin * 33.8639 : deviceData.baromrelin, addRemove);

			this.setCapability('alarm_battery', (deviceData[`batt${this.deviceID}`] !== undefined) ? (deviceData[`batt${this.deviceID}`] === 0) : deviceData[`batt${this.deviceID}`], addRemove);
		}
	}

}

module.exports = TemperatureDevice;
