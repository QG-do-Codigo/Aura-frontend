import { Lock, LogOut, Shield } from "lucide-react";

export const SignOut = () => {
  return (
    <div className=" bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-[40px] bg-[#ffe2e0] shadow-lg border border-gray-200 p-10">
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center gap-2  rounded-2xl px-4 py-2 w-200 ">
            <div
              style={{
                backgroundColor: "#dc262927",
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
              <LogOut color="red" size={20} className="cursor-pointer" />
            </div>
            <div className="flex flex-col">
              {" "}
              <h2 className="text-[#dc2626] font-bold"> 
                
                Sair do Aura</h2>
              <p className="text-red-500 text-sm font-light mt-1">
                Encerrar sessão atual
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
