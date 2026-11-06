 import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useMemo } from 'react';
import './Brand.css';
import Navbar from '../components/Navbar';
import React from 'react';

export interface Brand {
    id: number;
    createdAt: Date;
    name: string;
    adress: string;
    notes?: string;
    documentNumber: string;
    isdeleted: boolean;
    documentTypeID: number;
}

interface ApiResponse {
    totalItems?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    data?: Brand[];
    items?: Brand[];
}

export interface AddBrandDTO {
    brandName: string;
    brandNotes?: string;
    brandAdress: string;
    brandDocumentNumber: string;
    brandDocumentTypeID: number;
}

const API_BASE_URL = 'https://localhost:7035';
                  
export function BrandIndex() {
    const [lista, setLista] = useState<Brand[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // searchTermDebounced armazena o valor que de fato vai disparar a busca/efeito
    const [searchTermDebounced, setSearchTermDebounced] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // Estados de Paginação Server-Side
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    void setPageSize;
    const [totalPages, setTotalPages] = useState<number>(1);

    // Efeito isolado para o Debounce do input de pesquisa
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchTermDebounced(searchTerm);
            setPageNumber(1); // Reseta para a primeira página ao buscar
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Efeito principal de busca na API de Marcas
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

                const res = await fetch(`${API_BASE_URL}/api/Marcas?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result: Brand[] | ApiResponse = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    setLista(result);
                    setTotalPages(1);
                } else if (result && Array.isArray(result.data)) {
                    setLista(result.data);
                    setTotalPages(result.totalPages || 1);
                } else if (result && Array.isArray(result.items)) {
                    setLista(result.items);
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
        return lista.filter((item) => !item.isdeleted);
    }, [lista]);

    return (
        <div className="page-wrapper">
            <Navbar activePage="marcas" />

            <div className="container">
                <h2 className="title" style={{ textAlign: 'center', marginTop: '80px', marginBottom: '30px' }}>
                    Marcas Cadastradas
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
                            placeholder="Digite o nome da marca para filtrar (máx. 30 caracteres) "
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {loading && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loading && filteredLista.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhuma marca encontrada.</p>
                    )}

                   {!loading && filteredLista.length > 0 && (<>
   <table className="doc-table"><thead><tr>
    <th>Nome</th>
    <th>Endereço</th>
    <th>Documento</th>
    <th>Notas</th>
    <th>Criado em:</th>
</tr></thead><tbody>
    {filteredLista.map((item) => (
                <tr key={item.id}>
                    <td className="name-cell">{item.name || '-'}</td>
                    <td className="notes-cell">{item.adress || '-'}</td>
                    <td className="notes-cell">{item.documentNumber || '-'}</td>
                    <td className="notes-cell">{item.notes || '-'}</td>
                    <td className="date-cell">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : '-'}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
    {/* Controles de Paginação Server-Side */}
    <div className="pagination-container">
        <button type="button" className="btn-submit pagination-btn" disabled={pageNumber <= 1} onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}>Anterior</button>
        <span className="pagination-info">Pag {pageNumber} de {totalPages || 1}</span>
        <button type="button" className="btn-submit pagination-btn" disabled={pageNumber >= totalPages} onClick={() => setPageNumber(prev => prev + 1)}>Proxima</button>
    </div>
</>)}</div></div></div>);
}

export function BrandAdd() {
    const navigate = useNavigate();

    // Estados limpos sem dependência de interfaces externas
const [docTypes, setDocTypes] = useState<Array<{ id?: number; ID?: number; name?: string }>>([]);    const [docTypeSearch, setDocTypeSearch] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [selectedDocTypeId, setSelectedDocTypeId] = useState<number>(0);

    // Busca os tipos de documento diretamente do backend
    useEffect(() => {
        async function fetchDocTypes() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?PageNumber=1&PageSize=50`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (response.ok) {
                    const result = await response.json();
                    const listaItens = result.items || result.data || result;
                    setDocTypes(Array.isArray(listaItens) ? listaItens : []);
                }
            } catch (error) {
                console.error('Erro ao carregar tipos de documento:', error);
            }
        }
        fetchDocTypes();
    }, []);

    // Filtro seguro compatível com qualquer variação de maiúsculas/minúsculas da API
    const filteredDocTypes = docTypes.filter((dt) => {
        const id = dt.id ?? dt.ID ?? 0;
        const name = dt.name ?? '';
        return (
            name.toLowerCase().includes(docTypeSearch.toLowerCase()) ||
            String(id).includes(docTypeSearch)
        );
    });

    const handleAddBrand = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const payload: AddBrandDTO = {
            brandName: formData.get('brandName')?.toString() || '',
            brandAdress: formData.get('brandAdress')?.toString() || '',
            brandDocumentNumber: formData.get('brandDocumentNumber')?.toString() || '',
            brandDocumentTypeID: Number(formData.get('brandDocumentTypeID') || 0),
            brandNotes: formData.get('brandNotes')?.toString() || ''
        };

        try {
            const response = await fetch(`${API_BASE_URL}/api/Marcas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Erro ao cadastrar a marca.');

            const data = await response.json();
            console.log('Marca criada com sucesso:', data);
            navigate('/BrandIndex');
        } catch (error) {
            console.error('Erro no pedido:', error);
        }
    };

    return (
        <div className="page-wrapper">
            <Navbar activePage="marcas" />

            <div className="container">
                <h2 className="title edit-page-title">
                    Adicionar Marca
                </h2>

                <div className="table-card add-doc-card">
                    <form onSubmit={handleAddBrand}>
                        <div className="form-group modal-group-margin">
                            <label className="modal-label-style">
                                NOME DA MARCA:
                            </label>
                            <input
                                type="text"
                                name="brandName"
                                maxLength={30}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group modal-group-margin">
                            <label className="modal-label-style">
                                ENDEREÇO (Ex: Servidão):
                            </label>
                            <input
                                type="text"
                                name="brandAdress"
                                maxLength={100}
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group modal-group-margin">
                            <label className="modal-label-style">
                                NÚMERO DO DOCUMENTO:
                            </label>
                            <input
                                type="text"
                                name="brandDocumentNumber"
                                maxLength={30}
                                required
                                className="form-input"
                            />
                        </div>

                        {/* Campo interativo com Dropdown de Tipos de Documento */}
                        <div className="form-group modal-group-margin" style={{ position: 'relative' }}>
                            <label className="modal-label-style">
                                TIPO DE DOCUMENTO:
                            </label>
                            
                            <input
                                type="text"
                                placeholder="Digite para buscar pelo ID ou Nome..."
                                value={docTypeSearch}
                                onChange={(e) => {
                                    setDocTypeSearch(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="form-input"
                            />

                            <input
                                type="hidden"
                                name="brandDocumentTypeID"
                                value={selectedDocTypeId}
                                required
                            />

                            {isDropdownOpen && filteredDocTypes.length > 0 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    right: 0,
                                    zIndex: 99,
                                    background: '#fff',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    maxHeight: '160px',
                                    overflowY: 'auto',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                }}>
                                    {filteredDocTypes.map((dt) => {
                                        const currentId = dt.id ?? dt.ID ?? 0;
                                        const currentName = dt.name ?? '';
                                        return (
                                            <div
                                                key={currentId}
                                                onClick={() => {
                                                    setSelectedDocTypeId(currentId);
                                                    setDocTypeSearch(`ID: ${currentId} - ${currentName}`);
                                                    setIsDropdownOpen(false);
                                                }}
                                                style={{
                                                    padding: '10px 12px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #eee',
                                                    fontSize: '14px',
                                                    color: '#333'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <strong>[ID {currentId}]</strong> {currentName}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="form-group modal-group-margin-lg">
                            <label className="modal-label-style">
                                NOTAS ADICIONAIS:
                            </label>
                            <textarea
                                name="brandNotes"
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




export function BrandEdit() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    // Tipagem flexível para evitar qualquer erro de propriedade no DocumentType
    const [docTypes, setDocTypes] = useState<Array<{ id?: number; ID?: number; name?: string }>>([]);
    const [docTypeSearch, setDocTypeSearch] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [loadingSave, setLoadingSave] = useState<boolean>(false);
    const [mensagem, setMensagem] = useState<string>('');

    // 1. Função de Index baseada no DocTypeEdit que consome o [HttpGet] de Marcas
    const fetchBrands = async () => {
        setLoadingList(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/Marcas?PageNumber=1&PageSize=50`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                const listaItens = result.items || result.data || result;
                setBrands(Array.isArray(listaItens) ? listaItens : []);
            } else {
                console.error('Erro na resposta da API:', response.statusText);
            }
        } catch (error) {
            console.error('Erro no fetch:', error);
        } finally {
            setLoadingList(false);
        }
    };

    // Busca os tipos de documento para popular o dropdown de seleção
    const fetchDocTypes = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?PageNumber=1&PageSize=50`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                const result = await response.json();
                const listaItens = result.items || result.data || result;
                setDocTypes(Array.isArray(listaItens) ? listaItens : []);
            }
        } catch (error) {
            console.error('Erro ao carregar tipos de documento:', error);
        }
    };

    useEffect(() => {
        queueMicrotask(() => {
            fetchBrands();
            fetchDocTypes();
        });
    }, []);

    // 2. Filtra as marcas em tempo real na barra de buscas com base no nome (padrão DocTypeEdit)
    const filteredBrands = brands.filter((brand) =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtro seguro do dropdown de tipos de documento (lógica idêntica e validada do BrandAdd)
    const filteredDocTypes = docTypes.filter((dt) => {
        const currentId = dt.id ?? dt.ID ?? 0;
        const currentName = dt.name ?? '';
        return (
            currentName.toLowerCase().includes(docTypeSearch.toLowerCase()) ||
            String(currentId).includes(docTypeSearch)
        );
    });

    // Manipulador para alterar os campos do formulário de edição (padrão DocTypeEdit)
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!selectedBrand) return;
        const { name, value } = e.target;
        setSelectedBrand({
            ...selectedBrand,
            [name]: value,
        });
    };

    // 3. Função de Submit para atualizar via [HttpPut] enviando o objeto Brand esperado pelo BrandControllers
    const handleUpdateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedBrand) return;

        setLoadingSave(true);
        setMensagem('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/Marcas`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(selectedBrand),
            });

            if (response.ok) {
                const updated: Brand = await response.json();
                setMensagem(`Sucesso! Marca "${updated.name}" atualizada.`);
                setBrands(brands.map((b) => (b.id === updated.id ? updated : b)));
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
            <Navbar activePage="marcas" />

            <div className="container">
                <h2 className="title edit-page-title">
                    Editar Marcas
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
                            placeholder="Digite o nome da marca para filtrar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {/* Lista resultante da busca */}
                    <div className="search-results-list">
                        {loadingList ? (
                            <p className="status-text search-status-pad">Carregando lista...</p>
                        ) : filteredBrands.length > 0 ? (
                            <table className="doc-table">
                                <tbody>
                                    {filteredBrands.map((brand) => (
                                        <tr
                                            key={brand.id}
                                            onClick={() => {
                                                setSelectedBrand(brand);
                                                setMensagem('');
                                                // Preenche o campo de busca do dropdown com o ID atual da marca selecionada de forma segura
                                                const foundDt = docTypes.find(d => (d.id ?? d.ID ?? 0) === brand.documentTypeID);
                                                const foundName = foundDt?.name ?? '';
                                                setDocTypeSearch(foundName ? `ID: ${brand.documentTypeID} - ${foundName}` : brand.documentTypeID ? `ID: ${brand.documentTypeID}` : '');
                                            }}
                                            className="search-row-pointer"
                                        >
                                            <td className="name-cell"><strong>{brand.name}</strong></td>
                                            <td className="notes-cell">{brand.notes || 'Sem notas'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="status-text search-status-center">Nenhuma marca encontrada.</p>
                        )}
                    </div>
                </div>

                {/* Modal de Edição Sobreposto com Fundo Escurecido */}
                {selectedBrand && (
                    <div className="modal-overlay">
                        <div className="table-card modal-card-content">
                            <form onSubmit={handleUpdateSubmit}>
                                <h3 className="title modal-title-spacing">
                                    Editando: {selectedBrand.name}
                                </h3>

                                <div className="form-group modal-group-margin">
                                    <label className="modal-label-style">
                                        Nome da Marca:
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={selectedBrand.name}
                                        onChange={handleFormChange}
                                        maxLength={30}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group modal-group-margin">
                                    <label className="modal-label-style">
                                        Endereço:
                                    </label>
                                    <input
                                        type="text"
                                        name="adress"
                                        value={selectedBrand.adress}
                                        onChange={handleFormChange}
                                        maxLength={100}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                <div className="form-group modal-group-margin">
                                    <label className="modal-label-style">
                                        Número do Documento:
                                    </label>
                                    <input
                                        type="text"
                                        name="documentNumber"
                                        value={selectedBrand.documentNumber}
                                        onChange={handleFormChange}
                                        maxLength={30}
                                        required
                                        className="form-input"
                                    />
                                </div>

                                {/* Campo interativo com Dropdown de Tipos de Documento (Lógica de busca do BrandAdd) */}
                                <div className="form-group modal-group-margin" style={{ position: 'relative' }}>
                                    <label className="modal-label-style">
                                        Tipo de Documento:
                                    </label>
                                    
                                    <input
                                        type="text"
                                        placeholder="Digite para buscar pelo ID ou Nome..."
                                        value={docTypeSearch}
                                        onChange={(e) => {
                                            setDocTypeSearch(e.target.value);
                                            setIsDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsDropdownOpen(true)}
                                        className="form-input"
                                    />

                                    <input
                                        type="hidden"
                                        name="documentTypeID"
                                        value={selectedBrand.documentTypeID}
                                        required
                                    />

                                    {isDropdownOpen && filteredDocTypes.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            zIndex: 99,
                                            background: '#fff',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            maxHeight: '160px',
                                            overflowY: 'auto',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                                        }}>
                                            {filteredDocTypes.map((dt) => {
                                                const currentId = dt.id ?? dt.ID ?? 0;
                                                const currentName = dt.name ?? '';
                                                return (
                                                    <div
                                                        key={currentId}
                                                        onClick={() => {
                                                            setSelectedBrand({
                                                                ...selectedBrand,
                                                                documentTypeID: currentId
                                                            });
                                                            setDocTypeSearch(`ID: ${currentId} - ${currentName}`);
                                                            setIsDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: '10px 12px',
                                                            cursor: 'pointer',
                                                            borderBottom: '1px solid #eee',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                                                    >
                                                        <strong>[ID {currentId}]</strong> {currentName}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group modal-group-margin-lg">
                                    <label className="modal-label-style">
                                        Notas Adicionais:
                                    </label>
                                    <input
                                        type="text"
                                        name="notes"
                                        value={selectedBrand.notes || ''}
                                        onChange={handleFormChange}
                                        maxLength={150}
                                        className="form-input"
                                    />
                                </div>

                                <div className="modal-buttons-flex">
                                    <button
                                        type="submit"
                                        disabled={loadingSave}
                                        className="btn-submit"
                                    >
                                        {loadingSave ? 'Salvando...' : 'Salvar'}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedBrand(null)}
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
