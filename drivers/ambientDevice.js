/* jslint node: true */

'use strict';

const Homey = require('homey');

class AmbientDevice extends Homey.Device
{

    async onInit()
    {
        this.macAddress = this.getData().id;
        // Setup real time notifications
        const apiKey = this.getSetting('apiKey');
        this.homey.app.registerRealTime(apiKey);
    }

    /**
     * onAdded is called when the user adds the device, called just after pairing.
     */
     async onAdded()
     {
         // Initialise with the current data
         const apiKey = this.getSetting('apiKey');
         this.getStationData(apiKey);

         this.log('Device has been added');
     }

     async getStationData(apiKey)
     {
         const stationDataArray = await this.homey.app.getAPIData(apiKey, this.macAddress);
         this.homey.app.updateLog(`getStationData: ${this.homey.app.varToString(stationDataArray)}`);
         if (stationDataArray && Array.isArray(stationDataArray) && (stationDataArray.length > 0))
         {
             const stationData = stationDataArray[0];
             this.updateStationData(stationData, true);
             return true;
         }

         return false;
     }

     setCapability(capability, value, addRemove)
     {
         if (value !== undefined)
         {
             if (this.hasCapability(capability))
             {
                 this.setCapabilityValue(capability, value).catch(this.error);
             }
             else if (addRemove)
             {
                 this.addCapability(capability).then(() =>
                 {
                     this.setCapabilityValue(capability, value).catch(this.error);
                 });
             }
         }
         else if (addRemove)
         {
             if (this.hasCapability(capability))
             {
                 this.removeCapability(capability).catch(this.error);
             }
         }
     }

     async onCapabilitySendLog(value)
     {
         this.homey.app.sendLog('diag');
     }

}

module.exports = AmbientDevice;
