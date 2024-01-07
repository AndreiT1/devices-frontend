<template>

    <!-- Button trigger modal -->
    <button 
        type="button" 
        class="btn btn-primary" 
        @click="openModal" 
        style="margin-left:5px"
        :disabled="editButtonIsDisabled"
    >
        Edit device
    </button>
    
    
    
    <!-- Modal -->
    <div class="modal fade" id="modal_demo" tabindex="-1" aria-labelledby="modal_demo_label" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modal_demo_label">Edit device</h5>
            <button type="button" class="btn-close" aria-label="Close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <input type="text" placeholder="Device ID" v-model="props.data.deviceId">
            <input type="text" placeholder="Device name" v-model="props.data.deviceName">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
            <button type="button" class="btn btn-primary" @click="editDevice">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    
    </template>
    
    <script setup>

    import { reactive, onMounted } from 'vue'
    import DeviceAPI from '../API/DeviceAPI';
    
    const state = reactive({
        modal: null,
    })

    const props = defineProps({
      data: Object
    });
    
    const emit = defineEmits(['updateDevice'])

    onMounted(() => {
        state.modal = new bootstrap.Modal('#modal_demo', {})
    })
    
    function openModal()
    {
        state.modal.show()
    }
    
    function closeModal()
    {
        state.modal.hide()
    }

   async function editDevice() {
    const devicesAPI = new DeviceAPI();
        try {
        const response = await devicesAPI.update({ name: props.data.deviceName, serial_number: props.data.deviceId});
        emit('updateDevice', response.data);
      } catch (e) {
        console.log(e)
      }
    }
    
    
    
    </script>
