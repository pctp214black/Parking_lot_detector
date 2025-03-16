export default function Sidebar({ setDisplayComponent, userID, setUserID }) {
  return (
    <div className="sidebar">
      {/* Botones visibles siempre */}
      <button onClick={() => setDisplayComponent("viewParkings")}>
        View Parkings
      </button>

      {userID==="" ? (
        <>
          <button onClick={() => setDisplayComponent("logIn")}>
            Log In
          </button>
          <button onClick={() => setDisplayComponent("signUp")}>
            Sign Up
          </button>
        </>
      ) : (
        <>
          <button onClick={() => setDisplayComponent("manageParkings")}>
            Manage Parkings
          </button>
          <button onClick={() => setDisplayComponent("createParking")}>
            Create New Parking
          </button>
          <button onClick={() => {setUserID("");setDisplayComponent("viewParkings")}}>Log Out</button>
        </>
      )}
    </div>
  );
}

