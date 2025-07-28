
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Edit, Download, Upload, FileKey } from "lucide-react";
import { toast } from "sonner";
import AnswerKeyGenerator from "@/components/AnswerKeyGenerator";
import ShareDialog from "@/components/ShareDialog";
import EditableQuestionPaper from "@/components/EditableQuestionPaper";
import { generatePDF, generateDocx } from "@/utils/pdfGenerator";
import axios from 'axios'
// import { Blob } from "buffer";
// import { generateWordDocument } from "@/utils/pdfGenerator";
import html2pdf from 'html2pdf.js';

interface QuestionPaperConfig {
  subjectName: string;
  university: string;
  examDate: string;
  duration: string;
  headerImage: string | null;
  sections: any[];
  totalMarks: number;
  type?: 'mcq' | 'descriptive';
}

interface AnswerItem {
  id: string;
  question: string;
  answer: string;
  marks: number;
  explanation?: string;
}

const Result = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<QuestionPaperConfig | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [answerKey, setAnswerKey] = useState<AnswerItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedConfig = sessionStorage.getItem("questionPaperConfig");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        console.log("Loaded config from sessionStorage:", parsed);
        console.log("First section questions:", parsed.sections?.[0]?.questions);
  
        const cleanedSections = parsed.sections?.map(section => ({
          ...section,
          questions: section.questions || [],
        })) || [];
  
        setConfig({
          ...parsed,
          sections: cleanedSections,
        });
      } catch (err) {
        console.error("Failed to parse config:", err);
      }
    } else {
      navigate("/generator");
    }
  }, []);

  // const handlePDFGenerate = async () => {
  //   try {

  //     setUploading(true);

  //     try {

  //       const filename = (config?.subjectName || 'Question Paper') + ".pdf";
  //       console.log(filename);

  //       const blob = await generatePDF("question-paper-content", filename);
  //       if (blob) {
  //         const url = URL.createObjectURL(blob);
  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.download = `${filename}.pdf`;
  //         link.click();
  //         URL.revokeObjectURL(url);
  //       }


  //       toast.success("PDF export initiated - check your downloads folder");

  //       const file = new File([blob], filename, { type: blob.type });
  //       console.log(file.name);
  //       console.log(file.type);

  //       const payload = {
  //         filename: file.name,
  //         filetype: file.type
  //       };

  //       const response = await axios.get(`http://localhost:3001/get-upload-url`, {
  //         params: payload
  //       });

  //       const uploadUrl = response.data.uploadURL;
  //       console.log(uploadUrl);

  //       const ObjectUrl = response.data.objectURL;
  //       console.log(ObjectUrl);


  //       await axios.put(uploadUrl, blob, {
  //         headers: {
  //           'Content-Type': 'application/pdf',
  //         },
  //       });

  //       alert('✅ File uploaded to S3 successfully!');


  //     } catch (err) {
  //       console.error('❌ Upload failed:', err);
  //       alert('Failed to upload file');
  //     }

  //     alert('File Generated Succesfully');
  //   } catch (err) {
  //     console.error('error in generating', err);

  //   } finally {
  //     setUploading(false);
  //   }

  // };

  // const handleDownload = () => {
  //   const element = paperRef.current;
  //   console.log("Downloading PDF for element:", element);
  //   if (element) {
  //     html2pdf().from(element).set({
  //       margin: [0.5, 0.5, 0.5, 0.5],
  //       filename: `${config.subjectName.replace(/\s+/g, '_')}_Question_Paper.pdf`,
  //       image: { type: 'jpeg', quality: 0.98 },
  //       html2canvas: { scale: 2 },
  //       jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  //     }).save();
  //   }
  // };



  const handleDownload = async () => {
  try {
    setUploading(true);

    const filename = (config?.subjectName || 'Question Paper') + ".pdf";
    const element = paperRef.current;

    if (!element) {
      console.error("Element for PDF generation not found.");
      return;
    }

    // Step 1: Generate blob from html2pdf
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    const blob = await html2pdf().from(element).set(opt).outputPdf('blob');

    if (blob) {
      // Step 2: Manual download using blob
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded and upload started...");

      // Step 3: Prepare file for S3
      const file = new File([blob], filename, { type: blob.type });

      const payload = {
        filename: file.name,
        filetype: file.type
      };

      const response = await axios.get(`http://localhost:3001/get-upload-url`, {
        params: payload
      });

      const uploadUrl = response.data.uploadURL;
      const objectUrl = response.data.objectURL;

      // Step 4: Upload to S3
      await axios.put(uploadUrl, blob, {
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      alert('✅ File uploaded to S3 successfully!');
      console.log('S3 URL:', objectUrl);
    }

  } catch (err) {
    console.error('❌ PDF generation/upload failed:', err);
    alert('Something went wrong!');
  } finally {
    setUploading(false);
  }
};


  const handleWordGenerate = () => {
    const filename = config?.subjectName || 'question-paper';
    generateDocx('question-paper-content', filename);
    toast.success("Word document downloaded successfully!");
  };

  const handleAnswerKeyGenerate = async () => {
    if (!config) return;

    try {
      setShowAnswerKey(true);
      toast.info("Generating answer key with AI...");

      // Extract questions from the config
      const questions = config.sections.flatMap(section =>
        section.questions?.map((q: any, index: number) => ({
          number: `${section.name} - Question ${index + 1}`,
          text: q.question || q.text || `Question ${index + 1}`,
          marks: q.marks || 5
        })) || []
      );
      // Simulate AI API call (replace with actual API)
      const response = await fetch('https://vinathaal.azhizen.com/api/generate-answer-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionPaper: {
            subject: config.subjectName,
            type: config.type || 'descriptive',
            questions: questions
          }
        }),
      });

      let answerKeyData;
      const data = await response.json(); // Read response body once
      console.log("AI response:", data);

      if (!response.ok || !data.answerKey) {
        // Fallback
        answerKeyData = questions.map((q, index) => ({
          questionNumber: q.number,
          question: q.text,
          keyPoints: [
            { point: `Key concept explanation for ${q.text.substring(0, 30)}...`, marks: Math.ceil(q.marks * 0.4) },
            { point: `Supporting details and examples`, marks: Math.ceil(q.marks * 0.3) },
            { point: `Conclusion and final thoughts`, marks: Math.floor(q.marks * 0.3) }
          ],
          totalMarks: q.marks
        }));
      } else {
        // Clean JSON.parse if it's stringified JSON inside a string block
        try {
          if (typeof data.answerKey === "string") {
            answerKeyData = JSON.parse(data.answerKey.replace(/```json|```/g, "").trim());
          } else {
            answerKeyData = data.answerKey;
          }
        } catch (err) {
          console.error("Error parsing answer key:", err);
          // Fallback
          answerKeyData = questions.map((q, index) => ({
            questionNumber: q.number,
            question: q.text,
            keyPoints: [
              { point: `Key concept explanation for ${q.text.substring(0, 30)}...`, marks: Math.ceil(q.marks * 0.4) },
              { point: `Supporting details and examples`, marks: Math.ceil(q.marks * 0.3) },
              { point: `Conclusion and final thoughts`, marks: Math.floor(q.marks * 0.3) }
            ],
            totalMarks: q.marks
          }));
        }
      }

      // Save answer key to session storage
      sessionStorage.setItem('generatedAnswerKey', JSON.stringify(answerKeyData));

      toast.success("Answer key generated successfully!");
      navigate('/answer-key');

    } catch (error) {
      console.error('Error generating answer key:', error);

      // Fallback: Generate sample answer key
      const questions = config.sections.flatMap(section =>
        section.questions?.map((q: any, index: number) => ({
          number: `${section.name} - Question ${index + 1}`,
          text: q.question || q.text || `Question ${index + 1}`,
          marks: q.marks || 5
        })) || []
      );
    }
  };

  const handleEditConfiguration = () => {
    toast.info("Redirecting to edit configuration");
    navigate('/generator');
  };

  const handleQuestionsSave = (updatedQuestions: any[]) => {
    if (config) {
      const updatedConfig = { ...config };
      sessionStorage.setItem('questionPaperConfig', JSON.stringify(updatedConfig));
      toast.success("Question paper saved successfully!");
    }
  };

  if (!config) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/generator" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Generator</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span className="hidden sm:inline">Generated Question Paper</span>
              <span className="sm:hidden">Paper</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Generated Question Paper</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleAnswerKeyGenerate}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <FileKey className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Generate Answer Key</span>
              <span className="sm:hidden">Answer Key</span>
            </Button>
            <ShareDialog
              title={config.subjectName}
              content="Question paper generated successfully"
            />
            <Button onClick={handleWordGenerate} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Word</span>
              <span className="sm:hidden">DOC</span>
            </Button>
            <Button onClick={handleDownload} className="bg-slate-900 hover:bg-slate-800" size="sm">
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </div>


        <Card className="bg-white shadow-lg">
          <CardContent ref={paperRef} className="p-4 sm:p-8">
            <EditableQuestionPaper
              config={config}
              onSave={handleQuestionsSave}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Result;
