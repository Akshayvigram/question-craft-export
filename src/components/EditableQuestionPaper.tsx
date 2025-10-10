import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { S3Upload } from "@/utils/S3Uploads";
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Interfaces (assuming they are defined as in your original code)
interface SubQuestion {
  id: string;
  text: string;
  marks: number;
}

interface Question {
  id: string;
  text: string;
  options?: string[];
  marks: number;
  unit: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  subQuestions?: SubQuestion[];
}

interface Section {
  id: string;
  name: string;
  questions: Question[];
}

interface EditableQuestionPaperProps {
  config: any;
  token: any;
  onSave: (updatedConfig: any) => void;
}

const EditableQuestionPaper = ({ config, token, onSave }: EditableQuestionPaperProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedConfig, setEditedConfig] = useState(config);

  // --- HANDLER FUNCTIONS for State Updates ---

  const handleConfigChange = (field: string, value: any) => {
    setEditedConfig((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (sectionIndex: number, field: string, value: string) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex][field] = value;
    setEditedConfig(newConfig);
  };

  const handleQuestionChange = (sectionIndex: number, qIndex: number, field: string, value: any) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions[qIndex][field] = value;
    setEditedConfig(newConfig);
  };
  
  const handleSubQuestionChange = (sectionIndex: number, qIndex: number, subQIndex: number, field: string, value: any) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions[qIndex].subQuestions[subQIndex][field] = value;
    setEditedConfig(newConfig);
  };

  const handleOptionChange = (sectionIndex: number, qIndex: number, optIndex: number, value: string) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions[qIndex].options[optIndex] = value;
    setEditedConfig(newConfig);
  };

  // --- ADD FUNCTIONS ---

  const addSection = () => {
    const newSection = { id: uuidv4(), name: "New Section", questions: [] };
    const newConfig = { ...editedConfig, sections: [...editedConfig.sections, newSection] };
    setEditedConfig(newConfig);
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = { id: uuidv4(), text: "New Question Text", marks: 5, unit: "Unit 1", subQuestions: [], options: editedConfig.type === 'mcq' ? ["Option A", "Option B"] : [] };
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions.push(newQuestion);
    setEditedConfig(newConfig);
  };

  const addSubQuestion = (sectionIndex: number, qIndex: number) => {
    const newSubQuestion: SubQuestion = { id: uuidv4(), text: "New Sub-question", marks: 2 };
    const newConfig = { ...editedConfig };
    if (!newConfig.sections[sectionIndex].questions[qIndex].subQuestions) {
      newConfig.sections[sectionIndex].questions[qIndex].subQuestions = [];
    }
    newConfig.sections[sectionIndex].questions[qIndex].subQuestions.push(newSubQuestion);
    setEditedConfig(newConfig);
  };

  const addOption = (sectionIndex: number, qIndex: number) => {
    const newConfig = { ...editedConfig };
    if (!newConfig.sections[sectionIndex].questions[qIndex].options) {
      newConfig.sections[sectionIndex].questions[qIndex].options = [];
    }
    newConfig.sections[sectionIndex].questions[qIndex].options.push("New Option");
    setEditedConfig(newConfig);
  };

  // --- DELETE FUNCTIONS ---

  const deleteSection = (sectionIndex: number) => {
    const newConfig = { ...editedConfig };
    newConfig.sections.splice(sectionIndex, 1);
    setEditedConfig(newConfig);
  };

  const deleteQuestion = (sectionIndex: number, qIndex: number) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions.splice(qIndex, 1);
    setEditedConfig(newConfig);
  };

  const deleteSubQuestion = (sectionIndex: number, qIndex: number, subQIndex: number) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions[qIndex].subQuestions.splice(subQIndex, 1);
    setEditedConfig(newConfig);
  };
  
  const deleteOption = (sectionIndex: number, qIndex: number, optIndex: number) => {
    const newConfig = { ...editedConfig };
    newConfig.sections[sectionIndex].questions[qIndex].options.splice(optIndex, 1);
    setEditedConfig(newConfig);
  };

  // --- SAVE AND CANCEL ---
  const handleSave = async () => {
    onSave(editedConfig);
    await S3Upload(editedConfig, token);
    setIsEditing(false);
    toast.success("Question paper updated successfully!");
  };

  const handleCancel = () => {
    setEditedConfig(config);
    setIsEditing(false);
  };

  // Helper function
  const formatDate = (dateString: string) => {
    if (!dateString) return "___________";
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      return "Invalid Date";
    }
  };
  
  return (
    <div id="question-paper-content" className="relative p-4 md:p-8 bg-white shadow-lg rounded-md">
      <div className="flex justify-end mb-4 no-print">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" /> Edit Paper
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        {editedConfig.headerImage && <img src={editedConfig.headerImage} alt="Header" className="max-h-24 mx-auto mb-4"/>}
        
        {isEditing ? (
          <div className="space-y-2 max-w-lg mx-auto">
            <Input value={editedConfig.university || ""} onChange={(e) => handleConfigChange('university', e.target.value)} className="text-center text-2xl font-bold"/>
            <Input value={editedConfig.subjectName} onChange={(e) => handleConfigChange('subjectName', e.target.value)} className="text-center text-xl font-semibold"/>
          </div>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-bold mb-2">{editedConfig.university || "University Name"}</h2>
            <h3 className="text-lg md:text-xl font-semibold mb-6">{editedConfig.subjectName}</h3>
          </>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm border-b-2 border-slate-900 pb-4 mt-4 gap-2">
          {isEditing ? (
              <>
                <Input type="date" value={formatDate(editedConfig.examDate)} onChange={(e) => handleConfigChange('examDate', e.target.value)} className="w-full sm:w-auto"/>
                <Input placeholder="Duration" value={editedConfig.duration} onChange={(e) => handleConfigChange('duration', e.target.value)} className="w-full sm:w-auto text-center"/>
                <Input type="number" placeholder="Total Marks" value={editedConfig.totalMarks} onChange={(e) => handleConfigChange('totalMarks', e.target.value)} className="w-full sm:w-auto text-right"/>
              </>
          ) : (
              <>
                <span>Date: {formatDate(editedConfig.examDate)}</span>
                <span>Duration: {editedConfig.duration || "___________"}</span>
                <span>Total Marks: {editedConfig.totalMarks}</span>
              </>
          )}
        </div>
      </div>

      {/* Sections and Questions */}
      {editedConfig.sections?.map((section: Section, sectionIndex: number) => (
        <div key={section.id} className="mb-8 p-4">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-4">
              <Input value={section.name} onChange={(e) => handleSectionChange(sectionIndex, 'name', e.target.value)} className="text-lg font-semibold" />
              <Button variant="ghost" size="icon" onClick={() => deleteSection(sectionIndex)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
            </div>
          ) : (
            <h4 className="text-lg font-semibold text-center mb-6">{section.name}</h4>
          )}
          
          <div className="space-y-6">
            {section.questions?.map((question: Question, qIndex: number) => (
              <div key={question.id} className="p-3  border-slate-200">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <span className="font-medium pt-2">{qIndex + 1}.</span>
                      {isEditing ? (
                        <Textarea 
                          value={question.text} 
                          onChange={(e) => handleQuestionChange(sectionIndex, qIndex, 'text', e.target.value)}
                          className="flex-1"
                        />
                      ) : (
                        <p className="text-slate-800 leading-relaxed">{question.text}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Input type="number" value={question.marks} onChange={(e) => handleQuestionChange(sectionIndex, qIndex, 'marks', parseInt(e.target.value))} className="w-20 text-right" />
                        <Button variant="ghost" size="icon" onClick={() => deleteQuestion(sectionIndex, qIndex)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                      </>
                    ) : (
                      <span className="font-medium">[{question.marks} Mark{question.marks !== 1 ? 's' : ''}]</span>
                    )}
                  </div>
                </div>

                {/* Options for MCQ */}
                {editedConfig.type === 'mcq' && question.options && (
                  <div className="ml-8 mt-3 space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Input value={option} onChange={(e) => handleOptionChange(sectionIndex, qIndex, optIndex, e.target.value)} />
                            <Button variant="ghost" size="icon" onClick={() => deleteOption(sectionIndex, qIndex, optIndex)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                          </>
                        ) : (
                          <p>{String.fromCharCode(97 + optIndex)}. {option}</p>
                        )}
                      </div>
                    ))}
                    {isEditing && <Button variant="outline" size="sm" onClick={() => addOption(sectionIndex, qIndex)}><Plus className="w-4 h-4 mr-2"/>Add Option</Button>}
                  </div>
                )}

                {/* Sub-questions */}
                {question.subQuestions && question.subQuestions.length > 0 && (
                  <div className="ml-8 mt-4 space-y-3">
                    {question.subQuestions.map((subQ, subQIndex) => (
                      <div key={subQ.id} className="flex items-center gap-4">
                        <span className="text-slate-600">{String.fromCharCode(97 + subQIndex)}.</span>
                        {isEditing ? (
                            <>
                              <Input value={subQ.text} onChange={(e) => handleSubQuestionChange(sectionIndex, qIndex, subQIndex, 'text', e.target.value)} className="flex-1" />
                              <Input type="number" value={subQ.marks} onChange={(e) => handleSubQuestionChange(sectionIndex, qIndex, subQIndex, 'marks', parseInt(e.target.value))} className="w-20 text-right" />
                              <Button variant="ghost" size="icon" onClick={() => deleteSubQuestion(sectionIndex, qIndex, subQIndex)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                            </>
                        ) : (
                            <>
                              <p className="flex-1 text-slate-700">{subQ.text}</p>
                              <span className="font-medium text-sm">[{subQ.marks} Mark{subQ.marks !== 1 ? 's' : ''}]</span>
                            </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isEditing && <Button className="mt-4 ml-8" variant="outline" size="sm" onClick={() => addSubQuestion(sectionIndex, qIndex)}><Plus className="w-4 h-4 mr-2"/>Add Sub-question</Button>}
              </div>
            ))}
            {isEditing && <Button className="mt-6" variant="secondary" onClick={() => addQuestion(sectionIndex)}><Plus className="w-4 h-4 mr-2"/>Add Question to Section</Button>}
          </div>
        </div>
      ))}
      {isEditing && <Button className="mt-4 w-full" variant="outline" onClick={addSection}><Plus className="w-4 h-4 mr-2"/>Add New Section</Button>}

    </div>
  );
};

export default EditableQuestionPaper;