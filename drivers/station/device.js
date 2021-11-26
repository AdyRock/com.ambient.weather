'use strict';

const AmbientDevice = require('../ambientDevice');

class StationDevice extends AmbientDevice
{

    /**
     * onInit is called when the device is initialized.
     */
    async onInit()
    {
        super.onInit();
        this.registerCapabilityListener('button.send_log', this.onCapabilitySendLog.bind(this));

        this.log('StationDevice has been initialized');
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
        this.log('StationDevice settings where changed');
    }

    /**
     * onRenamed is called when the user updates the device's name.
     * This method can be used this to synchronise the name to the device.
     * @param {string} name The new name
     */
    async onRenamed(name)
    {
        this.log('StationDevice was renamed');
    }

    /**
     * onDeleted is called when the user deleted the device.
     */
    async onDeleted()
    {
        this.log('StationDevice has been deleted');
    }

    updateStationData(stationData, addRemove)
    {
        if (stationData && (addRemove || (stationData.macAddress === this.macAddress)))
        {
            this.setCapability('measure_temperature', (stationData.tempf !== undefined) ? (((stationData.tempf - 32) * 5) / 9) : stationData.tempf, addRemove);
            this.setCapability('measure_temperature.feelsLike', (stationData.feelsLike !== undefined) ? (((stationData.feelsLike - 32) * 5) / 9) : stationData.feelsLike, addRemove);
            this.setCapability('measure_temperature.dewPoint', (stationData.dewPoint !== undefined) ? (((stationData.dewPoint - 32) * 5) / 9) : stationData.dewPoint, addRemove);
            this.setCapability('measure_humidity', stationData.humidity, addRemove);

            this.setCapability('measure_wind_angle', stationData.winddir, addRemove);
            this.setCapability('measure_wind_strength', (stationData.windspeedmph !== undefined) ? (stationData.windspeedmph * 1.609344) : stationData.windspeedmph, addRemove);
            this.setCapability('measure_wind_strength.avg2m', (stationData.windspdmph_avg2m !== undefined) ? (stationData.windspdmph_avg2m * 1.609344) : stationData.windspdmph_avg2m, addRemove);
            this.setCapability('measure_wind_angle.avg2m', stationData.winddir_avg2m, addRemove);
            this.setCapability('measure_wind_strength.avg10m', (stationData.windspdmph_avg10m !== undefined) ? (stationData.windspdmph_avg10m * 1.609344) : stationData.windspdmph_avg10m, addRemove);
            this.setCapability('measure_wind_angle.avg10m', stationData.winddir_avg10m, addRemove);

            this.setCapability('measure_gust_angle', stationData.windgustdir, addRemove);
            this.setCapability('measure_gust_strength', (stationData.windgustmph !== undefined) ? (stationData.windgustmph * 1.609344) : stationData.windgustmph, addRemove);
            this.setCapability('measure_gust_strength.daily', (stationData.maxdailygust !== undefined) ? (stationData.maxdailygust * 1.609344) : stationData.maxdailygust, addRemove);

            this.setCapability('measure_radiation', stationData.solarradiation, addRemove);
            this.setCapability('measure_ultraviolet', stationData.uv, addRemove);

            this.setCapability('measure_rain', (stationData.eventrainin !== undefined) ? (stationData.eventrainin * 25.4) : stationData.eventrainin, addRemove);
            this.setCapability('measure_rain.rate', (stationData.hourlyrainin !== undefined) ? (stationData.hourlyrainin * 25.4) : stationData.hourlyrainin, addRemove);
            this.setCapability('measure_rain.total', (stationData.totalrainin !== undefined) ? (stationData.totalrainin * 25.4) : stationData.totalrainin, addRemove);
            this.setCapability('measure_rain.today', (stationData.dailyrainin !== undefined) ? (stationData.dailyrainin * 25.4) : stationData.dailyrainin, addRemove);
            this.setCapability('measure_rain.period24', (stationData['24hourrainin'] !== undefined) ? (stationData['24hourrainin'] * 25.4) : stationData['24hourrainin'], addRemove);
            this.setCapability('measure_rain.week', (stationData.weeklyrainin !== undefined) ? (stationData.weeklyrainin * 25.4) : stationData.weeklyrainin, addRemove);
            this.setCapability('measure_rain.month', (stationData.monthlyrainin !== undefined) ? (stationData.monthlyrainin * 25.4) : stationData.monthlyrainin, addRemove);
            this.setCapability('measure_rain.year', (stationData.yearlyrainin !== undefined) ? (stationData.yearlyrainin * 25.4) : stationData.yearlyrainin, addRemove);

            this.setCapability('alarm_battery', (stationData.battout !== undefined) ? (stationData.battout === 0) : stationData.battout, addRemove);
        }
    }

}

module.exports = StationDevice;
