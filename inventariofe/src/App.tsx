import { useEffect, useState } from 'react';
import './App.css';


export interface DocumentType {
    id: number;
    createdAt: string;
    name: string;
    notes?: string;
    Isdeleted : boolean;
}

interface ApiResponse {
    totalItems?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    data?: DocumentType[];
}

const API_BASE_URL = 'https://localhost:7035';

function Navbar({ activePage = 'documentos' }: { activePage?: string }) {
    return (
        <header className="navbar-container">
            <div className="navbar-content">
                <div className="navbar-brand">
                    <span className="brand-logo">📂</span>
                    <h1 className="brand-title">Inventario Web</h1>
                </div>

                <nav className="navbar-links">
                    <a
                        href="#"
                        className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
                    >
                        Inicio
                    </a>
                    <a
                        href="#"
                        className={`nav-item ${activePage === 'documentos' ? 'active' : ''}`}
                    >
                        Tipos de Documentos
                    </a>
                    <a
                        href="#"
                        className={`nav-item ${activePage === 'novo' ? 'active' : ''}`}
                    >
                        Cadastrar Novo
                    </a>
                </nav>
            </div>
        </header>
    );
}
export function App() {
    const [lista, setLista] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                setErro(null);

                const res = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?PageNumber=1&PageSize=10`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result: DocumentType[] | ApiResponse = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    setLista(result);
                } else if (result && Array.isArray(result.data)) {
                    setLista(result.data);
                } else {
                    setLista([]);
                }
            } catch (err) {
                if (isMounted) {
                    setErro(err instanceof Error ? err.message : 'Erro ao carregar dados');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="page-wrapper">
            <Navbar activePage='documentos' />

            <div className="container">
                <h2 className="title">Documentos Cadastrados</h2>

                {loading && <p className="status-text">Carregando...</p>}

                {erro && (
                    <div className="error-box">
                        <strong>Erro:</strong> {erro}
                    </div>
                )}

                {!loading && !erro && lista.length === 0 && (
                    <p className="status-text">Nenhum documento encontrado.</p>
                )}

                {!loading && !erro && lista.length > 0 && (
                    <div className="table-card">
                        <table className="doc-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Notas</th>
                                    <th>Criado em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lista.map((item) => (
                                    <tr key={item.id}>
                                        <td className="name-cell">{item.name || '-'}</td>
                                        <td className="notes-cell">{item.notes || '-'}</td>
                                        <td className="date-cell">
                                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}


export default App;