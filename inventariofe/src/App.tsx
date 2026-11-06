import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar'; // Mantém o seu import original
import { DocTypeIndex, DocTypeAdd, DocTypeEdit, DocTypeDelete } from './pages/DocType';
import {BrandIndex, BrandAdd, BrandEdit} from './pages/Brand';

import './App.css';

export function App() {
    return (
        <Router>
            <div className="page-wrapper">
                <Navbar />
                <main className="content">
                    <Routes>
                        <Route path="/DocTypeIndex" element={<DocTypeIndex />} />
                        <Route path="/DocTypeAdd" element={<DocTypeAdd />} />
                        <Route path="/DocTypeEdit" element={<DocTypeEdit />} />
                        <Route path="/DocTypeDelete" element={<DocTypeDelete />} />
                        <Route path= "/BrandIndex" element={<BrandIndex/>} />
                        <Route path= "/BrandAdd" element={<BrandAdd/>} />
                        <Route path= "/BrandEdit" element={<BrandEdit/>} />
                        <Route path="/" element={
                            <div className="container">
                                <h1 className="title">Início – Inventário Web</h1>
                                <p className="status-text">Bem-vindo à página inicial exclusiva!</p>
                            </div>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
export default App;




/*export function App() {
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

export default App; */

                 