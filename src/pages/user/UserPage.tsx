import { useEffect, useState } from "react";
import api from "../../services/api";
import type { UserInfo } from "./types";
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

      {/* {user.map((user, index) => (
        <div key={index} className="mb-4 border-b pb-2">
          <p className="text-lg mb-2">
            <span className="font-semibold text-gray-700">Nome:</span>{" "}
            {user.name}
          </p>

          <p className="text-lg">
            <span className="font-semibold text-gray-700">Email:</span>{" "}
            {user.email}
          </p>
        </div>
      ))} */}
      <ProfileCard />
    </div>
  );
};
