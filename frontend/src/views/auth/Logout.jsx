import { useEffect, useState } from 'react';
import { logout } from '../../utils/auth';
import { Link, useNavigate } from 'react-router-dom';

function Logout() {
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        logout().then(() => {
            setDone(true);
            setTimeout(() => navigate('/login'), 2000);
        });
    }, []);

    return (
        <section>
            <main style={{ marginBottom: 400, marginTop: 150 }}>
                <div className="container">
                    <div className="row d-flex justify-content-center">
                        <div className="col-xl-5 col-md-8">
                            <div className="card rounded-5">
                                <div className="card-body p-4 text-center">
                                    {done ? (
                                        <>
                                            <h3>You have been logged out</h3>
                                            <p className="text-muted">Redirecting to login…</p>
                                            <div className="d-flex justify-content-center gap-2 mt-3">
                                                <Link to="/login" className="btn btn-primary">
                                                    Login <i className="fas fa-sign-in-alt" />
                                                </Link>
                                                <Link to="/register" className="btn btn-outline-primary">
                                                    Register <i className="fas fa-user-plus" />
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <h3>Logging out…</h3>
                                            <i className="fas fa-spinner fa-spin fa-2x mt-3" />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}

export default Logout;
