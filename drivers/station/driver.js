'use strict';

const AmbientDriver = require('../ambientDriver');

class StationDriver extends AmbientDriver
{

    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        this.feelLikeTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature_feelsLike_changed');
        this.dewPointTrigger = this.homey.flow.getDeviceTriggerCard('measure_temperature_dewPoint_changed');
        this.log('StationDriver has been initialized');
    }

    async triggerFeelLike(Device, Value)
    {
        // trigger the card
        this.homey.app.updateLog(`Triggering Feels Like changed with: ${Value}`);
        const tokens = { feelsLike: Value };
        const state = {};

        this.feelLikeTrigger.trigger(Device, tokens, state)
            .then(this.log('Trigger feelsLike'))
            .catch(this.error);
    }

    async triggerDewPoint(Device, Value)
    {
        // trigger the card
        this.homey.app.updateLog(`Triggering Dew Point like changed with: ${Value}`);
        const tokens = { dewPoint: Value };
        const state = {};

        this.dewPointTrigger.trigger(Device, tokens, state)
            .then(this.log('Trigger dewPoint'))
            .catch(this.error);
    }

    async onPairListDevices(ambientAPI, apiKey)
    {
        const devices = [];

        const stations = await ambientAPI.userDevices();
        this.homey.app.updateLog(`Detected Stations: ${this.homey.app.varToString(stations)}`);

        stations.forEach(station => {
                const data = {
                    id: station.macAddress,
                };
                const settings = {
                    apiKey,
                };

                let location = '';
                let name = '';
                if (station.info && station.info.coords)
                {
                    location = station.info.coords.location;
                    name = station.info.coords.name;
                }

                if (name === '')
                {
                    name = station.macAddress;
                }

                // Add this device to the table
                devices.push({
                        name: `${location} - ${name}`,
                        data,
                        settings,
                    });
            });

        return devices;
    }

}

module.exports = StationDriver;
