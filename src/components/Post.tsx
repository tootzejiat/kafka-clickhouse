import './Post.css'
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { PostData } from '../types';

function Post({ data }: { data: PostData }) {
    const header = (
        <div className="post-header">
            <Badge value={data.category} severity="warning"></Badge>
            <span className="view-count">
                <i className="pi pi-eye"></i> {data.view_count} views
            </span>
        </div>
    );

    return (
        <Card title={data.title} header={header} className="custom-post-card">
            <p className="post-body">{data.body}</p>
            <div className="post-footer">
                <Button label="View Post" icon="pi pi-chevron-right" iconPos="right" text />
            </div>
        </Card>
    );
};

export default Post
