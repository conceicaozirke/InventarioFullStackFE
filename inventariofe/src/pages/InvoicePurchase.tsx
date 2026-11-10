 import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './InvoicePurchase.css';
import Navbar from '../components/Navbar';
import React from 'react';

export interface InvoicePurchase {
    id: string;
    invoiceNumber: string;
    notes?: string;
    purchaseDate: Date;
    priceTotal: number;
    taxTotal: number;
    shippingCost: number;
    purchaseStatus: string;
    isAvailable: boolean;
    isDeleted: boolean;
    isClosed: boolean;
}

export interface InvoicePurchaseDTO {
    InvoicePurchaseNumber: string;
    InvoicePurchaseNotes?: string;
    InvoicePurchasePriceTotal: number;
    InvoicePurchaseTaxTotal: number;
    InvoicePurchaseShippingCost: number;
    InvoicePurchasePurchaseStatus?: string;
    InvoicePurchaseIsAvailable: boolean;
}

export interface PagedResult<T> {
    totalItens: number;
    page: number;
    pageSize: number;
    dat: T[];
}

const API_BASE_URL = 'https://localhost:7035';

export function InvoicePurchaseIndex() {
    const [lista, setLista] = useState<InvoicePurchase[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [erro, setErro] = useState<string | null>(null);

    // Estados de Paginação Server-Side
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    void setPageSize;
    const [totalPages, setTotalPages] = useState<number>(1);

    // Efeito principal de busca na API de Notas Fiscais de Compra
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

                if (searchTerm.trim() !== '') {
                    queryParams.append('searchTerm', searchTerm.trim());
                }

                const res = await fetch(`${API_BASE_URL}/api/Notas-fiscais-Compras?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    const ativos = result.filter((d: InvoicePurchase) => !d.isDeleted);
                    setLista(ativos);
                    setTotalPages(1);
                } else if (result) {
                    const dados = result.dat || result.data || result.Data || [];
                    const ativos = Array.isArray(dados)
                        ? dados.filter((d: InvoicePurchase) => !d.isDeleted)
                        : [];
                    setLista(ativos);
                    setTotalPages(result.totalItens ? Math.ceil(result.totalItens / pageSize) : (result.totalPages || result.TotalPages || 1));
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
            <Navbar activePage="notas-fiscais-compras" />

            <div className="container">
                <h2 className="title" style={{ textAlign: 'center', marginTop: '80px', marginBottom: '30px' }}>
                    Notas Fiscais de Compra Cadastradas
                </h2>

                {erro && (
                    <div className="error-box">
                        <strong>Erro:</strong> {erro}
                    </div>
                )}

                <div className="table-card">
                    <div className="search-metal-bar">
                        <label className="search-metal-label">
                            Pesquisar por Número da Nota:
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Digite o número para filtrar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {loading && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loading && lista.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhuma nota fiscal encontrada.</p>
                    )}

                    {!loading && lista.length > 0 && (
                        <>
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Número da Nota</th>
                                        <th>Data da Compra</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.map((item) => (
                                        <tr key={item.id}>
                                            <td className="name-cell">{item.invoiceNumber || '-'}</td>
                                            <td className="date-cell">
                                                {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                            <td className="notes-cell">
                                                {item.priceTotal !== undefined ? item.priceTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '-'}
                                            </td>
                                            <td className="notes-cell">{item.purchaseStatus || '-'}</td>
                                            <td className="notes-cell">{item.notes || '-'}</td>
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
            </div>
        </div>
    );
}
export function InvoicePurchaseAdd() {
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


export function InvoicePurchaseDelete() {
    const [lista, setLista] = useState<Brand[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

    const [loadingList, setLoadingList] = useState<boolean>(false);
    const [loadingDelete, setLoadingDelete] = useState<boolean>(false);
    const [mensagem, setMensagem] = useState<string>('');

    // Estados de Paginação Server-Side
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    void setPageSize;
    const [totalPages, setTotalPages] = useState<number>(1);

    // Efeito principal de busca na API de Marcas
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
                    queryParams.append('searchTerm', searchTerm.trim());
                }

                const res = await fetch(`${API_BASE_URL}/api/Marcas?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    const ativos = result.filter((d: Brand) => !d.isdeleted);
                    setLista(ativos);
                    setTotalPages(1);
                } else if (result) {
                    const dados = result.data || result.Data || [];
                    const ativos = Array.isArray(dados)
                        ? dados.filter((d: Brand) => !d.isdeleted)
                        : [];
                    setLista(ativos);
                    setTotalPages(result.totalPages || result.TotalPages || 1);
                } else {
                    setLista([]);
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

    // Helper para gerar o range de páginas numeradas
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
        if (!selectedBrand) return;

        setLoadingDelete(true);
        setMensagem('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/Marcas/${selectedBrand.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setLista(lista.filter((d) => d.id !== selectedBrand.id));
                setMensagem(`Sucesso! Marca "${selectedBrand.name}" removida.`);

                setTimeout(() => {
                    setSelectedBrand(null);
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
            <Navbar activePage="marcas" />

            <div className="container">
                <h2 className="title edit-page-title" style={{ textAlign: 'center', marginTop: '80px', marginBottom: '30px' }}>
                    Excluir Marcas
                </h2>

                <div className="table-card">
                    {/* Barra de pesquisa */}
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

                    {loadingList && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loadingList && lista.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhuma marca encontrada.</p>
                    )}

                    {!loadingList && lista.length > 0 && (
                        <>
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Endereço</th>
                                        <th>Documento</th>
                                        <th>Notas</th>
                                        <th>Criado em:</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lista.map((item) => (
                                        <tr
                                            key={item.id}
                                            onClick={() => {
                                                setSelectedBrand(item);
                                                setMensagem('');
                                            }}
                                            className="search-row-pointer"
                                        >
                                            <td className="name-cell"><strong>{item.name || '-'}</strong></td>
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
                {selectedBrand && (
                    <div className="modal-overlay">
                        <div className="table-card modal-card-content">
                            <form onSubmit={handleDeleteSubmit}>
                                <h3 className="title modal-title-spacing" style={{ color: '#d9534f' }}>
                                    Desativar/Excluir: {selectedBrand.name}
                                </h3>

                                <p className="status-text modal-group-margin" style={{ marginBottom: '20px' }}>
                                    Tem certeza que deseja realizar a exclusão desta marca?
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
export function InvoicePurchaseEdit() {
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

    // Estados de Paginação Server-Side padronizados
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    void setPageSize;
    const [totalPages, setTotalPages] = useState<number>(1);

    // 1. Função principal de busca na API de Marcas com paginação e server-side search
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
                    queryParams.append('searchTerm', searchTerm.trim());
                }

                const res = await fetch(`${API_BASE_URL}/api/Marcas?${queryParams.toString()}`);

                if (!res.ok) {
                    throw new Error(`Erro ${res.status}: ${res.statusText}`);
                }

                const result = await res.json();

                if (!isMounted) return;

                if (Array.isArray(result)) {
                    const ativos = result.filter((d: Brand) => !d.isdeleted);
                    setBrands(ativos);
                    setTotalPages(1);
                } else if (result) {
                    const listaItens = result.data || result.items || [];
                    const ativos = Array.isArray(listaItens)
                        ? listaItens.filter((d: Brand) => !d.isdeleted)
                        : [];
                    setBrands(ativos);
                    setTotalPages(result.totalPages || result.TotalPages || 1);
                } else {
                    setBrands([]);
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

    // Busca os tipos de documento para popular o dropdown de seleção
    useEffect(() => {
        let isMounted = true;

        async function fetchDocTypes() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/Novo-tipo-de-Documento?PageNumber=1&PageSize=50`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                if (response.ok && isMounted) {
                    const result = await response.json();
                    const listaItens = result.items || result.data || result;
                    setDocTypes(Array.isArray(listaItens) ? listaItens : []);
                }
            } catch (error) {
                console.error('Erro ao carregar tipos de documento:', error);
            }
        }

        fetchDocTypes();

        return () => {
            isMounted = false;
        };
    }, []);

    // Reseta para a página 1 sempre que o usuário alterar o termo de busca
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPageNumber(1);
    };

    // Helper para gerar o range de páginas numeradas
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

    // Filtro seguro do dropdown de tipos de documento
    const filteredDocTypes = docTypes.filter((dt) => {
        const currentId = dt.id ?? dt.ID ?? 0;
        const currentName = dt.name ?? '';
        return (
            currentName.toLowerCase().includes(docTypeSearch.toLowerCase()) ||
            String(currentId).includes(docTypeSearch)
        );
    });

    // Manipulador para alterar os campos do formulário de edição
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!selectedBrand) return;
        const { name, value } = e.target;
        setSelectedBrand({
            ...selectedBrand,
            [name]: value,
        });
    };

    const handleUpdateSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedBrand) return;

        // VALIDAÇÃO: Garante que o ID digitado/selecionado realmente existe nos tipos de documento carregados
        const isValidDocType = docTypes.some(dt => (dt.id ?? dt.ID ?? 0) === Number(selectedBrand.documentTypeID));
        if (!isValidDocType) {
            setMensagem('Digite um ID válido');
            return;
        }

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
                setTimeout(() => {
                    setSelectedBrand(null);
                    setMensagem('');
                }, 1500);
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
                <h2 className="title edit-page-title" style={{ textAlign: 'center', marginTop: '80px', marginBottom: '30px' }}>
                    Editar Marcas
                </h2>

                <div className="table-card">
                    {/* Barra de pesquisa */}
                    <div className="search-metal-bar">
                        <label className="search-metal-label">
                            Pesquisar por Nome:
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Digite o nome da marca para filtrar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="form-input search-metal-input"
                        />
                    </div>

                    {loadingList && <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Carregando...</p>}

                    {!loadingList && brands.length === 0 && (
                        <p className="status-text" style={{ padding: '20px', textAlign: 'center' }}>Nenhuma marca encontrada.</p>
                    )}

                    {!loadingList && brands.length > 0 && (
                        <>
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th>Endereço</th>
                                        <th>Documento</th>
                                        <th>Notas</th>
                                        <th>Criado em:</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {brands.map((brand) => (
                                        <tr
                                            key={brand.id}
                                            onClick={() => {
                                                setSelectedBrand(brand);
                                                setMensagem('');
                                                const foundDt = docTypes.find(d => (d.id ?? d.ID ?? 0) === brand.documentTypeID);
                                                const foundName = foundDt?.name ?? '';
                                                setDocTypeSearch(foundName ? `ID: ${brand.documentTypeID} - ${foundName}` : brand.documentTypeID ? `ID: ${brand.documentTypeID}` : '');
                                            }}
                                            className="search-row-pointer"
                                        >
                                            <td className="name-cell"><strong>{brand.name}</strong></td>
                                            <td className="notes-cell">{brand.adress || '-'}</td>
                                            <td className="notes-cell">{brand.documentNumber || '-'}</td>
                                            <td className="notes-cell">{brand.notes || '-'}</td>
                                            <td className="date-cell">
                                                {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Controles de Paginação Server-Side */}
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

                {/* Modal de Edição Sobreposto */}
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
                                        value={selectedBrand.documentTypeID ?? ''}
                                        required
                                    />

                                    {isDropdownOpen && filteredDocTypes.length > 0 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            zIndex: 9999,
                                            background: '#fff',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            maxHeight: '160px',
                                            overflowY: 'auto',
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                                            marginTop: '2px'
                                        }}>
                                            {filteredDocTypes.map((dt) => {
                                                const currentId = dt.id ?? dt.ID ?? 0;
                                                const currentName = dt.name ?? '';
                                                return (
                                                    <div
                                                        key={currentId}
                                                        onMouseDown={(e) => e.preventDefault()} // Evita que o blur feche antes do clique
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
                                                            color: '#333',
                                                            backgroundColor: '#fff'
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