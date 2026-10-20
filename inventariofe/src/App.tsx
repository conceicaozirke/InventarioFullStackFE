import { useState, useEffect } from 'react';
import Navbar from './components/Navbar'; // Mantém o seu import original
import { DocTypeIndex, DocTypeAdd, DocTypeDelete, DocTypeEdit } from './pages/DocType';
import './App.css';

export function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    useEffect(() => {
        const handleLocationChange = () => {
            setCurrentPath(window.location.pathname);
        };

        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
    }, []);

    const renderCurrentPage = () => {
        switch (currentPath) {
            case '/DocTypeAdd':
                return <DocTypeAdd />;
            case '/DocTypeIndex':
                return <DocTypeIndex />;
            case '/DocTypeEdit':
                return <DocTypeEdit />;
            case '/':
            default:
                return (
                    <div className="container">
                        <h1 className="title">Início – Inventário Web</h1>
                        <p className="status-text">Bem-vindo à página inicial exclusiva!</p>
                    </div>
                );
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar />
            <main className="content">
                {renderCurrentPage()}
            </main>
        </div>
    );
}

export default App;