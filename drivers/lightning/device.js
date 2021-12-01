'use strict';

const AmbientDevice = require('../ambientDevice');

class LightningDevice extends AmbientDevice
{

    /**
     * onInit is called when the device is initialized.
     */
    async onInit()
    {
        super.onInit();
        this.inOut = this.getData().inOut;

        this.registerCapabilityListener('button.send_log', this.onCapabilitySendLog.bind(this));

        this.lightning_time = this.getStoreValue('lightning_time');
        if (this.lightning_time === null)
        {
            this.lightning_time = this.getCapabilityValue('measure_lightning_time');
        }

        this.log('Lightning Device has been initialized');
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
        this.log('Lightning Device settings where changed');
        if (changedKeys.indexOf('timeFormat') >= 0)
        {
            this.setCapabilityValue('measure_lightning_time', this.convertDate(this.lightning_time, newSettings));
        }
        if (changedKeys.indexOf('logEnabled') >= 0)
        {
            setImmediate(() =>
            {
                this.homey.app.updateLogEnabledSetting(newSettings.logEnabled);
            });
        }
    }

    convertDate(date, settings)
    {
        let strDate = '';
        if (date)
        {
            const tz = this.homey.clock.getTimezone();
            const lang = this.homey.i18n.getLanguage();

            const dateZero = new Date(0);
            const offset = dateZero.toLocaleString(lang, { hour: '2-digit', hour12: false, timeZone: tz });

            const dataNum = (parseInt(offset, 10) * 60 * 60) + parseInt(date, 10);

            const d = new Date(dataNum * 1000);

            if (settings.timeFormat === 'mm_dd')
            {
                const mins = d.getMinutes();
                const dte = d.getDate();
                const month = d.toLocaleString(lang, { month: 'short' });
                strDate = `${d.getHours()}:${mins < 10 ? '0' : ''}${mins} ${month}${dte < 10 ? ' 0' : ' '}${dte}`;
            }
            else if (settings.timeFormat === 'system')
            {
                strDate = d.toLocaleString();
            }
            else if (settings.timeFormat === 'time_stamp')
            {
                strDate = d.toJSON();
            }
            else
            {
                strDate = date;
            }
        }

        return strDate;
    }

    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name)
    {
        this.log('Lightning Device was renamed');
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted()
    {
        this.log('Lightning Device has been deleted');
    }

    updateStationData(stationData, addRemove)
    {
        if (stationData && (addRemove || (stationData.macAddress === this.macAddress)))
        {
            this.setCapability('measure_lightning', stationData.lightning_distance, addRemove);
            this.setCapability('measure_lightning_num', stationData.lightning_day, addRemove);

            const settings = this.getSettings();
            if (stationData.lightning_time !== '')
            {
                this.lightning_time = stationData.lightning_time;
                this.setStoreValue('lightning_time', this.lightning_time);
                this.setCapability('measure_lightning_time', this.convertDate(this.lightning_time, settings), addRemove);
            }

            this.setCapability('alarm_battery', stationData.batt_lightning === 0, addRemove);
        }
    }

}

module.exports = LightningDevice;
