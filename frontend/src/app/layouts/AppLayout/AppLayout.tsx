import Sidebar from "../../../components/layout/Sidebar";
import Header from "../../../components/layout/Header";

type Props = {
  children: React.ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Header />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>

      </div>

    </div>
  );
}