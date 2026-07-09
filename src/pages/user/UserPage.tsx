import { InfoCard } from "./components/InfoCard";
import { SecurityCard } from "./components/SecurityCard";
import { PreferenceCard } from "./components/PreferenceCard";
import { SignOut } from "./components/SignOut";
import { ProfileCard } from "./components/ProfileCard";

export const UserPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Perfil dos Usuários</h1>

      <ProfileCard />
      <InfoCard />
      <SecurityCard />
      <PreferenceCard />
      <SignOut />
    </div>
  );
};
