/* jslint node: true */

'use strict';

const { Driver } = require('homey');

class AmbientDriver extends Driver
{

    async onPair(session)
    {
        let { apiKey } = this.homey.app;
        let ambientAPI = null;

        session.setHandler('list_devices', async () =>
        {
            try
            {
                return await this.onPairListDevices(ambientAPI, apiKey);
            }
            catch (err)
            {
                throw new Error(err.message);
            }
        });

        session.setHandler('connection_setup', async () =>
        {
            // Initialise page with last used token
            return { apiKey };
        });

        session.setHandler('validate', async data =>
        {
            if (!data.apiKey)
            {
                return { ok: false, err: this.homey.__('settings.missingPassword') };
            }

            try
            {
                ambientAPI = await this.homey.app.getAPIInstance(data.apiKey);

                // Successful connection so save the credentials
                apiKey = data.apiKey;
                this.homey.app.apiKey = apiKey;
                this.homey.settings.set('APIToken', apiKey);
                return { ok: true };
            }
            catch (err)
            {
                this.homey.app.updateLog(`Error creating API: ${err.message}`);
                return { ok: false, err: err.message };
            }
        });
    }

    async onRepair(session, device)
    {
        // Argument socket is an EventEmitter, similar to Driver.onPair
        // Argument device is a Homey.Device that's being repaired
        let apiKey = device.getSetting('apiKey');

        session.setHandler('connection_setup', async () =>
        {
            // Initialise page with last used token
            return { apiKey };
        });

        session.setHandler('validate', async data =>
        {
            if (!data.apiKey)
            {
                return { ok: false, err: this.homey.__('settings.missingPassword') };
            }

            try
            {
                if (await device.getStationData(data.apiKey))
                {
                    // Successful connection so save the credentials
                    apiKey = data.apiKey;
                    this.homey.app.apiKey = apiKey;
                    this.homey.settings.set('APIToken', apiKey);
                    return { ok: true };
                }

                return { ok: false, err: 'Failed to fetch data' };
            }
            catch (err)
            {
                this.homey.app.updateLog(`Error creating API: ${err.message}`);
                return { ok: false, err: err.message };
            }
        });
    }

}

module.exports = AmbientDriver;
