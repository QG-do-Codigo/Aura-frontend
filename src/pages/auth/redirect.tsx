import { Navigate } from "react-router-dom";

export function RootRedirect() {
  const token = localStorage.getItem("token");

  //serve para renderizar tela de login na primeira renderização, ou seja, quando o usuário acessar a raiz do site, ele será redirecionado para a tela de login se não tiver token, ou para o dashboard se tiver token.
  // isso é útil para evitar que o usuário veja uma tela em branco ou uma tela de carregamento enquanto o aplicativo verifica o token

  return token ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/login" replace />
  );
}
