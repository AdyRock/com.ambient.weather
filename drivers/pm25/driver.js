'use strict';

const AmbientDriver = require('../ambientDriver');

class PM25Driver extends AmbientDriver
{

    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        this.measure_aq_changedTrigger = this.homey.flow.getDeviceTriggerCard('measure_aq_changed');
        this.measure_aq_changedTrigger.registerRunListener(async (args, state) =>
        {
            // If true, this flow should run
            const argValue = parseInt(args.measure_aq, 10);

            if (args.compare_type === '<=')
            {
                // Check <=
                return state.value <= argValue;
            }
            if (args.compare_type === '==')
            {
                // Check <=
                return state.value === argValue;
            }
            if (args.compare_type === '>=')
            {
                // Check <=
                return state.value >= argValue;
            }

            return false;
        });

        this.log('PM25Driver has been initialized');
    }

    async triggerAQChanged(device, tokens, state)
    {
         this.measure_aq_changedTrigger.trigger(device, tokens, state).catch(this.error);
    }

    async onPairListDevices(ambientAPI, apiKey)
    {
        const devices = [];

        const stations = await ambientAPI.userDevices();
        this.homey.app.updateLog(`Detected Stations: ${this.homey.app.varToString(stations)}`);

        stations.forEach(station =>
        {
            if (station.lastData.pm25)
            {
                const data = {
                    id: station.macAddress,
                    inOut: '',
                };
                const settings = {
                    apiKey,
                };

                // Add this device to the table
                devices.push(
                {
                    name: `PM2.5 (${station.info.name} outside)`,
                    data,
                    settings,
                },
                );
            }

            if (station.lastData.pm25_in)
            {
                const data = {
                    id: station.macAddress,
                    inOut: '_in',
                };
                const settings = {
                    apiKey,
                };

                // Add this device to the table
                devices.push(
                {
                    name: `PM2.5 (${station.info.name} inside)`,
                    data,
                    settings,
                },
                );
            }
        });

        return devices;
    }

}

module.exports = PM25Driver;
