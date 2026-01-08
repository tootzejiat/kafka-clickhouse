import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/viva-dark/theme.css";
import 'primeicons/primeicons.css';
import PostsPage from './pages/Posts.tsx';
import PostDetailsPage from './pages/PostDetailsPage.tsx';
import { dbClient } from './client.ts';
import { CommentsData, PostDetailsData } from './types.ts';
import { createBrowserRouter, RouterProvider } from 'react-router';

const getPostDetails = async (postId: string) => {
    try {
        const res = await dbClient.query({
            query: `
                    SELECT 
                    p.*,
                    dictGet('users_dict', 'username', p.user_id) AS username,
                    dictGet('users_dict', 'country_code', p.user_id) AS country_code
                    FROM posts AS p
                    WHERE p.post_id='${postId}'
                    LIMIT 1;
`,
            format: 'JSONEachRow',
        })

        const postData: PostDetailsData[] = await res.json();

        const commentsRes = await dbClient.query({
            query: `
                SELECT 
                    c.comment_id,
                    c.comment_text,
                    c.upvotes,
                    c.created_at AS comment_created_at,
                    c.is_deleted,
                    dictGet('users_dict', 'username', c.user_id) AS comment_author
                FROM comments AS c
                WHERE c.post_id = '${postId}'
                ORDER BY created_at DESC;
                `,
            format: 'JSONEachRow'
        })

        const commentsData: CommentsData[] = await commentsRes.json();

        return { post: postData[0], comments: commentsData }

    } catch (error) {
        console.log(error)
        return;
    }

}

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/posts",
        element: <PostsPage />,
    },
    {
        path: "/posts/:postId",
        loader: async ({ params }) => {
            const postData = await getPostDetails(params.postId as string)
            if (!postData) {
                throw new Response("Not Found", { status: 404 });
            }

            return postData

        },
        Component: PostDetailsPage,
    },
]);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PrimeReactProvider>
            <RouterProvider router={router} />
        </PrimeReactProvider>
    </StrictMode>
)
