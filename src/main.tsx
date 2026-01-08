import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { PrimeReactProvider } from 'primereact/api';
import "primereact/resources/themes/viva-dark/theme.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import PostsPage from './pages/Posts.tsx';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/posts",
        element: <PostsPage />,
    },
]);
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <PrimeReactProvider>
            <RouterProvider router={router} />,
        </PrimeReactProvider>
    </StrictMode>,
)
