
import UserSeachGame from "@/components/user-games-search";

const Home: React.FC = () => {
  


  return (
    <>
      {  <UserSeachGame /> } {/* Prevents rendering on the server */}
    </>
  );
};

export default Home;
