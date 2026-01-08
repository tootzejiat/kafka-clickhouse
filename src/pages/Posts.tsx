import './Posts.css'
import { dbClient } from '../client';
import { PostData } from '../types';
import Post from '../components/Post';
import { useEffect, useRef, useState } from 'react';
import { DataScroller } from 'primereact/datascroller';
import { Button } from 'primereact/button';

export default function PostsPage() {
    const [posts, setPosts] = useState<PostData[]>();
    const [page, setPage] = useState<number>(0)
    const ds = useRef<null>(null);

    const footer = <Button label="Load More" onClick={() => setPage(page + 1)} />;

    const itemTemplate = (post: PostData) => {
        return (
            <div className="col-12">
                <Post data={post} />
            </div>
        );
    };

    useEffect(() => {
        const getPosts = async () => {
            await dbClient.command({
                query: `SYSTEM RELOAD DICTIONARY users_dict;`
            })

            const resultSet = await dbClient.query({
                query: `
                    SELECT 
                    p.*,
                    dictGet('users_dict', 'username', p.user_id) AS username,
                    dictGet('users_dict', 'country_code', p.user_id) AS country_code
                    FROM posts AS p
                    ORDER BY p.created_at DESC 
                    LIMIT 200 OFFSET ${page};`,
                format: 'JSONEachRow',
            });

            const newPosts: PostData[] = await resultSet.json();

            setPosts((prev) => [...prev ?? [], ...newPosts ?? []])
        }

        getPosts()
    }, [page])

    return (
        <div className="posts-page-container">
            <h2 className="page-title">Available Posts</h2>

            <DataScroller
                ref={ds}
                value={posts}
                itemTemplate={itemTemplate}
                rows={5}
                inline
                scrollHeight="50rem"
                footer={footer}
            />
        </div>
    );
}
