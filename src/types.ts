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

export interface PostDetailsData {
    post_id: string; // uuid
    author: string;
    country_code: string;
    title: string;
    body: string;
    category: string;
    view_count: number;
    post_created_at: string;
    comment_author: string;
    comment_id: string;
    comment_text: string;
    upvotes: number;
    comment_created_at: string;
    is_deleted: number;
}

export interface PostData {
    post_id: string; // uuid
    username: string;
    country_code: string;
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

export interface CommentsData {
    comment_id: string;
    comment_text: string;
    upvotes: number;
    comment_created_at: string;
    is_deleted: number;
    comment_author: string;
}

export interface EngagementRatio {
    post_id: string; // uuid
    username: string;
    title: string;
    category: string;
    view_count: number;
    created_at: string;
    total_comments: number;
    rank_in_category: number;
    ratio: number;
}

export interface HourlyActivityData {
    hour: number,
    avg_ratio_per_hour: number
}

export interface CountryVSGlobalEngagementData {
    country_avg: number;
    global_avg: number;
}

export interface ViralVelocityData {
    post_id: string;
    hours_since_posted: number;
    ratio: number;
}
