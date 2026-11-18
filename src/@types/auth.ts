export interface LoginType {
    Email: string;
    Pass: string;
}

export interface GoogleLoginType {
    idToken: string;
}

export interface LoginResponse {
    message: string;
    token: string;
    data: {
        Uuid: string;
        Name: string;
        Email: string;
    };
}
