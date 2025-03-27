
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceGuidance from '@/components/VoiceGuidance';
import Header from '@/components/Header';
import TouchKeyboard from '@/components/TouchKeyboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Symptom {
  id: string;
  hindiName: string;
  englishName: string;
  icon: string;
}

interface GeneratedSymptom {
  id: string;
  description: string;
}

const SymptomInput: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [activeField, setActiveField] = useState<string | null>(null);
  const [keyboardType, setKeyboardType] = useState<'numeric' | 'alphanumeric' | 'hindi'>('alphanumeric');
  const [generatedSymptoms, setGeneratedSymptoms] = useState<GeneratedSymptom[]>([]);
  const [showGeneratedSymptoms, setShowGeneratedSymptoms] = useState(false);

  // Common symptoms
  const commonSymptoms: Symptom[] = [
    { id: 'fever', hindiName: 'बुखार', englishName: 'Fever', icon: '🌡️' },
    { id: 'cough', hindiName: 'खांसी', englishName: 'Cough', icon: '🤧' },
    { id: 'headache', hindiName: 'सिरदर्द', englishName: 'Headache', icon: '🤕' },
    { id: 'stomach-pain', hindiName: 'पेट दर्द', englishName: 'Stomach Pain', icon: '😣' },
    { id: 'weakness', hindiName: 'कमजोरी', englishName: 'Weakness', icon: '😓' },
    { id: 'none', hindiName: 'कोई नहीं', englishName: 'None', icon: '❌' },
  ];

  // Example ML-generated symptoms based on disease input
  // In a real app, this would be a call to an ML API
  const generateSymptomsBasedOnDisease = (disease: string) => {
    if (!disease.trim()) return [];

    // Simulated ML response - in a real app this would be an API call
    const mockSymptoms: { [key: string]: GeneratedSymptom[] } = {
      'fever': [
        { id: 'pain', description: t('दर्द या असुविधा', 'Pain or discomfort') },
        { id: 'changes', description: t('सामान्य कार्य में परिवर्तन', 'Changes in normal function') },
        { id: 'inflammation', description: t('सूजन', 'Inflammation or swelling') },
        { id: 'fatigue', description: t('थकान या कमजोरी', 'Fatigue or weakness') },
        { id: 'unwellness', description: t('अस्वस्थता का सामान्य अनुभव', 'General feeling of unwellness') },
      ],
      'cough': [
        { id: 'throat-pain', description: t('गले में खराश', 'Throat pain') },
        { id: 'dry-cough', description: t('सूखी खांसी', 'Dry cough') },
        { id: 'mucus', description: t('बलगम', 'Mucus production') },
        { id: 'chest-pain', description: t('छाती में दर्द', 'Chest pain') }
      ],
      'headache': [
        { id: 'throbbing', description: t('धड़कन', 'Throbbing pain') },
        { id: 'sensitivity', description: t('प्रकाश या ध्वनि के प्रति संवेदनशीलता', 'Sensitivity to light or sound') },
        { id: 'nausea', description: t('मतली', 'Nausea') },
        { id: 'blurred-vision', description: t('धुंधली दृष्टि', 'Blurred vision') }
      ]
    };
    
    // Default symptoms if the specific disease isn't found
    const defaultSymptoms = [
      { id: 'general-pain', description: t('दर्द', 'Pain') },
      { id: 'discomfort', description: t('असुविधा', 'Discomfort') },
      { id: 'weakness', description: t('कमजोरी', 'Weakness') }
    ];
    
    // Convert disease to lowercase for case-insensitive matching
    const lowerDisease = disease.toLowerCase();
    
    // Find matching symptoms or use default
    for (const key in mockSymptoms) {
      if (lowerDisease.includes(key)) {
        return mockSymptoms[key];
      }
    }
    
    return defaultSymptoms;
  };

  const handleDiseaseSubmit = () => {
    if (diseaseInput.trim() === '') return;
    
    // Generate symptoms based on the entered disease
    const symptoms = generateSymptomsBasedOnDisease(diseaseInput);
    setGeneratedSymptoms(symptoms);
    setShowGeneratedSymptoms(true);
  };

  const toggleGeneratedSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      } else {
        return [...prev, symptomId];
      }
    });
  };

  const toggleSymptom = (symptomId: string) => {
    if (symptomId === 'none') {
      // If "none" is selected, clear all other selections
      setSelectedSymptoms(['none']);
    } else {
      // Remove "none" if it was selected
      setSelectedSymptoms(prev => {
        const updatedSymptoms = prev.filter(id => id !== 'none');
        
        if (updatedSymptoms.includes(symptomId)) {
          // Remove symptom if already selected
          return updatedSymptoms.filter(id => id !== symptomId);
        } else {
          // Add symptom if not selected
          return [...updatedSymptoms, symptomId];
        }
      });
    }
  };

  const handleVoiceInput = () => {
    // In a real implementation, this would use speech recognition
    setIsRecording(true);
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      
      // Simulate receiving symptoms from voice input
      setSelectedSymptoms(['fever', 'headache']);
      
      alert(t(
        'आवाज़ से पहचाने गए लक्षण: बुखार, सिरदर्द',
        'Symptoms recognized by voice: Fever, Headache'
      ));
    }, 3000);
  };

  const handleContinue = () => {
    if (selectedSymptoms.length === 0) {
      alert(t(
        'कृपया कम से कम एक लक्षण चुनें या "कोई नहीं" का चयन करें',
        'Please select at least one symptom or choose "None"'
      ));
      return;
    }
    
    // In a real app, you would save these symptoms to state/context
    // For this demo, we'll just navigate to the next screen
    navigate('/diagnosis');
  };

  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setDiseaseInput(prev => prev.slice(0, -1));
    } else if (key === 'SPACE') {
      setDiseaseInput(prev => prev + ' ');
    } else {
      setDiseaseInput(prev => prev + key);
    }
  };

  const handleFocus = () => {
    setActiveField('disease');
    setKeyboardType(language === 'hindi' ? 'hindi' : 'alphanumeric');
  };

  const handleBlur = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName !== 'INPUT') {
        setActiveField(null);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6 pb-40">
        <div className="w-full max-w-lg flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <h1 className="kiosk-large-text text-center font-hindi">
              {t('अपने लक्षण बताएँ', 'Tell us your symptoms')}
            </h1>
            <p className="text-center text-gray-600 font-hindi">
              {t('सभी लागू लक्षणों का चयन करें या बीमारी का नाम बताएं', 'Select all symptoms that apply or enter disease name')}
            </p>
          </div>
          
          {!showGeneratedSymptoms ? (
            <>
              <div className="w-full">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-center font-hindi">
                      {t('बीमारी का नाम दर्ज करें', 'Enter Disease Name')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={diseaseInput}
                        onChange={(e) => setDiseaseInput(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        className="kiosk-input w-full"
                        placeholder={t('जैसे: बुखार, सर्दी, आदि', 'Ex: Fever, Cold, etc.')}
                      />
                      <button
                        onClick={handleDiseaseSubmit}
                        className="kiosk-button-small kiosk-button-blue"
                      >
                        {t('देखें', 'Find')}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="text-center">
                <h2 className="kiosk-medium-text font-hindi mb-4">
                  {t('या सामान्य लक्षण चुनें', 'OR Choose Common Symptoms')}
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full">
                {commonSymptoms.map(symptom => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleSymptom(symptom.id)}
                    className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                      selectedSymptoms.includes(symptom.id)
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-4xl">{symptom.icon}</span>
                    <span className="font-hindi">
                      {language === 'hindi' ? symptom.hindiName : symptom.englishName}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle className="text-center font-hindi">
                    {t(
                      `${diseaseInput} के लक्षणों का चयन करें`, 
                      `Select Symptoms of ${diseaseInput}`
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {generatedSymptoms.map((symptom, index) => (
                      <li key={symptom.id} className="flex items-center gap-3">
                        <button
                          onClick={() => toggleGeneratedSymptom(symptom.id)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center transition-all ${
                            selectedSymptoms.includes(symptom.id)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          {selectedSymptoms.includes(symptom.id) && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          )}
                        </button>
                        <span className="font-hindi text-lg">{`${index + 1}. ${symptom.description}`}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => {
                        setShowGeneratedSymptoms(false);
                        setDiseaseInput('');
                      }}
                      className="kiosk-button-small bg-gray-500 text-white"
                    >
                      {t('वापस जाएं', 'Go Back')}
                    </button>
                    <button
                      onClick={() => setSelectedSymptoms([])}
                      className="kiosk-button-small bg-red-500 text-white"
                    >
                      {t('सभी खाली करें', 'Clear All')}
                    </button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
          
          <div className="w-full text-center my-4">
            <p className="font-hindi text-lg mb-4">
              {t('या', 'OR')}
            </p>
            
            <button
              onClick={handleVoiceInput}
              disabled={isRecording}
              className={`kiosk-button-large mx-auto ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
              </svg>
              <span className="font-hindi">
                {isRecording
                  ? t('रिकॉर्डिंग...', 'Recording...')
                  : t('बोलकर बताएँ', 'Speak Symptoms')
                }
              </span>
            </button>
          </div>
          
          <button 
            onClick={handleContinue}
            className="kiosk-button-large kiosk-button-green mt-4"
          >
            <span className="font-hindi">{t('आगे बढ़ें', 'Next')}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
          
          <VoiceGuidance
            hindiPrompt="लक्षण चुनें, बीमारी का नाम दर्ज करें या माइक पर बोलें।"
            englishPrompt="Select symptoms, enter disease name, or speak into the microphone."
          />
        </div>
      </div>

      {/* Touch Keyboard */}
      <TouchKeyboard 
        onKeyPress={handleKeyPress}
        type={keyboardType}
        showKeyboard={activeField !== null}
        onSubmit={() => setActiveField(null)}
      />
    </div>
  );
};

export default SymptomInput;
