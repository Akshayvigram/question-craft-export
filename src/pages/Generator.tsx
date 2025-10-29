import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, FileText, Image, Settings, Wand2, Brain, Scale, File, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { S3Upload } from "@/utils/S3Uploads";

interface QuestionConfig {
  id: string;
  text?: string;
  marks: number;
  difficulty: string;
  unit: string;
  subQuestionsCount: number;
  isAIGenerated: boolean;
  subQuestions?: SubQuestion[];
}

interface SubQuestion {
  id: string;
  text: string;
  marks: number;
}

interface AutoGenConfig {
  questionCount: number;
  marksPerQuestion: number;
  difficulty: string;
  units: string[];
  subQuestionsCount: number;
}

interface IndividualConfig {
  aiQuestionCount: number;
  manualQuestionCount: number;
  defaultMarks: number;
  defaultDifficulty: string;
  defaultUnit: string;
  defaultSubQuestionsCount: number;
}

interface Section {
  id: string;
  name: string;
  isAutoGenerate: boolean;
  autoConfig: AutoGenConfig;
  individualConfig: IndividualConfig;
  questions: QuestionConfig[];
}

const Generator = () => {
  const navigate = useNavigate();
  const api_token = localStorage.getItem('apiToken');
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (!authToken || !userData) {
        // Store current path for redirect after login
        sessionStorage.setItem('redirectAfterLogin', '/generator');
        navigate('/login');
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  const [subjectName, setSubjectName] = useState("");
  const [university, setUniversity] = useState("");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("");
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [syllabusText, setSyllabusText] = useState("");
  const [isSubjectLocked, setIsSubjectLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user?.email;

  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      name: "Section A",
      isAutoGenerate: true,
      autoConfig: {
        questionCount: 5,
        marksPerQuestion: 2,
        difficulty: "Easy",
        units: ["UNIT I"],
        subQuestionsCount: 0
      },
      individualConfig: {
        aiQuestionCount: 3,
        manualQuestionCount: 2,
        defaultMarks: 2,
        defaultDifficulty: "Medium",
        defaultUnit: "UNIT I",
        defaultSubQuestionsCount: 0
      },
      questions: []
    }
  ]);

  const handleSyllabusUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSyllabusFile(file);
    toast.success("Syllabus file selected!");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://vinathaal.azhizen.com/api/extract-syllabus", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${api_token}` 
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Syllabus extraction failed.");
      }

      const data = await res.json();
      setSubjectName(data.subjectName || "");
      setSyllabusText(data.syllabusText || "");
      setIsSubjectLocked(true);
      toast.success("Syllabus extracted successfully!");
    } catch (err) {
      console.error("Error uploading syllabus:", err);
      toast.error("Failed to extract syllabus.");
    }
  };

  const handleHeaderImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeaderImage(e.target?.result as string);
        toast.success("Header image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: Date.now().toString(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`,
      isAutoGenerate: true,
      autoConfig: {
        questionCount: 5,
        marksPerQuestion: 2,
        difficulty: "Medium",
        units: ["UNIT I"],
        subQuestionsCount: 0
      },
      individualConfig: {
        aiQuestionCount: 3,
        manualQuestionCount: 2,
        defaultMarks: 2,
        defaultDifficulty: "Medium",
        defaultUnit: "UNIT I",
        defaultSubQuestionsCount: 0
      },
      questions: []
    };
    setSections([...sections, newSection]);
  };

  const updateIndividualConfig = (sectionId: string, field: keyof IndividualConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newSection = {
          ...section,
          individualConfig: { ...section.individualConfig, [field]: value }
        };
        if (field === 'aiQuestionCount' || field === 'manualQuestionCount') {
          newSection.questions = generateIndividualQuestions(newSection);
        }
        return newSection;
      }
      return section;
    }));
  };

  const generateIndividualQuestions = (section: Section): QuestionConfig[] => {
    const questions: QuestionConfig[] = [];
    const { aiQuestionCount, manualQuestionCount, defaultMarks, defaultDifficulty, defaultUnit, defaultSubQuestionsCount } = section.individualConfig;

    for (let i = 0; i < aiQuestionCount; i++) {
      questions.push({
        id: `ai-${Date.now()}-${i}`,
        marks: defaultMarks,
        difficulty: defaultDifficulty,
        unit: defaultUnit,
        subQuestionsCount: defaultSubQuestionsCount,
        isAIGenerated: true
      });
    }

    for (let i = 0; i < manualQuestionCount; i++) {
      questions.push({
        id: `manual-${Date.now()}-${i}`,
        text: "",
        marks: defaultMarks,
        difficulty: defaultDifficulty,
        unit: defaultUnit,
        subQuestionsCount: defaultSubQuestionsCount,
        isAIGenerated: false,
        subQuestions: []
      });
    }

    return questions;
  };

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  const updateSection = (id: string, field: keyof Section, value: any) => {
    setSections(sections.map(section =>
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const updateAutoConfig = (sectionId: string, field: keyof AutoGenConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          autoConfig: { ...section.autoConfig, [field]: value }
        };
      }
      return section;
    }));
  };

  const toggleAutoUnit = (sectionId: string, unit: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const units = section.autoConfig.units.includes(unit)
          ? section.autoConfig.units.filter(u => u !== unit)
          : [...section.autoConfig.units, unit];
        return {
          ...section,
          autoConfig: { ...section.autoConfig, units }
        };
      }
      return section;
    }));
  };

  const generateSmartQuestions = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const questions: QuestionConfig[] = [];
        for (let i = 0; i < section.autoConfig.questionCount; i++) {
          questions.push({
            id: `smart-${Date.now()}-${i}`,
            marks: section.autoConfig.marksPerQuestion,
            difficulty: section.autoConfig.difficulty,
            unit: section.autoConfig.units[0] || "UNIT I",
            subQuestionsCount: section.autoConfig.subQuestionsCount,
            isAIGenerated: true
          });
        }
        return { ...section, questions };
      }
      return section;
    }));
    toast.success("Smart question configuration generated!");
  };

  const addManualQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newQuestion: QuestionConfig = {
          id: Date.now().toString(),
          text: "",
          marks: 2,
          difficulty: "Medium",
          unit: "UNIT I",
          subQuestionsCount: 0,
          isAIGenerated: false,
          subQuestions: []
        };
        return { ...section, questions: [...section.questions, newQuestion] };
      }
      return section;
    }));
  };

  const removeQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const updateQuestion = (sectionId: string, questionId: string, field: keyof QuestionConfig, value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q =>
            q.id === questionId ? { ...q, [field]: value } : q
          )
        };
      }
      return section;
    }));
  };

  const generateAutoQuestions = (section: Section) => {
    const questions: QuestionConfig[] = [];

    if (section.isAutoGenerate) {
      for (let i = 0; i < section.autoConfig.questionCount; i++) {
        const unitIndex = i % section.autoConfig.units.length;
        questions.push({
          id: `auto-${Date.now()}-${i}`,
          text: `AI will generate a ${section.autoConfig.difficulty.toLowerCase()} level question from ${section.autoConfig.units[unitIndex]}`,
          marks: section.autoConfig.marksPerQuestion,
          difficulty: section.autoConfig.difficulty,
          unit: section.autoConfig.units[unitIndex],
          subQuestionsCount: section.autoConfig.subQuestionsCount,
          isAIGenerated: true
        });
      }
    } else {
      questions.push(...section.questions.map(q => ({
        ...q,
        text: q.isAIGenerated
          ? `AI will generate a ${q.difficulty.toLowerCase()} level question from ${q.unit} (${q.marks} marks)${q.subQuestionsCount > 0 ? ` with ${q.subQuestionsCount} sub-questions` : ''}`
          : q.text || ""
      })));
    }

    return questions;
  };

  const parseSyllabus = (text: string): { [key: string]: string } => {
    const unitTopics: { [key: string]: string } = {};
    // Regex to find "UNIT" followed by a Roman numeral or number, and then the unit title
    const unitRegex = /(UNIT\s+[IVX\d]+[\s\S]*?)(?=\n\s*UNIT\s+[IVX\d]+|$)/g;

    let match;
    while ((match = unitRegex.exec(text)) !== null) {
      const unitBlock = match[1].trim();
      // Extract the unit title (e.g., "UNIT I INTRODUCTION")
      const titleMatch = unitBlock.match(/^(UNIT\s+[IVX\d]+)/);
      if (titleMatch) {
        const unitName = titleMatch[0].trim(); // e.g., "UNIT I"
        const unitContent = unitBlock.replace(unitName, '').trim();
        unitTopics[unitName] = unitContent;
      }
    }
    return unitTopics;
  };

  const totalMarks = sections.reduce((total, section) => {
    if (section.isAutoGenerate) {
      const baseMarks = section.autoConfig.questionCount * section.autoConfig.marksPerQuestion;
      const subMarks = section.autoConfig.questionCount * section.autoConfig.subQuestionsCount;
      return total + baseMarks + subMarks;
    } else {
      return total + section.questions.reduce((sectionTotal, question) => {
        const baseMarks = question.marks;
        const subMarks = question.subQuestionsCount || 0;
        return sectionTotal + baseMarks + subMarks;
      }, 0);
    }
  }, 0);

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      // ✅ 1. Check credits immediately
      const creditsRes = await fetch("https://vinathaal.azhizen.com/api/get-credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api_token}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const creditsResult = await creditsRes.json();

      if (!creditsRes.ok || creditsResult.credits < 1) {
        setPopupMessage("Not enough credits to generate a question paper. Let's upgrade to premium");
        setIsGenerating(false);

        // ⏳ Give user a moment to read the popup, then navigate
        setTimeout(() => {
          navigate("/pricing");
        }, 2000); // wait 2 seconds before redirect

        return; // 🚫 Stop here
      }

      // ✅ 2. Validate required fields
      if (!subjectName.trim() || !syllabusText.trim()) {
        toast.error("Please provide a subject name and syllabus.");
        setIsGenerating(false);
        return;
      }

      // ✅ 3. Parse syllabus
      const parsedUnitTopics = parseSyllabus(syllabusText);
      if (Object.keys(parsedUnitTopics).length === 0) {
        toast.error("Could not parse units from the syllabus. Please check the format.");
        setIsGenerating(false);
        return;
      }

      // ✅ 4. Construct payload
      const payload = {
        university,
        subjectName,
        examDate,
        duration,
        headerImage,
        totalMarks,
        unitTopics: parsedUnitTopics,
        sections: sections.map(section => ({
          id: section.id,
          name: section.name,
          isAutoGenerate: section.isAutoGenerate,
          autoConfig: section.isAutoGenerate ? section.autoConfig : undefined,
          individualConfig: !section.isAutoGenerate ? section.individualConfig : undefined,
          questions: !section.isAutoGenerate ? section.questions : [],
        })),
      };

      console.log("Sending corrected payload:", JSON.stringify(payload, null, 2));

      // ✅ 5. Call generate API
      const res = await fetch("https://vinathaal.azhizen.com/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${api_token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        const updatedConfig = {
          ...payload,
          sections: payload.sections.map((section, idx) => ({
            ...section,
            questions: result.sections?.[idx]?.questions || [],
          })),
          type: "descriptive",
        };

        sessionStorage.setItem("questionPaperConfig", JSON.stringify(updatedConfig));

        // generate token
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const token = array[0].toString(36);

        sessionStorage.setItem("token", token);
        sessionStorage.setItem("shouldUploadOnce", "true");

        toast.success("Question paper generated successfully!");

        // ✅ 6. Deduct credits only on success
        try {
          const deductRes = await fetch("https://vinathaal.azhizen.com/api/deduct-credits", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${api_token}`,
            },
            body: JSON.stringify({ email: userEmail }),
          });

          const deductResult = await deductRes.json();
          if (!deductRes.ok) {
            console.error("Credit deduction failed:", deductResult.message);
            toast.error("Failed to deduct credits. Please check your account.");
          } else {
            console.log("✅ Credits updated:", deductResult);
          }
        } catch (deductErr) {
          console.error("Error calling deduct API:", deductErr);
        }

        navigate("/result");
      } else {
        toast.error(result.message || "Failed to generate question paper.");
      }
    } catch (error) {
      console.error("Error generating paper:", error);
      toast.error("An error occurred while communicating with the server.");
    } finally {
      setIsGenerating(false);
    }
  };


  const units = ["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 text-slate-900 hover:text-slate-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-card border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-primary">
                <FileText className="w-5 h-5" />
                <span>Upload Syllabus</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-subtle">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.jpeg,.jpg"
                  onChange={handleSyllabusUpload}
                  className="hidden"
                  id="syllabus-upload"
                />
                <label htmlFor="syllabus-upload" className="cursor-pointer">
                  {syllabusFile ? (
                    <div className="space-y-4">
                      <FileText className="w-12 h-12 mx-auto text-accent" />
                      <p className="text-success font-medium">Syllabus uploaded: {syllabusFile.name}</p>
                      <p className="text-sm text-text-secondary">AI will generate questions based on your syllabus</p>
                    </div>
                  ) : (
                    <>
                      <FileText className="w-12 h-12 mx-auto text-accent mb-4" />
                      <p className="text-text-primary font-medium">Click to upload your syllabus</p>
                      <p className="text-sm text-text-secondary mt-2">PDF, DOC, DOCX, TXT, JPG, JPEG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center space-x-2 text-primary">
                <Image className="w-5 h-5" />
                <span>Upload Header Image (Optional)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer bg-gradient-subtle">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageUpload}
                  className="hidden"
                  id="header-upload"
                />
                <label htmlFor="header-upload" className="cursor-pointer">
                  {headerImage ? (
                    <div className="space-y-4">
                      <img src={headerImage} alt="Header preview" className="max-h-32 mx-auto rounded-lg shadow-md" />
                      <p className="text-success font-medium">Header image uploaded successfully!</p>
                    </div>
                  ) : (
                    <>
                      <Image className="w-12 h-12 mx-auto text-accent mb-4" />
                      <p className="text-text-primary font-medium">Click to upload your university/institution header</p>
                      <p className="text-sm text-text-secondary mt-2">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Configure Question Paper</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">University/Institution</Label>
                <Input
                  id="university"
                  placeholder="e.g., Anna University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject Name</Label>
                <Input
                  id="subject"
                  placeholder="e.g., MATRICES AND CALCULUS"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  readOnly={isSubjectLocked}
                  className={isSubjectLocked ? "cursor-not-allowed bg-muted text-muted-foreground" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Exam Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 Hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sections Configuration</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-success font-medium">
                    Total Marks: {totalMarks}
                  </span>
                  <Button onClick={addSection} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {sections.map((section, index) => (
                  <div key={section.id} className="border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium">Section Configuration</h4>
                      {sections.length > 1 && (
                        <Button
                          onClick={() => removeSection(section.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label>Section Name</Label>
                        <Input
                          value={section.name}
                          onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                          placeholder="Section A"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={section.isAutoGenerate}
                          onCheckedChange={(checked) => updateSection(section.id, 'isAutoGenerate', checked)}
                        />
                        <Label className="text-sm">
                          {section.isAutoGenerate ? 'Bulk AI Generation' : 'Individual Question Config'}
                        </Label>
                      </div>
                    </div>

                    {section.isAutoGenerate ? (
                      <div className="space-y-4 bg-gradient-hero p-4 rounded-lg border border-accent/20">
                        <h5 className="font-medium text-foreground flex items-center">
                          <Wand2 className="w-4 h-4 mr-2 text-accent" />
                          Bulk AI Generation Settings
                        </h5>
                        <p className="text-sm text-muted-foreground">Configure common settings for all questions in this section</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Number of Questions</Label>
                            <Input
                              type="number"
                              value={section.autoConfig.questionCount}
                              onChange={(e) => updateAutoConfig(section.id, 'questionCount', parseInt(e.target.value) || 1)}
                              min="1"
                              max="20"
                            />
                          </div>

                          <div>
                            <Label>Marks per Question</Label>
                            <Input
                              type="number"
                              value={section.autoConfig.marksPerQuestion}
                              onChange={(e) => updateAutoConfig(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)}
                              min="1"
                              max="20"
                            />
                          </div>

                          <div>
                            <Label>Difficulty Level</Label>
                            <Select
                              value={section.autoConfig.difficulty}
                              onValueChange={(value) => updateAutoConfig(section.id, 'difficulty', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Sub-questions per Question</Label>
                            <Input
                              type="number"
                              value={section.autoConfig.subQuestionsCount}
                              onChange={(e) => updateAutoConfig(section.id, 'subQuestionsCount', parseInt(e.target.value) || 0)}
                              min="0"
                              max="5"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Units to Include</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {units.map((unit) => (
                              <Button
                                key={unit}
                                onClick={() => toggleAutoUnit(section.id, unit)}
                                variant={section.autoConfig.units.includes(unit) ? "default" : "outline"}
                                size="sm"
                                className={section.autoConfig.units.includes(unit) ? "bg-primary" : ""}
                              >
                                {unit}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 bg-gradient-hero p-4 rounded-lg border border-accent/20">
                        <h5 className="font-medium text-foreground flex items-center">
                          <Brain className="w-4 h-4 mr-2 text-accent" />
                          Individual Question Configuration
                        </h5>
                        <p className="text-sm text-muted-foreground">Specify how many AI and manual questions you need, then configure each one individually</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card/50 p-4 rounded-lg">
                          <div>
                            <Label>AI Questions</Label>
                            <Input
                              type="number"
                              value={section.individualConfig.aiQuestionCount}
                              onChange={(e) => updateIndividualConfig(section.id, 'aiQuestionCount', parseInt(e.target.value) || 0)}
                              min="0"
                              max="20"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <Label>Manual Questions</Label>
                            <Input
                              type="number"
                              value={section.individualConfig.manualQuestionCount}
                              onChange={(e) => updateIndividualConfig(section.id, 'manualQuestionCount', parseInt(e.target.value) || 0)}
                              min="0"
                              max="20"
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <Label>Default Marks</Label>
                            <Input
                              type="number"
                              value={section.individualConfig.defaultMarks}
                              onChange={(e) => updateIndividualConfig(section.id, 'defaultMarks', parseInt(e.target.value) || 1)}
                              min="1"
                              max="20"
                            />
                          </div>

                          <div>
                            <Label>Default Difficulty</Label>
                            <Select
                              value={section.individualConfig.defaultDifficulty}
                              onValueChange={(value) => updateIndividualConfig(section.id, 'defaultDifficulty', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Default Unit</Label>
                            <Select
                              value={section.individualConfig.defaultUnit}
                              onValueChange={(value) => updateIndividualConfig(section.id, 'defaultUnit', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Default Sub-questions</Label>
                            <Input
                              type="number"
                              value={section.individualConfig.defaultSubQuestionsCount}
                              onChange={(e) => updateIndividualConfig(section.id, 'defaultSubQuestionsCount', parseInt(e.target.value) || 0)}
                              min="0"
                              max="5"
                            />
                          </div>
                        </div>

                        {section.questions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground bg-card/30 rounded-lg">
                            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="mb-2">Set AI and Manual question counts above</p>
                            <p className="text-sm">Questions will appear automatically for individual configuration</p>
                          </div>
                        ) : (
                          <div className="bg-card/30 p-3 rounded-lg">
                            <p className="text-sm text-accent">
                              <strong>Total Questions:</strong> {section.questions.length}
                              ({section.questions.filter(q => q.isAIGenerated).length} AI + {section.questions.filter(q => !q.isAIGenerated).length} Manual)
                            </p>
                          </div>
                        )}

                        <div className="space-y-4">
                          {section.questions.map((question, questionIndex) => (
                            <div key={question.id} className={`border rounded p-4 ${question.isAIGenerated ? 'bg-gradient-hero border-accent/30' : 'bg-muted border-border'}`}>
                              <div className="flex justify-between items-start mb-3">
                                <h6 className="text-sm font-medium text-foreground flex items-center">
                                  {question.isAIGenerated && <Wand2 className="w-4 h-4 mr-1 text-accent" />}
                                  Question {questionIndex + 1} {question.isAIGenerated ? '(AI Generated)' : '(Manual)'}
                                </h6>
                                <Button
                                  onClick={() => removeQuestion(section.id, question.id)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                {!question.isAIGenerated && (
                                  <div>
                                    <Label>Question Text</Label>
                                    <Textarea
                                      value={question.text || ""}
                                      onChange={(e) => updateQuestion(section.id, question.id, 'text', e.target.value)}
                                      placeholder="Enter your question here..."
                                      className="min-h-[80px]"
                                    />
                                  </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <Label>Marks</Label>
                                    <Input
                                      type="number"
                                      value={question.marks}
                                      onChange={(e) => updateQuestion(section.id, question.id, 'marks', parseInt(e.target.value) || 1)}
                                      min="1"
                                    />
                                  </div>

                                  <div>
                                    <Label>Difficulty</Label>
                                    <Select
                                      value={question.difficulty}
                                      onValueChange={(value) => updateQuestion(section.id, question.id, 'difficulty', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Easy">Easy</SelectItem>
                                        <SelectItem value="Medium">Medium</SelectItem>
                                        <SelectItem value="Hard">Hard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Unit</Label>
                                    <Select
                                      value={question.unit}
                                      onValueChange={(value) => updateQuestion(section.id, question.id, 'unit', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {units.map((unit) => (
                                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label>Sub-questions</Label>
                                    <Input
                                      type="number"
                                      value={question.subQuestionsCount}
                                      onChange={(e) => updateQuestion(section.id, question.id, 'subQuestionsCount', parseInt(e.target.value) || 0)}
                                      min="0"
                                      max="5"
                                    />
                                  </div>
                                </div>

                                {question.isAIGenerated && (
                                  <div className="bg-card p-3 rounded border border-accent/30">
                                    <p className="text-sm text-accent">
                                      🎯 <strong>AI will generate:</strong> A {question.difficulty.toLowerCase()} level question from {question.unit}
                                      worth {question.marks} marks
                                      {question.subQuestionsCount > 0 && ` with ${question.subQuestionsCount} sub-questions`}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={handleGenerate}
            size="lg"
            className="px-8 py-3 bg-gradient-primary hover:opacity-90 text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Generate Question Paper
              </>
            )}
          </Button>
        </div>
        {/* 🔹 Place popup here so it overlays everything */}
        {popupMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setPopupMessage(null)}
            />

            {/* Popup Card */}
            <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-[340px] text-center animate-fade-in">
              {/* <h2 className="text-lg font-semibold text-red-600 mb-3">⚠️ Alert</h2> */}
              <p className="text-gray-700 mb-2">{popupMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Generator;