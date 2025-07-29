
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Generator from './pages/Generator';
import QuestionBankGenerator from './components/QuestionBankGenerator';
import MCQGenerator from './pages/MCQGenerator';
import Result from './pages/Result';
import AnswerKey from './pages/AnswerKey';
import Pricing from './pages/Pricing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Support from './pages/Support';
import Templates from './pages/Templates';
import NotFound from './pages/NotFound';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/question-bank" element={<QuestionBankGenerator />} />
          <Route path="/mcq-generator" element={<MCQGenerator />} />
          <Route path="/result" element={<Result />} />
          <Route path="/answer-key" element={<AnswerKey />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/support" element={<Support />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
