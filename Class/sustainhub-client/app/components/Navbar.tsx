const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4 navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <p> Home </p>
      </div>
      <div className="navbar-nav ms-auto">
        <p>Dashboard</p>
        <p> About</p>
      </div>
    </nav>
  );
};

export default Navbar;