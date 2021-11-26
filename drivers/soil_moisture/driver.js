'use strict';

const AmbientDriver = require('../ambientDriver');

class SoilMoistureDriver extends AmbientDriver
{

    /**
     * onInit is called when the driver is initialized.
     */
    async onInit()
    {
        this.measure_moisture_changedTrigger = this.homey.flow.getDeviceTriggerCard('measure_moisture_changed');
        this.measure_moisture_is_lessTrigger = this.homey.flow.getDeviceTriggerCard('measure_moisture_is_less');
        this.measure_moisture_is_lessTrigger.registerRunListener(async (args, state) =>
        {
            // If true, this flow should run
            return state.value < args.value;
        });

        this.measure_moisture_is_greaterTrigger = this.homey.flow.getDeviceTriggerCard('measure_moisture_is_greater');
        this.measure_moisture_is_greaterTrigger.registerRunListener(async (args, state) =>
        {
            // If true, this flow should run
            return state.value > args.value;
        });

        this.log('SoilMoistureDriver has been initialized');
    }

    triggerMeasureMoistureChanged(device, moisture)
    {
        const tokens = {
            value: moisture,
        };
        const state = {
            value: moisture,
        };

        this.measure_moisture_changedTrigger.trigger(device, tokens)
            .catch(this.error);

        this.measure_moisture_is_lessTrigger.trigger(device, tokens, state)
            .catch(this.error);

        this.measure_moisture_is_greaterTrigger.trigger(device, tokens, state)
            .catch(this.error);
    }

    async onPairListDevices(ambientAPI, apiKey)
    {
        const devices = [];

        const stations = await ambientAPI.userDevices();
        this.homey.app.updateLog(`Detected Stations: ${this.homey.app.varToString(stations)}`);

        stations.forEach(station =>
        {
            for (let i = 1; i <= 10; i++)
            {
                const moistureParam = `soilhum${i}`;
                if (station.lastData[moistureParam])
                {
                    const data = {
                        id: station.macAddress,
                        deviceID: i,
                    };
                    const settings = {
                        apiKey,
                    };

                    // Add this device to the table
                    devices.push(
                    {
                        name: `Soil sensor ${i}`,
                        data,
                        settings,
                    },
                    );
                }
            }
        });

        return devices;
    }

}

module.exports = SoilMoistureDriver;
