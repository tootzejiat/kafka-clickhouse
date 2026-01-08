export interface StatusMonthlyUserData {
    date: number,
    active: number,
    inactive: number,
    banned: number,
}

export interface GeographyMonthlyUserData {
    count: number,
    country_code: string
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

const ChartType = {
    GEO: "geography",
    STATUS: "status"
} as const

export type ChartType = typeof ChartType[keyof typeof ChartType];

export interface PostData {
    post_id: string; // UUID
    user_id: string; // UUID
    title: string;
    body: string;
    category: string;
    view_count: number;
    created_at: string;
}

export interface CommentData {
    comment_id: string;
    post_id: string;
    user_id: string;
    comment_text: string;
    upvotes: number;
    created_at: string;
    is_deleted: number;
}

export interface CommentData {
    comment_id: string; // UUID
    post_id: string;    // UUID
    user_id: string;    // UUID
    comment_text: string;
    upvotes: number;
    created_at: string;
}
