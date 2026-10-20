import { useEffect, useState, useMemo} from 'react';
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
    const [searchTerm, setSearchTerm] = useState<string>('');

    // searchTermDebounced armazena o valor que de fato vai disparar a busca/efeito
    const [searchTermDebounced, setSearchTermDebounced] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // Estados de Paginação Server-Side
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [totalPages, setTotalPages] = useState<number>(1);

    // Efeito isolado para o Debounce do input de pesquisa (Resolve a perda de foco do input)
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTermDebounced(searchTerm);
            setPageNumber(1); // Reseta para a primeira página ao buscar
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efeito principal de busca na API (Disparado apenas ao mudar de página ou após o debounce da busca)
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

                if (searchTermDebounced.trim() !== '') {
                    queryParams.append('SearchTerm', searchTermDebounced.trim());
                }

                const res = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result: DocumentType[] | ApiResponse = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    setLista(result);
                    setTotalPages(1);
                } else if (result && Array.isArray(result.data)) {
                    setLista(result.data);
                    setTotalPages(result.totalPages || 1);
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
    }, [pageNumber, searchTermDebounced, pageSize]);

    // Guardrail: Mantido o filtro client-side para itens deletados (Soft Delete)
    const filteredLista = useMemo(() => {
        return lista.filter((item) => !item.Isdeleted);
    }, [lista]);

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
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {loading && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loading && filteredLista.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhum documento encontrado.</p>
                    )}

                    {!loading && filteredLista.length > 0 && (
                        <>
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Notas</th>
                                        <th>Atualizado em: </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLista.map((item) => (
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

                            {/* Controles de Paginação Server-Side (Sem uso de !important inválido) */}
                            <div className="pagination-container">
                                <button
                                    type="button"
                                    className="btn-submit pagination-btn"
                                    disabled={pageNumber <= 1}
                                    onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                                >
                                    Anterior
                                </button>

                                <span className="pagination-info">
                                    Pag {pageNumber} de {totalPages || 1}
                                </span>

                                <button
                                    type="button"
                                    className="btn-submit pagination-btn"
                                    disabled={pageNumber >= totalPages}
                                    onClick={() => setPageNumber(prev => prev + 1)}
                                >
                                    Proxima
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
            // Mantém a base que você já usa e passa os parâmetros de paginação que o seu C# exige
            const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?PageNumber=1&PageSize=50`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();

                // O seu C# retorna o pagedResult.
                // Se a lista de itens estiver dentro de 'items', pegamos ela.
                // Se o seu helper retornar diretamente em outra propriedade (ex: 'data' ou 'result'), ajuste aqui:

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
    const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                body: JSON.stringify(selectedDoc), // Envia a entidade DocumentType esperada pelo [FromBody]
            });

            if (response.ok) {
                const updated: DocumentType = await response.json();
                setMensagem(`Sucesso! Documento "${updated.name}" atualizado.`);
                setDocuments(documents.map((d) => (d.id === updated.id ? updated : d)));
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
