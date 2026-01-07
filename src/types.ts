export interface MonthlyUserData {
    date: number,
    active: number,
    inactive: number,
    banned: number,
}

export interface UserRegistrationData {
    username: string,
    email: string,
    status: string,
    country_code: string,
    signup_date: string
}

export interface LiveData {
    sec: string,
    count: number
}
