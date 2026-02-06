import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import CardEditor from "@/pages/CardEditor";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:catalogId" element={<Editor />} />
          <Route path="/cards/:cardId" element={<CardEditor />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" richColors expand={false} />
    </div>
  );
}

export default App;
