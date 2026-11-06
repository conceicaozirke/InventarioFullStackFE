import { useNavigate } from 'react-router-dom';
import { useEffect, useState} from 'react';
import './DocType.css';
import Navbar from '../components/Navbar';
import React from 'react';

export interface DocumentType {
    id: number;
    createdAt: Date;
    name: string;
    notes?: string;
    Isdeleted: boolean;
}


export interface PagedResult<T> {
    totalItems: number;
    page: number;
    pageSize: number;
    totalPages: number;
    data: T[];
}



interface DocTypeDTO {

    documentTypeName: string;
    documentTypeNotes: string;

}





const API_BASE_URL = 'https://localhost:7035';


export function DocTypeIndex() {
    const [lista, setLista] = useState<DocumentType[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // Estados de Paginação Server-Side
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    void setPageSize;
    const [totalPages, setTotalPages] = useState<number>(1);

    // Efeito principal de busca na API (Disparado por página ou quando o usuário digita a busca)
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoading(true);
                setErro(null);

                const queryParams = new URLSearchParams({
                    PageNumber: pageNumber.toString(),
                    PageSize: pageSize.toString(),
                });

                // Envia searchTerm correspondente à propriedade do PaginationParamsDTO do C#
                if (searchTerm.trim() !== '') {
                    queryParams.append('searchTerm', searchTerm.trim());
                }

                const res = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    setLista(result);
                    setTotalPages(1);
                } else if (result) {
                    const dados = result.data || result.Data || [];
                    setLista(Array.isArray(dados) ? dados : []);
                    setTotalPages(result.totalPages || result.TotalPages || 1);
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
    }, [pageNumber, pageSize, searchTerm]);

    // Reseta para a página 1 sempre que o usuário alterar o termo de busca
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1); 
    };

    const renderPageNumbers = () => {
        const pages: (number | string)[] = [];
        
        if (totalPages <= 20) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            const start = Math.max(2, pageNumber - 8);
            const end = Math.min(totalPages - 1, pageNumber + 8);

            if (start > 2) pages.push('...');

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <span key={`dots-${index}`} style={{ padding: '0 4px', color: '#666', alignSelf: 'center' }}>
                        ...
                    </span>
                );
            }

            return (
                <button
                    key={page}
                    type="button"
                    onClick={() => setPageNumber(Number(page))}
                    style={{
                        padding: '4px 8px',
                        minWidth: '32px',
                        fontSize: '13px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: page === pageNumber ? '#1f3b5c' : '#fff',
                        color: page === pageNumber ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: page === pageNumber ? 'bold' : 'normal'
                    }}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="page-wrapper">
            <Navbar activePage="documentos" />

            <div className="container">
                <h2 className="title" style={{ textAlign: 'center', marginTop: '80px', marginBottom: '30px' }}>
                    Documentos Cadastrados
                </h2>

                {erro && (
                    <div className="error-box">
                        <strong>Erro:</strong> {erro}
                    </div>
                )}

                <div className="table-card">
                    {/* Barra de pesquisa isolada */}
                    <div className="search-metal-bar">
                        <label className="search-metal-label">
                            Pesquisar por Nome:
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Digite o nome para filtrar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {loading && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loading && lista.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhum documento encontrado.</p>
                    )}

                    {!loading && lista.length > 0 && (
                        <>
                            <table className="doc-table"><thead><tr>
                                <th>Nome</th>
                                <th>Notas</th>
                                <th>Atualizado em: </th>
                            </tr></thead><tbody>
                                {lista.map((item) => (
                                    <tr key={item.id}>
                                        <td className="name-cell">{item.name || '-'}</td>
                                        <td className="notes-cell">{item.notes || '-'}</td>
                                        <td className="date-cell">
                                            {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody></table>

                            {/* Controles de Paginação Server-Side com Botões de Páginas Específicas */}
                            <div 
                                className="pagination-container" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    padding: '15px 20px', 
                                    width: '100%',
                                    boxSizing: 'border-box' 
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn-submit pagination-btn"
                                    disabled={pageNumber <= 1}
                                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                    style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', margin: 0 }}
                                >
                                    Anterior
                                </button>

                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '70%' }}>
                                    {renderPageNumbers()}
                                </div>

                                <button
                                    type="button"
                                    className="btn-submit pagination-btn"
                                    disabled={pageNumber >= totalPages}
                                    onClick={() => setPageNumber(prev => prev + 1)}
                                    style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', margin: 0 }}
                                >
                                    Próxima
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}




export function DocTypeAdd() {

    const navigate = useNavigate();


    const handleAddDocType = async (e: React.SubmitEvent<HTMLFormElement>) => {
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
            navigate('/DocTypeIndex');
        } catch (error) {
            console.error('Erro no pedido:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar activePage="documentos" />

            <div className="container">
                <h2 className="title edit-page-title">
                    Adicionar Tipo de Documento
                </h2>

                <div className="table-card add-doc-card">
                    <form onSubmit={handleAddDocType}>
                        <div className="form-group modal-group-margin">
                            <label className="modal-label-style">
                                NOME (ex.: CNPJ):
                            </label>
                            <input
                                type="text"
                                name="documentTypeName"
                                maxLength={30}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group modal-group-margin-lg">
                            <label className="modal-label-style">
                                NOTAS ADICIONAIS (EX: Preencher no formato "A1.B2C.3D4/1A2B-99" ):
                            </label>
                            <textarea
                                name="documentTypeNotes"
                                className="form-textarea fixed-textarea"
                                maxLength={150}
                                rows={4}
                            />
                        </div>

                        <button type="submit" className="btn-submit">
                            Salvar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
 


export function DocTypeDelete() {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [mensagem, setMensagem] = useState<string>('');

    // Estados de Paginação Server-Side
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    void setPageSize;
    const [totalPages, setTotalPages] = useState<number>(1);

    // Efeito principal de busca na API idêntico ao do Index (com fetchData dentro e isMounted)
    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                setLoadingList(true);

                const queryParams = new URLSearchParams({
                    PageNumber: pageNumber.toString(),
                    PageSize: pageSize.toString(),
                });

                if (searchTerm.trim() !== '') {
                    queryParams.append('SearchTerm', searchTerm.trim());
                }

                const res = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    const ativos = result.filter((d: DocumentType) => !d.Isdeleted);
                    setDocuments(ativos);
                    setTotalPages(1);
                } else if (result) {
                    const listaItens = result.data || [];
                    const ativos = Array.isArray(listaItens) 
                        ? listaItens.filter((d: DocumentType) => !d.Isdeleted) 
                        : [];
                    setDocuments(ativos);
                    setTotalPages(result.totalPages || 1);
                } else {
                    setDocuments([]);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Erro ao carregar dados:', err);
                }
            } finally {
                if (isMounted) setLoadingList(false);
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [pageNumber, pageSize, searchTerm]);

    // Reseta para a página 1 sempre que o usuário alterar o termo de busca
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1); 
    };

    // Helper para gerar o range de páginas numeradas (idêntico ao Index)
    const renderPageNumbers = () => {
        const pages: (number | string)[] = [];
        
        if (totalPages <= 20) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            const start = Math.max(2, pageNumber - 8);
            const end = Math.min(totalPages - 1, pageNumber + 8);

            if (start > 2) pages.push('...');

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <span key={`dots-${index}`} style={{ padding: '0 4px', color: '#666', alignSelf: 'center' }}>
                        ...
                    </span>
                );
            }

            return (
                <button
                    key={page}
                    type="button"
                    onClick={() => setPageNumber(Number(page))}
                    style={{
                        padding: '4px 8px',
                        minWidth: '32px',
                        fontSize: '13px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        background: page === pageNumber ? '#1f3b5c' : '#fff',
                        color: page === pageNumber ? '#fff' : '#333',
                        cursor: 'pointer',
                        fontWeight: page === pageNumber ? 'bold' : 'normal'
                    }}
                >
                    {page}
                </button>
            );
        });
    };

    // Função de Submissão do Soft Delete via [HttpDelete] com o ID na rota
    const handleDeleteSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedDoc) return;

        setLoadingDelete(true);
        setMensagem('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento/${selectedDoc.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setDocuments(documents.filter((d) => d.id !== selectedDoc.id));
                setMensagem(`Sucesso! Documento "${selectedDoc.name}" removido.`);
                
                setTimeout(() => {
                    setSelectedDoc(null);
                    setMensagem('');
                    setPageNumber(1); 
                }, 1500);
            } else {
                const errorText = await response.text();
                setMensagem(`Erro ao deletar: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            setMensagem('Não foi possível conectar ao servidor.');
        } finally {
            setLoadingDelete(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar activePage="documentos" />

            <div className="container">
                <h2 className="title edit-page-title">
                    Excluir Tipos de Documentos
                </h2>

                <div className="table-card">
                    {/* Barra de pesquisa idêntica à do Index */}
                    <div className="search-metal-bar">
                        <label className="search-metal-label">
                            Pesquisar por Nome:
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Digite o nome do tipo de documento para filtrar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {loadingList && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loadingList && documents.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhum documento encontrado.</p>
                    )}

                    {!loadingList && documents.length > 0 && (
                        <>
                            <table className="doc-table">
                                <tbody>
                                    {documents.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setMensagem('');
                                            }}
                                            className="search-row-pointer"
                                        >
                                            <td className="name-cell"><strong>{doc.name}</strong></td>
                                            <td className="notes-cell">{doc.notes || 'Sem notas'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Controles de Paginação Server-Side com Botões de Páginas Específicas */}
                            <div 
                                className="pagination-container" 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    padding: '15px 20px', 
                                    width: '100%',
                                    boxSizing: 'border-box' 
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn-submit pagination-btn"
                                    disabled={pageNumber <= 1}
                                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                    style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', margin: 0 }}
                                >
                                    Anterior
                                </button>

                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '70%' }}>
                                    {renderPageNumbers()}
                                </div>

                                <button
                                    type="button"
                                    className="btn-submit pagination-btn"
                                    disabled={pageNumber >= totalPages}
                                    onClick={() => setPageNumber(prev => prev + 1)}
                                    style={{ width: 'auto', padding: '6px 14px', fontSize: '13px', margin: 0 }}
                                >
                                    Próxima
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Modal de Confirmação de Soft Delete Sobreposto */}
                {selectedDoc && (
                    <div className="modal-overlay">
                        <div className="table-card modal-card-content">
                            <form onSubmit={handleDeleteSubmit}>
                                <h3 className="title modal-title-spacing" style={{ color: '#d9534f' }}>
                                    Desativar/Excluir: {selectedDoc.name}
                                </h3>

                                <p className="status-text modal-group-margin" style={{ marginBottom: '20px' }}>
                                    Tem certeza que deseja realizar a exclusão deste tipo de documento?
                                </p>

                                <div className="modal-buttons-flex">
                                    <button
                                        type="submit"
                                        disabled={loadingDelete}
                                        className="btn-submit"
                                        style={{ backgroundColor: '#d9534f', borderColor: '#d9534f' }}
                                    >
                                        {loadingDelete ? 'Excluindo...' : 'Confirmar Exclusão'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedDoc(null)}
                                        className="btn-submit modal-btn-cancel"
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                {mensagem && (
                                    <p className="status-text modal-message-style">
                                        {mensagem}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


export function DocTypeEdit() {
    const [documents, setDocuments] = useState<DocumentType[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedDoc, setSelectedDoc] = useState<DocumentType | null>(null);

    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [loadingSave, setLoadingSave] = useState<boolean>(false);
    const [mensagem, setMensagem] = useState<string>('');

    // 1. Função de Index que consome o [HttpGet] com paginação
    const fetchDocuments = async () => {
        setLoadingList(true);
        try {


            const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?PageNumber=1&PageSize=50`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();

                

                const listaItens = result.items || result.data || result;

                setDocuments(Array.isArray(listaItens) ? listaItens : []);
            } else {
                console.error('Erro na resposta da API:', response.statusText);
            }
        } catch (error) {
            console.error('Erro no fetch:', error);
        } finally {
            setLoadingList(false);
        }
    };


    useEffect(() => {
        queueMicrotask(() => {
            fetchDocuments();
        });
    }, []);


    // 2. Filtra os documentos em tempo real na barra de buscas com base no nome
    const filteredDocuments = documents.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Manipulador para alterar os campos do formulário de edição
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!selectedDoc) return;
        const { name, value } = e.target;
        setSelectedDoc({
            ...selectedDoc,
            [name]: value,
        });
    };

    // 3. Função de Submit para atualizar via [HttpPut] enviando o objeto DocumentType
    const handleUpdateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedDoc) return;

        setLoadingSave(true);
        setMensagem('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedDoc),
            });

            if (response.ok) {
                const updated: DocumentType = await response.json();
                setDocuments(documents.map((d) => (d.id === updated.id ? updated : d)));
                setSelectedDoc(null); // <-- Fecha o modal e retorna à listagem principal
            } else {
                const errorText = await response.text();
                setMensagem(`Erro ao atualizar: ${errorText || response.statusText}`);
            }
        } catch (error) {
            console.error('Erro de rede:', error);
            setMensagem('Não foi possível conectar ao servidor.');
        } finally {
            setLoadingSave(false);
        }
    };
    return (
        <div className="page-wrapper">
            <Navbar activePage="documentos" />

            <div className="container">
                <h2 className="title edit-page-title">
                    Editar Tipos de Documentos
                </h2>

                <div className="table-card">
                    {/* Aba metalizada de pesquisa */}
                    <div className="search-metal-bar">
                        <label className="search-metal-label">
                            Pesquisar por Nome:
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Digite o nome do tipo de documento para filtrar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {/* Lista resultante da busca */}
                    <div className="search-results-list">
                        {loadingList ? (
                            <p className="status-text search-status-pad">Carregando lista...</p>
                        ) : filteredDocuments.length > 0 ? (
                            <table className="doc-table">
                                <tbody>
                                    {filteredDocuments.map((doc) => (
                                        <tr
                                            key={doc.id}
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setMensagem('');
                                            }}
                                            className="search-row-pointer"
                                        >
                                            <td className="name-cell"><strong>{doc.name}</strong></td>
                                            <td className="notes-cell">{doc.notes || 'Sem notas'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="status-text search-status-center">Nenhum documento encontrado.</p>
                        )}
                    </div>
                </div>

                {/* Modal de Edição Sobreposto com Fundo Escurecido */}
                {selectedDoc && (
                    <div className="modal-overlay">
                        <div className="table-card modal-card-content">
                            <form onSubmit={handleUpdateSubmit}>
                                <h3 className="title modal-title-spacing">
                                    Editando: {selectedDoc.name}
                                </h3>

                                <div className="form-group modal-group-margin">
                                    <label className="modal-label-style">
                                        Nome:
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={selectedDoc.name}
                                        onChange={handleFormChange}
                                        maxLength={30}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group modal-group-margin-lg">
                                    <label className="modal-label-style">
                                        Notas:
                                    </label>
                                    <input
                                        name="notes"
                                        value={selectedDoc.notes || ''}
                                        onChange={handleFormChange}
                                        maxLength= {150 }
                                        className="form-input"
                                    />
                                </div>

                                <div className="modal-buttons-flex">
                                    <button
                                        type="submit"
                                        disabled={loadingSave}
                                        className="btn-submit"
                                    >
                                        {loadingSave ? 'Salvando...' : 'Salvar '}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedDoc(null)}
                                        className="btn-submit modal-btn-cancel"
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                {mensagem && (
                                    <p className="status-text modal-message-style">
                                        {mensagem}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
