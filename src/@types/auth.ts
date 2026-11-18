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
        Id: number;
        Name: string;
        Email: string;
    };
}
