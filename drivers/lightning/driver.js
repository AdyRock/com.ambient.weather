'use strict';

const AmbientDriver = require('../ambientDriver');

class LightningDriver extends AmbientDriver
{

    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        this.log('Lightning Driver has been initialized');
    }

    async onPairListDevices(ambientAPI, apiKey)
    {
        const devices = [];

        const stations = await ambientAPI.userDevices();
        this.homey.app.updateLog(`Detected Stations: ${this.homey.app.varToString(stations)}`);

        stations.forEach(station =>
        {
            if (station.lastData.lightning_distance)
            {
                const data = {
                    id: station.macAddress,
                };
                const settings = {
                    apiKey,
                };

                // Add this device to the table
                devices.push(
                {
                    name: `Lightning (${station.info.name})`,
                    data,
                    settings,
                },
                );
            }
        });

        return devices;
    }

}

module.exports = LightningDriver;
