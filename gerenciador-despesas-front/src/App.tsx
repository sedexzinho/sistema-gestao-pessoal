import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { PrivateRoute } from "./routes/PrivateRoute";
import { Login } from "./pages/Login";
import { Registro } from "./pages/Registro";
import { Dashboard } from "./pages/Dashboard";
import { NovaCategoria } from "./pages/NovaCategoria";
import { NovaDespesa } from "./pages/NovaDespesa";

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
            path="/despesas/nova"
            element={
              <PrivateRoute>
                <NovaDespesa />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
