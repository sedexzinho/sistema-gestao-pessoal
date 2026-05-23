import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./routes/PrivateRoute";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Dashboard } from "./pages/Dashboard";
import { NovaCategoria } from "./pages/NovaCategoria";
import { NovaDespesa } from "./pages/NovaDespesa";
import { Despesas } from "./pages/Despesas";
import { Receitas } from "./pages/Receitas";
import { NovaReceita } from "./pages/NovaReceita";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/categorias/despesas/nova"
            element={
              <PrivateRoute>
                <NovaCategoria tipo="despesa" />
              </PrivateRoute>
            }
          />
          <Route
            path="/categorias/receitas/nova"
            element={
              <PrivateRoute>
                <NovaCategoria tipo="receita" />
              </PrivateRoute>
            }
          />
          <Route
            path="/receitas/nova"
            element={
              <PrivateRoute>
                <NovaReceita />
              </PrivateRoute>
            }
          />
          <Route
            path="/despesas/nova"
            element={
              <PrivateRoute>
                <NovaDespesa />
              </PrivateRoute>
            }
          />
          <Route
            path="/despesas"
            element={
              <PrivateRoute>
                <Despesas />
              </PrivateRoute>
            }
          />
          <Route
            path="/receitas"
            element={
              <PrivateRoute>
                <Receitas />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
