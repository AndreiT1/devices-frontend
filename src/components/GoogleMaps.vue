<template>
  <div style="display: flex;">
  <div >
    <input type="text" placeholder="Device ID" v-model="deviceId">
    <input type="text" placeholder="Device name" v-model="deviceName">
    <button v-if="hasMarkerBeenSelected" @click="editDevice">Edit device</button>
    <button v-else @click="addDevice" :disabled="checkIfButtonIsDissabled()">Add device</button>
    <Suspense>
  <GoogleMap api-key="AIzaSyBEpXu8KHfjY3bWhCqVAxR29WGqq9FG84A" 
  style="width: 100%; height: 700px" 
  :center="center" 
  :zoom="2"
  @click="setMarkerOnMap">
  <MarkerCluster>
      <Marker v-for="(location, i) in locations"
      :options="{ position: location,icon: 'icons/'+ location.status +'.png', title: location.title}" :key="i" @click="handleOnClickMarker(location)"/>
    </MarkerCluster>
  </GoogleMap>
</Suspense>
<button @click="randomizeDeviceStatuses">Update statuses</button>
</div>
<div>
  <img src="legend.png" width="600" height="500">
</div>
</div>
</template>

<script>
import { GoogleMap, Marker } from "vue3-google-map";
import { reactive, ref } from "vue";
import {pusher} from '../pusher';
import DeviceAPI from '../API/DeviceAPI';
export default {
  components: { GoogleMap, Marker },
   setup() {
    const devicesAPI = new DeviceAPI();
    devicesAPI.index().then((response) => {
      response.data.forEach(element => {
       locations.push({
        title: element.name,
        serialNumber: element.serial_number,
        lat: element.latitude,
        lng: element.longitude,
        status: element.device_last_status.status
       });
      });
    });
    const channel = pusher.subscribe('status-notification');
    
    channel.bind("status.notification", function(data) {
        const updatedStatusLocation = JSON.parse(data.message);
        locations.forEach((location) => {
          if(location.serialNumber === updatedStatusLocation.serial_number) {
            location.status = updatedStatusLocation.status;
          }
        }) 
    });
    const deviceId = ref('');
    const deviceName = ref('');
    let hasMarkerBeenSelected = ref(false);
    const addOrEditDevice = ref('Add device');
    let newMarker = reactive({});
    let locations = reactive([]);
    
    function handleOnClickMarker(location) {
      deviceName.value = location.title;
      deviceId.value = location.serialNumber;
      hasMarkerBeenSelected.value = true;
    }
    function setMarkerOnMap(event) {
      if(Object.keys(newMarker).length === 0) {
        newMarker = {lat:event.latLng.lat(), lng: event.latLng.lng(), title: deviceName.value, serialNumber: deviceId.value, status: 0};
        locations.push(newMarker);
      } 
      hasMarkerBeenSelected.value = false;
    }
    function onDragMarkerEvent(location) {
      console.log(location);
    }

    function checkIfButtonIsDissabled() {
      if(deviceId.value.length > 0 && deviceName.value.length>0 && Object.keys(newMarker).length > 0){
        return false;
      }
      return true;
    }
    async function addDevice() {
      await devicesAPI.create({
        serialNumber : deviceId.value,
        deviceName : deviceName.value,
        lat : newMarker.lat,
        long : newMarker.lng
      });
      newMarker = {}
      // deviceId.value = '';
      // deviceName.value = '';
    }

    async function editDevice() {
      try {
        const response = await devicesAPI.update({name: deviceName.value, serial_number: deviceId.value});
        locations.forEach((location)=> {
            if(location.serialNumber === response.data.serial_number) {
              location.title = response.data.name;
            }
        })
        hasMarkerBeenSelected.value = false;
        deviceId.value = '';
        deviceName.value = '';
      } catch(e) {
        console.log(e);
      }
    }
    async function randomizeDeviceStatuses() {
      await devicesAPI.randomizeDeviceStatuses();
    }

    const center = { lat: 40.689247, lng: -74.044502 };
    return { center , randomizeDeviceStatuses, editDevice, hasMarkerBeenSelected, addOrEditDevice, setMarkerOnMap, locations, deviceId,deviceName, addDevice, checkIfButtonIsDissabled, onDragMarkerEvent, handleOnClickMarker};
  },
};
</script>

