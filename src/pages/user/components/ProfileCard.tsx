import { Camera, Mail, Smile } from "lucide-react";
import { useUser } from "../../../context/UserContext";

export const ProfileCard = () => {
  const { user, loading } = useUser();
  return (
    <div className=" bg-gray-100 flex items-center justify-center p-6">
      {/* fundo cinza */}
      <div className="flex items-center justify-between bg-[rgba(244, 245, 247, 0)] w-full max-w-4xl rounded-[40px] shadow-lg border border-gray-200 p-10">
        {" "}
        {/* Left */}
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src="https://i.pravatar.cc/200"
              alt="Avatar"
              className="w-32 h-32 rounded-[40px] object-cover border-4 border-white shadow-md"
            />

            <button className="absolute bottom-0 -right-2 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200">
              <Camera size={18} className="text-slate-600" />
            </button>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              MEMBRO PREMIUM
            </p>

            <h2 className="text-5xl font-extrabold text-slate-900">
              {user?.name}
            </h2>

            <div className="mt-2 flex items-center gap-2 text-slate-500">
              <Mail size={16} />
              <span className="text-xl">{user?.email}</span>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-700">
                PREMIUM
              </span>

              <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                MEMBRO DESDE JAN 2025
              </span>
            </div>
          </div>
        </div>
        {/* Right Button */}
        <button className="flex items-center gap-3 rounded-full bg-white px-8 py-5 shadow-md border border-gray-200 hover:scale-[1.02] transition">
          <Smile size={20} className="text-slate-600" />
          <span className="font-semibold text-slate-600">Trocar Avatar</span>
        </button>
      </div>
    </div>
  );
};
