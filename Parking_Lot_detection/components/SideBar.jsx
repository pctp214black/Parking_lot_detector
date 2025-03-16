import { Link } from "react-router-dom";
import "./Sidebar.css";
import { Fragment } from "react";

const Sidebar = ({ isLeftSidebarCollapsed, changeIsLefSidebarCollapsed, userID, setUserID }) => {

  let items = [];
  if (userID == null) {
    items = [
      {
        routerLink: "/ViewParkings",
        icon: "../src/assets/golden_view_parkings.png", // Cambiar la ruta
        label: "View Parkings"
      },
      {
        routerLink: "/login",
        icon: "../src/assets/golden_user.png", // Cambiar la ruta
        label: "Log In"
      },
      {
        routerLink: "/signup",
        icon: "../src/assets/golden_signup.png", // Cambiar la ruta
        label: "Sign Up"
      },
    ];
  } else {
    items = [
      {
        routerLink: "/ViewParkings",
        icon: "../src/assets/golden_view_parkings.png", // Cambiar la ruta
        label: "View Parkings"
      },
      {
        routerLink: "/manageparkings",
        icon: "../src/assets/golden_manage_parkings.png", // Cambiar la ruta
        label: "Manage Parkings"
      },
    ];
  }

  const closeSidenav = () => {
    changeIsLefSidebarCollapsed(true);
  }

  const toggleCollapse = () => {
    changeIsLefSidebarCollapsed(!isLeftSidebarCollapsed);
  }

  return (
    <div className={isLeftSidebarCollapsed ? "sidenav-collapsed" : "sidenav"}>
      {/* LOGO Y BOTÓN DE CIERRE */}
      <div className="logo-container">
        <button className="logo" onClick={toggleCollapse}>
          <img src="../src/assets/menu.png" alt="Menu" />
        </button>
        <div className="logo-text">IParking</div>
        {!isLeftSidebarCollapsed &&
          <Fragment>
            <button className="btn-close" onClick={closeSidenav}>
              <img src="../src/assets/white_back.png" alt="Close" />
            </button>
          </Fragment>

        }

      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <ul className="sidenav-nav">
        {items.map((item) => (
          <li key={item.label} className="sidenav-nav-item">
            <Link className="sidenav-nav-link" to={item.routerLink}>
              <img className="sidenav-image-icon" src={item.icon} alt={item.label} />
              {!isLeftSidebarCollapsed && <span className="sidenav-link-text">{item.label}</span>}
            </Link>
          </li>
        ))}
        {userID &&
          <Fragment>
            <li key="Log Out" className="sidenav-nav-item" onClick={()=>setUserID(null)}>
              <Link className="sidenav-nav-link" to="/ViewParkings">
                <img className="sidenav-image-icon" src="../src/assets/golden_logout.png" alt="Log Out" />
                {!isLeftSidebarCollapsed && <span className="sidenav-link-text">Log Out</span>}
              </Link>
            </li>
          </Fragment>
        }
      </ul>
    </div>
  );
};

export default Sidebar;
