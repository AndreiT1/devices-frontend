<template>
  <div>
    <input type="text" placeholder="Device ID" v-model="deviceId">
    <input type="text" placeholder="Device name" v-model="deviceName">
    <button @click="addDevice" :disabled="checkIfButtonIsDissabled()">Add device</button>
    <Suspense>
  <GoogleMap api-key="AIzaSyBEpXu8KHfjY3bWhCqVAxR29WGqq9FG84A" 
  style="width: 100%; height: 700px" 
  :center="center" 
  :zoom="2"
  @click="setMarkerOnMap">
  <MarkerCluster>
      <Marker v-for="(location, i) in locations"
      :options="{ position: location,icon: 'icons/'+ location.status +'.png', title: location.title}" :key="i"/>
    </MarkerCluster>
  </GoogleMap>
</Suspense>
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
    devicesAPI.index().then((response)=> {
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
    let newMarker = reactive({});
    let locations = reactive([]);
    
   
    function setMarkerOnMap(event) {
      if(Object.keys(newMarker).length === 0) {
        locations.push({lat:event.latLng.lat(), lng: event.latLng.lng(), title: deviceName.value, serialNumber: deviceId.value, status: 0});
        newMarker = {lat:event.latLng.lat(), lng: event.latLng.lng() }
      } 
    }
    function onDragMarkerEvent(location) {
      console.log(location);
    }

    function checkIfButtonIsDissabled() {
      console.log(Object.keys(newMarker).length);
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
      deviceId.value = '';
      deviceName.value = '';
    }

    function updateDevice() {
      console.log('')
    }

    const center = { lat: 40.689247, lng: -74.044502 };
    return { center , setMarkerOnMap, locations, deviceId,deviceName, addDevice, checkIfButtonIsDissabled, onDragMarkerEvent};
  },
};
</script>

