import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { toast } from "sonner";
import html2pdf from 'html2pdf.js';
import ShareDialog from "@/components/ShareDialog";
// import { generateDocx } from "@/utils/pdfGenerator";

// Define the interface for the MCQ answer key data
interface MCQAnswerKeyItem {
  id: string;
  question: string;
  answer: string;
  marks: number;
  explanation?: string;
}

interface QuestionPaperConfig {
  subject: string;
  quizTitle: string;
  university: string;
  examDate: string;
  duration: string;
  headerImage: string | null;
  totalMarks: number;
}

const MCQAnswerKey = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<QuestionPaperConfig | null>(null);
  const [answerKey, setAnswerKey] = useState<MCQAnswerKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConfig = sessionStorage.getItem('questionPaperConfig');
    const savedAnswerKey = sessionStorage.getItem('generatedAnswerKey');

    if (savedConfig && savedAnswerKey) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        const parsedAnswerKey = JSON.parse(savedAnswerKey);

        // Ensure the config and answer key data are in the correct format
        if (parsedConfig && Array.isArray(parsedAnswerKey)) {
          setConfig(parsedConfig);
          setAnswerKey(parsedAnswerKey);
          setLoading(false);
        } else {
          toast.error("Invalid data found in session storage.");
          navigate('/mcq-generator');
        }
      } catch (error) {
        console.error("Failed to parse data from session storage:", error);
        toast.error("An error occurred loading the data.");
          navigate('/mcq-generator');
      }
    } else {
      navigate('/mcq-generator');
    }
  }, [navigate]);

  const handleDownload = () => {
    const element = paperRef.current;
    if (element) {
      toast.info("Preparing to download PDF...");
      html2pdf().from(element).set({
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${config?.subject.replace(/\s+/g, '_')}_Answer_Key.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).save();
      toast.success("Answer key PDF exported successfully!");
    }
  };

  // const handleWordGenerate = () => {
  //   const filename = config?.subject || 'answer-key';
  //   generateDocx('answer-key-content', filename);
  //   toast.success("Word document downloaded successfully!");
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/10">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary"></div>
      </div>
    );
  }

  if (!config || answerKey.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/10">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">No Answer Key Found</h2>
            <p className="text-muted-foreground mb-6">Please generate an answer key first.</p>
            <Button onClick={() => navigate('/mcq-generator')} className="w-full">
              Back to MCQ Generator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/mcq-result"
              className="flex items-center space-x-2 text-slate-900 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Quiz</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img
                src="/vinathaal%20logo.png"
                alt="Vinathaal Logo"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">MCQ Answer Key</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ShareDialog
              title={`${config.subject} - Answer Key`}
              content="MCQ Answer key generated successfully"
            />
            <Button onClick={/*handleWordGenerate*/ null} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Word</span>
              <span className="sm:hidden">DOC</span>
            </Button>
            <Button onClick={handleDownload} size="sm">
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>

        {/* Answer Key Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardContent ref={paperRef} className="p-4 sm:p-8" id="answer-key-content">
            {/* Header Info */}
            <div className="text-center mb-8 pb-6 border-b-2 border-primary/20">
              {config.headerImage && (
                <img
                  src={config.headerImage}
                  alt="University Logo"
                  className="w-20 h-20 mx-auto mb-4 object-contain"
                />
              )}
              <h1 className="text-2xl font-bold text-primary mb-2">{config.university}</h1>
              <h2 className="text-xl font-semibold text-foreground mb-4">{config.subject}</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Exam Date:</strong> {config.examDate}</p>
                <p><strong>Duration:</strong> {config.duration}</p>
                <p><strong>Total Marks:</strong> {config.totalMarks}</p>
              </div>
              <h3 className="text-lg font-bold text-primary mt-4">ANSWER KEY</h3>
            </div>
            
            {/* Answer Key Items */}
            <div className="space-y-6">
              {answerKey.map((item, index) => (
                <div key={item.id} className="border-l-4 border-primary/30 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {index + 1}. {item.question}
                    </h3>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                      [{item.marks} Marks]
                    </span>
                  </div>
                  <div className="space-y-2 ml-4">
                    <p className="text-foreground/90 font-medium text-sm">
                      <span className="font-bold text-green-700">Correct Answer:</span> {item.answer}
                    </p>
                    {item.explanation && (
                      <p className="text-foreground/90 text-sm">
                        <span className="font-semibold">Explanation:</span> {item.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Generated on {new Date().toLocaleDateString()} | AI Answer Key
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MCQAnswerKey;