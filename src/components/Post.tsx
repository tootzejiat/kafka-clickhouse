import './Post.css'
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { PostData } from '../types';
import { useNavigate } from 'react-router';

function Post({ data }: { data: PostData }) {
    let navigate = useNavigate();
    // Top bar with Category and View Count
    const header = (
        <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem' }}>
            <Badge value={data.category} severity="info"></Badge>
            <span className="view-count">
                <i className="pi pi-eye" style={{ marginRight: '5px' }}></i>
                {data.view_count.toLocaleString()} views
            </span>
        </div>
    );

    // Sub-title with Author and Country
    const subTitle = (
        <div className="post-subtitle" style={{ fontSize: '0.9rem', color: 'var(--text-color-secondary)' }}>
            <i className="pi pi-user" style={{ marginRight: '5px' }}></i>
            <strong>{data.username || 'Unknown Author'}</strong>
            {data.country_code && <span className="ml-2"> from {data.country_code}</span>}
        </div>
    );

    // Footer with Date and Action
    const footer = (
        <div className="post-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small className="text-secondary">
                {new Date(data.created_at).toLocaleDateString()}
            </small>
            <Button label="Read More" icon="pi pi-chevron-right" iconPos="right" text onClick={() => navigate(`/posts/${data.post_id}`)} />
        </div>
    );

    return (
        <Card
            title={data.title}
            subTitle={subTitle}
            header={header}
            footer={footer}
            className="custom-post-card mb-4"
        >
            <p className="post-body" style={{ lineHeight: '1.5' }}>
                {data.body.length > 150 ? `${data.body.substring(0, 150)}...` : data.body}
            </p>
        </Card>
    );
};

export default Post;
