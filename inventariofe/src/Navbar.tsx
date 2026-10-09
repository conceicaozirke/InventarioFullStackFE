import './Navbar.css';

interface NavbarProps {

    activePage?: string;
}


    export function Navbar({ activePage = 'documentos' }: NavbarProps) {
        return (
            <header className="navbar-container">
                <div className="navbar-content">
                    <div className="navbar-brand">
                        <span className="brand-logo">📂</span>
                        <h1 className="brand-title">Inventário Web</h1>
                    </div>

                    <nav className="navbar-links">
                        <a
                            href="#"
                            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
                        >
                            Início
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
                        <a
                            href="#"
                            className={`nav-item ${activePage === 'novo' ? 'active' : ''}`}
                        >
                            Editar / excluir
                        </a>

                    </nav>
                </div>
            </header>
        );
    }

    export default Navbar;

