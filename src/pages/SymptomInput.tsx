
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import VoiceGuidance from '@/components/VoiceGuidance';
import Header from '@/components/Header';
import TouchKeyboard from '@/components/TouchKeyboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDiseaseSymptoms, getAllCommonSymptoms } from '@/utils/medicalAssistant';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const [noneSelected, setNoneSelected] = useState(false);
  const [commonSymptomsList, setCommonSymptomsList] = useState<string[]>([]);
  const [showCommonSymptoms, setShowCommonSymptoms] = useState(false);

  // Common symptoms
  const commonSymptoms: Symptom[] = [
    { id: 'fever', hindiName: 'बुखार', englishName: 'Fever', icon: '🌡️' },
    { id: 'cough', hindiName: 'खांसी', englishName: 'Cough', icon: '🤧' },
    { id: 'headache', hindiName: 'सिरदर्द', englishName: 'Headache', icon: '🤕' },
    { id: 'stomach-pain', hindiName: 'पेट दर्द', englishName: 'Stomach Pain', icon: '😣' },
    { id: 'weakness', hindiName: 'कमजोरी', englishName: 'Weakness', icon: '😓' },
    { id: 'none', hindiName: 'कोई नहीं', englishName: 'None', icon: '❌' },
  ];

  const handleDiseaseSubmit = () => {
    if (diseaseInput.trim() === '') return;
    
    // Generate symptoms based on the entered disease using our ML model
    const diseaseInfo = getDiseaseSymptoms(diseaseInput);
    
    const symptoms = diseaseInfo.symptoms.map((symptom, index) => ({
      id: `symptom-${index}`,
      description: symptom
    }));
    
    setGeneratedSymptoms(symptoms);
    setShowGeneratedSymptoms(true);
    setNoneSelected(false);
  };

  const toggleGeneratedSymptom = (symptomId: string) => {
    const symptom = generatedSymptoms.find(s => s.id === symptomId);
    
    if (symptom) {
      setSelectedSymptoms(prev => {
        const symptomText = symptom.description;
        if (prev.includes(symptomText)) {
          return prev.filter(id => id !== symptomText);
        } else {
          return [...prev, symptomText];
        }
      });
    }
  };

  const toggleCommonSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => {
      if (prev.includes(symptom)) {
        return prev.filter(s => s !== symptom);
      } else {
        return [...prev, symptom];
      }
    });
  };

  const toggleSymptom = (symptomId: string) => {
    if (symptomId === 'none') {
      // If "none" is selected, clear all other selections and activate the "None" flow
      setSelectedSymptoms([]);
      setNoneSelected(true);
      
      // Get common symptoms from our ML model
      const commonSymptoms = getAllCommonSymptoms();
      setCommonSymptomsList(commonSymptoms);
      setShowCommonSymptoms(true);
      
    } else {
      // Remove "none" if it was selected
      setNoneSelected(false);
      setSelectedSymptoms(prev => {
        const updatedSymptoms = prev;
        
        // Convert symptom ID to actual symptom name
        const symptom = commonSymptoms.find(s => s.id === symptomId);
        const symptomName = language === 'hindi' ? symptom?.hindiName : symptom?.englishName;
        
        if (symptomName) {
          if (updatedSymptoms.includes(symptomName)) {
            // Remove symptom if already selected
            return updatedSymptoms.filter(id => id !== symptomName);
          } else {
            // Add symptom if not selected
            return [...updatedSymptoms, symptomName];
          }
        }
        
        return updatedSymptoms;
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
      const symptoms = [
        language === 'hindi' ? 'बुखार' : 'Fever',
        language === 'hindi' ? 'सिरदर्द' : 'Headache'
      ];
      
      setSelectedSymptoms(symptoms);
      
      alert(t(
        'आवाज़ से पहचाने गए लक्षण: बुखार, सिरदर्द',
        'Symptoms recognized by voice: Fever, Headache'
      ));
    }, 3000);
  };

  const handleContinue = () => {
    if (selectedSymptoms.length === 0 && !noneSelected) {
      alert(t(
        'कृपया कम से कम एक लक्षण चुनें या "कोई नहीं" का चयन करें',
        'Please select at least one symptom or choose "None"'
      ));
      return;
    }
    
    // In a real app, you would save these symptoms to state/context
    // For this demo, we pass the symptoms via navigation state
    navigate('/diagnosis', { state: { symptoms: selectedSymptoms, noneSelected } });
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

  const handleCustomSymptomInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      const symptom = e.currentTarget.value.trim();
      setSelectedSymptoms(prev => [...prev, symptom]);
      e.currentTarget.value = '';
    }
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
          
          {!showGeneratedSymptoms && !showCommonSymptoms ? (
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
                      (symptom.id === 'none' && noneSelected) || 
                      (symptom.id !== 'none' && selectedSymptoms.includes(language === 'hindi' ? symptom.hindiName : symptom.englishName))
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : symptom.id === 'none' 
                          ? 'bg-orange-100 hover:bg-orange-200 border-2 border-orange-300 hover:border-orange-500'
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
          ) : showGeneratedSymptoms ? (
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
                            selectedSymptoms.includes(symptom.description)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          {selectedSymptoms.includes(symptom.description) && (
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
          ) : (
            // Show common symptoms selection when "None of the above" was selected
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="text-center font-hindi">
                  {t('आप किन लक्षणों का अनुभव कर रहे हैं?', 'What symptoms are you experiencing?')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 font-hindi">
                  {t(
                    'आप ने निर्दिष्ट किया है कि आपके पास सामान्य लक्षण नहीं हैं। कृपया अपने अनुभव किए गए किसी भी लक्षण का चयन करें:',
                    'You have indicated you don\'t have the common symptoms. Please select any symptoms you are experiencing:'
                  )}
                </p>
                
                <div className="space-y-3 mb-4">
                  {commonSymptomsList.map((symptom, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`symptom-${index}`}
                        checked={selectedSymptoms.includes(symptom)}
                        onChange={() => toggleCommonSymptom(symptom)}
                        className="h-5 w-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                      />
                      <label htmlFor={`symptom-${index}`} className="text-gray-900 font-hindi">
                        {symptom}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <p className="text-gray-700 mb-2 font-hindi">
                    {t('या अपना स्वयं का लक्षण दर्ज करें:', 'Or enter your own symptom:')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="kiosk-input w-full"
                      placeholder={t('अपना लक्षण यहां दर्ज करें', 'Enter your symptom here')}
                      onKeyDown={handleCustomSymptomInput}
                      onFocus={handleFocus}
                      onBlur={handleBlur}
                    />
                    <button
                      onClick={() => {
                        const input = document.querySelector('input') as HTMLInputElement;
                        if (input && input.value.trim() !== '') {
                          setSelectedSymptoms(prev => [...prev, input.value.trim()]);
                          input.value = '';
                        }
                      }}
                      className="kiosk-button-small kiosk-button-blue"
                    >
                      {t('जोड़ें', 'Add')}
                    </button>
                  </div>
                </div>
                
                {selectedSymptoms.length > 0 && (
                  <div className="mt-4">
                    <p className="font-medium text-gray-900 mb-2 font-hindi">
                      {t('चयनित लक्षण:', 'Selected symptoms:')}
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedSymptoms.map((symptom, index) => (
                        <li key={index} className="flex items-center justify-between">
                          <span className="font-hindi">{symptom}</span>
                          <button
                            onClick={() => setSelectedSymptoms(prev => prev.filter(s => s !== symptom))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 6 6 18"/>
                              <path d="m6 6 12 12"/>
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => {
                      setShowCommonSymptoms(false);
                      setNoneSelected(false);
                      setSelectedSymptoms([]);
                    }}
                    className="kiosk-button-small bg-gray-500 text-white"
                  >
                    {t('वापस जाएं', 'Go Back')}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!showCommonSymptoms && (
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
          )}
          
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
