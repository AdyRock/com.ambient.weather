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

    updateStationData(stationData, addRemove)
    {
        if (stationData && (addRemove || (stationData.macAddress === this.macAddress)))
        {
            this.setCapability('measure_moisture', stationData[`soilhum${this.deviceID}`], addRemove);
            this.setCapability('measure_temperature', (stationData[`soiltemp${this.deviceID}f`] !== undefined) ? (((stationData[`soiltemp${this.deviceID}f`] - 32) * 5) / 9) : stationData[`soiltemp${this.deviceID}f`], addRemove);
            this.setCapability('alarm_battery', (stationData[`battsm${this.deviceID}`] !== undefined) ? (stationData[`battsm${this.deviceID}`] === 0) : stationData[`battsm${this.deviceID}`], addRemove);
        }
    }

}

module.exports = SoilMoistureDevice;
