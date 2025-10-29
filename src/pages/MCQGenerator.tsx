import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Plus, Trash2, FileText, Image, Wand2, Brain } from "lucide-react";
import { toast } from "sonner";

interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionConfig {
  id: string;
  text?: string;
  marks: number;
  difficulty: string;
  unit: string;
  optionCount: number;
  isAIGenerated: boolean;
  options?: MCQOption[];
}

interface AutoGenConfig {
  questionCount: number;
  marksPerQuestion: number;
  difficulty: string;
  units: string[];
  optionCount: number;
}

interface IndividualConfig {
  aiQuestionCount: number;
  manualQuestionCount: number;
  defaultMarks: number;
  defaultDifficulty: string;
  defaultUnit: string;
  defaultOptionCount: number;
}

interface Section {
  id: string;
  name: string;
  isAutoGenerate: boolean;
  autoConfig: AutoGenConfig;
  individualConfig: IndividualConfig;
  questions: QuestionConfig[];
}

const MCQGenerator = () => {
  const navigate = useNavigate();
  const api_token = localStorage.getItem('apiToken');

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');

      if (!authToken || !userData) {
        sessionStorage.setItem('redirectAfterLogin', '/mcqgenerator');
        navigate('/login');
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [quizTopic, setQuizTopic] = useState("");
  const [syllabusText, setSyllabusText] = useState("");
  const [syllabusImage, setSyllabusImage] = useState<string | null>(null);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [university, setUniversity] = useState("");
  const [examDate, setExamDate] = useState("");
  const [duration, setDuration] = useState("");
  const [isSubjectLocked, setIsSubjectLocked] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useSyllabus, setUseSyllabus] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    {
      id: "1",
      name: "Section A",
      isAutoGenerate: true,
      autoConfig: {
        questionCount: 10,
        marksPerQuestion: 1,
        difficulty: "Easy",
        units: ["UNIT I"],
        optionCount: 4
      },
      individualConfig: {
        aiQuestionCount: 5,
        manualQuestionCount: 5,
        defaultMarks: 1,
        defaultDifficulty: "Medium",
        defaultUnit: "UNIT I",
        defaultOptionCount: 4
      },
      questions: []
    }
  ]);

  const handleSyllabusUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSyllabusImage(file.name);
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
      setSubject(data.subjectName || "");
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
        questionCount: 10,
        marksPerQuestion: 1,
        difficulty: "Medium",
        units: ["UNIT I"],
        optionCount: 4
      },
      individualConfig: {
        aiQuestionCount: 5,
        manualQuestionCount: 5,
        defaultMarks: 1,
        defaultDifficulty: "Medium",
        defaultUnit: "UNIT I",
        defaultOptionCount: 4
      },
      questions: []
    };
    setSections([...sections, newSection]);
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
    const { aiQuestionCount, manualQuestionCount, defaultMarks, defaultDifficulty, defaultUnit, defaultOptionCount } = section.individualConfig;

    for (let i = 0; i < aiQuestionCount; i++) {
      questions.push({
        id: `ai-${Date.now()}-${i}`,
        marks: defaultMarks,
        difficulty: defaultDifficulty,
        unit: defaultUnit,
        optionCount: defaultOptionCount,
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
        optionCount: defaultOptionCount,
        isAIGenerated: false,
        options: Array.from({ length: defaultOptionCount }, (_, j) => ({
          id: `option-${j}`,
          text: "",
          isCorrect: j === 0
        }))
      });
    }

    return questions;
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

  const updateOption = (sectionId: string, questionId: string, optionId: string, field: 'text' | 'isCorrect', value: any) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => {
            if (q.id === questionId) {
              return {
                ...q,
                options: q.options?.map(o => {
                  if (o.id === optionId) {
                    return { ...o, [field]: value };
                  }
                  if (field === 'isCorrect' && value === true) {
                    return { ...o, isCorrect: false };
                  }
                  return o;
                })
              };
            }
            return q;
          })
        };
      }
      return section;
    }));
  };

  const parseSyllabus = (text: string): { [key: string]: string } => {
    const unitTopics: { [key: string]: string } = {};
    const unitRegex = /(UNIT\s+[IVX\d]+[\s\S]*?)(?=\n\s*UNIT\s+[IVX\d]+|$)/g;

    let match;
    while ((match = unitRegex.exec(text)) !== null) {
      const unitBlock = match[1].trim();
      const titleMatch = unitBlock.match(/^(UNIT\s+[IVX\d]+)/);
      if (titleMatch) {
        const unitName = titleMatch[0].trim();
        const unitContent = unitBlock.replace(unitName, '').trim();
        unitTopics[unitName] = unitContent;
      }
    }
    return unitTopics;
  };

  const totalMarks = sections.reduce((total, section) => {
    if (section.isAutoGenerate) {
      return total + section.autoConfig.questionCount * section.autoConfig.marksPerQuestion;
    } else {
      return total + section.questions.reduce((sectionTotal, question) => sectionTotal + question.marks, 0);
    }
  }, 0);

  const handleGenerate = async () => {
    setIsGenerating(true);
    if (!quizTitle.trim() || quizTitle.length < 4) {
      toast.error("Please enter a quiz title with at least 4 characters");
      setIsGenerating(false);
      return;
    }

    if (!subject.trim()) {
      toast.error("Please select a subject");
      setIsGenerating(false);
      return;
    }

    if (!syllabusText.trim() && !quizTopic.trim()) {
      toast.error("Please provide a syllabus or quiz topic.");
      setIsGenerating(false);
      return;
    }

    const parsedUnitTopics = syllabusText ? parseSyllabus(syllabusText) : { "UNIT I": quizTopic };

    if (Object.keys(parsedUnitTopics).length === 0) {
      toast.error("Could not parse units from the syllabus or topic. Please check the format.");
      setIsGenerating(false);
      return;
    }

    const payload = {
      quizTitle,
      subjectName: subject,
      university,
      examDate,
      duration,
      headerImage,
      description,
      totalMarks,
      unitTopics: parsedUnitTopics,
      sections: sections.map(section => ({
        id: section.id,
        name: section.name,
        isAutoGenerate: section.isAutoGenerate,
        autoConfig: section.isAutoGenerate ? section.autoConfig : undefined,
        individualConfig: !section.isAutoGenerate ? section.individualConfig : undefined,
        questions: !section.isAutoGenerate ? section.questions.map(q => ({
          ...q,
          options: q.options
        })) : [],
      })),
      type: "mcq"
    };

    console.log("Sending MCQ payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await fetch("http://localhost:3001/api/generate-mcq-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${api_token}`
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}, Message: ${res.statusText}`);
      }
      const result = await res.json();

      const updatedConfig = {
        ...payload,
        sections: payload.sections.map((section, idx) => ({
          ...section,
          questions: result.sections?.[idx]?.questions || [],
        }))
      };

      sessionStorage.setItem("questionPaperConfig", JSON.stringify(updatedConfig));
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const token = array[0].toString(36);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("shouldUploadOnce", "true");
      toast.success("MCQ question paper generated successfully!");
      navigate("/mcq-result");
    } catch (error) {
      console.error("Error generating paper:", error);
      toast.error(`Failed to generate MCQ paper. Error: ${error.message}. Please ensure the backend server is running at http://localhost:3001 and try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const units = ["UNIT I", "UNIT II", "UNIT III", "UNIT IV", "UNIT V"];
  const subjects = [
    "General Knowledge",
    "Mathematics",
    "Science",
    "History",
    "Geography",
    "English",
    "Computer Science",
    "Physics",
    "Chemistry",
    "Biology"
  ];

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
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={useSyllabus}
              onCheckedChange={(checked) => {
                setUseSyllabus(checked);
                if (!checked) {
                  setSyllabusImage(null);
                  setSyllabusText("");
                  setHeaderImage(null);
                  setIsSubjectLocked(false);
                }
              }}
            />
            <Label className="text-sm font-medium text-slate-700">
              Upload Syllabus and Header Image
            </Label>
          </div>

          {useSyllabus && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white shadow-lg border-accent/20">
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
                      {syllabusImage ? (
                        <div className="space-y-4">
                          <FileText className="w-12 h-12 mx-auto text-accent" />
                          <p className="text-success font-medium">Syllabus uploaded: {syllabusImage}</p>
                          <p className="text-sm text-text-secondary">AI will generate MCQ questions based on your syllabus</p>
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

              <Card className="bg-white shadow-lg border-accent/20">
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
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 ">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl font-semibold text-slate-900">
              <FileText className="w-5 h-5" />
              <span>Create a New Quiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-title" className="text-sm font-medium text-slate-700">
                  Quiz Title
                </Label>
                <Input
                  id="quiz-title"
                  placeholder="Enter quiz title (min 4 characters)"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Subject</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj} value={subj}>
                        {subj}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium text-slate-700">
                  University/Institution (Optional)
                </Label>
                <Input
                  id="university"
                  placeholder="e.g., Anna University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                  Exam Date (Optional)
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-slate-700">
                  Duration (Optional)
                </Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 Hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Enter quiz description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiz-topic" className="text-sm font-medium text-slate-700">
                Quiz Topic
              </Label>
              <Input
                id="quiz-topic"
                placeholder="e.g., Solar System, World War II, JavaScript Basics"
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500">This will be used to generate general MCQs if no syllabus is uploaded</p>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Sections Configuration</h3>
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
                      <h4 className="font-medium">Section {section.name}</h4>
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
                        <p className="text-sm text-muted-foreground">Configure common settings for all MCQ questions in this section</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label>Number of Questions</Label>
                            <Slider
                              value={[section.autoConfig.questionCount]}
                              onValueChange={(value) => updateAutoConfig(section.id, 'questionCount', value[0])}
                              max={50}
                              min={1}
                              step={1}
                              className="w-full mt-2"
                            />
                            <p className="text-sm text-center mt-1">{section.autoConfig.questionCount}</p>
                          </div>

                          <div>
                            <Label>Marks per Question</Label>
                            <Input
                              type="number"
                              value={section.autoConfig.marksPerQuestion}
                              onChange={(e) => updateAutoConfig(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)}
                              min="1"
                              max="5"
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
                            <Label>Options per Question</Label>
                            <Input
                              type="number"
                              value={section.autoConfig.optionCount}
                              onChange={(e) => updateAutoConfig(section.id, 'optionCount', parseInt(e.target.value) || 4)}
                              min="2"
                              max="6"
                            />
                          </div>
                        </div>

                        {useSyllabus && (
                          <div>
                            <Label>Units to Include (Optional)</Label>
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
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4 bg-gradient-hero p-4 rounded-lg border border-accent/20">
                        <h5 className="font-medium text-foreground flex items-center">
                          <Brain className="w-4 h-4 mr-2 text-accent" />
                          Individual MCQ Question Configuration
                        </h5>
                        <p className="text-sm text-muted-foreground">Specify how many AI and manual MCQ questions you need, then configure each one individually</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-card/50 p-4 rounded-lg">
                          <div>
                            <Label>AI Questions</Label>
                            <Input
                              type="number"
                              value={section.individualConfig.aiQuestionCount}
                              onChange={(e) => updateIndividualConfig(section.id, 'aiQuestionCount', parseInt(e.target.value) || 0)}
                              min="0"
                              max="50"
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
                              max="50"
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
                              max="5"
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

                          {useSyllabus && (
                            <div>
                              <Label>Default Unit (Optional)</Label>
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
                          )}

                          <div>
                            <Label>Default Options</Label>
                            <Input
                              type="number"
                              value={section.individualConfig.defaultOptionCount}
                              onChange={(e) => updateIndividualConfig(section.id, 'defaultOptionCount', parseInt(e.target.value) || 4)}
                              min="2"
                              max="6"
                            />
                          </div>
                        </div>

                        {section.questions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground bg-card/30 rounded-lg">
                            <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="mb-2">Set AI and Manual question counts above</p>
                            <p className="text-sm">MCQ questions will appear automatically for individual configuration</p>
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
                                      placeholder="Enter your MCQ question here..."
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
                                      max="5"
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

                                  {useSyllabus && (
                                    <div>
                                      <Label>Unit (Optional)</Label>
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
                                  )}

                                  <div>
                                    <Label>Number of Options</Label>
                                    <Input
                                      type="number"
                                      value={question.optionCount}
                                      onChange={(e) => {
                                        const newCount = parseInt(e.target.value) || 4;
                                        updateQuestion(section.id, question.id, 'optionCount', newCount);
                                        if (!question.isAIGenerated) {
                                          const newOptions = Array.from({ length: newCount }, (_, j) => ({
                                            id: `option-${j}`,
                                            text: question.options?.[j]?.text || "",
                                            isCorrect: j === 0
                                          }));
                                          updateQuestion(section.id, question.id, 'options', newOptions);
                                        }
                                      }}
                                      min="2"
                                      max="6"
                                    />
                                  </div>
                                </div>

                                {!question.isAIGenerated && question.options && (
                                  <div className="space-y-2">
                                    <Label>Options</Label>
                                    {question.options.map((option) => (
                                      <div key={option.id} className="flex items-center space-x-2">
                                        <Switch
                                          checked={option.isCorrect}
                                          onCheckedChange={(checked) => updateOption(section.id, question.id, option.id, 'isCorrect', checked)}
                                        />
                                        <Input
                                          value={option.text}
                                          onChange={(e) => updateOption(section.id, question.id, option.id, 'text', e.target.value)}
                                          placeholder={`Option ${parseInt(option.id.split('-')[1]) + 1}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {question.isAIGenerated && (
                                  <div className="bg-card p-3 rounded border border-accent/30">
                                    <p className="text-sm text-accent">
                                      🎯 <strong>AI will generate:</strong> A {question.difficulty.toLowerCase()} level MCQ from {question.unit}
                                      worth {question.marks} marks with {question.optionCount} options
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

            <div className="pt-4 text-center">
              <Button
                onClick={handleGenerate}
                size="lg"
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white"
                disabled={isGenerating || !quizTitle.trim() || quizTitle.length < 4 || !subject.trim()}
              >
                {isGenerating ? (
                  <>
                    <FileText className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate MCQ Question Paper
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MCQGenerator;