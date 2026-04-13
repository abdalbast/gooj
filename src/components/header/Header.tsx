import Navigation from "./Navigation";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/90 pt-[var(--safe-area-top)] backdrop-blur">
      <Navigation />
    </header>
  );
};

export default Header;
