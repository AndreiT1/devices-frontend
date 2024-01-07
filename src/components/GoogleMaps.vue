<template>
  <div style="display: flex;">
    <div style="width: 100%;">
      <div style="margin-bottom: 10px;">
      <input type="text" placeholder="Device ID" v-model="deviceId" style="margin-left: 5px;">
      <input type="text" placeholder="Device name" v-model="deviceName" style="margin-left: 5px;">
      <button @click="addDevice" type='button' class="btn btn-primary" style="margin-left: 5px;" :disabled="checkIfButtonIsDissabled()">Add device</button>
      <button @click="deleteDevice" type='button' class="btn btn-secondary" style="margin-left: 5px;" :disabled="hasMarkerBeenSelected">Delete device</button>
      <EditModal :editButtonIsDisabled="hasMarkerBeenSelected" :data="{deviceName,deviceId}" @updateDevice="updateLocations"></EditModal>
    </div>
      <Suspense>
        <GoogleMap api-key="AIzaSyBEpXu8KHfjY3bWhCqVAxR29WGqq9FG84A"
                   style="width: 100%; height: 700px"
                   :center="center"
                   :zoom="2"
                   :scrollWheel="false"
                   :zoomControl="false"
                   :scaleControl="false"
                   :disableDoubleClickZoom="true"
                   @click="setMarkerOnMap">
          <MarkerCluster>
            <Marker v-for="(location, i) in locations"
                    :options="{ position: location,icon: 'icons/'+ location.status +'.png', title: location.title}"
                    :key="i" @click="handleOnClickMarker(location)" />
          </MarkerCluster>
        </GoogleMap>
      </Suspense>
      <button type='button' class="btn btn-secondary" @click="randomizeDeviceStatuses">Update statuses</button>
    </div>
  </div>
</template>

<script>
import { GoogleMap, Marker } from 'vue3-google-map'
import { reactive, ref } from 'vue'
import { pusher } from '../pusher'
import DeviceAPI from '../API/DeviceAPI'
import EditModal from './EditModal.vue'

export default {
  components: { GoogleMap, Marker, EditModal },
  setup() {
    const devicesAPI = new DeviceAPI()
    devicesAPI.index().then((response) => {
      response.data.forEach(element => {
        locations.push({
          title: element.name,
          serialNumber: element.serial_number,
          lat: element.latitude,
          lng: element.longitude,
          status: element.device_last_status.status
        })
      })
    })
    const channel = pusher.subscribe('status-notification')

    channel.bind('status.notification', function(data) {
      const updatedStatusLocation = JSON.parse(data.message)
      locations.forEach((location) => {
        if (location.serialNumber === updatedStatusLocation.serial_number) {
          location.status = updatedStatusLocation.status
        }
      })
    })
    const deviceId = ref('')
    const deviceName = ref('')
    const hasMarkerBeenSelected = ref(true);
    let newMarker = reactive({})
    let locations = reactive([])

    function handleOnClickMarker(location) {
      deviceName.value = location.title
      deviceId.value = location.serialNumber
      hasMarkerBeenSelected.value = false;
    }

    function setMarkerOnMap(event) {
      if (Object.keys(newMarker).length === 0) {
        newMarker = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
          title: deviceName.value,
          serialNumber: deviceId.value,
          status: 0
        }
        locations.push(newMarker)
      }
    }

    function checkIfButtonIsDissabled() {
      if (deviceId.value.length > 0 && deviceName.value.length > 0 && Object.keys(newMarker).length > 0) {
        return false
      }
      return true
    }
    function updateLocations(data) {
      console.log(data);
      locations.forEach((location) => {
          if (location.serialNumber === data.serial_number) {
            location.title = data.name
          }
        })
    }

    async function addDevice() {
      await devicesAPI.create({
        serialNumber: deviceId.value,
        deviceName: deviceName.value,
        lat: newMarker.lat,
        long: newMarker.lng
      })
      newMarker = {}
      // deviceId.value = '';
      // deviceName.value = '';
    }

    async function editDevice() {
      try {
        const response = await devicesAPI.update({ name: deviceName.value, serial_number: deviceId.value })
        locations.forEach((location) => {
          if (location.serialNumber === response.data.serial_number) {
            location.title = response.data.name
          }
        })
        deviceId.value = ''
        deviceName.value = ''
      } catch (e) {
        console.log(e)
      }
    }

    async function randomizeDeviceStatuses() {
      await devicesAPI.randomizeDeviceStatuses()
    }
    async function deleteDevice() {
      try {
      await devicesAPI.delete(deviceId.value);
      locations = locations.filter(function(location) {
          return location.serialNumber !== deviceId.value;
        })
      } catch (e) {
        console.log(e);
      }
    }
  

    const center = { lat: 40.689247, lng: -74.044502 }
    return {
      center,
      randomizeDeviceStatuses,
      editDevice,
      setMarkerOnMap,
      locations,
      deviceId,
      deviceName,
      addDevice,
      checkIfButtonIsDissabled,
      handleOnClickMarker,
      updateLocations,
      deleteDevice
    }
  }
}
</script>

