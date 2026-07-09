import { Mail, Pencil, Save, User } from "lucide-react";
import { useUser } from "../../../context/UserContext";

export const InfoCard = () => {
  const { user, loading } = useUser();

  return (
    <div className=" bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-[40px] bg-[#f8f8f8] shadow-lg border border-gray-200 p-10">
        {/* Header */}
        <div className="flex items-start gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
            <User className="text-indigo-500" size={26} />
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-slate-900">
              Informações Pessoais
            </h1>

            <p className="text-slate-400 text-lg mt-1">
              Edite e salve suas informações
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Nome */}
          <div className="flex items-center justify-between">
            <div className="w-full max-w-md">
              <label className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-slate-400 mb-3">
                <User size={14} />
                Nome Completo
              </label>

              <div className="bg-gray-100 rounded-3xl px-6 py-5 text-2xl font-semibold text-slate-800">
                {loading ? 'Carregando...' : user?.name || 'Nome não disponível'}
              </div>
            </div>

            <button className="text-slate-300 hover:text-slate-500 transition">
              <Pencil size={22} />
            </button>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="w-full max-w-md">
              <label className="flex items-center gap-2 text-sm font-bold tracking-wider uppercase text-slate-400 mb-3">
                <Mail size={14} />
                Endereço de E-mail
              </label>

              <div className="bg-gray-100 rounded-3xl px-6 py-5 text-2xl font-semibold text-slate-800">
                {loading ? 'Carregando...' : user?.email || 'E-mail não disponível'}
              </div>
            </div>

            <button className="text-slate-300 hover:text-slate-500 transition">
              <Mail size={22} />
            </button>
          </div>
        </div>

        <button className="mt-12 w-full rounded-[28px] bg-gradient-to-r from-indigo-500 to-indigo-600 py-5 px-6 text-white text-2xl font-bold shadow-lg hover:scale-[1.01] transition flex items-center justify-start gap-3">
          <Save size={22} />
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};
