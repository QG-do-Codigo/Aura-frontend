import { Lock, Shield } from "lucide-react";

export const SecurityCard = () => {
  return (
    <div className=" bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-[40px] bg-[#f8f8f8] shadow-lg border border-gray-200 p-10">
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 w-200">
            <div
              style={{
                backgroundColor: "#FEF3C9",
                padding: "8px",
                borderRadius: "999px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
              <Lock color="orange" size={20} />
            </div>
            Segurança
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Gerencie sua senha e acesso
          </p>
        </div>
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 w-200">
            <div
              style={{
                backgroundColor: "#FEF3C9",
                padding: "8px",
                borderRadius: "999px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
              <Lock color="orange" size={20} />
            </div>
            Alterar Senha
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Última alteração há 3 meses
          </p>
        </div>
        <div className="font-bold mb-4  ">
          {" "}
          <div className=" flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 w-200">
            <div
              style={{
                backgroundColor: "#E0E7FF",
                padding: "8px",
                borderRadius: "999px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {" "}
              <Shield color="blue" size={20} />
            </div>
            Autenticação em 2 Etapas
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Recomendado para maior segurança
          </p>
        </div>
      </div>
    </div>
  );
};
