import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, FileKey } from "lucide-react";
import { toast } from "sonner";
import ShareDialog from "@/components/ShareDialog";
import EditableQuestionPaper from "@/components/EditableQuestionPaper";
import { S3Upload } from "@/utils/S3Uploads";
import html2pdf from 'html2pdf.js';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  ImageRun,
  Header,
  Tab,
  TabStopType,
  TabStopPosition,
} from "docx";
import { saveAs } from "file-saver";

interface QuestionPaperConfig {
  subjectName: string;
  university: string;
  examDate: string;
  duration: string;
  headerImage: string | null;
  sections: Section[];
  totalMarks: number;
  type?: 'mcq' | 'descriptive';
}

interface Section {
  name: string;
  questions: Question[];
}

interface Question {
  text?: string;
  question?: string;
  marks: number;
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
  const api_token = localStorage.getItem("apiToken");
  const [config, setConfig] = useState<QuestionPaperConfig | null>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [answerKey, setAnswerKey] = useState<AnswerItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);
  const token = sessionStorage.getItem("token");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Helper: fetch image -> return arrayBuffer and mime type
  const urlToArrayBufferWithMime = async (url: string) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
      const mime = response.headers.get('content-type') || '';
      const arrayBuffer = await response.arrayBuffer();
      return { arrayBuffer, mime };
    } catch (error) {
      console.error("Error fetching image:", error);
      toast.error("Failed to load header image. Generating document without image.");
      return null;
    }
  };

  const handleWordGenerate = async () => {
    if (!config) {
      toast.error("No configuration available for document generation.");
      return;
    }

    const filename = config.subjectName || "question-paper";
    const children: Paragraph[] = [];

    // Fetch header image (if present) with mime info
    const headerImageResult = config.headerImage ? await urlToArrayBufferWithMime(config.headerImage) : null;
    let headerImageOptions: any | null = null;

    if (headerImageResult && headerImageResult.arrayBuffer.byteLength > 0) {
      const { arrayBuffer, mime } = headerImageResult;

      // If image is SVG, docx expects a string for the SVG data and a fallback for non SVG consumers.
      // If image is PNG/JPEG, docx expects a Uint8Array (or Buffer).
      if (mime.includes('svg')) {
        // Convert ArrayBuffer to string
        const svgText = new TextDecoder().decode(arrayBuffer);
        // For SVG, docx type should be 'image/svg+xml' and a fallback (PNG/JPEG) may be provided.
        // Creating a proper fallback requires rasterizing the svg to png in-browser which is out of scope here.
        // We'll set the minimal properties for an SVG image. If you need robust SVG support, rasterize and provide fallback bytes.
        headerImageOptions = {
          data: svgText,
          type: 'image/svg+xml',
          // fallback can be provided as PNG/JPEG binary if available:
          // fallback: { data: new Uint8Array([...]), transformation: { width: 60, height: 60 } }
        };
      } else {
        // For PNG/JPEG: convert ArrayBuffer -> Uint8Array
        const uint8 = new Uint8Array(arrayBuffer);
        headerImageOptions = {
          data: uint8,
          transformation: { width: 60, height: 60 },
          // optionally: altText, floating, etc.
        };
      }
    }

    // Build main content
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Question Paper",
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: config.subjectName,
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    children.push(
      new Paragraph({
        tabStops: [
          {
            type: TabStopType.CENTER,
            position: 4680,
          },
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: `Date: ${config.examDate || "________"}`,
            size: 24,
          }),
          new TextRun({ children: [new Tab()] }),
          new TextRun({
            text: `Duration: ${config.duration || "________"}`,
            size: 24,
          }),
          new TextRun({ children: [new Tab()] }),
          new TextRun({
            text: `Total Marks: ${config.totalMarks || "________"}`,
            size: 24,
          }),
        ],
      })
    );

    config.sections.forEach((section, sIndex) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.name,
              bold: true,
              size: 28,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
      section.questions.forEach((q: any, qIndex: number) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${qIndex + 1}. ${q.text || q.question}`,
                size: 24,
              }),
            ],
            alignment: AlignmentType.LEFT,
          })
        );
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[${q.marks} Marks]`,
                size: 22,
                bold: true,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
          })
        );
      });
    });

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Generated using AI Question Paper Generator",
            italics: true,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
      })
    );

    // Build the Word document with header image when available
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: "1in",
                right: "1in",
                bottom: "1in",
                left: "1in",
              },
            },
          },
          headers: {
            default: new Header({
              children: [
                // Only create the ImageRun when headerImageOptions is available
                ...(headerImageOptions
                  ? [
                      new Paragraph({
                        children: [
                          // cast to any because docx TypeScript types sometimes require union-specific fields.
                          // headerImageOptions is either a Uint8Array-based image (PNG/JPEG) or an SVG string with type.
                          new ImageRun(headerImageOptions as any),
                        ],
                        alignment: AlignmentType.CENTER,
                      }),
                    ]
                  : []),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${config.university || ""}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children,
        },
      ],
    });

    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${filename.replace(/\s+/g, "_")}_Question_Paper.docx`);
      toast.success("Word document generated successfully!");
    } catch (error) {
      console.error("Error generating Word document:", error);
      toast.error("Failed to generate Word document.");
    }
  };

  useEffect(() => {
    const savedConfig = sessionStorage.getItem("questionPaperConfig");
    const shouldUpload = sessionStorage.getItem("shouldUploadOnce");

    if (!savedConfig) {
      navigate("/generator");
      return;
    }

    try {
      const parsed = JSON.parse(savedConfig);
      const cleanedSections = parsed.sections?.map((section: any) => ({
        ...section,
        questions: section.questions || [],
      })) || [];

      setConfig({
        ...parsed,
        sections: cleanedSections,
      });

      const generateInitialPDF = async () => {
        if (!paperRef.current) return;

        const opt = {
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `${parsed.subjectName.replace(/\s+/g, "_")}_Question_Paper.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        };

        try {
          const pdfBlob = await html2pdf()
            .from(paperRef.current)
            .set(opt)
            .output("blob");

          setPdfBlob(pdfBlob);

          if (shouldUpload === "true") {
            setUploading(true);
            await S3Upload(savedConfig, token);
            toast.success("Uploaded to S3 successfully");
            setUploading(false);
            sessionStorage.removeItem("shouldUploadOnce");
          }
        } catch (error) {
          console.error("PDF generation failed:", error);
          toast.error("Failed to generate PDF");
        }
      };

      const timer = setTimeout(generateInitialPDF, 2000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.error("Failed to parse config:", err);
      toast.error("Failed to load configuration");
    }
  }, [navigate, token]);

  const handleDownload = async () => {
    if (!pdfBlob) {
      toast.error("PDF not available");
      return;
    }

    try {
      const userPassword = prompt("Enter password to encrypt PDF:") || "";
      const formData = new FormData();
      formData.append("pdf", pdfBlob, "question_paper.pdf");
      formData.append("password", userPassword);

      const res = await fetch("https://vinathaal.azhizen.com/api/encrypt-pdf", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        throw new Error("Encryption failed");
      }

      const encryptedBlob = await res.blob();
      const url = window.URL.createObjectURL(encryptedBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${config?.subjectName || 'Question-paper'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Encrypted PDF downloaded");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download PDF");
    }
  };

  // ... rest of the code remains the same ...

  if (!config) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-2">
              <img
                src="/vinathaal%20logo.png"
                alt="Vinathaal Logo"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        
        {/* ACTION BUTTONS BAR - Compact, Horizontal, Non-wrapping, Scrollable on Mobile */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 sm:mb-6 gap-2">
          
          {/* Title Area - Reduced size on mobile */}
          <h1 className="text-xl sm:text-3xl font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">
            Generated Question Paper
          </h1>
          
          {/* Button Group - Compact, Horizontal, Non-wrapping, Scrollable on small screens */}
          <div className="flex flex-row flex-nowrap items-center justify-end gap-1 sm:gap-2 
                        overflow-x-scroll lg:overflow-x-hidden w-full lg:w-auto p-1 -m-1">
            
            {/* Generate Answer Key Button - Compact size */}
            <Button
              onClick={() => { /* handleAnswerKeyGenerate – omitted for brevity */ }}
              variant="outline"
              size="sm"
              className="flex-shrink-0 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 whitespace-nowrap"
            >
              <FileKey className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Generate Answer Key
            </Button>
            {pdfBlob && (
              <ShareDialog
                title={config.subjectName}
                content="Question paper generated successfully"
                pdfBlob={pdfBlob}
              />
            )}
            <Button
              onClick={handleWordGenerate}
              variant="outline"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Word</span>
              <span className="sm:hidden">DOC</span>
            </Button>

            {/* Export PDF Button - Compact size */}
            <Button onClick={handleDownload} 
              className="flex-shrink-0 bg-slate-900 hover:bg-slate-800 text-[10px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3 whitespace-nowrap" 
              size="sm"
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Export PDF
            </Button>

          </div>
        </div>

        <Card className="bg-white shadow-lg">
          <CardContent ref={paperRef} className="p-4 sm:p-8">
            <EditableQuestionPaper
              config={config}
              token={token}
              onSave={() => { /* handleQuestionsSave – omitted for brevity */ }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Result;