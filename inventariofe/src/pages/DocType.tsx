import { useEffect, useState } from 'react';
import './DocType.css';
import Navbar from '../components/Navbar';
import React from 'react';

export interface DocumentType {
    id: number;
    createdAt: string;
    name: string;
    notes?: string;
    Isdeleted: boolean;
}



interface ApiResponse {
    totalItems?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    data?: DocumentType[];
}

interface DocTypeDTO {

    documentTypeName: string;
    documentTypeNotes: string;

}


const API_BASE_URL = 'https://localhost:7035';

export function DocTypeIndex() {
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
            <Navbar activePage="documentos" />

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
                                    <th>Atualizado em: </th>
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



export function DocTypeAdd() {
    const handleAddDocType = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const payload: DocTypeDTO = {
            documentTypeName: formData.get('documentTypeName')?.toString() || '',
            documentTypeNotes: formData.get('documentTypeNotes')?.toString() || ''
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Erro ao cadastrar o tipo de documento.');

            const data = await response.json();
            console.log('Criado com sucesso:', data);
            window.location.href = '/DocTypeIndex';
        } catch (error) {
            console.error('Erro na requisição:', error);
        }
    };



    return (
        <div className="page-wrapper">
            <Navbar activePage="documentos" />
            <div className="container">
                <h2 className="title">Adicionar Tipo de Documento</h2>
                <form onSubmit={handleAddDocType} className="form-container">
                    <div className="form-group">
                        <label>Nome do Tipo de Documento:</label>
                        <input type="text" name="documentTypeName" required className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Notas:</label>
                        <textarea name="documentTypeNotes" className="form-textarea" />
                    </div>
                    <button type="submit" className="btn-submit">Salvar</button>
                </form>
            </div>
        </div>
    );
}

export function DocTypeDelete() {



}



export function DocTypeEdit() {



}

