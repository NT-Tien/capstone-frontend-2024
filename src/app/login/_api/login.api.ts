import axios, { AxiosResponse } from 'axios';
import { URL_API_BACKEND } from '@/common/url-api-backend.common';
import { message } from 'antd';
import { decodeCommon } from '@/common/decode.common';

export type LoginRequest = {
    username: string;
    password: string;
};

type LoginResponse = {
    data: any;
    statusCode: number;
    message: string;
};

export const loginApi = async (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> => {
    var result = await axios.post(`${URL_API_BACKEND}/auth/login`, data).then((response) => {
        localStorage.setItem('token', response.data.data);
        message.success(response.data.message);
        return response;
    }).catch((error) => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        message.error(error.response.data.message);
        return error
    });
    // decode token
    var token = localStorage.getItem('token') as string;
    var payload = decodeCommon(token);
    localStorage.setItem('user', JSON.stringify(payload));
    // check role to redirect
    if (payload.role === 'admin') {
        window.location.href = '/admin';
    } else {
        window.location.href = '/user';
    }
    return result;
};