import { Avatar } from 'primereact/avatar';
import './Comment.css'
import { CommentData } from '../types';

function Comment({ data }: { data: CommentData }) {
    return (
        <div className="comment-container">
            <Avatar icon="pi pi-user" shape="circle" size="large" className="comment-avatar" />
            <div className="comment-content">
                <div className="comment-meta">
                    <span className="user-id">User: {data.user_id.slice(0, 8)}</span>
                    <span className="comment-date">{new Date(data.created_at).toLocaleDateString()}</span>
                </div>
                <p className="comment-text">{data.comment_text}</p>
                <div className="comment-stats">
                    <i className="pi pi-heart-fill"></i>
                    <span>{data.upvotes} likes</span>
                </div>
            </div>
        </div>
    );
};

export default Comment
