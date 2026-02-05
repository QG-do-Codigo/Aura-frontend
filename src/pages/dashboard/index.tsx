import { Sidebar } from "../../components/sidebar/sidebar";

export const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-4">
        <h1>Dashboard</h1>
      </div>
    </div>
  );
};
