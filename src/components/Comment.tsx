import { Avatar } from 'primereact/avatar';
import './Comment.css'
import { CommentsData } from '../types';

function Comment({ data }: { data: CommentsData }) {
    return (
        <div className="comment-container">
            <Avatar icon="pi pi-user" shape="circle" size="large" className="comment-avatar" />
            <div className="comment-content">
                <div className="comment-meta">
                    <span className="user-id">User: {data.comment_author}</span>
                    <span className="comment-date">{new Date(data.comment_created_at).toLocaleDateString()}</span>
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
