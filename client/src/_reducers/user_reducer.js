import {
    LOGIN_USER, REGISTER_USER, AUTH_USER
} from '../_actions/types';


export default function (state = {}, action) {
    switch (action.type) { //type별로 다른 조치를 취하기 위해
        case LOGIN_USER:
            return { ...state, loginSuccess: action.payload } //...은 위의 state를 그대로 가져오는 것
            break;
        case REGISTER_USER:
            return { ...state, register: action.payload }
            break;
        case AUTH_USER:
            return { ...state, userData: action.payload }
            break;
        default:
            return state;
    }
}