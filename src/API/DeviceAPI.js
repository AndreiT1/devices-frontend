import axios from 'axios';

export default class DeviceAPI {
    url = '';
    axios;
    constructor(){
        this.axios = axios;
        this.axios.defaults.baseURL= import.meta.env.VITE_BACKEND_API_URL;
    }
    index(){
        return this.axios({
            url: 'api/devices',
            method: 'get'
        });
    }

    show(id){
        return this.axios({
            url: 'api/device/'+id,
            method: 'get'
        });
    }

    create(data){
        return this.axios({
            url: 'api/device',
            data: data,
            method: 'post'
        });
    }

    update(data){
        return this.axios({
            url: 'api/device',
            data: data,
            method: 'put'
        });
    }

    delete(id){
        return this.axios({
            url: 'api/device'+id,
            method: 'delete'
        });
    }

    randomizeDeviceStatuses() {
        return this.axios({
            url: 'api/device/status/randomize',
            method: 'get'
        });
    }
}
