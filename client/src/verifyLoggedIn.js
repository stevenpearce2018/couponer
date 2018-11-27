  import { ToastContainer, toast } from 'react-toastify';   import 'react-toastify/dist/ReactToastify.css';

const loggedInKey = sessionStorage.getItem('UnlimitedCouponerKey') ? sessionStorage.getItem('UnlimitedCouponerKey').replace('"', '').replace('"', '') : null;

const verifyLoggedIn = callback => {
    if (!loggedInKey || loggedInKey.slice(-1) !== "b" && loggedInKey.slice(-1) !== "c") {
        callback();
        window.history.pushState(null, '', '/Home');
        toast.error('You are not logged in!')
        return false;
    } else return true;
}

export default verifyLoggedIn;