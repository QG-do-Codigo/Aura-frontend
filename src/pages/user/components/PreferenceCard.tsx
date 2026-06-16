import { Lock, Palette, Shield } from "lucide-react";

export const PreferenceCard = () => {
  return (
    <div className=" bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-[40px] bg-[#f8f8f8] shadow-lg border border-gray-200 p-10">
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2 w-200">
            <div
              style={{
                backgroundColor: "#E9D5FF",
                padding: "8px",
                borderRadius: "999px",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Palette color="purple" size={20} />
            </div>{" "}
            Preferências
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Personalize sua experiência com Aura
          </p>
        </div>
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 w-full">
            <span className="font-bold">Notificações</span>

            <label className="relative inline-flex cursor-pointer items-center ml-auto">
              <input type="checkbox" className="peer sr-only" defaultChecked />

              <div className="w-12 h-7 rounded-full bg-indigo-500 transition" />

              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Lembretes diários e alertas
          </p>
        </div>
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 w-full">
            <span className="font-bold">Modo Foco</span>

            <label className="relative inline-flex cursor-pointer items-center ml-auto">
              <input type="checkbox" className="peer sr-only" defaultChecked />

              <div className="w-12 h-7 rounded-full bg-indigo-500 transition" />

              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Minimize as distrações ao usar o app
          </p>
        </div>
        <div className="font-bold mb-4  ">
          {" "}
          <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3 w-full">
            <span className="font-bold">Sons Ambiente</span>

            <label className="relative inline-flex cursor-pointer items-center ml-auto">
              <input type="checkbox" className="peer sr-only" defaultChecked />

              <div className="w-12 h-7 rounded-full bg-indigo-500 transition" />

              <div className="absolute left-1 top-1 w-5 h-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </label>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Sons suaves ao usar o Aura
          </p>
        </div>
      </div>
    </div>
  );
};
