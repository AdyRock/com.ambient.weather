/* eslint-disable max-len */

'use strict';

const AmbientDevice = require('../ambientDevice');

class SoilMoistureDevice extends AmbientDevice
{

    /**
     * onInit is called when the device is initialized.
     */
    async onInit()
    {
        super.onInit();
        this.deviceID = this.getData().deviceID;

        this.registerCapabilityListener('button.send_log', this.onCapabilitySendLog.bind(this));

        this.log('SoilMoistureDevice has been initialized');
    }

    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name)
    {
        this.log('SoilMoistureDevice was renamed');
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted()
    {
        this.log('SoilMoistureDevice has been deleted');
    }

	updateStationData(deviceData, addRemove)
	{
		if (deviceData && (addRemove || (deviceData.macAddress === this.macAddress)))
		{
			this.setCapability('measure_moisture', deviceData[`soilhum${this.deviceID}`], addRemove);
			this.setCapability('measure_temperature', (deviceData[`soiltemp${this.deviceID}f`] !== undefined) ? (((deviceData[`soiltemp${this.deviceID}f`] - 32) * 5) / 9) : deviceData[`soiltemp${this.deviceID}f`], addRemove);
			this.setCapability('alarm_battery', (deviceData[`battsm${this.deviceID}`] !== undefined) ? (deviceData[`battsm${this.deviceID}`] === 0) : deviceData[`battsm${this.deviceID}`], addRemove);
		}
    }

}

module.exports = SoilMoistureDevice;
