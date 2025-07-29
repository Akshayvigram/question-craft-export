
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QuestionBankSection {
  id: string;
  name: string;
  chapters: string[];
  questionTypes: string[];
  difficulty: string;
  questions: number;
  marksPerQuestion: number;
}

const QuestionBankGenerator = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const authToken = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      
      if (!authToken || !userData) {
        sessionStorage.setItem('redirectAfterLogin', '/question-bank');
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
  const [sections, setSections] = useState<QuestionBankSection[]>([
    {
      id: "1",
      name: "Section A",
      chapters: [],
      questionTypes: [],
      difficulty: "Medium",
      questions: 5,
      marksPerQuestion: 2
    }
  ]);

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "English", "History", "Geography", "Economics", "Political Science"
  ];

  const chapters = [
    "Chapter 1: Introduction",
    "Chapter 2: Fundamentals", 
    "Chapter 3: Advanced Topics",
    "Chapter 4: Applications",
    "Chapter 5: Case Studies"
  ];

  const questionTypes = [
    "Short Answer",
    "Long Answer", 
    "Essay Type",
    "Problem Solving",
    "Analytical",
    "Descriptive"
  ];

  const addSection = () => {
    const newSection: QuestionBankSection = {
      id: Date.now().toString(),
      name: `Section ${String.fromCharCode(65 + sections.length)}`,
      chapters: [],
      questionTypes: [],
      difficulty: "Medium",
      questions: 5,
      marksPerQuestion: 2
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (id: string) => {
    if (sections.length > 1) {
      setSections(sections.filter(section => section.id !== id));
    }
  };

  const updateSection = (id: string, field: keyof QuestionBankSection, value: any) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ));
  };

  const toggleChapter = (sectionId: string, chapter: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const chapters = section.chapters.includes(chapter)
          ? section.chapters.filter(c => c !== chapter)
          : [...section.chapters, chapter];
        return { ...section, chapters };
      }
      return section;
    }));
  };

  const toggleQuestionType = (sectionId: string, type: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const questionTypes = section.questionTypes.includes(type)
          ? section.questionTypes.filter(t => t !== type)
          : [...section.questionTypes, type];
        return { ...section, questionTypes };
      }
      return section;
    }));
  };

  const totalMarks = sections.reduce((total, section) => 
    total + (section.questions * section.marksPerQuestion), 0
  );

  const handleGenerate = () => {
    if (!subjectName.trim()) {
      toast.error("Please enter a subject name");
      return;
    }

    const hasEmptySection = sections.some(section => 
      section.chapters.length === 0 || section.questionTypes.length === 0
    );

    if (hasEmptySection) {
      toast.error("Please select chapters and question types for all sections");
      return;
    }
    
    const config = {
      subjectName,
      university,
      examDate,
      duration,
      sections,
      totalMarks,
      type: 'question-bank'
    };
    sessionStorage.setItem('questionPaperConfig', JSON.stringify(config));
    
    console.log("Generating question bank paper with:", config);
    toast.success("Question bank paper generated successfully!");
    navigate("/result");
  };

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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-primary">
              <FileText className="w-6 h-6" />
              <span>Question Bank Generator</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
                <Select value={subjectName} onValueChange={setSubjectName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="university" className="text-sm font-medium">University</Label>
                <Input
                  id="university"
                  placeholder="e.g., Anna University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium">Exam Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 3 Hours"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Configure Sections</h3>
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

              {sections.map((section) => (
                <Card key={section.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Input
                        value={section.name}
                        onChange={(e) => updateSection(section.id, 'name', e.target.value)}
                        className="font-medium text-lg w-48"
                      />
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

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Chapters */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">Select Chapters</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {chapters.map((chapter) => (
                            <div key={chapter} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${section.id}-${chapter}`}
                                checked={section.chapters.includes(chapter)}
                                onCheckedChange={() => toggleChapter(section.id, chapter)}
                              />
                              <Label
                                htmlFor={`${section.id}-${chapter}`}
                                className="text-sm cursor-pointer"
                              >
                                {chapter}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Question Types */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-slate-700">Question Types</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                          {questionTypes.map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${section.id}-${type}`}
                                checked={section.questionTypes.includes(type)}
                                onCheckedChange={() => toggleQuestionType(section.id, type)}
                              />
                              <Label
                                htmlFor={`${section.id}-${type}`}
                                className="text-sm cursor-pointer"
                              >
                                {type}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Configuration */}
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Difficulty</Label>
                          <Select
                            value={section.difficulty}
                            onValueChange={(value) => updateSection(section.id, 'difficulty', value)}
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
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Questions</Label>
                            <Input
                              type="number"
                              value={section.questions}
                              onChange={(e) => updateSection(section.id, 'questions', parseInt(e.target.value) || 1)}
                              min="1"
                              className="text-center"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-slate-700">Marks Each</Label>
                            <Input
                              type="number"
                              value={section.marksPerQuestion}
                              onChange={(e) => updateSection(section.id, 'marksPerQuestion', parseInt(e.target.value) || 1)}
                              min="1"
                              className="text-center"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Generate Button */}
            <div className="text-center mt-8">
              <Button 
                onClick={handleGenerate}
                size="lg" 
                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white"
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate Question Paper
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QuestionBankGenerator;
