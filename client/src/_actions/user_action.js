import axios from 'axios';
import {
    LOGIN_USER, REGISTER_USER, AUTH_USER
} from './types';

export function loginUser(dataTosubmit) {
    const request = axios.post('/api/users/login', dataTosubmit)
        .then(response => response.data)

    return {//request를 reducer에게 넘겨주기 위한 action객체
        type: LOGIN_USER,
        payload: request
    }
}

//서버에서 받은 resonse.data를 request에다가 저장함

export function registerUser(dataTosubmit) {
    const request = axios.post('/api/users/register', dataTosubmit)
        .then(response => response.data)

    return {//request를 reducer에게 넘겨주기 위한 action객체
        type: REGISTER_USER,
        payload: request
    }
}

export function auth() {
    const request = axios.get('/api/users/auth')
        .then(response => response.data)

    return {
        type: AUTH_USER,
        payload: request
    }
}