import './PostDetailsPage.css'
import { Card } from 'primereact/card';
import { DataView } from 'primereact/dataview';
import Comment from '../components/Comment';
import { Tag } from 'primereact/tag';
import { CommentsData, PostData } from '../types';
import { useLoaderData } from 'react-router';

const PostDetailsPage = () => {
    const { post, comments } = useLoaderData() as { post: PostData, comments: CommentsData[] };

    const commentTemplate = (comment: CommentsData) => {
        return (<Comment data={comment} />);
    };

    if (!post) return <div className="p-4">Loading Post...</div>;

    return (
        <div className="post-details-container">
            <div className="post-details-wrapper">
                {/* Main Post Content */}
                <Card className="post-card">
                    <div className="post-header-row">
                        <Tag value={post.category} severity="info" rounded />
                        <span className="text-secondary">
                            <i className="pi pi-calendar" style={{ marginRight: '5px' }}></i>
                            {new Date(post.created_at).toLocaleDateString()}
                        </span>
                    </div>

                    <h1 className="post-title-text">{post.title}</h1>

                    {/* Author Meta */}
                    <div className="author-info-box">
                        <i className="pi pi-user" style={{ fontSize: '1.5rem' }}></i>
                        <div className="author-details">
                            <span className="author-name">{post.username}</span>
                            <small className="author-location">Location: {post.country_code}</small>
                        </div>
                    </div>

                    <p className="post-body-text">
                        {post.body}
                    </p>

                    <div className="post-footer-stats">
                        <span className="stat-item">
                            <i className="pi pi-eye"></i>{post.view_count} Views
                        </span>
                        <span className="stat-item">
                            <i className="pi pi-comments"></i>{comments.length} Comments
                        </span>
                    </div>
                </Card>

                {/* Comments Section */}
                <h3 className="discussion-title">Discussion</h3>
                <Card>
                    <DataView
                        value={comments}
                        itemTemplate={commentTemplate}
                        emptyMessage="No comments yet. Be the first to join the discussion!"
                    />
                </Card>
            </div>
        </div>
    );
};

export default PostDetailsPage;
