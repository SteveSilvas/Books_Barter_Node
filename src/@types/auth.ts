export interface LoginType {
    Email: string;
    Pass: string;
}

export interface LoginResponse {
    message: string;
    data: {
        Id: number;
        Name: string;
        Email: string;
    };
}
