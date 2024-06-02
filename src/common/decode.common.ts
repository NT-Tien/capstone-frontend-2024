import { Role } from "./role.common";

type Payload = {
    id: string;
    username: string;
    phone: string;
    role: Role;
};

export function decodeCommon(token: string): Payload {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    var payload = JSON.parse(jsonPayload);
    return payload;
}