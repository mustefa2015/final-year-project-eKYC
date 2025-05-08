import React from 'react'
import Header from '../components/Header/Header'; 
import Routers from '../routes/Routers'
import { useLocation } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();
    const hideHeader = location.pathname === '/userportal' || location.pathname === '/callresult';

    return (
        <> 
            {!hideHeader && <Header/>}
            <main>
                <Routers/>
            </main> 
        </>
    );
};

export default Layout;