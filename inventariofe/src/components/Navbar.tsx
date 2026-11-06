import { useState } from 'react';
import { Link } from 'react-router-dom'; 
import './Navbar.css';

interface NavbarProps {
    activePage?: string;
    onSelect?: (action: string) => void;
}

export function Navbar({ activePage = 'documentos', onSelect }: NavbarProps) {
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
        documentos: true
    });
    void activePage;
    void onSelect;


    // Estado exclusivo para controlar o menu flutuante (gaveta)
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = (menuKey: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Botão flutuante para abrir o menu quando minimizado/oculto */}
            <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Abrir Menu">
                📂
            </button>

            {/* Fundo escuro com fade gradual ao abrir */}
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={toggleSidebar}
            />

            {/* Container do Navbar original com a classe condicional 'open' */}
            <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header" onClick={toggleSidebar} style={{ cursor: 'pointer' }} title="Fechar Menu">
                    <span className="brand-logo">📂</span>
                    <h1 className="brand-title">Inventário Web</h1>
                </div>

                <div className="sidebar-section-title">Menu Principal</div>

                <nav className="sidebar-nav">
                  
                
                
                
                {/* 3.1 - Tipos de documentos */}
                    <div className="sidebar-dropdown">
                        <button
                            className={`sidebar-menu-item ${openMenus['documentos'] ? 'open' : ''}`}
                            onClick={() => toggleMenu('documentos')}
                        >
                            <span>Tipos de documentos</span>
                            <span className="arrow">{openMenus['documentos'] ? '▼' : '▶'}</span>
                        </button>

                        {openMenus['documentos'] && (
                     <div className="sidebar-submenu">

                                <Link
                                    to="/DocTypeIndex"
                                    className="sidebar-sub-item"
                                >
                                    3.1.1- Visualizar
                                </Link>

                                <Link
                                    to="/DocTypeAdd"
                                    className="sidebar-sub-item"
                                >
                                    3.1.2- Adicionar
                                </Link>

                                <Link
                                    to="/DocTypeEdit"
                                    className="sidebar-sub-item"
                                >
                                    3.1.3- Editar
                                </Link>
                                
                                
                                <Link
                                    to="/DocTypeDelete"
                                    className="sidebar-sub-item"
                                >
                                    3.1.4- Remover
                                </Link>

                            </div>
                        )}

                            </div>
                    
                            
                            
                            
                            {/* 3.2 - Marcas */}
                    <div className="sidebar-dropdown">
                        <button
                            className={`sidebar-menu-item ${openMenus['marcas'] ? 'open' : ''}`}
                            onClick={() => toggleMenu('marcas')}
                        >
                            <span>Marcas</span>
                            <span className="arrow">{openMenus['marcas'] ? '▼' : '▶'}</span>
                        </button>
                        {openMenus['marcas'] && (
                            <div className="sidebar-submenu">
                                <Link to="/BrandIndex" className="sidebar-sub-item">
                                    3.2.1- Visualizar
                                </Link>
                                <Link to="/BrandAdd" className="sidebar-sub-item">
                                    3.2.2- Adicionar
                                </Link>
                                <Link to="/BrandEdit" className="sidebar-sub-item">
                                    3.2.3- Editar
                                </Link>
                               
                                <Link to="/BrandDelete" className="sidebar-sub-item">
                                    3.2.4- Remover
                                </Link>
                               
                            </div>
                        )}
                    </div>

                   
                    
                                        {/* 3.3 - Nota Fiscal de Aquisição */}
                    <div className="sidebar-dropdown">
                        <button
                            className={`sidebar-menu-item ${openMenus['nf'] ? 'open' : ''}`}
                            onClick={() => toggleMenu('nf')}
                        >
                            <span>Nota Fiscal de Aquisição</span>
                            <span className="arrow">{openMenus['nf'] ? '▼' : '▶'}</span>
                        </button>
                        {openMenus['nf'] && (
                            <div className="sidebar-submenu">
                                <Link to="/NfAdd" className="sidebar-sub-item">3.3.1- Adicionar</Link>
                                <Link to="/NfEdit" className="sidebar-sub-item">3.3.2- Editar/Remover</Link>
                                <Link to="/NfIndex" className="sidebar-sub-item">3.3.3- Visualizar</Link>
                            </div>
                        )}
                    </div>


                    {/* 3.4 - Produtos */}
                    <div className="sidebar-dropdown">
                        <button
                            className={`sidebar-menu-item ${openMenus['produtos'] ? 'open' : ''}`}
                            onClick={() => toggleMenu('produtos')}
                        >
                            <span>Produtos</span>
                            <span className="arrow">{openMenus['produtos'] ? '▼' : '▶'}</span>
                        </button>
                        {openMenus['produtos'] && (
                            <div className="sidebar-submenu">
                                <Link to="/ProductAdd" className="sidebar-sub-item">3.4.1- Adicionar</Link>
                                <Link to="/ProductEdit" className="sidebar-sub-item">3.4.2- Editar/Remover</Link>
                                <Link to="/ProductIndex" className="sidebar-sub-item">3.4.3- Visualizar</Link>
                            </div>
                        )}
                    
                    
                    </div>
                </nav>
            </aside>
        </>
    );
}

export default Navbar;