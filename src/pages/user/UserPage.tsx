import { useEffect, useState } from "react";
import api from "../../services/api";
import type { UserInfo } from "./types";
import { InfoCard } from "./components/InfoCard";
import { SecurityCard } from "./components/SecurityCard";
import { PreferenceCard } from "./components/PreferenceCard";
import { SignOut } from "./components/SignOut";
import { ProfileCard } from "./components/ProfileCard";

export const UserPage = () => {
  const [user, setUser] = useState<UserInfo[]>([]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await api.get("users");
        setUser(response.data);
        console.log("Dados do usuário:", response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      }
    };
    getUserData();
  }, []);

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
