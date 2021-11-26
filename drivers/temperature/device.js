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
     * onSettings is called when the user updates the device's settings.
     * @param {object} event the onSettings event data
     * @param {object} event.oldSettings The old settings object
     * @param {object} event.newSettings The new settings object
     * @param {string[]} event.changedKeys An array of keys changed since the previous version
     * @returns {Promise<string|void>} return a custom message that will be displayed
     */
    async onSettings({ oldSettings, newSettings, changedKeys })
    {
        this.log('TemperatureDevice settings where changed');
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

    updateStationData(stationData, addRemove)
    {
        if (stationData && (addRemove || (stationData.macAddress === this.macAddress)))
        {
            // eslint-disable-next-line max-len
            this.setCapability('measure_temperature', (stationData[`temp${this.deviceID}f`] !== undefined) ? (((stationData[`temp${this.deviceID}f`] - 32) * 5) / 9) : stationData[`temp${this.deviceID}f`], addRemove);
            this.setCapability('measure_humidity', stationData[`humidity${this.deviceID}`], addRemove);
            this.setCapability('measure_pressure', (stationData.baromrelin !== undefined) ? stationData.baromrelin * 33.8639 : stationData.baromrelin, addRemove);

            this.setCapability('alarm_battery', (stationData[`batt${this.deviceID}`] !== undefined) ? (stationData[`batt${this.deviceID}`] === 0) : stationData[`batt${this.deviceID}`], addRemove);
        }
    }

}

module.exports = TemperatureDevice;
